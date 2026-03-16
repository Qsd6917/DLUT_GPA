import React from 'react';
import { Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Trophy } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Course } from '../../types';

interface AcademicRadarProps {
  courses: Course[];
}

const categorizeCourse = (courseName: string): string => {
  const nameLower = courseName.toLowerCase();

  if (
    nameLower.includes('数学') ||
    nameLower.includes('math') ||
    nameLower.includes('微积分') ||
    nameLower.includes('线性代数') ||
    nameLower.includes('概率') ||
    nameLower.includes('统计')
  ) {
    return 'math';
  }

  if (nameLower.includes('英语') || nameLower.includes('english') || nameLower.includes('外语')) {
    return 'english';
  }

  if (
    nameLower.includes('专业') ||
    nameLower.includes('核心') ||
    nameLower.includes('程序') ||
    nameLower.includes('算法') ||
    nameLower.includes('数据结构') ||
    nameLower.includes('计算机') ||
    nameLower.includes('编程')
  ) {
    return 'major';
  }

  if (
    nameLower.includes('思政') ||
    nameLower.includes('政治') ||
    nameLower.includes('思想') ||
    nameLower.includes('道德') ||
    nameLower.includes('法律') ||
    nameLower.includes('文化') ||
    nameLower.includes('历史') ||
    nameLower.includes('哲学')
  ) {
    return 'general';
  }

  if (nameLower.includes('体育') || nameLower.includes('physical') || nameLower.includes('pe') || nameLower.includes('运动')) {
    return 'sports';
  }

  return 'other';
};

const getCategoryLabel = (category: string, t: (key: string) => string): string => {
  const labels: Record<string, string> = {
    math: t('category_math'),
    english: t('category_english'),
    major: t('category_major'),
    general: t('category_general'),
    sports: t('category_sports'),
    other: t('category_other'),
  };
  return labels[category] || category;
};

export const AcademicRadar: React.FC<AcademicRadarProps> = ({ courses }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const categorizedScores: Record<string, number[]> = {
    math: [],
    english: [],
    major: [],
    general: [],
    sports: [],
    other: [],
  };

  courses
    .filter((course) => course.isActive)
    .forEach((course) => {
      const category = categorizeCourse(course.name);
      categorizedScores[category].push(course.score);
    });

  const radarData = Object.entries(categorizedScores)
    .map(([category, scores]) => {
      const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

      return {
        subject: getCategoryLabel(category, t),
        score: Math.round(average * 100) / 100,
        fullMark: 100,
        category,
      };
    })
    .filter((item) => item.score > 0);

  const primaryColor = theme === 'dark' ? '#60A5FA' : '#005BAC';
  const secondaryColor = theme === 'dark' ? '#A5B4FC' : '#4F46E5';

  return (
    <section className="paper-panel p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="section-kicker">Radar</div>
          <h3 className="mt-2 text-2xl leading-none text-main sm:text-3xl">{t('academic_radar_title')}</h3>
        </div>
        <div className="rounded-[1.2rem] border border-primary/10 bg-primary/10 p-3 text-primary">
          <Trophy size={18} />
        </div>
      </div>

      <div className="h-72 w-full sm:h-80">
        {radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke={theme === 'dark' ? '#334155' : '#CBD5E1'} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? '#CBD5E1' : '#475569', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={6} tick={{ fill: theme === 'dark' ? '#94A3B8' : '#64748B', fontSize: 11 }} />
              <Radar name={t('scores')} dataKey="score" stroke={secondaryColor} fill={primaryColor} fillOpacity={0.28} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted">
            <Trophy size={32} className="opacity-20" />
            {t('no_data_for_radar')}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {radarData.map((item) => (
          <div key={item.category} className="flex items-center gap-1.5 text-xs font-medium">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
            <span className="text-muted">{getCategoryLabel(item.category, t)}</span>
            <span className="text-muted/70">({item.score})</span>
          </div>
        ))}
      </div>
    </section>
  );
};
