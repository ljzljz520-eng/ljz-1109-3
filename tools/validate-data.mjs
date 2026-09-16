/**
 * 独立数据校验入口：npm run validate
 * 比浏览器端多做一件事：对照磁盘，确认每条媒体引用的文件真实存在。
 */
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { museumData, } from "../src/data/museum-data.js";
import { validateMuseumData, formatErrors } from "../src/data/schema.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const result = validateMuseumData(museumData, (src) =>
  fs.existsSync(path.join(root, src))
);

if (!result.valid) {
  console.error("馆藏数据 schema 校验失败：\n");
  console.error(formatErrors(result));
  process.exitCode = 1;
} else {
  const works = museumData.works.length;
  const media = museumData.media.length;
  console.log(`数据校验通过：${works} 件作品、${media} 条媒体引用，器物类型与文件均有效。`);
}
