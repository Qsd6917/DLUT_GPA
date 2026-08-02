import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/LanguageContext';
import { renderWithProviders } from './renderWithProviders';

const Probe = () => {
  const { theme } = useTheme();
  const { language } = useTranslation();
  return <div>{theme}:{language}</div>;
};

const LanguageSwitcher = () => {
  const { language, setLanguage } = useTranslation();
  return <button onClick={() => setLanguage('zh')}>{language}</button>;
};

describe('renderWithProviders', () => {
  test('supports initial theme and language overrides', async () => {
    renderWithProviders(<Probe />, { initialTheme: 'light', initialLanguage: 'en' });
    expect(await screen.findByText('light:en')).toBeInTheDocument();
  });

  test('applies initial language once and preserves a later real language change', async () => {
    const view = renderWithProviders(<LanguageSwitcher />, { initialLanguage: 'en' });
    const button = await screen.findByRole('button', { name: 'en' });
    fireEvent.click(button);
    expect(await screen.findByRole('button', { name: 'zh' })).toBeInTheDocument();

    view.rerender(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: 'zh' })).toBeInTheDocument();
  });

  test('restores theme storage after unmount so the next render uses default dark', async () => {
    localStorage.removeItem('dlut_gpa_theme');
    const first = renderWithProviders(<Probe />, { initialTheme: 'light' });
    expect(await screen.findByText('light:zh')).toBeInTheDocument();
    first.unmount();

    renderWithProviders(<Probe />);
    expect(await screen.findByText('dark:zh')).toBeInTheDocument();
  });
});
