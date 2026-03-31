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
    <div
      className="segmented-control"
      role="group"
      aria-label={t('theme_light')}
    >
      {themes.map(({ id, icon: Icon, labelKey, shortKey }) => {
        const active = theme === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            className="segmented-control-button min-h-[2.3rem] px-3 text-xs"
            data-active={active}
            aria-label={t(labelKey)}
            title={t(labelKey)}
            aria-pressed={active}
          >
            <Icon size={14} />
            <span className="hidden md:inline">{t(shortKey)}</span>
          </button>
        );
      })}
    </div>
  );
};
