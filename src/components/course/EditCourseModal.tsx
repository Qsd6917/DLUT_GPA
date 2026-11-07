import React, { useState, useEffect } from 'react';
import { Course, CourseType } from '../../types';
import {
  X,
  Save,
  BookOpen,
  Calendar,
  GraduationCap,
  Award,
  Hash,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

type FieldName = 'name' | 'credits' | 'score' | 'semester';
type FieldErrors = Partial<Record<FieldName, string>>;

const ERROR_ID_PREFIX = 'edit-course-error';

const errorId = (field: FieldName) => `${ERROR_ID_PREFIX}-${field}`;

/**
 * 把可能已损坏的数值字段转成输入框字符串。
 * 历史脏数据里 `credits` / `score` 可能是 `null` 或 `NaN`
 * （`JSON.stringify(NaN)` 会落盘成 `null`），裸调 `.toString()` 会直接抛错。
 */
const toInputValue = (value: unknown): string =>
  Number.isFinite(value) ? String(value) : '';

/** 字段级错误提示。与 TargetGpaCalculator 的展示方式保持一致。 */
const FieldError: React.FC<{ field: FieldName; message?: string }> = ({
  field,
  message,
}) =>
  message ? (
    <p
      id={errorId(field)}
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-[hsl(var(--color-negative))]"
    >
      <AlertCircle size={13} className="mt-px shrink-0" />
      <span>{message}</span>
    </p>
  ) : null;

interface EditCourseModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    name: string,
    credits: number,
    score: number,
    semester: string,
    type: CourseType,
    isCore: boolean
  ) => void;
  existingSemesters: string[];
}

