/**
 * 极简 DOM 工具。
 * 所有由数据生成的文本节点默认经 textContent / escapeHtml 处理，防止注入。
 */
export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("data-")) node.setAttribute(key, value);
    else if (key in node && key !== "list") {
      node[key] = value;
    } else {
      node.setAttribute(key, value);
    }
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * 用转义后的模板数据拼 innerHTML（模板中的常量字符串由开发者提供）。
 */
export function html(strings, ...values) {
  return strings.reduce((acc, part, i) => {
    const v = values[i];
    return acc + part + (v === undefined || v === null ? "" : escapeHtml(v));
  }, "");
}
