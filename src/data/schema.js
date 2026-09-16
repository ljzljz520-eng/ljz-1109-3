/**
 * 数据 schema 校验器
 * - 通用部分：轻量类型/结构校验引擎
 * - 馆藏规则：器物类型必须在枚举内；作品的媒体引用必须能在媒体表中解析；
 *   媒体路径必须是站内相对路径；构建时还会由 Node 端复查文件是否存在。
 */

export const WORK_TYPES = [
  "篮",
  "盘",
  "盒",
  "瓶",
  "席",
  "扇",
  "灯具",
  "斗笠",
];

const ALLOWED_MEDIA_EXT = [".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif"];

/* ---------- 通用 schema 描述 ---------- */

export function str(min = 0, max = Infinity) {
  return { kind: "string", min, max };
}

export function num(min = -Infinity, max = Infinity) {
  return { kind: "number", min, max };
}

export function bool() {
  return { kind: "boolean" };
}

export function oneOf(values) {
  return { kind: "enum", values };
}

export function maybe(spec) {
  return { ...spec, optional: true };
}

export function listOf(itemSpec, min = 0) {
  return { kind: "array", item: itemSpec, min };
}

export function object(shape) {
  return { kind: "object", shape };
}

/* ---------- 核心校验 ---------- */

function check(spec, value, path, errors) {
  if (value === undefined || value === null) {
    if (spec.optional) return;
    errors.push({ path, message: "缺少必填字段" });
    return;
  }

  switch (spec.kind) {
    case "string": {
      if (typeof value !== "string") {
        errors.push({ path, message: `应为字符串，实际为 ${typeof value}` });
        return;
      }
      if (value.trim().length < spec.min) {
        errors.push({ path, message: `字符串长度不能少于 ${spec.min}` });
      }
      if (value.length > spec.max) {
        errors.push({ path, message: `字符串长度不能超过 ${spec.max}` });
      }
      return;
    }
    case "number": {
      if (typeof value !== "number" || Number.isNaN(value)) {
        errors.push({ path, message: "应为数字" });
        return;
      }
      if (value < spec.min || value > spec.max) {
        errors.push({ path, message: `数字应在 ${spec.min} ~ ${spec.max} 之间` });
      }
      return;
    }
    case "boolean": {
      if (typeof value !== "boolean") errors.push({ path, message: "应为布尔值" });
      return;
    }
    case "enum": {
      if (!spec.values.includes(value)) {
        errors.push({ path, message: `值 “${value}” 不在允许集合中：${spec.values.join(" / ")}` });
      }
      return;
    }
    case "array": {
      if (!Array.isArray(value)) {
        errors.push({ path, message: "应为数组" });
        return;
      }
      if (value.length < spec.min) {
        errors.push({ path, message: `数组至少包含 ${spec.min} 项` });
      }
      value.forEach((item, i) => check(spec.item, item, `${path}[${i}]`, errors));
      return;
    }
    case "object": {
      if (typeof value !== "object" || Array.isArray(value)) {
        errors.push({ path, message: "应为对象" });
        return;
      }
      for (const [key, fieldSpec] of Object.entries(spec.shape)) {
        check(fieldSpec, value[key], `${path}.${key}`, errors);
      }
      const allowed = new Set(Object.keys(spec.shape));
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) {
          errors.push({ path: `${path}.${key}`, message: "出现 schema 未定义的多余字段" });
        }
      }
      return;
    }
    default:
      errors.push({ path, message: `未知的 schema 类型：${spec.kind}` });
  }
}

export function validate(spec, value, rootName = "data") {
  const errors = [];
  check(spec, value, rootName, errors);
  return errors;
}

/* ---------- 媒体路径规则：必须是站内相对路径 ---------- */

function isSafeRelativePath(src) {
  if (typeof src !== "string" || src.length === 0) return "媒体路径为空";
  if (src.startsWith("/")) return "不能使用以 / 开头的绝对路径";
  if (/^[a-z]+:/i.test(src) || src.startsWith("//")) return "不能使用协议绝对 URL";
  if (src.includes("..")) return "不能包含 .. 路径段";
  const lower = src.toLowerCase();
  if (!ALLOWED_MEDIA_EXT.some((ext) => lower.endsWith(ext))) {
    return `媒体扩展名不受支持，允许：${ALLOWED_MEDIA_EXT.join(" ")}`;
  }
  return null;
}

