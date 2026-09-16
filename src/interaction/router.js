/**
 * hash 路由：#history / #materials / #weaves / #works?type=... / #masters
 * - 作品页筛选参数也在 hash query 中，前进后退天然可恢复；
 * - 非法或空 hash 默认进入“历史”。
 */

export const ROUTES = ["history", "materials", "weaves", "works", "masters"];
export const DEFAULT_ROUTE = "history";

export function parseHash() {
  const raw = (window.location.hash || "").replace(/^#/, "");
  const [name, queryString] = raw.split("?");
  const query = new URLSearchParams(queryString || "");
  return {
    name: ROUTES.includes(name) ? name : DEFAULT_ROUTE,
    rawName: name,
    query,
  };
}

export function createRouter({ onChange }) {
  function handle() {
    const route = parseHash();
    document.querySelectorAll("[data-section]").forEach((section) => {
      section.hidden = section.dataset.section !== route.name;
    });
    document.querySelectorAll(".hero-nav a").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.route === route.name);
    });
    window.scrollTo({ top: 0, behavior: "auto" });
    onChange(route);
  }

  window.addEventListener("hashchange", handle);
  window.addEventListener("popstate", handle);

  return {
    start: handle,
    current: parseHash,
  };
}
