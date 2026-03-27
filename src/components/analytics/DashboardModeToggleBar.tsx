import React from 'react';
import { Brain, Orbit, Sigma, Sparkles } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

type AnalysisView = 'overview' | 'simulation' | 'radar' | 'advisor';

interface DashboardModeToggleBarProps {
  activeView: AnalysisView;
  onChange: (view: AnalysisView) => void;
}

export const DashboardModeToggleBar: React.FC<DashboardModeToggleBarProps> = ({
  activeView,
  onChange,
}) => {
  const { t, language } = useTranslation();

  const items: Array<{
    id: AnalysisView;
    label: string;
    sublabel: string;
    icon: React.ComponentType<any>;
  }> = [
    {
      id: 'overview',
      label: t('analysis_overview'),
      sublabel: language === 'zh' ? '图表总览' : 'Charts',
      icon: Sparkles,
    },
    {
      id: 'simulation',
      label: t('analysis_simulation'),
      sublabel: 'GPA',
      icon: Sigma,
    },
    {
      id: 'radar',
      label: t('analysis_radar'),
      sublabel: language === 'zh' ? '学业结构' : 'Radar',
      icon: Orbit,
    },
    {
      id: 'advisor',
      label: t('analysis_advisor'),
      sublabel: language === 'zh' ? '辅助建议' : 'Notes',
      icon: Brain,
    },
  ];

  return (
    <div className="paper-panel p-2">
      <div
        className="grid gap-2 md:grid-cols-2 xl:grid-cols-4"
        role="tablist"
        aria-label="Analysis views"
      >
        {items.map(item => {
          const Icon = item.icon;
          const active = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.id)}
              className={`flex items-center justify-between rounded-[0.95rem] border px-4 py-3 text-left transition-colors ${
                active
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/10 bg-transparent text-main hover:border-primary/18 hover:bg-[hsl(var(--surface-2))] dark:border-white/8'
              }`}
            >
              <div>
                <div
                  className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
                    active ? 'text-white/72' : 'text-muted'
                  }`}
                >
                  {item.sublabel}
                </div>
                <div className="mt-1 text-sm font-semibold">{item.label}</div>
              </div>

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-[0.85rem] ${
                  active
                    ? 'bg-white/14 text-white'
                    : 'bg-[hsl(var(--surface-2))] text-muted dark:bg-[hsl(var(--surface-3))]'
                }`}
              >
                <Icon size={16} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
