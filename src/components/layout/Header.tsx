import React, { useEffect, useRef, useState } from 'react';
import {
  BookText,
  ChevronDown,
  Database,
  FlaskConical,
  Languages,
  LayoutDashboard,
  LineChart,
  RotateCcw,
  Settings,
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

const navItems: Array<{ id: Section; labelKey: 'nav_overview' | 'nav_courses' | 'nav_analysis'; icon: React.ComponentType<any> }> = [
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
    function handleClickOutside(event: MouseEvent) {
      if (methodRef.current && !methodRef.current.contains(event.target as Node)) {
        setIsMethodOpen(false);
      }
    }

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

  const currentMethodLabel = methodOptions.find((item) => item.value === method)?.label ?? 'DLUT 5.0';
  const actionButton =
    'inline-flex h-10 items-center gap-2 rounded-full border border-slate-200/45 bg-white/60 px-3 text-[11px] font-semibold text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white/80 hover:text-slate-900 sm:h-auto sm:px-3.5 sm:py-2.5 sm:text-xs dark:border-white/6 dark:bg-slate-950/34 dark:text-white/60 dark:shadow-none dark:hover:border-primary/20 dark:hover:bg-white/[0.06] dark:hover:text-white';
  const tertiaryActionButton =
    'inline-flex h-10 items-center gap-2 rounded-full border border-slate-200/35 bg-white/45 px-2.5 text-[11px] font-semibold text-slate-500 shadow-[0_8px_24px_rgba(15,23,42,0.03)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-slate-300/40 hover:bg-white/72 hover:text-slate-900 sm:h-auto sm:px-3 sm:py-2.5 sm:text-xs dark:border-white/5 dark:bg-white/[0.03] dark:text-white/52 dark:shadow-none dark:hover:border-white/10 dark:hover:bg-white/[0.06] dark:hover:text-white';
  const navButton =
    'group relative inline-flex min-w-fit items-center gap-2 px-1 py-2 text-sm font-semibold transition-colors sm:px-2 sm:text-[0.95rem]';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/70 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-md dark:border-white/10 dark:bg-slate-950/55 dark:shadow-[0_22px_54px_rgba(2,8,23,0.36)]">
      <div className="mx-auto flex max-w-[94rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <div className="hidden text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500/70 sm:block dark:text-white/50">
                Dalian University of Technology
              </div>
              <div className="flex flex-wrap items-end gap-2 sm:mt-2 sm:gap-3">
                <h1 className="text-[1.55rem] leading-none text-slate-950 sm:text-[1.95rem] dark:text-white">
                  <span className="font-bold">DLUT</span>
                  <span className="mx-1.5 font-medium text-slate-400 dark:text-white/35">-</span>
                  <span className="font-medium text-primary">GPA</span>
                </h1>
                <span
                  className={`status-chip ${
                    isSandboxMode
                      ? 'border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200'
                      : 'border-primary/15 bg-primary/10 text-primary'
                  }`}
                >
                  {isSandboxMode ? t('sandbox_mode') : currentMethodLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 xl:justify-end">
            <button type="button" onClick={onDataMgmt} className={actionButton}>
              <Database size={14} />
              <span className="hidden sm:inline">{t('data_mgmt')}</span>
            </button>
            <button type="button" onClick={onShare} className="primary-button h-10 px-3 text-[11px] sm:h-auto sm:px-4 sm:py-2.5 sm:text-xs">
              <Share2 size={14} />
              <span className="hidden sm:inline">{t('share')}</span>
            </button>
            {!isSandboxMode ? (
              <>
                <button
                  type="button"
                  onClick={onEnterSandbox}
                  className={`${tertiaryActionButton} border-amber-400/18 bg-amber-500/8 text-amber-700 dark:text-amber-200`}
                >
                  <FlaskConical size={14} />
                  <span className="hidden sm:inline">{t('enter_sandbox')}</span>
                </button>
                <button type="button" onClick={onReset} className={tertiaryActionButton}>
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline">{t('reset')}</span>
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          <nav className="flex flex-nowrap items-center gap-5 overflow-x-auto pb-1" aria-label="Primary">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSectionChange(item.id)}
                  className={`${navButton} ${
                    active
                      ? 'text-primary dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-white/50 dark:hover:text-white/85'
                  }`}
                  aria-label={t(item.labelKey)}
                  data-active={active}
                  aria-pressed={active}
                >
                  <Icon size={15} />
                  {t(item.labelKey)}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary transition-opacity ${
                      active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-1.5 xl:justify-end">
            <ThemeSelector />

              <button
                type="button"
                onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                className={actionButton}
              title={t('language_toggle')}
              aria-label={t('language_toggle')}
            >
              <Languages size={14} />
              <span className="data-figure text-[11px] uppercase">{language}</span>
            </button>

            <div className="relative" ref={methodRef}>
              <button
                type="button"
                onClick={() => setIsMethodOpen((value) => !value)}
                className={actionButton}
                aria-haspopup="listbox"
                aria-expanded={isMethodOpen}
              >
                <Settings size={14} />
                <span className="data-figure hidden text-[11px] sm:inline">{currentMethodLabel}</span>
                <span className="data-figure text-[11px] sm:hidden">GPA</span>
                <ChevronDown size={14} className={`transition-transform ${isMethodOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMethodOpen ? (
                <div className="paper-panel absolute right-0 top-full z-30 mt-3 w-52 p-2">
                  <div role="listbox" aria-label="GPA Mode" className="space-y-1">
                    {methodOptions.map((option) => {
                      const active = option.value === method;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setMethod(option.value);
                            setIsMethodOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition-colors ${
                            active
                              ? 'bg-primary/10 font-semibold text-primary dark:bg-primary/15 dark:text-white'
                              : 'text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white'
                          }`}
                        >
                          <span>{option.label}</span>
                          {active ? <span className="data-figure text-[11px]">SET</span> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
