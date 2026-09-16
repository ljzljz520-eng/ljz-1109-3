/**
 * 构建：校验数据 -> 打包内联 JS/CSS -> 拷贝 assets -> 绝对路径检查
 * 产物 dist/index.html 为单文件（媒体除外），所有引用均为相对路径，
 * 可直接 file:// 打开或挂到任意子路径的静态服务器下。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "./bundler.js";
import { museumData } from "../src/data/museum-data.js";
import { validateMuseumData, formatErrors } from "../src/data/schema.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

function logStep(n, msg) {
  console.log(`[${n}] ${msg}`);
}

/* 1. 数据校验（器物类型、媒体引用、文件存在性） */
logStep("1/5", "校验馆藏数据 schema …");
const result = validateMuseumData(museumData, (src) => fs.existsSync(path.join(root, src)));
if (!result.valid) {
  console.error("数据校验失败，已中止构建：\n");
  console.error(formatErrors(result));
  process.exit(1);
}
console.log(`      通过：${museumData.works.length} 件作品，${museumData.media.length} 条媒体引用。`);

/* 2. 清理并准备 dist */
logStep("2/5", "准备 dist 目录 …");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

/* 3. 内联样式与打包 JS */
logStep("3/5", "内联样式、打包交互模块 …");
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const cssFiles = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/g)].map(
  (m) => m[1]
);
const cssText = cssFiles
  .map((href) => fs.readFileSync(path.join(root, href), "utf8"))
  .join("\n");
html = html.replace(
  /(?:[ \t]*<link[^>]+rel="stylesheet"[^>]*>\s*\n?)+/g,
  `  <style>\n${cssText}\n  </style>\n`
);

const entryMatch = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"[^>]*>\s*<\/script>/);
if (!entryMatch) throw new Error("未找到 module 入口脚本");
const bundleCode = bundle(path.join(root, entryMatch[1]), root);
html = html.replace(
  /[ \t]*<script[^>]+type="module"[^>]*>\s*<\/script>\s*\n?/,
  `  <script>\n${bundleCode}\n  </script>\n`
);

/* 4. 拷贝媒体资源（仅相对引用允许存在） */
logStep("4/5", "拷贝 assets …");
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
copyDir(path.join(root, "assets"), path.join(dist, "assets"));

fs.writeFileSync(path.join(dist, "index.html"), html, "utf8");

/* 5. 静态预览安全检查：产物中不得残留 / 开头的站内绝对引用 */
logStep("5/5", "检查绝对路径依赖 …");
const violations = [];
const attrRe = /\b(src|href)\s*=\s*"(?!data:)([^"]+)"/g;
let m;
while ((m = attrRe.exec(html)) !== null) {
  const ref = m[2];
  if (ref.startsWith("/")) violations.push(`${m[1]}="${ref}"`);
  if (/^[a-z]+:/i.test(ref) && !ref.startsWith("data:")) violations.push(`${m[1]}="${ref}"（外部 URL）`);
}
const leftoverModule = /type="module"|rel="stylesheet"/.test(html);
if (leftoverModule) violations.push("产物仍残留未内联的 module/stylesheet 标签");
if (violations.length) {
  console.error("发现绝对路径或未内联引用：\n" + violations.map((v) => "  ✗ " + v).join("\n"));
  process.exit(1);
}

const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(1);
console.log(`      通过：无绝对路径、无外链。\n\n构建完成 → dist/index.html（${kb} kB）`);
console.log("预览方式：node tools/serve.js dist ，或直接用浏览器打开 dist/index.html");
