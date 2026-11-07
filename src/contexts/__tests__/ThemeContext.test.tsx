import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import {
  resetSafeStorageState,
  isStorageAvailable,
} from '../../utils/safeStorage';

const ThemeProbe = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <span>{theme}</span>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
    </>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    // safeStorage 的可用性探测结果是模块级缓存，用例之间必须重置
    resetSafeStorageState();
    localStorage.clear();
    document.documentElement.className = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetSafeStorageState();
  });

  test('defaults to dark when no saved theme exists', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('toggles between dark and light only', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByText('light')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('light')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  describe('localStorage 抛错时仍能正常渲染', () => {
    test('读取抛 SecurityError 时回退默认 dark 并正常渲染', () => {
      // Safari「阻止所有 Cookie」/ 机房策略：getItem 直接抛 SecurityError。
      // 修复前这发生在 useState 初始化器（渲染期），整站只剩错误页。
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      });

      expect(() =>
        render(
          <ThemeProvider>
            <ThemeProbe />
          </ThemeProvider>
        )
      ).not.toThrow();

      expect(screen.getByText('dark')).toBeInTheDocument();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('localStorage 属性访问本身抛 SecurityError 时仍能正常渲染', () => {
      const descriptor = Object.getOwnPropertyDescriptor(
        globalThis,
        'localStorage'
      );
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('The operation is insecure.', 'SecurityError');
        },
      });

      try {
        expect(() =>
          render(
            <ThemeProvider>
              <ThemeProbe />
            </ThemeProvider>
          )
        ).not.toThrow();
        expect(screen.getByText('dark')).toBeInTheDocument();
      } finally {
        if (descriptor) {
          Object.defineProperty(globalThis, 'localStorage', descriptor);
        }
      }
    });

    test('写入抛 QuotaExceededError 时切换主题仍然生效（仅持久化失败）', () => {
      // 先让探测通过，模拟「本来能用、后来配额满了」
      expect(isStorageAvailable()).toBe(true);
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new DOMException('quota exceeded', 'QuotaExceededError');
      });

      render(
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

      // 用户可见行为：主题确实切换了，没有因为写不进存储而回滚或崩溃
      expect(screen.getByText('light')).toBeInTheDocument();
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
  });
});
