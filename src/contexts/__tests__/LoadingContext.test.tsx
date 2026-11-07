import { describe, expect, test, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { LoadingProvider, useLoading } from '../LoadingContext';

// 探针把 context 暴露成按钮，避免在断言里依赖内部实现细节。
const LoadingProbe = () => {
  const { loadingTasks, showLoading, hideLoading, isLoading } = useLoading();

  return (
    <div>
      <span data-testid="task-count">{loadingTasks.size}</span>
      <span data-testid="is-loading-a">{String(isLoading('a'))}</span>
      <span data-testid="is-loading-b">{String(isLoading('b'))}</span>
      <button type="button" onClick={() => showLoading('a', '正在导入成绩单')}>
        show-a
      </button>
      <button type="button" onClick={() => showLoading('b', '正在计算 GPA')}>
        show-b
      </button>
      <button type="button" onClick={() => hideLoading('a')}>
        hide-a
      </button>
    </div>
  );
};

const renderProbe = () =>
  render(
    <LoadingProvider>
      <LoadingProbe />
    </LoadingProvider>
  );

const readCount = () =>
  Number(screen.getByTestId('task-count').textContent ?? '-1');

describe('LoadingContext', () => {
  test('starts idle and renders no overlay', () => {
    renderProbe();

    expect(readCount()).toBe(0);
    expect(screen.getByTestId('is-loading-a').textContent).toBe('false');
    expect(screen.queryByText('正在导入成绩单')).not.toBeInTheDocument();
  });

  test('showLoading registers the task and renders its message in the overlay', () => {
    renderProbe();

    act(() => {
      screen.getByRole('button', { name: 'show-a' }).click();
    });

    expect(readCount()).toBe(1);
    expect(screen.getByTestId('is-loading-a').textContent).toBe('true');
    expect(screen.getByText('正在导入成绩单')).toBeInTheDocument();
  });

  test('tracks multiple concurrent tasks and lists every message', () => {
    renderProbe();

    act(() => {
      screen.getByRole('button', { name: 'show-a' }).click();
    });
    act(() => {
      screen.getByRole('button', { name: 'show-b' }).click();
    });

    expect(readCount()).toBe(2);
    expect(screen.getByTestId('is-loading-a').textContent).toBe('true');
    expect(screen.getByTestId('is-loading-b').textContent).toBe('true');
    expect(screen.getByText('正在导入成绩单')).toBeInTheDocument();
    expect(screen.getByText('正在计算 GPA')).toBeInTheDocument();
  });

  test('hideLoading removes only the named task and keeps the rest', () => {
    renderProbe();

    act(() => {
      screen.getByRole('button', { name: 'show-a' }).click();
    });
    act(() => {
      screen.getByRole('button', { name: 'show-b' }).click();
    });
    act(() => {
      screen.getByRole('button', { name: 'hide-a' }).click();
    });

    expect(readCount()).toBe(1);
    expect(screen.getByTestId('is-loading-a').textContent).toBe('false');
    expect(screen.getByTestId('is-loading-b').textContent).toBe('true');
    expect(screen.queryByText('正在导入成绩单')).not.toBeInTheDocument();
    expect(screen.getByText('正在计算 GPA')).toBeInTheDocument();
  });

  test('drops the overlay once the last task is hidden', () => {
    renderProbe();

    act(() => {
      screen.getByRole('button', { name: 'show-a' }).click();
    });
    expect(screen.getByText('正在导入成绩单')).toBeInTheDocument();

    act(() => {
      screen.getByRole('button', { name: 'hide-a' }).click();
    });

    expect(readCount()).toBe(0);
    expect(screen.queryByText('正在导入成绩单')).not.toBeInTheDocument();
  });

  test('showing the same id twice replaces its message instead of duplicating', () => {
    const Rewrite = () => {
      const { loadingTasks, showLoading } = useLoading();
      return (
        <div>
          <span data-testid="task-count">{loadingTasks.size}</span>
          <button type="button" onClick={() => showLoading('a', '第一次消息')}>
            first
          </button>
          <button type="button" onClick={() => showLoading('a', '第二次消息')}>
            second
          </button>
        </div>
      );
    };

    render(
      <LoadingProvider>
        <Rewrite />
      </LoadingProvider>
    );

    act(() => {
      screen.getByRole('button', { name: 'first' }).click();
    });
    act(() => {
      screen.getByRole('button', { name: 'second' }).click();
    });

    expect(readCount()).toBe(1);
    expect(screen.queryByText('第一次消息')).not.toBeInTheDocument();
    expect(screen.getByText('第二次消息')).toBeInTheDocument();
  });

  test('hiding an unknown id is a no-op', () => {
    const NoopProbe = () => {
      const { loadingTasks, hideLoading } = useLoading();
      return (
        <div>
          <span data-testid="task-count">{loadingTasks.size}</span>
          <button type="button" onClick={() => hideLoading('missing')}>
            hide-missing
          </button>
        </div>
      );
    };

    render(
      <LoadingProvider>
        <NoopProbe />
      </LoadingProvider>
    );

    act(() => {
      screen.getByRole('button', { name: 'hide-missing' }).click();
    });

    expect(readCount()).toBe(0);
  });

  test('throws when the hook is used outside a provider', () => {
    const Orphan = () => {
      useLoading();
      return null;
    };

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      expect(() => render(<Orphan />)).toThrow(
        'useLoading must be used within a LoadingProvider'
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
