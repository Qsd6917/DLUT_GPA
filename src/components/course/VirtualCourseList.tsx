import React, { memo, useCallback } from 'react';
import { Course } from '../../types';

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
  onToggle
}) => {
  const Row = useCallback((course: Course) => {
    return (
      <div
        key={course.id}
        className={`p-4 border-b border-primary/10 flex items-center justify-between gap-4 ${
          course.isActive ? 'bg-surface' : 'bg-background/50 opacity-60'
        }`}
      >
        <div className="min-w-0">
          <div className="font-medium text-main truncate">{course.name}</div>
          <div className="text-xs text-muted mt-1">
            {course.semester} · {course.type} · {course.credits} 学分 · {course.score} 分 · {course.gpa.toFixed(2)} GPA
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onToggle(course.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-primary/20 hover:bg-primary/5"
          >
            {course.isActive ? '排除' : '计入'}
          </button>
          <button
            type="button"
            onClick={() => onEdit(course)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-primary/20 hover:bg-primary/5"
          >
            编辑
          </button>
          <button
            type="button"
            onClick={() => onRemove(course.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50"
          >
            删除
          </button>
        </div>
      </div>
    );
  }, [onEdit, onRemove, onToggle]);

  return (
    <div className="border border-primary/10 rounded-xl overflow-hidden shadow-soft max-h-[32rem] overflow-y-auto">
      {courses.map(Row)}
    </div>
  );
};

export default memo(VirtualCourseList);
