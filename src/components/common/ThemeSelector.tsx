import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/LanguageContext';

const themes = [
  { id: 'dark', icon: Moon, labelKey: 'theme_dark', shortKey: 'theme_dark_short' },
  { id: 'light', icon: Sun, labelKey: 'theme_light', shortKey: 'theme_light_short' },
] as const;

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-200/70 bg-white/70 p-1 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/45">
      {themes.map(({ id, icon: Icon, labelKey, shortKey }) => {
        const active = theme === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all ${
              active
                ? 'bg-primary/12 text-primary shadow-[0_10px_24px_hsla(var(--color-primary),0.14)] dark:bg-primary/20 dark:text-white'
                : 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 dark:text-white/55 dark:hover:bg-white/5 dark:hover:text-white'
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
