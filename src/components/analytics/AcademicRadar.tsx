import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Trophy } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Course } from '../../types';

interface AcademicRadarProps {
  courses: Course[];
}

// 课程分类函数
const categorizeCourse = (courseName: string): string => {
  const nameLower = courseName.toLowerCase();
  
  // 数学类
  if (nameLower.includes('数学') || 
      nameLower.includes('math') || 
      nameLower.includes('微积分') || 
      nameLower.includes('线性代数') || 
      nameLower.includes('概率') || 
      nameLower.includes('统计')) {
    return 'math';
  }
  
  // 英语类
  if (nameLower.includes('英语') || 
      nameLower.includes('english') || 
      nameLower.includes('外语')) {
    return 'english';
  }
  
  // 专业核心类
  if (nameLower.includes('专业') || 
      nameLower.includes('核心') || 
      nameLower.includes('程序') || 
      nameLower.includes('算法') || 
      nameLower.includes('数据结构') || 
      nameLower.includes('计算机') || 
      nameLower.includes('编程')) {
    return 'major';
  }
  
  // 通识教育类
  if (nameLower.includes('思政') || 
      nameLower.includes('政治') || 
      nameLower.includes('思想') || 
      nameLower.includes('道德') || 
      nameLower.includes('法律') || 
      nameLower.includes('文化') || 
      nameLower.includes('历史') || 
      nameLower.includes('哲学')) {
    return 'general';
  }
  
  // 体育类
  if (nameLower.includes('体育') || 
      nameLower.includes('physical') || 
      nameLower.includes('pe') || 
      nameLower.includes('运动')) {
    return 'sports';
  }
  
  // 默认为其他
  return 'other';
};

// 获取分类标签
const getCategoryLabel = (category: string, t: (key: string) => string): string => {
  const labels: Record<string, string> = {
    math: t('category_math'),
    english: t('category_english'),
    major: t('category_major'),
    general: t('category_general'),
    sports: t('category_sports'),
    other: t('category_other')
  };
  return labels[category] || category;
};

export const AcademicRadar: React.FC<AcademicRadarProps> = ({ courses }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  // 按类别分组课程
  const categorizedScores: Record<string, number[]> = {
    math: [],
    english: [],
    major: [],
    general: [],
    sports: [],
    other: []
  };
  
  // 对激活的课程进行分类并收集分数
  courses
    .filter(course => course.isActive)
    .forEach(course => {
      const category = categorizeCourse(course.name);
      categorizedScores[category].push(course.score);
    });
  
  // 计算每类的平均分
  const radarData = Object.entries(categorizedScores).map(([category, scores]) => {
    const average = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;
    
    return {
      subject: getCategoryLabel(category, t),
      score: Math.round(average * 100) / 100, // 四舍五入到两位小数
      fullMark: 100,
      category
    };
  }).filter(item => item.score > 0); // 只显示有分数的类别
  
  // 颜色配置
  const primaryColor = theme === 'dark' ? '#60A5FA' : '#005BAC';
  const secondaryColor = theme === 'dark' ? '#818cf8' : '#4f46e5';
  
  return (
    <div className="bg-surface p-6 rounded-2xl shadow-soft border border-primary/10 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-main flex items-center gap-2">
          {t('academic_radar_title')}
        </h3>
      </div>

      <div className="h-72 w-full">
        {radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tickCount={6}
                tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
              />
              <Radar
                name={t('scores')}
                dataKey="score"
                stroke={secondaryColor}
                fill={primaryColor}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted text-sm gap-2">
            <Trophy size={32} className="opacity-20" />
            {t('no_data_for_radar')}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {radarData.map((item) => (
          <div key={item.category} className="flex items-center gap-1.5 text-xs font-medium">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: secondaryColor }}></span>
            <span className="text-muted">{getCategoryLabel(item.category, t)}</span>
            <span className="text-muted/70 ml-0.5">({item.score})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
