import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

/** 渲染即抛错的子组件，用来触发错误边界。 */
const Bomb = ({ message = 'boom-in-child' }: { message?: string }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('renders the subtree untouched while nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>正常的子树内容</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('正常的子树内容')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /尝试恢复/ })
    ).not.toBeInTheDocument();
  });

  test('renders a readable fallback instead of a blank screen when a child throws', () => {
    // React 会把捕获到的错误打到 console.error，测试里不需要这份噪音。
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '页面出错了' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /尝试恢复/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /重新加载/ })
    ).toBeInTheDocument();
    // 抛错的子树必须被移除，页面不能是白屏。
    expect(screen.queryByText('正常的子树内容')).not.toBeInTheDocument();
  });

  test('reloads the page when the reload button is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reload = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload });

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(reload).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /重新加载/ }));

    expect(reload).toHaveBeenCalledTimes(1);
  });

  test('re-renders the subtree after retrying once the child stops throwing', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    let shouldThrow = true;
    const Flaky = () => {
      if (shouldThrow) {
        throw new Error('boom-in-child');
      }
      return <p>恢复后的子树内容</p>;
    };

    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('恢复后的子树内容')).not.toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /尝试恢复/ }));

    expect(screen.getByText('恢复后的子树内容')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('shows the error summary in development but hides it in production', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(
      <ErrorBoundary>
        <Bomb message="dev-only-detail" />
      </ErrorBoundary>
    );

    expect(screen.getByText('错误详情（仅开发环境可见）')).toBeInTheDocument();
    expect(screen.getByText(/dev-only-detail/)).toBeInTheDocument();
    unmount();

    vi.stubEnv('DEV', false);

    render(
      <ErrorBoundary>
        <Bomb message="prod-hidden-detail" />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.queryByText('错误详情（仅开发环境可见）')
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/prod-hidden-detail/)).not.toBeInTheDocument();
  });
});