/* ---------- 馆藏数据 schema ---------- */

const mediaSpec = object({
  src: str(1),
  alt: str(1, 80),
  width: maybe(num(1)),
  height: maybe(num(1)),
});

const workSpec = object({
  id: str(2, 40),
  name: str(1, 40),
  type: oneOf(WORK_TYPES),
  media: str(1),
  masterId: str(1),
  year: str(1, 20),
  region: str(1, 30),
  weave: str(1, 40),
  description: str(4),
});

const masterSpec = object({
  id: str(2, 40),
  name: str(1, 20),
  title: str(2, 40),
  born: str(1, 12),
  region: str(1, 30),
  bio: str(4),
  quote: str(2),
});

export const museumSpec = object({
  history: listOf(
    object({
      era: str(1, 24),
      title: str(1, 40),
      text: str(4),
    }),
    1
  ),
  bamboos: listOf(
    object({
      name: str(1, 20),
      latin: str(1, 40),
      use: str(4),
    }),
    1
  ),
  processes: listOf(
    object({
      name: str(1, 20),
      text: str(4),
    }),
    1
  ),
  strips: listOf(
    object({
      name: str(1, 20),
      spec: str(1, 30),
      text: str(4),
    }),
    1
  ),
  weaves: listOf(
    object({
      id: str(2, 20),
      name: str(1, 20),
      sub: str(1, 30),
      description: str(4),
      animated: bool(),
    }),
    1
  ),
  media: listOf(mediaSpec, 1),
  masters: listOf(masterSpec, 1),
  works: listOf(workSpec, 1),
});

/**
 * 校验整份馆藏数据。
 * @param {object} data 博物馆数据
 * @param {(src:string)=>boolean} [fileExists] 仅构建期传入：检查媒体文件确实存在
 * @returns {{ valid: boolean, errors: Array<{path:string,message:string}> }}
 */
export function validateMuseumData(data, fileExists) {
  const errors = validate(museumSpec, data, "museum");

  const mediaIds = new Set();
  (data.media || []).forEach((m, i) => {
    mediaIds.add(m.src);
    const pathProblem = isSafeRelativePath(m.src);
    if (pathProblem) errors.push({ path: `museum.media[${i}].src`, message: pathProblem });
    if (fileExists) {
      if (!fileExists(m.src)) {
        errors.push({ path: `museum.media[${i}].src`, message: `媒体文件不存在：${m.src}` });
      }
    }
  });

  const masterIds = new Set((data.masters || []).map((m) => m.id));

  const workIds = new Set();
  (data.works || []).forEach((w, i) => {
    if (w && typeof w.id === "string") {
      if (workIds.has(w.id)) {
        errors.push({ path: `museum.works[${i}].id`, message: `作品 id 重复：${w.id}` });
      }
      workIds.add(w.id);
    }
    if (w && typeof w.media === "string" && !mediaIds.has(w.media)) {
      errors.push({
        path: `museum.works[${i}].media`,
        message: `作品 “${w.name || w.id}” 引用了媒体表中不存在的媒体：${w.media}`,
      });
    }
    if (w && typeof w.masterId === "string" && !masterIds.has(w.masterId)) {
      errors.push({
        path: `museum.works[${i}].masterId`,
        message: `作品 “${w.name || w.id}” 引用了不存在的师傅：${w.masterId}`,
      });
    }
  });

  const weaveIds = new Set((data.weaves || []).map((w) => w.id));
  (data.works || []).forEach((w, i) => {
    if (w && w.weave && !weaveIds.has(w.weave)) {
      errors.push({
        path: `museum.works[${i}].weave`,
        message: `作品 “${w.name || w.id}” 引用了未登记的编法：${w.weave}`,
      });
    }
  });

  return { valid: errors.length === 0, errors };
}

export function formatErrors(result) {
  return result.errors.map((e) => `  ✗ ${e.path} — ${e.message}`).join("\n");
}
