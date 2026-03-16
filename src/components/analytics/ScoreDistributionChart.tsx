import React, { useMemo } from 'react';
import { GpaStats } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Sparkles, PieChart as PieChartIcon } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface ScoreDistributionChartProps {
  stats: GpaStats;
}

export const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({ stats }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const primaryColor = theme === 'dark' ? '#60A5FA' : '#005BAC';
  const mutedColor = theme === 'dark' ? '#94A3B8' : '#64748B';
  const panelColor = theme === 'dark' ? '#162033' : '#FCFAF4';
  const COLORS = useMemo(() => ['#10B981', primaryColor, '#F59E0B', '#EF4444', '#6B7280'], [primaryColor]);

  return (
    <div className="paper-panel p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="section-kicker">Distribution Story</div>
          <h3 className="type-section-title mt-2 text-main">{t('score_dist')}</h3>
        </div>
        <div className="rounded-[1.2rem] border border-primary/15 bg-primary/5 p-3 text-primary">
          <Sparkles size={18} className="text-[hsl(var(--color-accent))]" />
        </div>
      </div>

      <div className="relative h-64 w-full sm:h-72">
        {stats.totalCredits > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={stats.scoreDistribution}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
                >
                {stats.scoreDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
                <RechartsTooltip 
                     contentStyle={{ 
                       borderRadius: '12px', 
                       border: 'none', 
                       boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                       backgroundColor: panelColor,
                       color: theme === 'dark' ? '#F8FAFC' : '#1E293B'
                     }}
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                    <tspan
                      x="50%"
                      dy="-0.6em"
                      fontSize="28"
                      fontWeight="600"
                      fontFamily="var(--font-numeric)"
                      fill={primaryColor}
                      letterSpacing="0.02em"
                    >
                        {stats.weightedGpa.toFixed(3)}
                    </tspan>
                    <tspan
                      x="50%"
                      dy="1.6em"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="var(--font-body)"
                      fill={mutedColor}
                      letterSpacing="0.08em"
                    >
                        GPA
                    </tspan>
                </text>
            </PieChart>
            </ResponsiveContainer>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted text-sm gap-2">
                <PieChartIcon size={32} className="opacity-20" />
                {t('no_data')}
            </div>
        )}
      </div>
      <div className="editorial-divider my-4" />
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 px-2">
          {stats.scoreDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="w-2.5 h-2.5 rounded-full ring-2 ring-surface shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="text-muted">{entry.name}</span>
                  <span className="num-inline ml-0.5 text-muted/70">({entry.value})</span>
              </div>
          ))}
      </div>
    </div>
  );
};
