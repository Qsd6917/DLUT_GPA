import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { Course } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';

interface GraduationProgressProps {
  courses: Course[];
  totalCredits: number;
}

export const GraduationProgress: React.FC<GraduationProgressProps> = ({
  courses,
  totalCredits,
}) => {
  const { language } = useTranslation();

  const requirements = {
    total: 160,
    compulsory: 100,
    elective: 30,
  };

  const compulsoryCredits = courses
    .filter(course => course.type === '必修')
    .reduce((sum, course) => sum + course.credits, 0);
  const electiveCredits = courses
    .filter(course => course.type === '选修')
    .reduce((sum, course) => sum + course.credits, 0);

  const renderProgressBar = (
    label: string,
    current: number,
    target: number,
    className: string
  ) => {
    const percentage = Math.min(100, (current / target) * 100);

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <span className="type-label">{label}</span>
          <span className="text-sm font-semibold text-main">
            {current.toFixed(1)} / {target} ({percentage.toFixed(0)}%)
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--surface-3))]">
          <div
            className={`h-full rounded-full transition-all duration-700 ${className}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="paper-panel p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-primary/10 bg-[hsl(var(--surface-2))] text-primary">
          <Award size={18} />
        </div>
        <div>
          <div className="section-kicker">
            {language === 'zh' ? '毕业进度' : 'Progress'}
          </div>
          <h3 className="type-section-title text-main">毕业进度概览</h3>
        </div>
      </div>

      <div className="space-y-5">
        {renderProgressBar(
          language === 'zh' ? '总学分' : 'Total Credits',
          totalCredits,
          requirements.total,
          'bg-primary'
        )}
        {renderProgressBar(
          language === 'zh' ? '必修学分' : 'Compulsory Credits',
          compulsoryCredits,
          requirements.compulsory,
          'bg-violet-500'
        )}
        {renderProgressBar(
          language === 'zh' ? '选修学分' : 'Elective Credits',
          electiveCredits,
          requirements.elective,
          'bg-emerald-500'
        )}
      </div>

      <div className="type-body-sm mt-5 flex items-center gap-2 border-t border-primary/10 pt-4">
        <CheckCircle2 size={14} />
        <span>
          {language === 'zh'
            ? '仅供参考，具体要求仍以培养方案为准。'
            : 'Reference only. Always confirm against the official program requirements.'}
        </span>
      </div>
    </div>
  );
};
