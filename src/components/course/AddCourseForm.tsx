import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Hash,
  Plus,
} from 'lucide-react';
import { CourseType } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';

interface AddCourseFormProps {
  onAdd: (name: string, credits: number, score: number, semester: string, type: CourseType, isCore: boolean) => void;
  existingNames: string[];
  existingSemesters: string[];
  variant?: 'panel' | 'drawer';
}

const fieldClassName =
  'w-full rounded-[1.15rem] border border-primary/15 bg-background/55 px-4 py-3 text-sm text-main outline-none transition-all placeholder:text-muted focus:border-primary focus:bg-background/75 focus:ring-4 focus:ring-primary/10';

export const AddCourseForm: React.FC<AddCourseFormProps> = ({
  onAdd,
  existingNames,
  existingSemesters,
  variant = 'panel',
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('');
  const [score, setScore] = useState('');
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
    if (score === '' || Number.isNaN(numScore) || numScore < 0 || numScore > 100) {
      setError('请输入有效的成绩 (0-100)');
      return;
    }

    const numCredits = Number(credits);
    if (credits === '' || Number.isNaN(numCredits) || numCredits <= 0) {
      setError('请输入有效的学分');
      return;
    }

    if (!semester.trim()) {
      setError('请输入学期 (例如: 1-1)');
      return;
    }

    onAdd(name.trim(), numCredits, numScore, semester.trim(), type, isCore);
    setName('');
    setScore('');
    setCredits('');
    setSemester('');
    setType('必修');
    setIsCore(false);
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-2">
        <label className="space-y-2">
          <span className="figure-label inline-flex items-center gap-2">
            <BookOpen size={14} /> 课程名称
          </span>
          <input
            id="course-name"
            type="text"
            list="course-names"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClassName}
            placeholder="例如：自动控制原理A"
          />
          <datalist id="course-names">
            {existingNames.map((item, index) => (
              <option key={index} value={item} />
            ))}
          </datalist>
        </label>

        <label className="space-y-2">
          <span className="figure-label inline-flex items-center gap-2">
            <Calendar size={14} /> 学期
          </span>
          <input
            id="course-semester"
            type="text"
            list="semesters"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className={fieldClassName}
            placeholder="例如：3-1"
          />
          <datalist id="semesters">
            {existingSemesters.map((item, index) => (
              <option key={index} value={item} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2">
          <span className="figure-label inline-flex items-center gap-2">
            <GraduationCap size={14} /> {t('credits')}
          </span>
          <input
            id="course-credits"
            type="number"
            step="0.5"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            className={fieldClassName}
            placeholder="0.0"
          />
        </label>

        <label className="space-y-2">
          <span className="figure-label inline-flex items-center gap-2">
            <Award size={14} /> 成绩
          </span>
          <input
            id="course-score"
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className={fieldClassName}
            placeholder="0-100"
          />
        </label>

        <label className="space-y-2 xl:col-span-2">
          <span className="figure-label inline-flex items-center gap-2">
            <Hash size={14} /> 属性
          </span>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <select id="course-type" value={type} onChange={(e) => setType(e.target.value as CourseType)} className={fieldClassName}>
              <option value="必修">必修</option>
              <option value="选修">选修</option>
              <option value="任选">任选</option>
            </select>

            <button
              type="button"
              onClick={() => setIsCore((value) => !value)}
              className={`inline-flex items-center justify-center gap-2 rounded-[1.15rem] border px-4 py-3 text-sm font-semibold transition-colors ${
                isCore
                  ? 'border-amber-400/30 bg-amber-500/10 text-amber-200'
                  : 'border-primary/15 bg-background/55 text-muted hover:border-primary/30 hover:text-main'
              }`}
              title="是否为核心/主干课程"
            >
              <CheckCircle2 size={16} className={isCore ? 'fill-current' : ''} />
              核心
            </button>
          </div>
        </label>
      </div>

      <div className={`flex flex-col gap-4 border-t border-primary/10 pt-5 ${variant === 'drawer' ? 'sticky bottom-0 bg-[hsl(var(--color-background))] pb-2' : ''}`}>
        <div className="flex min-h-6 items-center gap-2 text-sm text-[hsl(var(--color-accent))]">
          {error ? (
            <>
              <AlertCircle size={14} />
              {error}
            </>
          ) : (
            <span className="text-muted">保存后自动重算绩点。</span>
          )}
        </div>

        <button type="submit" className="primary-button w-full">
          <Plus size={16} strokeWidth={2.5} />
          {t('new_course')}
        </button>
      </div>
    </form>
  );

  if (variant === 'drawer') {
    return content;
  }

  return (
    <section className="paper-panel p-6">
      <div className="relative z-10 space-y-6">
        <div>
          <div className="section-kicker">Entry</div>
          <h3 className="mt-3 text-3xl leading-none text-main">{t('course_entry')}</h3>
          <p className="mt-2 text-sm text-muted">{t('course_entry_desc')}</p>
        </div>
        {content}
      </div>
    </section>
  );
};
