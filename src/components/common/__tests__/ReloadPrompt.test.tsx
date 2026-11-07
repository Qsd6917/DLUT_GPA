import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ReloadPrompt } from '../ReloadPrompt';

/**
 * `virtual:pwa-register/react` 是 vite-plugin-pwa 注入的虚拟模块，
 * 磁盘上不存在对应文件，因此必须整体 mock 掉，否则 Vitest 无法解析。
 * 用 vi.hoisted 提升可变状态，保证 vi.mock 工厂在 import 求值前就能读到。
 */
const swState = vi.hoisted(() => ({
  offlineReady: false,
  needRefresh: false,
  setOfflineReady: vi.fn(),
  setNeedRefresh: vi.fn(),
  updateServiceWorker: vi.fn(),
  lastOptions: undefined as
    | {
        onRegistered?: (registration: unknown) => void;
        onRegisterError?: (error: unknown) => void;
      }
    | undefined,
}));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: (options?: typeof swState.lastOptions) => {
    swState.lastOptions = options;
    return {
      offlineReady: [swState.offlineReady, swState.setOfflineReady],
      needRefresh: [swState.needRefresh, swState.setNeedRefresh],
      updateServiceWorker: swState.updateServiceWorker,
    };
  },
}));

/** 关闭按钮只有图标没有文字，用「无文本的按钮」把它和「刷新更新」区分开 */
const getCloseButton = () =>
  screen
    .getAllByRole('button')
    .find(button => (button.textContent ?? '').trim() === '');

describe('ReloadPrompt', () => {
  beforeEach(() => {
    swState.offlineReady = false;
    swState.needRefresh = false;
    swState.setOfflineReady.mockReset();
    swState.setNeedRefresh.mockReset();
    swState.updateServiceWorker.mockReset();
    swState.lastOptions = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('两种状态都为 false 时不渲染任何内容', () => {
    const { container } = render(<ReloadPrompt />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('offlineReady 为 true 时显示离线就绪提示', () => {
    swState.offlineReady = true;

    render(<ReloadPrompt />);

    expect(screen.getByText('应用已就绪')).toBeInTheDocument();
    expect(screen.getByText('应用已缓存，可离线使用。')).toBeInTheDocument();
    // 离线就绪状态下不显示「刷新更新」按钮
    expect(
      screen.queryByRole('button', { name: /刷新更新/ })
    ).not.toBeInTheDocument();
  });

  test('needRefresh 为 true 时显示新版本提示与刷新按钮', () => {
    swState.needRefresh = true;

    render(<ReloadPrompt />);

    expect(screen.getByText('发现新版本')).toBeInTheDocument();
    expect(
      screen.getByText('有新的内容可用，点击刷新以更新。')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /刷新更新/ })
    ).toBeInTheDocument();
    expect(screen.queryByText('应用已就绪')).not.toBeInTheDocument();
  });

  test('点击「刷新更新」会以 true 调用 updateServiceWorker', () => {
    swState.needRefresh = true;

    render(<ReloadPrompt />);
    fireEvent.click(screen.getByRole('button', { name: /刷新更新/ }));

    expect(swState.updateServiceWorker).toHaveBeenCalledTimes(1);
    expect(swState.updateServiceWorker).toHaveBeenCalledWith(true);
  });

  test('点击关闭（X）会把 offlineReady 与 needRefresh 都置为 false', () => {
    swState.offlineReady = true;
    swState.needRefresh = true;

    render(<ReloadPrompt />);
    const closeButton = getCloseButton();
    expect(closeButton).toBeDefined();

    fireEvent.click(closeButton as HTMLElement);

    expect(swState.setOfflineReady).toHaveBeenCalledTimes(1);
    expect(swState.setOfflineReady).toHaveBeenCalledWith(false);
    expect(swState.setNeedRefresh).toHaveBeenCalledTimes(1);
    expect(swState.setNeedRefresh).toHaveBeenCalledWith(false);
    expect(swState.updateServiceWorker).not.toHaveBeenCalled();
  });

  test('把 SW 注册回调透传给 useRegisterSW', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<ReloadPrompt />);
    expect(swState.lastOptions).toBeDefined();

    swState.lastOptions?.onRegistered?.('sw.js');
    expect(logSpy).toHaveBeenCalledWith('SW Registered: sw.js');

    const error = new Error('register failed');
    swState.lastOptions?.onRegisterError?.(error);
    expect(logSpy).toHaveBeenCalledWith('SW registration error', error);
  });
});
