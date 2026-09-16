/**
 * 基于 EventTarget 的轻量事件发射器。
 * 编法播放器通过它对外广播 play / pause / step / done / reset 等步骤事件，
 * 视图层（按钮、步骤点、状态文字）只订阅事件，不直接持有播放状态。
 */
export class Emitter {
  constructor() {
    this._target = new EventTarget();
    this._handlers = new Map();
  }

  emit(type, detail) {
    this._target.dispatchEvent(new CustomEvent(type, { detail }));
  }

  /**
   * 订阅事件，返回取消订阅函数。
   */
  on(type, handler) {
    const wrapper = (event) => handler(event.detail, event);
    const set = this._handlers.get(type) || new Set();
    set.add({ handler, wrapper });
    this._handlers.set(type, set);
    this._target.addEventListener(type, wrapper);
    return () => {
      this._target.removeEventListener(type, wrapper);
      set.delete({ handler, wrapper });
    };
  }
}
