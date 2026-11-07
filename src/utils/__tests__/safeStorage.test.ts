import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  isStorageAvailable,
  readJSON,
  readString,
  remove,
  resetSafeStorageState,
  writeJSON,
  writeString,
} from '../safeStorage';

const KEY = 'safe_storage_test_key';

/** 造一个和浏览器一致的命名异常，便于断言「不抛」而非「抛了别的」。 */
const domError = (name: string, message: string) =>
  new DOMException(message, name);

/**
 * 注意：`src/test/setup.ts` 用一个实现了 `Storage` 接口的 MemoryStorage 实例
 * 替换了 `localStorage`，它并不继承 `Storage.prototype`。
 * 因此这里对**实例**打 spy；语义与 `vi.spyOn(Storage.prototype, ...)` 等价，
 * 都是让底层 setItem/getItem 抛错。
 */
const spySetItemThrow = (error: unknown) =>
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
    throw error;
  });

const spyGetItemThrow = (error: unknown) =>
  vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
    throw error;
  });

const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'localStorage'
);

describe('safeStorage', () => {
  beforeEach(() => {
    // 探测结果是模块级缓存，每个用例前必须重置，否则会串味。
    resetSafeStorageState();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // 恢复「属性访问就抛错」的用例对全局的改写
    if (originalLocalStorageDescriptor) {
      Object.defineProperty(
        globalThis,
        'localStorage',
        originalLocalStorageDescriptor
      );
    }
    resetSafeStorageState();
    localStorage.clear();
  });

  describe('正常读写往返', () => {
    test('writeJSON 后 readJSON 拿回同一个值', () => {
      const value = {
        courses: [{ id: 'a', score: 91 }],
        method: 'SUBTRACTIVE',
      };

      expect(writeJSON(KEY, value)).toBe(true);
      expect(readJSON(KEY, null)).toEqual(value);
    });

    test('writeString 后 readString 拿回同一个字符串', () => {
      expect(writeString(KEY, 'dark')).toBe(true);
      expect(readString(KEY)).toBe('dark');
    });

    test('readString 对不存在的键返回 null', () => {
      expect(readString('never_written_key')).toBeNull();
    });

    test('readJSON 对不存在的键返回 fallback', () => {
      const fallback = { theme: 'dark' };
      expect(readJSON('never_written_key', fallback)).toBe(fallback);
    });

    test('remove 删除键，之后读到 null', () => {
      writeString(KEY, 'value');
      remove(KEY);
      expect(readString(KEY)).toBeNull();
    });

    test('writeJSON 能保存空数组与假值', () => {
      expect(writeJSON(KEY, [])).toBe(true);
      expect(readJSON(KEY, ['fallback'])).toEqual([]);

      expect(writeJSON(KEY, 0)).toBe(true);
      expect(readJSON(KEY, 99)).toBe(0);

      expect(writeJSON(KEY, false)).toBe(true);
      expect(readJSON(KEY, true)).toBe(false);
    });
  });

  describe('写入失败（QuotaExceededError）', () => {
    test('setItem 抛 QuotaExceededError 时 writeJSON 返回 false 且不抛', () => {
      // 先让探测通过并缓存，模拟「本来能用、后来配额满了」
      expect(isStorageAvailable()).toBe(true);
      spySetItemThrow(domError('QuotaExceededError', 'quota exceeded'));

      expect(() => writeJSON(KEY, { a: 1 })).not.toThrow();
      expect(writeJSON(KEY, { a: 1 })).toBe(false);
    });

    test('setItem 抛 QuotaExceededError 时 writeString 返回 false 且不抛', () => {
      expect(isStorageAvailable()).toBe(true);
      spySetItemThrow(domError('QuotaExceededError', 'quota exceeded'));

      expect(() => writeString(KEY, 'dark')).not.toThrow();
      expect(writeString(KEY, 'dark')).toBe(false);
    });

    test('首次探测就配额满时 isStorageAvailable 为 false 且写入返回 false', () => {
      spySetItemThrow(domError('QuotaExceededError', 'quota exceeded'));

      expect(isStorageAvailable()).toBe(false);
      expect(writeJSON(KEY, { a: 1 })).toBe(false);
    });

    test('写入失败不会留下半条数据', () => {
      expect(isStorageAvailable()).toBe(true);
      spySetItemThrow(domError('QuotaExceededError', 'quota exceeded'));

      writeJSON(KEY, { a: 1 });

      vi.restoreAllMocks();
      expect(readString(KEY)).toBeNull();
    });

    test('writeJSON 遇到无法序列化的值返回 false 且不抛', () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      expect(() => writeJSON(KEY, circular)).not.toThrow();
      expect(writeJSON(KEY, circular)).toBe(false);
    });

    test('writeJSON 遇到 undefined 返回 false（JSON.stringify 返回 undefined）', () => {
      expect(writeJSON(KEY, undefined)).toBe(false);
      expect(readString(KEY)).toBeNull();
    });
  });

  describe('读取失败（SecurityError）', () => {
    test('getItem 抛 SecurityError 时 readJSON 返回 fallback', () => {
      spyGetItemThrow(domError('SecurityError', 'storage is disabled'));
      const fallback = [{ id: 'fallback' }];

      expect(() => readJSON(KEY, fallback)).not.toThrow();
      expect(readJSON(KEY, fallback)).toBe(fallback);
    });

    test('getItem 抛 SecurityError 时 readString 返回 null', () => {
      spyGetItemThrow(domError('SecurityError', 'storage is disabled'));

      expect(() => readString(KEY)).not.toThrow();
      expect(readString(KEY)).toBeNull();
    });

    test('探测已通过后 getItem 才开始抛错，仍然降级为 fallback', () => {
      expect(isStorageAvailable()).toBe(true);
      spyGetItemThrow(domError('SecurityError', 'storage is disabled'));

      expect(readJSON(KEY, 'fallback')).toBe('fallback');
    });

    test('localStorage 属性访问本身就抛 SecurityError（Safari 阻止所有 Cookie）时全部降级', () => {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        get() {
          throw domError('SecurityError', 'The operation is insecure.');
        },
      });

      expect(isStorageAvailable()).toBe(false);
      expect(() => readString(KEY)).not.toThrow();
      expect(readString(KEY)).toBeNull();
      expect(readJSON(KEY, 'fallback')).toBe('fallback');
      expect(writeString(KEY, 'dark')).toBe(false);
      expect(writeJSON(KEY, { a: 1 })).toBe(false);
      expect(() => remove(KEY)).not.toThrow();
    });
  });

  describe('数据损坏', () => {
    test('损坏 JSON 返回 fallback', () => {
      localStorage.setItem(KEY, '{bad json');

      expect(() => readJSON(KEY, { ok: true })).not.toThrow();
      expect(readJSON(KEY, { ok: true })).toEqual({ ok: true });
    });

    test('空字符串同样返回 fallback', () => {
      localStorage.setItem(KEY, '');
      expect(readJSON(KEY, [])).toEqual([]);
    });

    test('JSON 合法但不是期望类型时原样返回，由调用方判断', () => {
      localStorage.setItem(KEY, '"just a string"');
      expect(readJSON(KEY, null)).toBe('just a string');
    });
  });

  describe('isStorageAvailable 与探测缓存', () => {
    test('正常环境下返回 true', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    test('抛错环境下返回 false', () => {
      spySetItemThrow(domError('SecurityError', 'storage is disabled'));
      expect(isStorageAvailable()).toBe(false);
    });

    test('探测结果被缓存，不会每次读写都重新探测', () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem');

      isStorageAvailable();
      const callsAfterProbe = setItemSpy.mock.calls.length;

      readString(KEY);
      readJSON(KEY, null);
      writeString(KEY, 'a');
      writeJSON(KEY, { b: 1 });
      isStorageAvailable();

      // 后续调用只应有 writeString / writeJSON 两次真实写入，没有额外探测写入
      expect(setItemSpy.mock.calls.length).toBe(callsAfterProbe + 2);
    });

    test('不可用时的读写不再触碰底层 storage', () => {
      spySetItemThrow(domError('SecurityError', 'storage is disabled'));
      isStorageAvailable();

      const getItemSpy = vi.spyOn(localStorage, 'getItem');
      expect(readString(KEY)).toBeNull();
      expect(readJSON(KEY, 'fallback')).toBe('fallback');
      expect(getItemSpy).not.toHaveBeenCalled();
    });

    test('resetSafeStorageState 会重新探测', () => {
      spySetItemThrow(domError('SecurityError', 'storage is disabled'));
      expect(isStorageAvailable()).toBe(false);

      vi.restoreAllMocks();
      resetSafeStorageState();
      expect(isStorageAvailable()).toBe(true);
    });
  });

  describe('失败日志', () => {
    test('同一个会话内只 console.warn 一次，不刷屏', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(isStorageAvailable()).toBe(true);
      spySetItemThrow(domError('QuotaExceededError', 'quota exceeded'));

      writeString(KEY, 'a');
      writeString(KEY, 'b');
      writeJSON(KEY, { c: 1 });

      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    test('resetSafeStorageState 后可以再次提示', () => {
      const firstWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(isStorageAvailable()).toBe(true);
      spySetItemThrow(domError('QuotaExceededError', 'quota exceeded'));
      writeString(KEY, 'a');
      expect(firstWarn).toHaveBeenCalledTimes(1);

      // 清掉缓存与「已提示」标记。注意可用性探测也会重新跑，
      // 所以先恢复成正常存储、探测通过、再让写入失败。
      resetSafeStorageState();
      vi.restoreAllMocks();

      const secondWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(isStorageAvailable()).toBe(true);
      spySetItemThrow(domError('QuotaExceededError', 'quota exceeded'));
      writeString(KEY, 'b');

      expect(secondWarn).toHaveBeenCalledTimes(1);
    });
  });
});
