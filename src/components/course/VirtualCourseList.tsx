import React, { memo } from 'react';
import { CheckSquare, Edit, Square, Trash2 } from 'lucide-react';
import { Course } from '../../types';

interface VirtualCourseListProps {
  courses: Course[];
  onRemove: (id: string) => void;
  onEdit: (course: Course) => void;
  onToggle: (id: string) => void;
}

const VirtualCourseList: React.FC<VirtualCourseListProps> = ({ courses, onRemove, onEdit, onToggle }) => {
  const getTypeBadgeClass = (type: Course['type']) => {
    if (type === '必修') {
      return 'border-red-500/20 bg-red-500/10 text-red-600 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-400';
    }
    if (type === '选修') {
      return 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400';
    }
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200';
  };

  return (
    <section className="paper-panel max-h-[34rem] overflow-y-auto">
      <div className="divide-y divide-primary/10">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`group flex items-center justify-between gap-4 border-b border-primary/10 px-5 py-4 transition-colors hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.05] ${
              course.isActive ? 'bg-transparent' : 'bg-slate-900/[0.03] opacity-60 dark:bg-white/[0.02]'
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => onToggle(course.id)}
                className="rounded-full p-1.5 hover:bg-primary/10"
                aria-label={course.isActive ? 'exclude course' : 'include course'}
              >
                {course.isActive ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-muted" />}
              </button>
              <div className="min-w-0">
                <div className="truncate font-medium text-main">{course.name}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className={`table-chip ${getTypeBadgeClass(course.type)}`}>{course.type}</span>
                  <span className="table-chip">{course.semester}</span>
                  <span>{course.credits} 学分</span>
                  <span>{course.score} 分</span>
                  <span className="data-figure text-primary">{course.gpa.toFixed(2)} GPA</span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(course)}
                className="rounded-full border border-primary/10 p-2 text-muted opacity-35 transition-all hover:border-primary/30 hover:text-primary group-hover:opacity-100"
                title="编辑"
              >
                <Edit size={14} />
              </button>
              <button
                type="button"
                onClick={() => onRemove(course.id)}
                className="rounded-full border border-primary/10 p-2 text-muted opacity-35 transition-all hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))] group-hover:opacity-100"
                title="删除"
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
