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
    'inline-flex h-10 items-center gap-2 rounded-full border border-primary/15 bg-background/55 px-3 text-[11px] font-semibold text-main transition-colors hover:border-primary/40 hover:text-primary sm:h-auto sm:px-3.5 sm:py-2.5 sm:text-xs';

  return (
    <header className="app-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-[94rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="paper-panel flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-background/65 p-2 sm:h-12 sm:w-12">
              <img src="/icons/pwa-192x192.png" alt="DLUT GPA" className="h-7 w-7 object-contain sm:h-8 sm:w-8" />
            </div>

            <div className="min-w-0">
              <div className="section-kicker hidden sm:inline-flex">Dalian University of Technology</div>
              <div className="flex flex-wrap items-center gap-2 sm:mt-1 sm:gap-3">
                <h1 className="text-[1.55rem] leading-none text-main sm:text-[1.9rem]">{t('app_title')}</h1>
                <span
                  className={`status-chip ${
                    isSandboxMode ? 'border-amber-400/30 bg-amber-500/10 text-amber-200' : 'border-primary/20 bg-primary/10 text-primary'
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
                <button type="button" onClick={onEnterSandbox} className={`${actionButton} border-amber-400/30 bg-amber-500/10 text-amber-200`}>
                  <FlaskConical size={14} />
                  <span className="hidden sm:inline">{t('enter_sandbox')}</span>
                </button>
                <button type="button" onClick={onReset} className={actionButton}>
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline">{t('reset')}</span>
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          <nav className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-1" aria-label="Primary">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSectionChange(item.id)}
                  className="nav-pill"
                  data-active={active}
                  aria-pressed={active}
                >
                  <Icon size={15} />
                  {t(item.labelKey)}
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
                <div className="paper-panel absolute right-0 top-full z-30 mt-3 w-48 p-2">
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
                            active ? 'bg-primary/12 font-semibold text-primary' : 'text-main hover:bg-background/60'
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
