import React, { useEffect, useRef, useState } from 'react';
import {
  BookText,
  ChevronDown,
  Database,
  FlaskConical,
  GraduationCap,
  Languages,
  LayoutDashboard,
  LineChart,
  RotateCcw,
  Settings2,
  Share2,
} from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { CalculationMethod } from '../../types';
import { ThemeSelector } from '../common/ThemeSelector';

type Section = 'overview' | 'courses' | 'analysis';

interface HeaderProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  isSandboxMode: boolean;
  onReset: () => void;
  onDataMgmt: () => void;
  onShare: () => void;
  onEnterSandbox: () => void;
  method: CalculationMethod;
  setMethod: (method: CalculationMethod) => void;
}

const navItems: Array<{
  id: Section;
  labelKey: 'nav_overview' | 'nav_courses' | 'nav_analysis';
  icon: React.ComponentType<any>;
}> = [
  { id: 'overview', labelKey: 'nav_overview', icon: LayoutDashboard },
  { id: 'courses', labelKey: 'nav_courses', icon: BookText },
  { id: 'analysis', labelKey: 'nav_analysis', icon: LineChart },
];

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onSectionChange,
  isSandboxMode,
  onReset,
  onDataMgmt,
  onShare,
  onEnterSandbox,
  method,
  setMethod,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const methodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        methodRef.current &&
        !methodRef.current.contains(event.target as Node)
      ) {
        setIsMethodOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const methodOptions: Array<{ value: CalculationMethod; label: string }> = [
    { value: CalculationMethod.SUBTRACTIVE, label: 'DLUT 5.0' },
    { value: CalculationMethod.STD_4_0, label: 'Std 4.0' },
    { value: CalculationMethod.PKU_4_0, label: 'PKU 4.0' },
    { value: CalculationMethod.SCALE_4_5, label: '4.5 Scale' },
    { value: CalculationMethod.LINEAR, label: 'Linear 5.0' },
    { value: CalculationMethod.WES, label: 'WES 5.0' },
  ];

  const currentMethodLabel =
    methodOptions.find(item => item.value === method)?.label ?? 'DLUT 5.0';

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-[hsla(var(--surface-0),0.92)] shadow-[var(--header-shadow)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[94rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
            <div className="flex min-w-0 items-center gap-3 rounded-[0.95rem] border border-primary/10 bg-surface px-3 py-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-primary text-white shadow-sm">
                <GraduationCap size={18} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-main">
                  DLUT GPA
                </div>
                <div className="mt-0.5 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
                  {language === 'zh' ? 'Academic Console' : 'Academic Console'}
                </div>
              </div>
            </div>

            <nav className="segmented-control" aria-label="Primary">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSectionChange(item.id)}
                    className="segmented-control-button"
                    data-active={active}
                    aria-label={t(item.labelKey)}
                    aria-current={active ? 'page' : undefined}
                    aria-pressed={active}
                  >
                    <Icon size={15} />
                    <span>{t(item.labelKey)}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-col gap-2 xl:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <div className="toolbar-cluster">
                <button
                  type="button"
                  onClick={onDataMgmt}
                  className="toolbar-button"
                  data-tone="primary"
                >
                  <Database size={15} />
                  <span>{t('data_mgmt')}</span>
                </button>

                <button
                  type="button"
                  onClick={onShare}
                  className="toolbar-button"
                >
                  <Share2 size={15} />
                  <span>{t('share')}</span>
                </button>

                {!isSandboxMode ? (
                  <button
                    type="button"
                    onClick={onEnterSandbox}
                    className="toolbar-button"
                    data-tone="warn"
                  >
                    <FlaskConical size={15} />
                    <span>{t('enter_sandbox')}</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={onReset}
                  className="toolbar-button"
                >
                  <RotateCcw size={15} />
                  <span>{t('reset')}</span>
                </button>
              </div>

              <div className="toolbar-cluster">
                <ThemeSelector />

                <button
                  type="button"
                  onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                  className="toolbar-button"
                  title={t('language_toggle')}
                  aria-label={t('language_toggle')}
                >
                  <Languages size={15} />
                  <span className="uppercase">{language}</span>
                </button>

                <div className="relative" ref={methodRef}>
                  <button
                    type="button"
                    onClick={() => setIsMethodOpen(value => !value)}
                    className="toolbar-button"
                    aria-haspopup="listbox"
                    aria-expanded={isMethodOpen}
                  >
                    <Settings2 size={15} />
                    <span>{currentMethodLabel}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isMethodOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isMethodOpen ? (
                    <div className="dropdown-menu-panel absolute right-0 top-full z-30 mt-2 w-52 p-2">
                      <div
                        role="listbox"
                        aria-label="GPA Mode"
                        className="space-y-1"
                      >
                        {methodOptions.map(option => {
                          const active = option.value === method;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setMethod(option.value);
                                setIsMethodOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-[0.78rem] px-3 py-2.5 text-left text-sm transition-colors ${
                                active
                                  ? 'bg-primary text-white'
                                  : 'text-main hover:bg-[hsl(var(--surface-2))] dark:hover:bg-[hsl(var(--surface-3))]'
                              }`}
                            >
                              <span>{option.label}</span>
                              {active ? (
                                <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                                  On
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="status-chip">{currentMethodLabel}</span>
              <span className="status-chip">
                {isSandboxMode ? t('sandbox_mode') : t('overview_state_live')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
