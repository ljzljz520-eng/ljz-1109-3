/**
 * 编法动画场景：负责生成 SVG 与“步骤事件 -> 画面”的映射。
 * 场景本身没有计时器；播放、暂停、取消由 StepPlayer 驱动。
 */

/* ---------- 共用 ---------- */

const COLORS = {
  paper: "#f3ecd8",
  warpBase: "#d8b36b", // 经篾：金竹色
  warpOver: "#eccd85", // 经篾在上（受光面更亮）
  weftBase: "#7c9a63", // 纬篾：青篾色
  weftOver: "#9bbb7d", // 纬篾在上
  rim: "#5b4630",
  rimLight: "#8a6a45",
  body: "#c9b489",
};

function h(value) {
  return String(value).replace(/"/g, "&quot;");
}

function setRowVisibility(refs, current) {
  // 第 r 行在步骤 r+1 出现；未到达的行整体淡出
  refs.rowGroups.forEach((g) => {
    const r = Number(g.dataset.row);
    g.classList.toggle("wv-row-hidden", r + 1 > current);
  });
}

/* ---------- 压一挑一 / 斜纹：俯视网格 ---------- */

/**
 * @param {"plain"|"twill"} kind
 * plain: 每行同相；twill: 每行整体错位一根，压二挑二
 */
export function buildGridScene(kind) {
  const n = 7; // 7 经 × 7 纬
  const x0 = 26;
  const y0 = 25;
  const cellX = 44;
  const cellY = 30;
  const stripX = cellX - 2;
  const stripY = cellY - 2;
  const width = x0 * 2 + n * cellX;
  const height = 50 + n * cellY;

  // 该格是否“经篾在上”
  const warpOnTop = (r, c) => {
    if (kind === "plain") return (r + c) % 2 === 0;
    // 斜纹：压二挑二，下一行错一位
    const phase = ((c - r) % 4 + 4) % 4;
    return phase === 0 || phase === 1;
  };

  const rowGroups = [];
  const overGroups = [];

  let bases = "";
  let overs = "";
  for (let r = 0; r < n; r += 1) {
    const y = y0 + r * cellY;
    let overCells = "";
    for (let c = 0; c < n; c += 1) {
      if (!warpOnTop(r, c)) {
        const x = x0 + c * cellX + 1;
        overCells += `<rect class="wv-piece" x="${x}" y="${y + 1}" width="${stripX}" height="${stripY}" rx="1.5" fill="${COLORS.weftOver}"/>`;
      }
    }
    const rowId = `row-${kind}-${r}`;
    bases += `<g class="wv-row wv-row-hidden" data-row="${r}" id="${h(rowId)}-b">
      <rect class="wv-piece" x="${x0}" y="${y + 1}" width="${n * cellX - 2}" height="${stripY}" rx="1.5" fill="${COLORS.weftBase}"/>
    </g>`;
    overs += `<g class="wv-row wv-row-hidden" data-row="${r}" id="${h(rowId)}-o">${overCells}</g>`;
  }

  let warps = "";
  for (let c = 0; c < n; c += 1) {
    const x = x0 + c * cellX + 1;
    warps += `<rect x="${x}" y="${y0}" width="${stripX}" height="${n * cellY - 2}" rx="1.5" fill="${COLORS.warpBase}"/>`;
  }
  // 受光提示：每根经篾顶部一道亮头，提示经篾方向
  for (let c = 0; c < n; c += 1) {
    const x = x0 + c * cellX + 1;
    warps += `<rect x="${x + 2}" y="${y0 + 2}" width="3" height="${n * cellY - 6}" rx="1.5" fill="${COLORS.warpOver}" opacity="0.8"/>`;
  }

  const svg = `
  <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${kind === "plain" ? "压一挑一平纹编" : "斜纹编"}俯视示意">
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="8" fill="${COLORS.paper}"/>
    <text x="${x0}" y="16" font-size="11" fill="#5d594e">经篾（纵向）</text>
    <text x="${width - 26}" y="${height - 12}" font-size="11" fill="#5d594e" text-anchor="end">纬篾逐行穿入 →</text>
    <g class="layer-bases">${bases}</g>
    <g class="layer-warp">${warps}</g>
    <g class="layer-overs">${overs}</g>
  </svg>`;

  const refs = { rowGroups: [] };
  const attach = (root) => {
    refs.rowGroups = Array.from(root.querySelectorAll(".layer-bases .wv-row, .layer-overs .wv-row"));
  };

  const stepEvents = {
    go(step) {
      if (!refs.rowGroups.length) return;
      setRowVisibility(refs, step);
    },
    reset() {
      if (!refs.rowGroups.length) return;
      refs.rowGroups.forEach((g) => g.classList.add("wv-row-hidden"));
    },
  };

  return { svg, attach, stepEvents, steps: n };
}

/* ---------- 收边：口沿侧视，端头回折 ---------- */

export function buildEdgeScene() {
  const width = 360;
  const height = 230;
  const pivotY = 62; // 口沿上方转轴处
  const spokeBaseY = 112;
  const tuckLen = 46;
  const spokeCount = 7;
  const xStart = 46;
  const xEnd = 314;
  const gap = (xEnd - xStart) / (spokeCount - 1);

  let spokes = "";
  let tucks = "";
  for (let i = 0; i < spokeCount; i += 1) {
    const x = Math.round(xStart + i * gap);
    // 竖经篾：从篮壁一直到口沿上的转轴点
    spokes += `<line data-spoke="${i}" x1="${x}" y1="${spokeBaseY + 60}" x2="${x}" y2="${pivotY}"
      stroke="${COLORS.warpBase}" stroke-width="7" stroke-linecap="round"/>`;
    spokes += `<line data-spoke-hl="${i}" x1="${x - 1.5}" y1="${spokeBaseY + 60}" x2="${x - 1.5}" y2="${pivotY}"
      stroke="${COLORS.warpOver}" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>`;
    // 待回折的端头：初始竖直向上
    tucks += `<line class="wv-piece wv-tuck" data-tuck="${i}" x1="${x}" y1="${pivotY}" x2="${x}" y2="${pivotY - tuckLen}"
      stroke="${COLORS.warpBase}" stroke-width="7" stroke-linecap="round"/>`;
  }

  const svg = `
  <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="收边：经篾端头回折锁口示意">
    <defs>
      <pattern id="wv-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="10" height="10" fill="${COLORS.body}"/>
        <line x1="0" y1="0" x2="0" y2="10" stroke="#b0986a" stroke-width="2"/>
      </pattern>
    </defs>
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="8" fill="${COLORS.paper}"/>
    <!-- 篮身剖面 -->
    <path d="M18,218 L64,${spokeBaseY + 8} L296,${spokeBaseY + 8} L342,218 Z" fill="url(#wv-hatch)" stroke="#8a6a45" stroke-width="1.5"/>
    <!-- 竖经篾 -->
    <g class="layer-spokes">${spokes}</g>
    <!-- 口沿 -->
    <rect x="30" y="${pivotY - 9}" width="${width - 60}" height="17" rx="8.5" fill="${COLORS.rim}"/>
    <rect x="34" y="${pivotY - 7}" width="${width - 68}" height="4" rx="2" fill="${COLORS.rimLight}" opacity="0.7"/>
    <text x="34" y="${pivotY - 16}" font-size="11" fill="#5d594e">口沿</text>
    <!-- 待回折端头 -->
    <g class="layer-tucks">${tucks}</g>
    <text x="${width - 26}" y="26" font-size="11" fill="#5d594e" text-anchor="end">外露经篾端头 → 依次回折 180°</text>
  </svg>`;

  const refs = { tucks: [] };
  const attach = (root) => {
    refs.tucks = Array.from(root.querySelectorAll(".wv-tuck"));
  };

  const stepEvents = {
    go(step) {
      if (!refs.tucks.length) return;
      // 步骤 1..n：第 i 根端头回折（索引 i < step）
      refs.tucks.forEach((line, i) => {
        line.classList.toggle("is-bent", i < step);
      });
    },
    reset() {
      if (!refs.tucks.length) return;
      refs.tucks.forEach((line) => line.classList.remove("is-bent"));
    },
  };

  return { svg, attach, stepEvents, steps: spokeCount + 1 };
}
