/**
 * 可取消计时器
 * 编法动画的每一步推进都经由它调度；切换栏目、暂停或复位时调用 cancel()，
 * 旧的回调绝不会在被取消后继续触发（用序号校验防止竞态）。
 */
export class CancellableTimer {
  constructor() {
    this._handle = null;
    this._seq = 0;
  }

  /**
   * 在 delayMs 后执行 fn；若期间再次 run 或 cancel，本次调度作废。
   * @returns {number} 当前调度序号
   */
  run(fn, delayMs) {
    const seq = ++this._seq;
    if (this._handle !== null) clearTimeout(this._handle);
    this._handle = setTimeout(() => {
      this._handle = null;
      if (seq === this._seq) fn();
    }, delayMs);
    return seq;
  }

  cancel() {
    this._seq++;
    if (this._handle !== null) {
      clearTimeout(this._handle);
      this._handle = null;
    }
  }

  get active() {
    return this._handle !== null;
  }
}