export const EditCourseModal: React.FC<EditCourseModalProps> = ({
  course,
  isOpen,
  onClose,
  onSave,
  existingSemesters,
}) => {
  const [name, setName] = useState(course.name);
  const [credits, setCredits] = useState(toInputValue(course.credits));
  const [score, setScore] = useState(toInputValue(course.score));
  const [semester, setSemester] = useState(course.semester);
  const [type, setType] = useState<CourseType>(course.type);
  const [isCore, setIsCore] = useState(course.isCore || false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setName(course.name);
    setCredits(toInputValue(course.credits));
    setScore(toInputValue(course.score));
    setSemester(course.semester);
    setType(course.type);
    setIsCore(course.isCore || false);
    setErrors({});
  }, [course]);

  if (!isOpen) return null;

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {};

    if (!name.trim()) {
      nextErrors.name = '请输入课程名称';
    }

    // 用字符串判空而不是 Number('')：Number('') 是 0，会被误判为合法。
    const trimmedCredits = credits.trim();
    const numCredits = Number(trimmedCredits);
    if (
      trimmedCredits === '' ||
      !Number.isFinite(numCredits) ||
      numCredits <= 0
    ) {
      nextErrors.credits = '请输入有效的学分（大于 0）';
    }

    const trimmedScore = score.trim();
    const numScore = Number(trimmedScore);
    if (
      trimmedScore === '' ||
      !Number.isFinite(numScore) ||
      numScore < 0 ||
      numScore > 100
    ) {
      nextErrors.score = '请输入有效的成绩 (0-100)';
    }

    if (!semester.trim()) {
      nextErrors.semester = '请输入学期 (例如: 1-1)';
    }

    return nextErrors;
  };

  /** 修改任意字段时清掉该字段的错误，避免旧提示一直挂着。 */
  const clearError = (field: FieldName) =>
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      // 校验失败绝不能落盘：NaN 会 JSON.stringify 成 null，刷新后整页崩溃。
      return;
    }

    onSave(
      course.id,
      name.trim(),
      Number(credits.trim()),
      Number(score.trim()),
      semester.trim(),
      type,
      isCore
    );
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(2,6,23,0.68)] p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-[0_28px_90px_rgba(15,23,42,0.16)] backdrop-blur-xl animate-in zoom-in-95 duration-200 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_32px_90px_rgba(2,6,23,0.56)]">
        <div className="flex items-center justify-between border-b border-primary/10 px-6 py-5">
          <h3 className="text-lg font-bold text-main">编辑课程</h3>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200/80 bg-white/80 p-2 text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="edit-course-name"
                className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5"
              >
                课程名称
              </label>
              <div className="relative">
                <BookOpen
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  size={16}
                />
                <input
                  id="edit-course-name"
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    clearError('name');
                  }}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? errorId('name') : undefined}
                  className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-main ${
                    errors.name
                      ? 'border-[hsl(var(--color-negative))]'
                      : 'border-primary/20'
                  }`}
                />
              </div>
              <FieldError field="name" message={errors.name} />
            </div>

            {/* Semester & Credits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-course-semester"
                  className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5"
                >
                  学期
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    size={16}
                  />
                  <input
                    id="edit-course-semester"
                    type="text"
                    list="edit-semesters"
                    value={semester}
                    onChange={e => {
                      setSemester(e.target.value);
                      clearError('semester');
                    }}
                    aria-invalid={Boolean(errors.semester)}
                    aria-describedby={
                      errors.semester ? errorId('semester') : undefined
                    }
                    className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-main ${
                      errors.semester
                        ? 'border-[hsl(var(--color-negative))]'
                        : 'border-primary/20'
                    }`}
                  />
                  <datalist id="edit-semesters">
                    {existingSemesters.map(s => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                <FieldError field="semester" message={errors.semester} />
              </div>
              <div>
                <label
                  htmlFor="edit-course-credits"
                  className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5"
                >
                  学分
                </label>
                <div className="relative">
                  <GraduationCap
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    size={16}
                  />
                  <input
                    id="edit-course-credits"
                    type="number"
                    step="0.5"
                    value={credits}
                    onChange={e => {
                      setCredits(e.target.value);
                      clearError('credits');
                    }}
                    aria-invalid={Boolean(errors.credits)}
                    aria-describedby={
                      errors.credits ? errorId('credits') : undefined
                    }
                    className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-main ${
                      errors.credits
                        ? 'border-[hsl(var(--color-negative))]'
                        : 'border-primary/20'
                    }`}
                  />
                </div>
                <FieldError field="credits" message={errors.credits} />
              </div>
            </div>

            {/* Score & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-course-score"
                  className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5"
                >
                  成绩
                </label>
                <div className="relative">
                  <Award
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    size={16}
                  />
                  <input
                    id="edit-course-score"
                    type="number"
                    value={score}
                    onChange={e => {
                      setScore(e.target.value);
                      clearError('score');
                    }}
                    aria-invalid={Boolean(errors.score)}
                    aria-describedby={
                      errors.score ? errorId('score') : undefined
                    }
                    className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-main ${
                      errors.score
                        ? 'border-[hsl(var(--color-negative))]'
                        : 'border-primary/20'
                    }`}
                  />
                </div>
                <FieldError field="score" message={errors.score} />
              </div>
              <div>
                <label
                  htmlFor="edit-course-type"
                  className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5"
                >
                  属性
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    size={16}
                  />
                  <select
                    id="edit-course-type"
                    value={type}
                    onChange={e => setType(e.target.value as CourseType)}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer text-main"
                  >
                    <option value="必修">必修</option>
                    <option value="选修">选修</option>
                    <option value="任选">任选</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Core Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsCore(!isCore)}
                className={`w-full py-3 rounded-xl border transition-all flex items-center justify-center gap-2 font-bold text-sm ${
                  isCore
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700 shadow-sm'
                    : 'bg-background border-primary/20 text-muted hover:bg-background/80'
                }`}
              >
                <CheckCircle2
                  size={18}
                  className={isCore ? 'fill-yellow-500 text-white' : ''}
                />
                <span>{isCore ? '核心/主干课程' : '设为核心/主干课程'}</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-primary/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-muted/10 hover:bg-muted/20 text-main font-bold rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              保存更改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
