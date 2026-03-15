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
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
          <span className="text-xs font-bold text-gray-700">
            {current.toFixed(1)} / {target} ({percentage.toFixed(0)}%)
          </span>
        </div>
        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
          <Award size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">毕业进度概览</h3>
      </div>

      <div className="space-y-6">
        {renderProgressBar('总学分', totalCredits, requirements.total, 'bg-gradient-to-r from-blue-500 to-indigo-600')}
        {renderProgressBar('必修学分', compulsoryCredits, requirements.compulsory, 'bg-gradient-to-r from-purple-500 to-pink-500')}
        {renderProgressBar('选修学分', electiveCredits, requirements.elective, 'bg-gradient-to-r from-emerald-500 to-teal-500')}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-center gap-2 text-xs text-gray-400">
        <CheckCircle2 size={14} />
        <span>仅供参考，具体要求请以培养方案为准</span>
      </div>
    </div>
  );
};
