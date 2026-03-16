import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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

  test('opens on overview and supports section navigation', async () => {
    renderApp();

    expect(await screen.findByRole('button', { name: '总览' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: '课程' }));
    expect(screen.getByRole('button', { name: '新建课程' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '分析' }));
    expect(await screen.findByRole('button', { name: /总览分析/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('opens and closes the course entry drawer from the courses section', async () => {
    renderApp();

    fireEvent.click(await screen.findByRole('button', { name: '课程' }));
    fireEvent.click(screen.getByRole('button', { name: '新建课程' }));

    expect(screen.getByRole('heading', { name: '课程录入' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('heading', { name: '课程录入' })).not.toBeInTheDocument();
  });
});
