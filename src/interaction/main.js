import { museumData } from "../data/museum-data.js";
import { validateMuseumData } from "../data/schema.js";
import { createRouter } from "./router.js";
import { mountHistory } from "./history.js";
import { mountMaterials } from "./materials.js";
import { mountMasters } from "./masters.js";
import { mountWeaves } from "./weaves/mountWeaves.js";
import { mountWorks, getWorksRouteType } from "./works.js";

/* 运行时再校验一次（构建期 tools/validate-data.mjs 会额外检查文件存在性） */
const validation = validateMuseumData(museumData);
if (!validation.valid) {
  console.groupCollapsed("[竹编馆] 数据 schema 校验未通过（仍尝试渲染）");
  validation.errors.forEach((e) => console.warn(`${e.path} — ${e.message}`));
  console.groupEnd();
} else {
  console.info("[竹编馆] 数据 schema 校验通过：器物类型与媒体引用均有效。");
}

const data = museumData;

/* 各栏目内容只在首次进入时渲染一次；作品页保留 refresh 以响应 URL 变化 */
let worksController = null;
let disposeWeaves = null;
const mounted = new Set();

function mountSection(name) {
  if (name === "history") {
    mountHistory({ history: data.history, root: document.getElementById("timeline") });
  } else if (name === "materials") {
    mountMaterials({
      bamboos: data.bamboos,
      processes: data.processes,
      strips: data.strips,
      root: document,
    });
  } else if (name === "weaves") {
    disposeWeaves = mountWeaves({
      weaves: data.weaves,
      root: document.getElementById("weave-stage"),
    });
  } else if (name === "works") {
    worksController = mountWorks({
      works: data.works,
      media: data.media,
      masters: data.masters,
      root: document.getElementById("works-grid"),
    });
  } else if (name === "masters") {
    mountMasters({
      masters: data.masters,
      works: data.works,
      root: document.getElementById("masters-list"),
    });
  }
  mounted.add(name);
}

const router = createRouter({
  onChange(route) {
    // 离开编法页：暂停并取消所有尚未触发的动画计时器。
    // 销毁函数保持引用（幂等：StepPlayer.pause 可重复调用），
    // 因为编法页只挂载一次，之后每次离开都还要能取消计时器。
    if (route.name !== "weaves" && disposeWeaves) {
      disposeWeaves();
    }

    if (!mounted.has(route.name)) {
      mountSection(route.name);
    }

    // 作品页：前进/后退导致 type 变化时重渲染
    if (route.name === "works" && worksController) {
      worksController.refresh();
    }
  },
});

// 首次进入若无 hash，静默补一个，保证刷新后仍停留在当前栏目
if (!window.location.hash) {
  window.history.replaceState(null, "", "#history");
}
// 防御：若手工输入非法作品类型，规整为 all
if (window.location.hash.startsWith("#works?") && getWorksRouteType() === "all") {
  const rawType = new URLSearchParams(window.location.hash.slice(window.location.hash.indexOf("?") + 1)).get("type");
  if (rawType && rawType !== "all") {
    window.history.replaceState(null, "", "#works?type=all");
  }
}

router.start();
