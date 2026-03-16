import React from 'react';
import { Brain, Orbit, Sigma, Sparkles } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

type AnalysisView = 'overview' | 'simulation' | 'radar' | 'advisor';

interface DashboardModeToggleBarProps {
  activeView: AnalysisView;
  onChange: (view: AnalysisView) => void;
}

export const DashboardModeToggleBar: React.FC<DashboardModeToggleBarProps> = ({ activeView, onChange }) => {
  const { t } = useTranslation();

  const items: Array<{ id: AnalysisView; label: string; sublabel: string; icon: React.ComponentType<any> }> = [
    { id: 'overview', label: t('analysis_overview'), sublabel: 'Charts', icon: Sparkles },
    { id: 'simulation', label: t('analysis_simulation'), sublabel: 'GPA', icon: Sigma },
    { id: 'radar', label: t('analysis_radar'), sublabel: 'Radar', icon: Orbit },
    { id: 'advisor', label: t('analysis_advisor'), sublabel: 'Notes', icon: Brain },
  ];

  return (
    <div className="paper-panel px-4 py-3 sm:px-5">
      <div className="flex gap-5 overflow-x-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`group relative min-w-fit flex-1 px-1 py-2 text-left transition-colors ${
                active
                  ? 'text-primary dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-white/55 dark:hover:text-white/85'
              }`}
              aria-pressed={active}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className={`figure-label ${active ? 'text-primary/70 dark:text-white/55' : ''}`}>{item.sublabel}</div>
                  <div className="mt-1 text-sm font-semibold sm:text-base">{item.label}</div>
                </div>
                <div
                  className={`rounded-2xl p-2 ${
                    active
                      ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white'
                      : 'bg-slate-900/5 text-slate-500 group-hover:bg-slate-900/10 group-hover:text-primary dark:bg-white/5 dark:text-white/45 dark:group-hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                </div>
              </div>
              <span
                className={`absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-primary transition-opacity ${
                  active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
