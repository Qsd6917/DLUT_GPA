import React from 'react';
import { Brain, Orbit, Sigma, Sparkles } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

export type AnalysisView = 'overview' | 'experiment' | 'radar' | 'advisor';

interface DashboardModeToggleBarProps {
  activeView: AnalysisView;
  onChange: (view: AnalysisView) => void;
}

export const DashboardModeToggleBar: React.FC<DashboardModeToggleBarProps> = ({
  activeView,
  onChange,
}) => {
  const { t } = useTranslation();

  const items: Array<{
    id: AnalysisView;
    label: string;
    sublabel: string;
    icon: React.ComponentType<any>;
  }> = [
    {
      id: 'overview',
      label: t('analysis_overview'),
      sublabel: t('analysis_overview_sublabel'),
      icon: Sparkles,
    },
    {
      id: 'experiment',
      label: t('analysis_experiment'),
      sublabel: t('analysis_experiment_sublabel'),
      icon: Sigma,
    },
    {
      id: 'radar',
      label: t('analysis_radar'),
      sublabel: t('analysis_radar_sublabel'),
      icon: Orbit,
    },
    {
      id: 'advisor',
      label: t('analysis_advisor'),
      sublabel: t('analysis_advisor_sublabel'),
      icon: Brain,
    },
  ];

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 :
      (index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    onChange(items[next].id);
    document.getElementById(`analysis-tab-${items[next].id}`)?.focus();
  };

  return (
    <div className="paper-panel p-2">
      <div
        className="flex min-w-max gap-2 overflow-x-auto pb-1 md:grid md:min-w-0 md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-4"
        role="tablist"
        aria-label={t('analysis_views')}
      >
        {items.map(item => {
          const Icon = item.icon;
          const active = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`analysis-tab-${item.id}`}
              aria-controls={`analysis-panel-${item.id}`}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onKeyDown={event => handleKeyDown(event, items.indexOf(item))}
              onClick={() => onChange(item.id)}
              className={`flex min-w-[11rem] shrink-0 items-center justify-between rounded-[0.95rem] border px-4 py-3 text-left transition-colors md:min-w-0 ${
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
