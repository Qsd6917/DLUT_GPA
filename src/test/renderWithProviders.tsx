import React, { type ReactElement, useEffect, useRef } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider, useTranslation } from '../contexts/LanguageContext';
import { LoadingProvider } from '../contexts/LoadingContext';

type ProviderOptions = Omit<RenderOptions, 'wrapper'> & {
  initialTheme?: 'light' | 'dark';
  initialLanguage?: 'zh' | 'en';
};

const LanguageInitializer = ({ language }: { language: 'zh' | 'en' }) => {
  const { setLanguage } = useTranslation();
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setLanguage(language);
  }, [language, setLanguage]);
  return null;
};

const ThemeStorageRestorer = ({ previousTheme }: { previousTheme: string | null }) => {
  useEffect(() => () => {
    if (previousTheme === null) localStorage.removeItem('dlut_gpa_theme');
    else localStorage.setItem('dlut_gpa_theme', previousTheme);
  }, [previousTheme]);
  return null;
};

export const renderWithProviders = (
  ui: ReactElement,
  options: ProviderOptions = {}
) => {
  const { initialTheme, initialLanguage, ...renderOptions } = options;
  const previousTheme = localStorage.getItem('dlut_gpa_theme');
  if (initialTheme) localStorage.setItem('dlut_gpa_theme', initialTheme);

  const Providers = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
      {initialTheme ? <ThemeStorageRestorer previousTheme={previousTheme} /> : null}
      <LanguageProvider>
        {initialLanguage ? <LanguageInitializer language={initialLanguage} /> : null}
        <LoadingProvider>{children}</LoadingProvider>
      </LanguageProvider>
    </ThemeProvider>
  );

  return render(ui, { wrapper: Providers, ...renderOptions });
};
