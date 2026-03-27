import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/LanguageContext';

const themes = [
  {
    id: 'dark',
    icon: Moon,
    labelKey: 'theme_dark',
    shortKey: 'theme_dark_short',
  },
  {
    id: 'light',
    icon: Sun,
    labelKey: 'theme_light',
    shortKey: 'theme_light_short',
  },
] as const;

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 rounded-[0.95rem] border border-primary/10 bg-surface p-1 dark:border-white/8 dark:bg-[hsl(var(--surface-1))]">
      {themes.map(({ id, icon: Icon, labelKey, shortKey }) => {
        const active = theme === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            className={`inline-flex h-8 items-center gap-2 rounded-[0.7rem] px-3 text-xs font-semibold transition-colors ${
              active
                ? 'bg-primary text-white'
                : 'text-muted hover:text-main dark:hover:text-white'
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
