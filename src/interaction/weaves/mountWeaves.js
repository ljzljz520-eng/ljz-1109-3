import { el, html } from "../dom.js";
import { StepPlayer } from "./player.js";
import { buildGridScene, buildEdgeScene } from "./scenes.js";

const SPEEDS = [0.7, 1, 1.5, 2];

function gridCaptions(kind) {
  const verb = kind === "plain" ? "压一挑一" : "压二挑二并错一位";
  const captions = ["准备：7 根经篾纵向固定，纬篾自第一行起穿入。"];
  for (let r = 1; r <= 7; r += 1) {
    if (r < 7) captions.push(`第 ${r} 行：纬篾${verb}穿入，继续下一行。`);
    else captions.push("第 7 行完成，纹样铺满整个面。");
  }
  captions.push("编织完成。按“复位”可重新逐行观察。");
  return captions;
}

const EDGE_CAPTIONS = [
  "准备：口沿上方留着 7 根外露的经篾端头。",
  "第 1 根端头沿口沿回折 180°，插入编层。",
  "第 2 根端头回折，相邻锁紧。",
  "第 3 根端头回折，依次锁口。",
  "第 4 根端头回折，锁至中点。",
  "第 5 根端头回折，过半收口。",
  "第 6 根端头回折，只余一根。",
  "最后一根端头回折。",
  "收边完成：口沿挺括，端头全部隐入编层。",
];

function buildAnimatedCard(weave) {
  let scene;
  let intervalMs;
  let captions;
  let legend;
  if (weave.id === "plain") {
    scene = buildGridScene("plain");
    intervalMs = 620;
    captions = gridCaptions("plain");
    legend = [
      { color: "#d8b36b", label: "经篾：纵向骨篾" },
      { color: "#7c9a63", label: "纬篾：在经篾下" },
      { color: "#9bbb7d", label: "纬篾：压过经篾" },
    ];
  } else if (weave.id === "twill") {
    scene = buildGridScene("twill");
    intervalMs = 650;
    captions = gridCaptions("twill");
    legend = [
      { color: "#d8b36b", label: "经篾：纵向骨篾" },
      { color: "#7c9a63", label: "纬篾底层" },
      { color: "#9bbb7d", label: "纬篾压经（连二格错位）" },
    ];
  } else {
    scene = buildEdgeScene();
    intervalMs = 560;
    captions = EDGE_CAPTIONS;
    legend = [
      { color: "#d8b36b", label: "经篾端头" },
      { color: "#5b4630", label: "口沿（锁口）" },
      { color: "#c9b489", label: "已编篮壁" },
    ];
  }

  const card = el("article", { class: "weave-card" });
  card.appendChild(el("h3", { text: weave.name }));
  card.appendChild(el("p", { class: "weave-sub", text: weave.sub }));
  card.appendChild(el("p", { text: weave.description }));

  // 图例：颜色来自代码常量，文字来自数据（经 textContent 转义）
  const legendBox = el("div", { class: "legend" });
  for (const item of legend) {
    const swatch = el("i");
    swatch.style.background = item.color;
    legendBox.appendChild(el("span", {}, [swatch, document.createTextNode(item.label)]));
  }
  card.appendChild(legendBox);

  // SVG 由本项目代码生成（非外部数据），可直接置入
  const svgWrap = el("div", { class: "weave-svg-wrap" });
  svgWrap.innerHTML = scene.svg;
  card.appendChild(svgWrap);

  const dots = [];
  const dotBar = el("div", { class: "step-dots", role: "tablist", "aria-label": "编织步骤" });
  for (let i = 0; i <= scene.steps; i += 1) {
    const dot = el("button", {
      class: "step-dot",
      type: "button",
      text: String(i),
      "aria-label": `跳到第 ${i} 步`,
    });
    dot.addEventListener("click", () => {
      player.pause();
      player.seek(i);
    });
    dots.push(dot);
    dotBar.appendChild(dot);
  }

  const playBtn = el("button", { class: "primary", type: "button", text: "播放" });
  const resetBtn = el("button", { type: "button", text: "复位" });
  const speedSel = el("select", { "aria-label": "播放速度" });
  SPEEDS.forEach((s) => {
    speedSel.appendChild(el("option", { value: String(s), text: s === 1 ? "1× 常速" : `${s}×` }));
  });

  const status = el("p", { class: "weave-status", "aria-live": "polite", text: captions[0] });

  const controls = el("div", { class: "player-controls" }, [
    playBtn,
    resetBtn,
    el("label", {}, ["速度", speedSel]),
  ]);
  card.append(dotBar, controls, status);

  const player = new StepPlayer({
    steps: scene.steps,
    captions,
    intervalMs,
    stepEvents: scene.stepEvents,
  });

  // 场景在卡片插入文档后再绑定真实 DOM
  scene.attach(card);

  function paintDots(snap) {
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-done", i < snap.current);
      dot.classList.toggle("is-current", i === snap.current);
    });
  }

  player.on("play", (snap) => {
    playBtn.textContent = "暂停";
    status.textContent = snap.caption;
    paintDots(snap);
  });
  player.on("pause", (snap) => {
    playBtn.textContent = "播放";
    status.textContent = snap.caption;
    paintDots(snap);
  });
  player.on("step", (snap) => {
    status.textContent = snap.caption;
    paintDots(snap);
  });
  player.on("done", (snap) => {
    playBtn.textContent = "播放";
    status.textContent = snap.caption;
    paintDots(snap);
  });
  player.on("reset", (snap) => {
    playBtn.textContent = "播放";
    status.textContent = snap.caption;
    paintDots(snap);
  });

  playBtn.addEventListener("click", () => player.toggle());
  resetBtn.addEventListener("click", () => player.reset());
  speedSel.addEventListener("change", () => player.setSpeed(Number(speedSel.value)));

  // 初始画一遍第 0 步
  player.seek(0);
  player.pause();

  card._weavePlayer = player;
  return card;
}

export function mountWeaves({ weaves, root }) {
  root.innerHTML = "";
  const players = [];
  for (const weave of weaves) {
    if (weave.animated) {
      const card = buildAnimatedCard(weave);
      players.push(card._weavePlayer);
      root.appendChild(card);
    }
  }

  const extra = weaves.filter((w) => !w.animated);
  if (extra.length) {
    const extraRoot = document.getElementById("weave-extra");
    extraRoot.innerHTML = extra
      .map(
        (w) => html`
          <article class="weave-mini">
            <h4>${w.name}</h4>
            <p class="weave-sub">${w.sub}</p>
            <p>${w.description}</p>
          </article>`
      )
      .join("");
  }

  // 供路由在离开栏目时统一暂停、取消计时器
  return () => players.forEach((p) => p.dispose());
}
