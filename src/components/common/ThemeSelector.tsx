import React from 'react';
import { Moon, Palette, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/LanguageContext';

const themes = [
  { id: 'dark', icon: Moon, labelKey: 'theme_dark', shortKey: 'theme_dark_short' },
  { id: 'dlut-blue', icon: Palette, labelKey: 'theme_dlut_blue', shortKey: 'theme_dlut_short' },
  { id: 'light', icon: Sun, labelKey: 'theme_light', shortKey: 'theme_light_short' },
] as const;

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 rounded-full border border-primary/15 bg-background/55 p-1 backdrop-blur-xl">
      {themes.map(({ id, icon: Icon, labelKey, shortKey }) => {
        const active = theme === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
              active ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-muted hover:bg-white/5 hover:text-main'
            }`}
            aria-label={t(labelKey)}
            title={t(labelKey)}
          >
            <Icon size={14} />
            <span className="hidden md:inline">{t(shortKey)}</span>
          </button>
        );
      })}
    </div>
  );
};
