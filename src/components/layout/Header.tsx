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
  Menu,
  X,
} from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { CalculationMethod } from '../../types';
import { ThemeSelector } from '../common/ThemeSelector';

type Section = 'overview' | 'courses' | 'analysis';

interface HeaderProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  isExperimentActive: boolean;
  onReset: () => void;
  onDataMgmt: () => void;
  onShare: () => void;
  onOpenExperiment: () => void;
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
  isExperimentActive,
  onReset,
  onDataMgmt,
  onShare,
  onOpenExperiment,
  method,
  setMethod,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const [isUtilityOpen, setIsUtilityOpen] = useState(false);
  const methodRef = useRef<HTMLDivElement>(null);
  const methodOptionsRef = useRef<HTMLDivElement>(null);

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

  const handleMethodKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const options = Array.from(methodOptionsRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    if (!options.length) return;
    const current = Math.max(0, options.findIndex(option => option.getAttribute('aria-selected') === 'true'));
    const next = event.key === 'ArrowDown' ? (current + 1) % options.length : event.key === 'ArrowUp' ? (current - 1 + options.length) % options.length : event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : -1;
    if (next >= 0) { event.preventDefault(); options[next].focus(); }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-[hsla(var(--surface-0),0.92)] shadow-[var(--header-shadow)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[94rem] flex-col gap-2 px-4 py-2 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
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
                  {t('academic_console')}
                </div>
              </div>
            </div>

            <nav className="segmented-control responsive-primary-nav" aria-label={t('primary_nav')}>
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

          <div className="flex flex-col gap-2 lg:items-end">
            <div className="hidden flex-wrap items-center gap-2 lg:flex">
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

                <button
                  type="button"
                  onClick={onOpenExperiment}
                  className="toolbar-button"
                  data-tone="warn"
                >
                  <FlaskConical size={15} />
                  <span>{isExperimentActive ? t('experiment_return') : t('experiment_start')}</span>
                </button>

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
                        tabIndex={0}
                        aria-label={t('gpa_method')}
                        ref={methodOptionsRef}
                        onKeyDown={handleMethodKeyDown}
                        className="space-y-1"
                      >
                        {methodOptions.map(option => {
                          const active = option.value === method;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              role="option"
                              aria-selected={active}
                              tabIndex={active ? 0 : -1}
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
                                  {t('enabled')}
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

            <button type="button" className="toolbar-button lg:hidden" aria-label={t('open_tools')} aria-expanded={isUtilityOpen} onClick={() => setIsUtilityOpen(value => !value)}>
              {isUtilityOpen ? <X size={15} /> : <Menu size={15} />}<span>{t('tools')}</span>
            </button>
            <a
              href="#experiment"
              className="toolbar-button lg:hidden"
              data-tone="warn"
              onClick={event => {
                event.preventDefault();
                onOpenExperiment();
              }}
              aria-label={isExperimentActive ? t('experiment_return') : t('experiment_start')}
            >
              <FlaskConical size={15} />
              <span>{isExperimentActive ? t('experiment_return') : t('experiment_start')}</span>
            </a>

            <div className="hidden items-center gap-2 lg:flex">
              {isExperimentActive ? <span className="status-chip text-[hsl(var(--color-accent))]">{t('experiment_status')}</span> : null}
            </div>
          </div>
        </div>
      </div>
      {isUtilityOpen ? <div className="lg:hidden border-t border-primary/10 bg-[hsl(var(--surface-1))] p-3"><div className="mx-auto flex max-w-[94rem] flex-wrap gap-2"><button type="button" className="toolbar-button" onClick={onDataMgmt}><Database size={15} />{t('data_mgmt')}</button><button type="button" className="toolbar-button" onClick={onShare}><Share2 size={15} />{t('share')}</button><button type="button" className="toolbar-button" onClick={onReset}><RotateCcw size={15} />{t('reset')}</button><ThemeSelector /><button type="button" className="toolbar-button" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}><Languages size={15} />{language}</button></div></div> : null}
    </header>
  );
};
