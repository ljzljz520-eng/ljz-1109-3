# 竹编技艺展示馆

纯静态、零运行时依赖的竹编技艺展示馆。栏目：**历史 · 材料 · 编法 · 作品 · 师傅故事**。

## 功能

- **编法动画**：压一挑一（平纹）、斜纹（压二挑二错位）、收边（端头 180° 回折）三个可交互动画，
  支持播放 / 暂停 / 复位 / 步进点 / 0.7–2× 变速。
  - 动画由**步骤事件**驱动（`step / play / pause / done / reset`，见 `interaction/emitter.js`）；
  - 每一步通过**可取消计时器** `CancellableTimer` 链式调度，暂停、复位、切换栏目即取消未触发回调。
- **作品筛选**：按器物类型（篮/盘/盒/瓶/席/扇/灯具/斗笠）筛选，状态写入 URL
  （`#works?type=篮`），支持前进 / 后退 / 复制链接分享；非法类型自动回退为“全部”。
- **数据 schema 校验器**：构建期检查器物类型枚举、媒体引用是否登记、师傅/编法引用完整性，
  并对照磁盘确认媒体文件存在；禁止 `/` 绝对路径与外链 URL。
- **构建产物不依赖绝对路径**：JS/CSS 全部内联进单个 `dist/index.html`，资源全部相对路径，
  既可挂任意子路径静态服务，也可直接用浏览器以 `file://` 双击打开。

## 目录结构（按 样式 / 数据 / 交互 分层）

```
index.html                 页面骨架
src/
  styles/                  样式
    base.css               设计变量、排版、布局
    components.css         导航、时间线、卡片、筛选、师傅、页脚
    weaves.css             编法动画舞台与控件
  data/                    数据
    museum-data.js         唯一数据源（历史/竹种/工序/篾/编法/作品/师傅/媒体表）
    schema.js              通用校验引擎 + 馆藏规则（器物类型、媒体引用）
  interaction/             交互
    main.js                入口：运行时校验 + 挂载编排
    router.js              hash 路由
    dom.js / emitter.js / timer.js   DOM 工具、事件基类、可取消计时器
    history.js / materials.js / masters.js / works.js
    weaves/
      player.js            StepPlayer 步骤状态机（事件 + 可取消计时器）
      scenes.js            SVG 场景与步骤->画面映射
      mountWeaves.js       编法卡片与控件
assets/works/*.svg         10 件馆藏配图（代码绘制）
tools/
  build.js                 构建：校验 -> 内联打包 -> 拷资源 -> 绝对路径检查
  bundler.js               零依赖极简 ESM 打包器
  validate-data.mjs        独立数据校验（含文件存在性）
  serve.js                 零依赖静态服务器
  smoke/run-smoke.mjs      jsdom 冒烟测试
```

## 使用

```bash
npm install          # 仅安装测试用 jsdom；构建本身零依赖
npm run dev          # http://localhost:5173 开发预览（源码直跑 ESM）
npm run build        # 生成 dist/（先过数据校验）
npm run preview      # http://localhost:4173 预览构建产物
npm run validate     单独运行数据 schema 校验
node tools/smoke/run-smoke.mjs   冒烟测试（需先 build）
```
