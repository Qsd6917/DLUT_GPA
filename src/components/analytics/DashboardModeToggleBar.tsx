import React from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

interface DashboardModeToggleBarProps {
  showSimulation: boolean;
  showRadar: boolean;
  showAdvisor: boolean;
  onToggleSimulation: () => void;
  onToggleRadar: () => void;
  onToggleAdvisor: () => void;
}

export const DashboardModeToggleBar: React.FC<DashboardModeToggleBarProps> = ({
  showSimulation,
  showRadar,
  showAdvisor,
  onToggleSimulation,
  onToggleRadar,
  onToggleAdvisor,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center gap-3 mt-4 flex-wrap">
      <button
        type="button"
        onClick={onToggleSimulation}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          showSimulation ? 'bg-primary text-on-primary' : 'bg-surface text-main border border-primary/20 hover:bg-muted/10'
        }`}
      >
        {showSimulation ? t('hide_simulation') : t('show_simulation')}
      </button>
      <button
        type="button"
        onClick={onToggleRadar}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          showRadar ? 'bg-primary text-on-primary' : 'bg-surface text-main border border-primary/20 hover:bg-muted/10'
        }`}
      >
        {showRadar ? t('hide_radar') : t('show_radar')}
      </button>
      <button
        type="button"
        onClick={onToggleAdvisor}
        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
          showAdvisor ? 'bg-indigo-600 text-white' : 'bg-surface text-main border border-primary/20 hover:bg-muted/10'
        }`}
      >
        {showAdvisor ? (
          <>
            <Sparkles size={16} /> 隐藏智能建议
          </>
        ) : (
          <>
            <Brain size={16} /> 智能学业建议
          </>
        )}
      </button>
    </div>
  );
};
