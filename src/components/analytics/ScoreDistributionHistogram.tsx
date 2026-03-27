import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { GpaStats } from '../../types';

interface ScoreDistributionHistogramProps {
  stats: GpaStats;
}

export const ScoreDistributionHistogram: React.FC<
  ScoreDistributionHistogramProps
> = ({ stats }) => {
  const { t, language } = useTranslation();
  const { theme } = useTheme();

  // 定义颜色方案
  const primaryColor = theme === 'dark' ? '#60A5FA' : '#005BAC';
  const axisColor = theme === 'dark' ? '#A8B3C7' : '#5B6B80';
  const barColors = [
    '#10B981', // 90-100 range (green)
    primaryColor, // 80-89 range (blue)
    '#F59E0B', // 70-79 range (yellow)
    '#EF4444', // 60-69 range (red)
    '#6B7280', // <60 range (gray)
  ];

  // 自定义 Tooltip 组件
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={`p-3 rounded-lg border shadow-lg ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-200 text-gray-800'
          }`}
        >
          <p className="type-label text-main dark:text-white">{data.name}</p>
          <p className="type-body-sm mt-1">
            {t('course_count')}:{' '}
            <span className="num-inline text-main dark:text-white">
              {data.value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="paper-panel p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="section-kicker">
            {language === 'zh' ? '直方统计' : 'Histogram'}
          </div>
          <h3 className="type-section-title mt-2 text-main">
            {t('score_dist')} - {t('histogram')}
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-primary/10 bg-[hsl(var(--surface-2))] text-primary">
          <TrendingUp size={18} className="text-emerald-500" />
        </div>
      </div>

      <div className="h-72 w-full sm:h-80">
        {stats.totalCredits > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.scoreDistribution}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
              />
              <XAxis
                dataKey="name"
                stroke={axisColor}
                tick={{
                  fill: axisColor,
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <YAxis
                stroke={axisColor}
                tick={{
                  fill: axisColor,
                  fontFamily: 'var(--font-numeric)',
                  fontSize: 12,
                  fontWeight: 500,
                }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                name={t('course_count')}
                radius={[4, 4, 0, 0]}
              >
                {stats.scoreDistribution.map((_, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={barColors[index % barColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted text-sm gap-2">
            <BarChart3 size={32} className="opacity-20" />
            {t('no_data')}
          </div>
        )}
      </div>

      <div className="editorial-divider my-4" />
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {stats.scoreDistribution.map((entry, index) => (
          <div
            key={entry.name}
            className="flex items-center gap-2 text-xs font-medium"
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: barColors[index % barColors.length] }}
            ></div>
            <span className="text-muted">{entry.name}</span>
            <span className="num-inline text-muted/70">({entry.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
