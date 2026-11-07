import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * 渲染期错误的兜底边界。
 *
 * React 的错误边界只能捕获子树在**渲染、生命周期与构造函数**中抛出的错误，
 * 事件回调与异步代码里的异常不会经过这里（那些仍走 window.onerror）。
 * 因此这里只承诺一件事：子树抛错时不再白屏，而是给用户一条可操作的出路。
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 生产环境没有 sourcemap 时组件栈价值有限，但保留完整日志便于线上排查；
    // 界面上是否展示错误详情由下面的 isDev 单独决定。
    console.error('[ErrorBoundary] 渲染子树时抛出错误：', error, info);
  }

  private handleRetry = () => {
    // 只清空自身状态，让 React 重新挂载子树。若子树再次抛错，
    // getDerivedStateFromError 会重新把错误写回来，不会陷入白屏。
    this.setState({ error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    const isDev = import.meta.env.DEV;

    return (
      <div
        role="alert"
        className="flex min-h-screen items-center justify-center bg-[hsl(var(--surface-0))] p-4"
      >
        <div className="paper-panel w-full max-w-lg p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.95rem] border border-amber-400/30 bg-amber-400/10 text-amber-500 dark:border-amber-300/20">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="type-section-title text-main">页面出错了</h1>
              <p className="type-body-sm mt-2">
                应用在渲染时遇到了未预期的错误，已经拦截，避免整页白屏。
              </p>
            </div>
          </div>

          <p className="type-body-sm mt-4">
            可以先点「尝试恢复」重新渲染当前页面；如果仍然出错，再点「重新加载」刷新整个应用。
            本地已保存的课程数据不会因为这一步丢失。
          </p>

          {isDev ? (
            <details className="mt-4 rounded-[var(--radius-control)] border border-[hsla(var(--color-line),0.96)] bg-[hsl(var(--surface-2))] p-3">
              <summary className="cursor-pointer text-xs font-semibold text-main">
                错误详情（仅开发环境可见）
              </summary>
              <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words font-mono text-[0.72rem] leading-relaxed text-muted">
                {error.message}
                {error.stack ? `\n\n${error.stack}` : ''}
              </pre>
            </details>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="ghost-button"
              onClick={this.handleRetry}
            >
              <RotateCcw size={15} aria-hidden="true" />
              尝试恢复
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={this.handleReload}
            >
              <RefreshCw size={15} aria-hidden="true" />
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }
}
