import React, { createContext, useContext, useEffect, useState } from 'react';
import { readString, writeString } from '../utils/safeStorage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = 'dlut_gpa_theme';
const DEFAULT_THEME: Theme = 'dark';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 这里的读取发生在渲染期（useState 初始化器）。Safari「阻止所有 Cookie」
  // 或校园机房策略下，裸 localStorage 读取会抛 SecurityError，整站只剩错误页。
  // readString 内部吞掉所有异常，失败时返回 null → 回退默认主题。
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = readString(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    // 写入失败（配额满 / 存储被禁）只影响下次访问的持久化，
    // 本次会话的主题仍然生效，因此这里不需要打断用户。
    writeString(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
