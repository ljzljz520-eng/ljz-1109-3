import { Emitter } from "../emitter.js";
import { CancellableTimer } from "../timer.js";

/**
 * 编法步骤播放器。
 *
 * 它只负责“步骤状态机”和调度，不认识 SVG：
 *  - stepEvents(step) 负责把每一步画到舞台上（由 createWeavePlayer 注入）；
 *  - 对外广播 step / play / pause / done / reset 事件，控件通过事件刷新。
 *
 * 播放循环用 CancellableTimer 链式调度，任意时刻调用 pause/reset/cancel
 * 都能阻止尚未触发的下一步（例如快速切换栏目时不会“偷跑”）。
 */
export class StepPlayer extends Emitter {
  constructor({ steps, captions, intervalMs = 700, stepEvents, initialCaption = "" }) {
    super();
    this.steps = steps;
    this.captions = captions;
    this.intervalMs = intervalMs;
    this.stepEvents = stepEvents;
    this.initialCaption = initialCaption;
    this.current = 0;
    this.playing = false;
    this.speed = 1;
    this.timer = new CancellableTimer();
    if (typeof stepEvents?.go !== "function" || typeof stepEvents?.reset !== "function") {
      throw new Error("StepPlayer 需要 { go(step), reset() } 两个步骤事件处理器");
    }
  }

  captionFor(step) {
    if (this.captions[step] !== undefined) return this.captions[step];
    return this.initialCaption;
  }

  _snapshot(extra = {}) {
    return {
      current: this.current,
      total: this.steps,
      playing: this.playing,
      caption: this.captionFor(this.current),
      ...extra,
    };
  }

  /** 推进到指定步骤（含），只负责状态与事件，实际绘制交给 stepEvents.go */
  seek(step) {
    this.current = Math.max(0, Math.min(this.steps, step));
    this.stepEvents.go(this.current, this);
    this.emit("step", this._snapshot());
  }

  play() {
    if (this.playing) return;
    // 在末尾再按播放：从头开始
    if (this.current >= this.steps) this.seek(0);
    this.playing = true;
    this.emit("play", this._snapshot());
    this._scheduleNext();
  }

  pause() {
    if (!this.playing) return;
    this.playing = false;
    this.timer.cancel();
    this.emit("pause", this._snapshot());
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  reset() {
    this.pause();
    this.current = 0;
    this.stepEvents.reset(this);
    this.emit("reset", this._snapshot());
  }

  setSpeed(speed) {
    const changed = this.speed !== speed;
    this.speed = speed;
    if (changed) this.emit("step", this._snapshot());
  }

  /** 组件被移除（如切换栏目）时调用，彻底取消计时器 */
  dispose() {
    this.pause();
  }

  _scheduleNext() {
    if (!this.playing) return;
    if (this.current >= this.steps) {
      this.playing = false;
      this.emit("done", this._snapshot());
      return;
    }
    const delay = this.intervalMs / this.speed;
    this.timer.run(() => {
      if (!this.playing) return;
      this.current += 1;
      this.stepEvents.go(this.current, this);
      this.emit("step", this._snapshot());
      if (this.current >= this.steps) {
        this.playing = false;
        this.emit("done", this._snapshot());
        return;
      }
      this._scheduleNext();
    }, delay);
  }
}
