import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Database, FlaskConical, GraduationCap, Languages, RotateCcw, Settings, Share2 } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { CalculationMethod } from '../../types';
import { ThemeSelector } from '../common/ThemeSelector';

interface HeaderProps {
  isSandboxMode: boolean;
  logoError: boolean;
  setLogoError: (error: boolean) => void;
  onReset: () => void;
  onDataMgmt: () => void;
  onShare: () => void;
  onEnterSandbox: () => void;
  method: CalculationMethod;
  setMethod: (method: CalculationMethod) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSandboxMode,
  logoError,
  setLogoError,
  onReset,
  onDataMgmt,
  onShare,
  onEnterSandbox,
  method,
  setMethod,
}) => {
  const { t, language, setLanguage } = useTranslation();
  useTheme();
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const methodRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

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

  const currentMethodLabel = methodOptions.find((m) => m.value === method)?.label ?? 'DLUT 5.0';

  return (
    <header className={`bg-white/95 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-40 transition-all duration-300 dark:bg-gray-900/90 dark:border-gray-800 ${isSandboxMode ? 'border-b-amber-200 bg-amber-50/90 dark:bg-amber-900/90' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-default min-w-0">
            <div className="flex-shrink-0 relative overflow-hidden rounded-full p-1 bg-white border border-primary/20 shadow-sm transition-transform group-hover:scale-105 duration-300 w-12 h-12 flex items-center justify-center dark:bg-gray-800 dark:border-gray-700">
               {!logoError ? (
                   <img 
                     src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Dalian_University_of_Technology_logo.png/240px-Dalian_University_of_Technology_logo.png" 
                     alt="DLUT Logo" 
                     className="w-10 h-10 object-contain"
                     onError={() => setLogoError(true)}
                   />
               ) : (
                   <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                        <GraduationCap className="text-primary w-6 h-6" />
                   </div>
               )}
            </div>
            <div className="min-w-0">
                <h1 className="text-2xl font-extrabold text-main tracking-tight flex items-center gap-2 min-w-0">
                  <span className="truncate">{t('app_title')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border hidden sm:inline-block ${isSandboxMode ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-200' : 'bg-primary/10 text-primary border-primary/20 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'}`}>
                    {isSandboxMode ? t('sandbox_mode') : 'Pro'}
                  </span>
                </h1>
                <p className="text-xs text-muted font-medium tracking-wide truncate">{t('app_desc')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2">
                 {!isSandboxMode ? (
                     <>
                        <button 
                            onClick={onReset}
                            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200"
                        >
                            <RotateCcw size={14} />
                            {t('reset')}
                        </button>
                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
                        <button 
                            onClick={onDataMgmt}
                            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary px-3 py-2 rounded-xl hover:bg-primary/10 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all duration-200"
                        >
                            <Database size={14} />
                            {t('data_mgmt')}
                        </button>
                        <button 
                            onClick={onShare}
                            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl transition-all duration-200 shadow-md shadow-indigo-200 dark:shadow-none"
                        >
                            <Share2 size={14} />
                            {t('share')}
                        </button>
                        <button 
                            onClick={onEnterSandbox}
                            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-xl transition-all duration-200 border border-amber-200 ml-2 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800"
                        >
                            <FlaskConical size={14} />
                            {t('enter_sandbox')}
                        </button>
                     </>
                 ) : (
                     <div className="flex items-center gap-2 bg-amber-100 px-2 py-1 rounded-xl border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800">
                         <FlaskConical size={14} className="text-amber-600 dark:text-amber-400 animate-pulse" />
                         <span className="text-xs font-bold text-amber-800 dark:text-amber-200">{t('sandbox_active')}</span>
                     </div>
                 )}
            </div>
            
            {/* Mobile Share Button (Only Icon) */}
            {!isSandboxMode && (
                <button 
                    onClick={onShare}
                    className="md:hidden flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-xl transition-all dark:bg-indigo-900/30 dark:text-indigo-300"
                    aria-label={t('share')}
                >
                    <Share2 size={18} />
                </button>
            )}

            {/* Theme Selector */}
            <div className="flex items-center justify-center p-2 rounded-xl text-muted hover:bg-gray-100 hover:text-main dark:hover:bg-gray-800 dark:hover:text-white transition-colors">
                <ThemeSelector />
            </div>

            {/* Language Switcher */}
            <button 
                onClick={toggleLanguage}
                className="flex items-center justify-center p-2 rounded-xl text-muted hover:bg-gray-100 hover:text-main dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
                title="Switch Language"
                aria-label="Switch language"
            >
                <Languages size={18} />
                <span className="text-xs font-bold ml-1 uppercase">{language}</span>
            </button>

            <div className="relative" ref={methodRef}>
              <button
                type="button"
                onClick={() => setIsMethodOpen((v) => !v)}
                className="flex items-center gap-2 bg-gray-100/80 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl px-2 py-2 transition-all duration-200 shadow-sm dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                aria-haspopup="listbox"
                aria-expanded={isMethodOpen}
              >
                <Settings size={16} className="text-muted" />
                <span className="text-sm font-semibold text-main w-[90px] sm:w-auto text-left">{currentMethodLabel}</span>
                <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${isMethodOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMethodOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-surface rounded-2xl shadow-xl border border-primary/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                  <div role="listbox" aria-label="GPA 模式">
                    {methodOptions.map((opt) => {
                      const active = opt.value === method;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setMethod(opt.value);
                            setIsMethodOpen(false);
                          }}
                          className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${active ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-background text-main'}`}
                        >
                          <span>{opt.label}</span>
                          {active && <span className="text-xs font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </header>
  );
};
