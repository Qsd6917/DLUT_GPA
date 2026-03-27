import React, { memo } from 'react';
import { CheckSquare, Edit, Square, Trash2 } from 'lucide-react';
import { Course } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';

interface VirtualCourseListProps {
  courses: Course[];
  onRemove: (id: string) => void;
  onEdit: (course: Course) => void;
  onToggle: (id: string) => void;
}

const VirtualCourseList: React.FC<VirtualCourseListProps> = ({
  courses,
  onRemove,
  onEdit,
  onToggle,
}) => {
  const { language } = useTranslation();

  const getTypeBadgeClass = (type: Course['type']) => {
    if (type === '必修') {
      return 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300';
    }
    if (type === '选修') {
      return 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300';
    }
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200';
  };

  return (
    <section className="paper-panel max-h-[42rem] overflow-y-auto">
      <div className="divide-y divide-primary/10">
        {courses.map(course => (
          <div
            key={course.id}
            className={`flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-[hsl(var(--surface-2))] ${
              course.isActive ? '' : 'opacity-65'
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => onToggle(course.id)}
                className="rounded-md p-1.5 transition-colors hover:bg-[hsl(var(--surface-3))]"
                aria-label={
                  course.isActive ? 'exclude course' : 'include course'
                }
              >
                {course.isActive ? (
                  <CheckSquare size={18} className="text-primary" />
                ) : (
                  <Square size={18} className="text-muted" />
                )}
              </button>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-main">
                  {course.name}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  <span
                    className={`table-chip ${getTypeBadgeClass(course.type)}`}
                  >
                    {course.type}
                  </span>
                  <span className="table-chip">{course.semester}</span>
                  <span className="table-chip">{course.credits} 学分</span>
                  <span className="table-chip">{course.score} 分</span>
                  <span className="table-chip text-primary">
                    {course.gpa.toFixed(2)} GPA
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(course)}
                className="rounded-[0.75rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-2 text-muted transition-colors hover:border-primary/20 hover:text-primary"
                title={language === 'zh' ? '编辑课程' : 'Edit course'}
                aria-label={language === 'zh' ? '编辑课程' : 'Edit course'}
              >
                <Edit size={14} />
              </button>
              <button
                type="button"
                onClick={() => onRemove(course.id)}
                className="rounded-[0.75rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-2 text-muted transition-colors hover:border-rose-500/20 hover:text-rose-600 dark:hover:text-rose-300"
                title={language === 'zh' ? '删除课程' : 'Delete course'}
                aria-label={language === 'zh' ? '删除课程' : 'Delete course'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default memo(VirtualCourseList);
