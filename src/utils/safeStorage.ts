/**
 * localStorage 安全读写封装。
 *
 * 背景：全项目原先直接调用 `localStorage.getItem/setItem`，零异常处理。
 * 两类真实故障会因此把整站打挂：
 *
 * 1. Safari「阻止所有 Cookie」、部分校园机房策略下，**读取 `localStorage`
 *    这个属性本身**就抛 `SecurityError`。`ThemeContext` 在 `useState`
 *    初始化器里读主题，即渲染期抛错，用户只能看到错误页。
 * 2. 配额满时 `setItem` 抛 `QuotaExceededError`，用户每次编辑都失败且
 *    不知道原因。
 *
 * 约定：本模块所有导出函数**绝不向外抛异常**，失败一律降级为
 * 「读不到 / 写不进」，由调用方决定如何提示。
 *
 * 性能：可用性探测（一次 setItem + getItem + removeItem）的结果在模块级
 * 缓存，不会每次读写都重跑；存储不可用时直接短路，连 try/catch 都不进。
 */

const PROBE_KEY = '__dlut_gpa_storage_probe__';
const PROBE_VALUE = 'ok';

/** 探测结果缓存。`null` 表示尚未探测。 */
let availabilityCache: boolean | null = null;

/** 失败日志只打一次，避免配额满时刷屏。 */
let hasWarned = false;

const warnOnce = (action: string, error: unknown): void => {
  if (hasWarned) return;
  hasWarned = true;
  console.warn(
    `[safeStorage] localStorage ${action}失败，已降级（本次会话不再重复提示）。`,
    error
  );
};

/**
 * 取 localStorage 引用。
 * 在「阻止所有 Cookie」的环境里，这个属性访问本身就会抛 SecurityError。
 */
const getStorage = (): Storage | null => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

/** 真正探测一次可用性：能写、能读回、能清理。 */
const probeStorage = (): boolean => {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(PROBE_KEY, PROBE_VALUE);
    if (storage.getItem(PROBE_KEY) !== PROBE_VALUE) return false;
  } catch {
    return false;
  }

  try {
    storage.removeItem(PROBE_KEY);
  } catch {
    // 探测键清不掉不影响可用性判断，只是留下一条垃圾数据
  }

  return true;
};

/**
 * 探测 localStorage 是否可用。结果在模块级缓存，重复调用零成本。
 * 注意：返回 true 只代表「此刻能读写」，配额满仍可能在后续写入时发生。
 */
export const isStorageAvailable = (): boolean => {
  if (availabilityCache === null) {
    availabilityCache = probeStorage();
  }
  return availabilityCache;
};

/** 读取原始字符串。存储不可用或读取抛错时返回 `null`。 */
export const readString = (key: string): string | null => {
  if (!isStorageAvailable()) return null;

  const storage = getStorage();
  if (!storage) return null;

  try {
    return storage.getItem(key);
  } catch (error) {
    warnOnce('读取', error);
    return null;
  }
};

/**
 * 读取并 `JSON.parse`。任一环节失败（无值 / 读取抛错 / JSON 损坏）返回
 * `fallback`，不会把异常抛给调用方。
 */
export const readJSON = <T>(key: string, fallback: T): T => {
  const raw = readString(key);
  if (raw === null) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    warnOnce('解析', error);
    return fallback;
  }
};

/** 写入原始字符串。成功返回 `true`，任何失败返回 `false`。 */
export const writeString = (key: string, value: string): boolean => {
  if (!isStorageAvailable()) return false;

  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(key, value);
    return true;
  } catch (error) {
    warnOnce('写入', error);
    return false;
  }
};

/**
 * `JSON.stringify` 后写入。序列化失败（循环引用 / BigInt）或写入失败
 * （配额满）都返回 `false`，不抛。
 */
export const writeJSON = (key: string, value: unknown): boolean => {
  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(value) as string | undefined;
  } catch (error) {
    warnOnce('序列化', error);
    return false;
  }

  // JSON.stringify(undefined) / 函数 会返回 undefined，写进去没有意义
  if (serialized === undefined) return false;

  return writeString(key, serialized);
};

/** 删除键。存储不可用或删除抛错时静默返回。 */
export const remove = (key: string): void => {
  if (!isStorageAvailable()) return;

  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(key);
  } catch (error) {
    warnOnce('删除', error);
  }
};

/**
 * 清空探测结果与「已提示过」标记。
 *
 * 仅供测试使用：生产环境里探测结果就是该会话的结论，不需要重置。
 */
export const resetSafeStorageState = (): void => {
  availabilityCache = null;
  hasWarned = false;
};
