/**
 * jsdom 冒烟测试：加载构建产物，模拟用户操作。
 * 运行：node tools/smoke/run-smoke.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const html = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
const assetsRoot = path.join(root, "dist");

const failures = [];
const pass = (cond, name) => {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures.push(name);
    console.error(`  ✗ ${name}`);
  }
};

const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
});
const { window } = dom;
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};

// jsdom 不加载 <img>，但会解析 src；直接校验属性
function imgSrcs() {
  return [...window.document.querySelectorAll(".work-card img")].map((i) => i.getAttribute("src"));
}

await new Promise((resolve) => {
  window.addEventListener("load", () => setTimeout(resolve, 60));
  setTimeout(resolve, 1500);
});

console.log("1) 初始状态：默认历史栏目渲染");
pass(window.location.hash === "#history", "无 hash 时补为 #history");
pass(!window.document.querySelector('[data-section="history"]').hidden, "历史栏目可见");
pass(window.document.querySelectorAll(".tl-item").length === 7, "渲染 7 条历史时间线");
pass(window.document.querySelector(".hero-nav a[data-route='history']").classList.contains("is-active"), "历史导航高亮");

console.log("2) 材料栏目");
window.location.hash = "#materials";
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
await new Promise((r) => setTimeout(r, 30));
pass(window.document.querySelectorAll("#bamboo-grid .mat-card").length === 4, "渲染 4 种竹种卡片");
pass(window.document.querySelectorAll("#process-list li").length === 8, "渲染 8 道备料工序");
pass(window.document.querySelectorAll("#strip-grid .mat-card").length === 3, "渲染 3 种篾料规格");

console.log("3) 编法动画：步骤事件 + 可取消计时器");
window.location.hash = "#weaves";
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
await new Promise((r) => setTimeout(r, 30));
const weaveCards = window.document.querySelectorAll("#weave-stage .weave-card");
pass(weaveCards.length === 3, "渲染 3 个动画编法卡片");
const firstCard = weaveCards[0];
const playBtn = firstCard.querySelector(".primary");
const status = firstCard.querySelector(".weave-status");
const dots = [...firstCard.querySelectorAll(".step-dot")];
pass(dots.length === 8, "压一挑一有 8 个步骤点(0..7)");
pass(dots[0].classList.contains("is-current"), "初始停在第 0 步");
const caption0 = status.textContent;
playBtn.click(); // 播放
pass(playBtn.textContent === "暂停", "播放后按钮变为“暂停”");
await new Promise((r) => setTimeout(r, 750));
const after1 = firstCard.querySelectorAll(".layer-bases .wv-row:not(.wv-row-hidden)").length;
pass(after1 === 1, "约一步后第 1 行纬篾显现");
playBtn.click(); // 暂停
await new Promise((r) => setTimeout(r, 400));
const rowsAtPause = firstCard.querySelectorAll(".layer-bases .wv-row:not(.wv-row-hidden)").length;
await new Promise((r) => setTimeout(r, 400));
const rowsLater = firstCard.querySelectorAll(".layer-bases .wv-row:not(.wv-row-hidden)").length;
pass(rowsAtPause === rowsLater, "暂停后计时器不再推进（可取消计时器生效）");
// 步骤跳转
dots[4].click();
await new Promise((r) => setTimeout(r, 30));
pass(firstCard.querySelectorAll(".layer-bases .wv-row:not(.wv-row-hidden)").length === 4, "点步骤点跳转到第 4 步");
pass(dots[4].classList.contains("is-current"), "第 4 步点高亮");

console.log("4) 收边动画：端头回折");
const edgeCard = weaveCards[2];
const edgeDots = [...edgeCard.querySelectorAll(".step-dot")];
edgeDots[5].click();
await new Promise((r) => setTimeout(r, 30));
const bent = edgeCard.querySelectorAll(".wv-tuck.is-bent").length;
pass(bent === 5, "第 5 步有 5 根端头已回折");
edgeCard.querySelector("button:not(.primary)").click(); // 复位
await new Promise((r) => setTimeout(r, 30));
pass(edgeCard.querySelectorAll(".wv-tuck.is-bent").length === 0, "复位后端头全部竖直");

console.log("5) 作品筛选与 URL");
window.location.hash = "#works?type=all";
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
await new Promise((r) => setTimeout(r, 30));
const chips = () => [...window.document.querySelectorAll("#works-filters button")];
pass(chips().length === 9, "筛选项 = 全部 + 8 种器物类型");
pass(window.document.querySelectorAll("#works-grid .work-card").length === 10, "全部：展示 10 件作品");
const refs = imgSrcs();
pass(refs.every((s) => s.startsWith("assets/works/")), "所有媒体均为相对路径");
const basketChip = chips().find((b) => b.textContent.trim().startsWith("篮"));
basketChip.click();
await new Promise((r) => setTimeout(r, 30));
pass(window.location.hash === "#works?type=%E7%AF%AE", "点击筛选后条件写入 URL（篮被编码）");
pass(window.document.querySelectorAll("#works-grid .work-card").length === 3, "篮类筛选为 3 件");
pass(chips().find((b) => b.classList.contains("is-active")) === basketChip, "篮类筛选项高亮");
// 前进后退
window.history.back();
window.dispatchEvent(new window.PopStateEvent("popstate"));
await new Promise((r) => setTimeout(r, 30));
pass(window.location.hash === "#works?type=all", "后退恢复 all");
pass(window.document.querySelectorAll("#works-grid .work-card").length === 10, "后退后恢复 10 件");

console.log("6) 非法 URL 规整");
window.history.pushState(null, "", "#works?type=飞碟");
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
await new Promise((r) => setTimeout(r, 30));
pass(window.document.querySelectorAll("#works-grid .work-card").length === 10, "未知类型回退显示全部");

console.log("7) 师傅栏目");
window.location.hash = "#masters";
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
await new Promise((r) => setTimeout(r, 30));
pass(window.document.querySelectorAll(".master-card").length === 3, "渲染 3 位师傅故事");

console.log("8) 离开编法页取消计时器");
window.location.hash = "#weaves";
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
await new Promise((r) => setTimeout(r, 30));
weaveCards[0].querySelector(".primary").click();
window.location.hash = "#history";
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
const beforeRows = weaveCards[0].querySelectorAll(".layer-bases .wv-row:not(.wv-row-hidden)").length;
await new Promise((r) => setTimeout(r, 700));
const afterRows = weaveCards[0].querySelectorAll(".layer-bases .wv-row:not(.wv-row-hidden)").length;
pass(beforeRows === afterRows, "切走后动画计时器已取消，画面不再推进");

console.log("9) 媒体文件真实存在");
const allRefs = [...new Set([...window.document.querySelectorAll("img")].map((i) => i.getAttribute("src")))];
pass(allRefs.every((s) => fs.existsSync(path.join(assetsRoot, s))), `${allRefs.length} 个媒体引用在 dist 中均存在`);

console.log("");
if (failures.length) {
  console.error(`冒烟测试失败 ${failures.length} 项：${failures.join("；")}`);
  process.exit(1);
}
console.log("全部冒烟测试通过 ✔");
window.close();
