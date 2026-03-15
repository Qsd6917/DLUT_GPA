import React from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/LanguageContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 p-1 bg-surface/50 rounded-xl border border-primary/10">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'light'
            ? 'bg-primary text-on-primary'
            : 'text-muted hover:bg-surface'
        }`}
        aria-label={t('theme_light')}
      >
        <Sun size={16} />
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'bg-primary text-on-primary'
            : 'text-muted hover:bg-surface'
        }`}
        aria-label={t('theme_dark')}
      >
        <Moon size={16} />
      </button>
      
      <button
        onClick={() => setTheme('dlut-blue')}
        className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
          theme === 'dlut-blue'
            ? 'bg-primary text-on-primary'
            : 'text-muted hover:bg-surface'
        }`}
        aria-label={t('theme_dlut_blue')}
      >
        <Palette size={16} />
        <span className="hidden sm:inline text-xs">DLUT</span>
      </button>
    </div>
  );
};