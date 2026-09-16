import { el } from "./dom.js";

export function mountHistory({ history, root }) {
  root.innerHTML = "";
  for (const item of history) {
    const node = el("article", { class: "tl-item" }, [
      el("time", { text: item.era }),
      el("h3", { text: item.title }),
      el("p", { text: item.text }),
    ]);
    root.appendChild(node);
  }
}
