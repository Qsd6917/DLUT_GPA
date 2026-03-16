import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { LoadingProvider } from '../contexts/LoadingContext';

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [false, vi.fn()],
    needRefresh: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

const renderApp = () =>
  render(
    <ThemeProvider>
      <LanguageProvider>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </LanguageProvider>
    </ThemeProvider>
  );

describe('App shell', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test(
    'opens on overview and supports section navigation',
    async () => {
    renderApp();

    expect(screen.getByText('总览').closest('button')).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByText('课程').closest('button') as HTMLButtonElement);
    expect(screen.getByRole('button', { name: '新建课程' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('分析').closest('button') as HTMLButtonElement);
    expect(screen.getByText(/总览分析/).closest('button')).toHaveAttribute('aria-pressed', 'true');
    },
    15000
  );

  test(
    'opens and closes the course entry drawer from the courses section',
    () => {
    renderApp();

    fireEvent.click(screen.getByText('课程').closest('button') as HTMLButtonElement);
    fireEvent.click(screen.getByRole('button', { name: '新建课程' }));

    expect(screen.getByRole('heading', { name: '课程录入' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('heading', { name: '课程录入' })).not.toBeInTheDocument();
    },
    15000
  );

  test(
    'filters courses by semester and type, then restores the full list after clearing filters',
    async () => {
      renderApp();

      fireEvent.click(screen.getByText('课程').closest('button') as HTMLButtonElement);

      fireEvent.click(screen.getAllByRole('button', { name: /全部学期/i })[0]);
      fireEvent.click(await screen.findByRole('option', { name: '2-2' }));

      expect(await screen.findByText('程序设计基础A课程设计')).toBeInTheDocument();
      expect(screen.queryByText('健康教育')).not.toBeInTheDocument();

      fireEvent.click(screen.getAllByRole('button', { name: /全部类型/i })[0]);
      fireEvent.click(await screen.findByRole('option', { name: '必修' }));

      expect(screen.getByText('程序设计基础A课程设计')).toBeInTheDocument();
      expect(screen.queryByText('人工智能概论')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '清除筛选' }));
      expect(await screen.findByText('健康教育')).toBeInTheDocument();
    },
    15000
  );

  test(
    'shows a filtered empty state and clears back to the course list',
    async () => {
      renderApp();

      fireEvent.click(screen.getByText('课程').closest('button') as HTMLButtonElement);
      fireEvent.click(screen.getAllByRole('button', { name: /全部学期/i })[0]);
      fireEvent.click(await screen.findByRole('option', { name: '3-3' }));

      expect(await screen.findByText('暂无匹配课程')).toBeInTheDocument();
      expect(screen.getByText('当前筛选条件下没有课程，尝试清除筛选或切换其他条件。')).toBeInTheDocument();

      const emptyState = screen.getByText('暂无匹配课程').closest('section') as HTMLElement;
      fireEvent.click(within(emptyState).getByRole('button', { name: '清除筛选' }));
      expect(await screen.findByText('健康教育')).toBeInTheDocument();
    },
    15000
  );
});
