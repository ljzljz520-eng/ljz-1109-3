import { el } from "./dom.js";

export function mountMaterials({ bamboos, processes, strips, root }) {
  const bambooGrid = document.getElementById("bamboo-grid");
  bambooGrid.innerHTML = "";
  for (const b of bamboos) {
    bambooGrid.appendChild(
      el("article", { class: "mat-card" }, [
        el("h4", { text: b.name }),
        el("span", { class: "latin", text: b.latin }),
        el("p", { text: b.use }),
      ])
    );
  }

  const processList = document.getElementById("process-list");
  processList.innerHTML = "";
  for (const p of processes) {
    const li = el("li");
    li.appendChild(el("strong", { text: p.name + "　" }));
    li.appendChild(el("span", { text: p.text }));
    processList.appendChild(li);
  }

  const stripGrid = document.getElementById("strip-grid");
  stripGrid.innerHTML = "";
  for (const s of strips) {
    stripGrid.appendChild(
      el("article", { class: "mat-card strip-card" }, [
        el("h4", { text: s.name }),
        el("p", { text: s.text }),
        el("span", { class: "strip-spec", text: s.spec }),
      ])
    );
  }
}
