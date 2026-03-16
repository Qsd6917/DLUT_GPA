import React, { memo, useCallback } from 'react';
import { CheckSquare, Edit, Square, Trash2 } from 'lucide-react';
import { Course } from '../../types';

interface VirtualCourseListProps {
  courses: Course[];
  onRemove: (id: string) => void;
  onEdit: (course: Course) => void;
  onToggle: (id: string) => void;
}

const VirtualCourseList: React.FC<VirtualCourseListProps> = ({ courses, onRemove, onEdit, onToggle }) => {
  const Row = useCallback(
    (course: Course) => {
      return (
        <div
          key={course.id}
          className={`flex items-center justify-between gap-4 border-b border-primary/10 px-5 py-4 ${
            course.isActive ? 'bg-transparent' : 'bg-background/35 opacity-60'
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
              <div className="mt-1 text-xs text-muted">
                {course.semester} · {course.type} · {course.credits} 学分 · {course.score} 分 · {course.gpa.toFixed(2)} GPA
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(course)}
              className="rounded-full border border-primary/10 p-2 text-muted transition-colors hover:border-primary/30 hover:text-primary"
              title="编辑"
            >
              <Edit size={14} />
            </button>
            <button
              type="button"
              onClick={() => onRemove(course.id)}
              className="rounded-full border border-primary/10 p-2 text-muted transition-colors hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))]"
              title="删除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      );
    },
    [onEdit, onRemove, onToggle]
  );

  return (
    <section className="paper-panel max-h-[34rem] overflow-y-auto">
      <div className="divide-y divide-primary/10">{courses.map(Row)}</div>
    </section>
  );
};

export default memo(VirtualCourseList);
