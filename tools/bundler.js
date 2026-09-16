/**
 * 极简 ESM 打包器（零依赖，仅支持本项目使用的语法子集）：
 *  - import { a, b } from "./x.js";
 *  - export const|let|var ... / export function ... / export class ...
 * 不支持 default export、重导出、动态 import（本项目刻意不用）。
 *
 * 模块以仓库相对路径为键注册，产出一段经典脚本，可直接内联进 HTML，
 * 因此 dist 可由 file:// 打开，不依赖任何绝对 URL 或服务器。
 */
import fs from "node:fs";
import path from "node:path";

const importRe = /^import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["'];?\s*$/gm;
const exportNamedRe = /export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g;
const exportFnRe = /export\s+(function|class)\s+([A-Za-z_$][\w$]*)/g;

export function bundle(entryPath, projectRoot) {
  const modules = new Map();

  const keyOf = (file) => path.relative(projectRoot, file).split(path.sep).join("/");

  function load(file) {
    const key = keyOf(file);
    if (modules.has(key)) return key;
    let code = fs.readFileSync(file, "utf8");
    const dir = path.dirname(file);
    const deps = [];

    code = code.replace(importRe, (_whole, names, spec) => {
      const depFile = path.resolve(dir, spec);
      const depKey = load(depFile);
      const picked = names
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((pair) => {
          // 暂不需要 as 重命名，预留支持
          const [orig, alias] = pair.split(/\s+as\s+/).map((s) => s.trim());
          return alias ? `${JSON.stringify(orig)}: ${alias}` : orig;
        })
        .join(", ");
      deps.push(depKey);
      return `const { ${picked} } = __require(${JSON.stringify(depKey)});`;
    });

    const exportedNames = [];
    code = code.replace(exportNamedRe, (_m, kind, name) => {
      exportedNames.push(name);
      return `${kind} ${name}`;
    });
    code = code.replace(exportFnRe, (_m, kind, name) => {
      exportedNames.push(name);
      return `${kind} ${name}`;
    });

    const footer = exportedNames.map((n) => `__exports.${n} = ${n};`).join("\n");
    modules.set(key, { code: code.replace(/\s+$/, "") + "\n" + footer, deps });
    return key;
  }

  const entryKey = load(path.resolve(entryPath));

  const moduleDefs = Array.from(modules.entries()).map(([key, mod]) => {
    const depArray = mod.deps.map((d) => JSON.stringify(d)).join(", ");
    return [
      `__modules[${JSON.stringify(key)}] = function (__require, __exports) {`,
      mod.code,
      `}; __modules[${JSON.stringify(key)}].deps = [${depArray}];`,
    ].join("\n");
  });

  return `/* 由 tools/bundler.js 生成，请勿手改 */
(function () {
  "use strict";
  var __cache = Object.create(null);
  var __modules = Object.create(null);
  function __require(key) {
    if (__cache[key]) return __cache[key];
    var __exports = {};
    __cache[key] = __exports;
    __modules[key](function (dep) { return __require(dep); }, __exports);
    return __exports;
  }
${moduleDefs.map((d) => "\n" + d).join("\n")}
  __require(${JSON.stringify(entryKey)});
})();
`;
}
