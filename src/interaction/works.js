import { el } from "./dom.js";
import { WORK_TYPES } from "../data/schema.js";

/**
 * 作品筛选：
 *  - 当前筛选写入地址栏 hash：#works?type=篮
 *  - pushState 不触发 hashchange，因此点击时手动 render；
 *  - 浏览器前进/后退（popstate / hashchange）由路由统一转成 render。
 */

function parseTypeFromHash() {
  const hash = window.location.hash || "";
  const queryIndex = hash.indexOf("?");
  if (queryIndex === -1) return "all";
  const params = new URLSearchParams(hash.slice(queryIndex + 1));
  const t = params.get("type");
  return t && WORK_TYPES.includes(t) ? t : "all";
}

export function getWorksRouteType() {
  return parseTypeFromHash();
}

export function buildWorksHash(type) {
  return type === "all" ? "#works?type=all" : `#works?type=${encodeURIComponent(type)}`;
}

export function mountWorks({ works, media, masters, root }) {
  const filterBar = document.getElementById("works-filters");
  const countBox = document.getElementById("works-count");
  const emptyBox = document.getElementById("works-empty");
  const grid = root;

  const mediaBySrc = new Map(media.map((m) => [m.src, m]));
  const masterById = new Map(masters.map((m) => [m.id, m]));

  // 仅展示馆藏中实际出现的类型，顺序以 schema 枚举为准
  const presentTypes = WORK_TYPES.filter((t) => works.some((w) => w.type === t));

  filterBar.innerHTML = "";
  const chips = new Map();

  const makeChip = (type, label) => {
    const n = type === "all" ? works.length : works.filter((w) => w.type === type).length;
    const chip = el("button", {
      type: "button",
      text: `${label} ${n}`,
      "aria-pressed": "false",
    });
    chip.addEventListener("click", () => {
      const target = buildWorksHash(type);
      if (window.location.hash !== target) {
        window.history.pushState({ route: "works" }, "", target);
      }
      render(type);
    });
    filterBar.appendChild(chip);
    chips.set(type, chip);
  };

  makeChip("all", "全部");
  presentTypes.forEach((t) => makeChip(t, t));

  function makeCard(work) {
    const mediaItem = mediaBySrc.get(work.media) || { src: work.media, alt: work.name };
    const master = masterById.get(work.masterId);
    const img = el("img", {
      src: mediaItem.src,
      alt: mediaItem.alt,
      loading: "lazy",
      width: mediaItem.width ? String(mediaItem.width) : "400",
      height: mediaItem.height ? String(mediaItem.height) : "300",
    });
    const mediaBox = el("div", { class: "media" }, [img]);
    const body = el("div", { class: "body" }, [
      el("h3", { text: work.name }),
      el("p", { class: "meta", text: `${work.type} · ${work.year} · ${work.region}` }),
      el("p", { text: work.description }),
      el("div", { class: "tag-row" }, [
        el("span", { class: "tag", text: work.weave }),
        el("span", { class: "tag tag-master", text: master ? master.name : "佚名" }),
      ]),
    ]);
    return el("article", { class: "work-card" }, [mediaBox, body]);
  }

  function render(type) {
    const active = type && presentTypes.includes(type) ? type : "all";
    chips.forEach((chip, key) => {
      const on = key === active;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });

    const list = active === "all" ? works : works.filter((w) => w.type === active);
    grid.innerHTML = "";
    list.forEach((w) => grid.appendChild(makeCard(w)));

    countBox.textContent = `共 ${list.length} 件 / 馆藏 ${works.length} 件${active === "all" ? "" : `（类型：${active}）`}`;
    emptyBox.hidden = list.length !== 0;
  }

  render(getWorksRouteType());

  // 路由在 hash 变化（前进后退）时调用
  return {
    refresh: () => render(getWorksRouteType()),
  };
}
