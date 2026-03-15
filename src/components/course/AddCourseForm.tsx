import React, { useState } from 'react';
import { Plus, BookOpen, GraduationCap, Calendar, Hash, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { CourseType } from '../../types';

interface AddCourseFormProps {
  onAdd: (name: string, credits: number, score: number, semester: string, type: CourseType, isCore: boolean) => void;
  existingNames: string[];
  existingSemesters: string[];
}

export const AddCourseForm: React.FC<AddCourseFormProps> = ({ onAdd, existingNames, existingSemesters }) => {
  const [name, setName] = useState('');
  const [credits, setCredits] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [semester, setSemester] = useState('');
  const [type, setType] = useState<CourseType>('必修');
  const [isCore, setIsCore] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('请输入课程名称');
      return;
    }
    
    const numScore = Number(score);
    if (score === '' || isNaN(numScore) || numScore < 0 || numScore > 100) {
      setError('请输入有效的成绩 (0-100)');
      return;
    }

    const numCredits = Number(credits);
    if (credits === '' || isNaN(numCredits) || numCredits <= 0) {
      setError('请输入有效的学分');
      return;
    }

    if (!semester.trim()) {
      setError('请输入学期 (例如: 1-1)');
      return;
    }

    onAdd(name.trim(), numCredits, numScore, semester.trim(), type, isCore);
    
    // 重置表单，保留学期和类型以便连续输入
    setName('');
    setScore('');
    setCredits(''); 
    // setSemester(''); // 通常连续录入同一学期
  };

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-soft border border-primary/10 transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Plus size={20} />
        </div>
        <h3 className="text-lg font-bold text-main">添加课程</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 第一行：课程名与学期 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="course-name" className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={14} /> 课程名称
            </label>
            <div className="relative group">
              <input
                id="course-name"
                type="text"
                list="course-names"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all group-hover:bg-surface text-main placeholder:text-muted"
                placeholder="例如：高等数学"
              />
              <datalist id="course-names">
                {existingNames.map((n, i) => <option key={i} value={n} />)}
              </datalist>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="course-semester" className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} /> 学期
            </label>
            <div className="relative group">
              <input
                id="course-semester"
                type="text"
                list="semesters"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all group-hover:bg-surface text-main placeholder:text-muted"
                placeholder="例如：1-1"
              />
              <datalist id="semesters">
                {existingSemesters.map((s, i) => <option key={i} value={s} />)}
              </datalist>
            </div>
          </div>
        </div>

        {/* 第二行：学分、成绩、类型 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="course-credits" className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap size={14} /> 学分
            </label>
            <input
              id="course-credits"
              type="number"
              step="0.5"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-main placeholder:text-muted"
              placeholder="0.0"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="course-score" className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} /> 成绩
            </label>
            <input
              id="course-score"
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-main placeholder:text-muted"
              placeholder="0-100"
            />
          </div>

          <div className="space-y-1.5 col-span-2 md:col-span-2">
            <label htmlFor="course-type" className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Hash size={14} /> 属性
            </label>
            <div className="flex gap-2">
              <select
                id="course-type"
                value={type}
                onChange={(e) => setType(e.target.value as CourseType)}
                className="flex-1 px-4 py-2.5 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer text-main"
              >
                <option value="必修">必修</option>
                <option value="选修">选修</option>
                <option value="任选">任选</option>
              </select>
              
              <button
                type="button"
                onClick={() => setIsCore(!isCore)}
                className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 font-medium text-sm ${
                  isCore 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-400' 
                    : 'bg-background border-primary/20 text-muted hover:bg-surface'
                }`}
                title="是否为核心/主干课程"
              >
                <CheckCircle2 size={16} className={isCore ? 'fill-yellow-500 text-white' : ''} />
                <span>核心</span>
              </button>
            </div>
          </div>
        </div>

        {/* 错误提示与提交 */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-red-500 text-sm font-medium flex items-center gap-1.5 h-6">
            {error && (
              <>
                <AlertCircle size={14} />
                {error}
              </>
            )}
          </div>
          
          <button
            type="submit"
            className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} strokeWidth={2.5} />
            添加
          </button>
        </div>
      </form>
    </div>
  );
};
