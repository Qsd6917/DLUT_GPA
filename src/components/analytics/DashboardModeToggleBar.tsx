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
    <div className="paper-panel p-2">
      <div className="flex gap-2 overflow-x-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`min-w-fit flex-1 rounded-[1.1rem] px-4 py-3 text-left transition-all ${
                active
                  ? 'bg-primary text-on-primary shadow-[0_18px_34px_hsla(var(--color-primary),0.24)]'
                  : 'bg-transparent text-main hover:bg-background/60'
              }`}
              aria-pressed={active}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className={`figure-label ${active ? 'text-on-primary/70' : ''}`}>{item.sublabel}</div>
                  <div className="mt-1 text-sm font-semibold sm:text-base">{item.label}</div>
                </div>
                <div className={`rounded-2xl p-2 ${active ? 'bg-white/10' : 'bg-primary/10 text-primary'}`}>
                  <Icon size={16} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
