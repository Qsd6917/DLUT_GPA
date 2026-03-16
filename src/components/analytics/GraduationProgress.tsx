import React from 'react';
import { Course } from '../../types';
import { Award, CheckCircle2 } from 'lucide-react';

interface GraduationProgressProps {
  courses: Course[];
  totalCredits: number;
}

export const GraduationProgress: React.FC<GraduationProgressProps> = ({
  courses,
  totalCredits,
}) => {
  // Hardcoded DLUT requirements for now (or make it configurable)
  const requirements = {
    total: 160,
    compulsory: 100,
    elective: 30,
  };

  const compulsoryCredits = courses.filter(c => c.type === '必修').reduce((sum, c) => sum + c.credits, 0);
  const electiveCredits = courses.filter(c => c.type === '选修').reduce((sum, c) => sum + c.credits, 0);

  const renderProgressBar = (label: string, current: number, target: number, color: string) => {
    const percentage = Math.min(100, (current / target) * 100);
    return (
      <div className="mb-4">
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-xs font-bold text-muted uppercase tracking-[0.24em]">{label}</span>
          <span className="data-figure text-xs text-main">
            {current.toFixed(1)} / {target} ({percentage.toFixed(0)}%)
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-background/90">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="paper-panel p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-[1.2rem] border border-primary/15 bg-primary/5 p-3 text-primary">
          <Award size={20} />
        </div>
        <div>
          <div className="section-kicker">Progress Ledger</div>
          <h3 className="text-2xl leading-none text-main sm:text-3xl">毕业进度概览</h3>
        </div>
      </div>

      <div className="space-y-6">
        {renderProgressBar('总学分', totalCredits, requirements.total, 'bg-gradient-to-r from-blue-500 to-indigo-600')}
        {renderProgressBar('必修学分', compulsoryCredits, requirements.compulsory, 'bg-gradient-to-r from-purple-500 to-pink-500')}
        {renderProgressBar('选修学分', electiveCredits, requirements.elective, 'bg-gradient-to-r from-emerald-500 to-teal-500')}
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-2 border-t border-primary/10 pt-4 text-xs text-muted">
        <CheckCircle2 size={14} />
        <span>仅供参考，具体要求请以培养方案为准</span>
      </div>
    </div>
  );
};
