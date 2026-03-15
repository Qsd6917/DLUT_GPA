import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { GpaStats } from '../../types';

interface ScoreDistributionHistogramProps {
  stats: GpaStats;
}

export const ScoreDistributionHistogram: React.FC<ScoreDistributionHistogramProps> = ({ stats }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // 定义颜色方案
  const primaryColor = theme === 'dark' ? '#60A5FA' : '#005BAC';
  const barColors = [
    '#10B981', // 90-100 range (green)
    primaryColor, // 80-89 range (blue)
    '#F59E0B', // 70-79 range (yellow)
    '#EF4444', // 60-69 range (red)
    '#6B7280'  // <60 range (gray)
  ];

  // 自定义 Tooltip 组件
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg border shadow-lg ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-800'
        }`}>
          <p className="font-bold">{data.name}</p>
          <p className="text-sm">{t('course_count')}: {data.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-soft border border-primary/10 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-main flex items-center gap-2">
          <TrendingUp size={18} className="text-green-500" />
          {t('score_dist')} - {t('histogram')}
        </h3>
      </div>

      <div className="h-72 w-full">
        {stats.totalCredits > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.scoreDistribution}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 30
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} 
              />
              <XAxis 
                dataKey="name" 
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              />
              <YAxis 
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="value" 
                name={t('course_count')}
                radius={[4, 4, 0, 0]}
              >
                {stats.scoreDistribution.map((_, index) => (
                  <rect 
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
      
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {stats.scoreDistribution.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs font-medium">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: barColors[index % barColors.length] }}
            ></div>
            <span className="text-muted">{entry.name}</span>
            <span className="text-muted/70">({entry.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
