import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CheckSquare, Edit, Square, Trash2 } from 'lucide-react';
import { Course } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';

const ROW_HEIGHT = 74;
const MAX_LIST_HEIGHT = 672;
const MIN_LIST_HEIGHT = 360;
const OVERSCAN_ROWS = 6;

interface VirtualCourseListProps {
  courses: Course[];
  onRemove: (id: string) => void;
  onEdit: (course: Course) => void;
  onToggle: (id: string) => void;
}

const getTypeBadgeClass = (type: Course['type']) => {
  if (type === '必修') {
    return 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300';
  }
  if (type === '选修') {
    return 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300';
  }
  return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200';
};

interface VirtualCourseRowProps {
  course: Course;
  index: number;
  language: string;
  onRemove: (id: string) => void;
  onEdit: (course: Course) => void;
  onToggle: (id: string) => void;
}

const VirtualCourseRow = memo(
  ({
    course,
    index,
    language,
    onRemove,
    onEdit,
    onToggle,
  }: VirtualCourseRowProps) => (
    <div
      className={`absolute left-0 right-0 flex items-center justify-between gap-3 border-b border-primary/10 px-4 py-3 [contain:layout_paint] sm:px-5 ${
        course.isActive ? '' : 'opacity-65'
      } hover:bg-[hsl(var(--surface-2))]`}
      style={{
        height: ROW_HEIGHT,
        transform: `translateY(${index * ROW_HEIGHT}px)`,
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={() => onToggle(course.id)}
          className="rounded-md p-1.5 hover:bg-[hsl(var(--surface-3))]"
          aria-label={language === 'zh'
            ? `${course.isActive ? '排除课程' : '计入课程'}：${course.name}`
            : `${course.isActive ? 'Exclude course' : 'Include course'}: ${course.name}`}
        >
          {course.isActive ? (
            <CheckSquare size={18} className="text-primary" />
          ) : (
            <Square size={18} className="text-muted" />
          )}
        </button>

        <div className="w-7 shrink-0 text-right text-[11px] font-semibold text-muted">
          {String(index + 1).padStart(2, '0')}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-main">
            {course.name}
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-muted">
            <span className={`table-chip ${getTypeBadgeClass(course.type)}`}>
              {course.type}
            </span>
            <span className="table-chip">{course.semester}</span>
            <span className="table-chip shrink-0">
              {course.credits.toFixed(course.credits % 1 === 0 ? 0 : 1)} 学分
            </span>
            <span className="table-chip hidden shrink-0 sm:inline-flex">
              {course.score} 分
            </span>
            <span className="table-chip hidden shrink-0 text-primary md:inline-flex">
              {course.gpa.toFixed(2)} GPA
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(course)}
          className="rounded-[0.75rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-2 text-muted hover:border-primary/20 hover:text-primary"
          title={language === 'zh' ? '编辑课程' : 'Edit course'}
          aria-label={language === 'zh' ? `编辑课程：${course.name}` : `Edit course: ${course.name}`}
        >
          <Edit size={14} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(course.id)}
          className="rounded-[0.75rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-2 text-muted hover:border-rose-500/20 hover:text-rose-600 dark:hover:text-rose-300"
          title={language === 'zh' ? '删除课程' : 'Delete course'}
          aria-label={language === 'zh' ? `删除课程：${course.name}` : `Delete course: ${course.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
);

VirtualCourseRow.displayName = 'VirtualCourseRow';

const VirtualCourseList: React.FC<VirtualCourseListProps> = ({
  courses,
  onRemove,
  onEdit,
  onToggle,
}) => {
  const { language } = useTranslation();
  const animationFrameRef = useRef<number>();
  const pendingScrollTopRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(
    () => () => {
      if (animationFrameRef.current !== undefined) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    },
    []
  );

  const listHeight = Math.min(
    MAX_LIST_HEIGHT,
    Math.max(MIN_LIST_HEIGHT, courses.length * ROW_HEIGHT)
  );
  const totalHeight = courses.length * ROW_HEIGHT;

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      pendingScrollTopRef.current = event.currentTarget.scrollTop;

      if (animationFrameRef.current !== undefined) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = undefined;
        setScrollTop(pendingScrollTopRef.current);
      });
    },
    []
  );

  const visibleWindow = useMemo(() => {
    const visibleCount =
      Math.ceil(listHeight / ROW_HEIGHT) + OVERSCAN_ROWS * 2;
    const rawStart = Math.max(
      0,
      Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_ROWS
    );
    const maxStart = Math.max(0, courses.length - visibleCount);
    const start = Math.min(rawStart, maxStart);
    const end = Math.min(courses.length, start + visibleCount);

    return {
      start,
      courses: courses.slice(start, end),
    };
  }, [courses, listHeight, scrollTop]);

  return (
    <section className="paper-panel overflow-hidden">
      <div
        role="region"
        aria-label={language === 'zh' ? '课程列表' : 'Course list'}
        // Scrollable regions need keyboard focus even though jsx-a11y treats region as non-interactive.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className="overflow-y-auto overscroll-contain [content-visibility:auto] [scrollbar-gutter:stable]"
        style={{ height: listHeight }}
        onScroll={handleScroll}
      >
        <div className="relative" style={{ height: totalHeight }}>
          {visibleWindow.courses.map((course, offset) => {
            const index = visibleWindow.start + offset;
            return (
              <VirtualCourseRow
                key={course.id}
                course={course}
                index={index}
                language={language}
                onRemove={onRemove}
                onEdit={onEdit}
                onToggle={onToggle}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default memo(VirtualCourseList);
