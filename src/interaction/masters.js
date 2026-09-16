import { el } from "./dom.js";

const WEAVE_NAME = {
  plain: "压一挑一",
  twill: "斜纹编",
  edge: "收边",
  hexagon: "六角眼",
  herringbone: "人字编",
};

export function mountMasters({ masters, works, root }) {
  root.innerHTML = "";
  for (const m of masters) {
    const ownWorks = works.filter((w) => w.masterId === m.id);

    const avatar = el("div", { class: "master-avatar", "aria-hidden": "true", text: m.name.charAt(0) });
    const body = el("div", { class: "master-body" }, [
      el("h3", { text: m.name }),
      el("p", { class: "master-title", text: `${m.title} · ${m.born} · ${m.region}` }),
      el("p", { class: "master-bio", text: m.bio }),
      el("blockquote", { text: `“${m.quote}”` }),
    ]);

    if (ownWorks.length) {
      body.appendChild(
        el("p", {
          class: "master-works",
          text: "本馆作品：" + ownWorks.map((w) => `${w.name}（${WEAVE_NAME[w.weave] || w.weave}）`).join("、"),
        })
      );
    }

    root.appendChild(el("article", { class: "master-card" }, [avatar, body]));
  }
}
