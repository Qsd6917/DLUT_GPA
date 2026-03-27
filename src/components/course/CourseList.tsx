import React from 'react';
import {
  BookOpen,
  CheckSquare,
  Edit,
  Plus,
  SearchX,
  Square,
  Trash2,
  Upload,
} from 'lucide-react';
import { Course } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import VirtualCourseList from './VirtualCourseList';

interface CourseListProps {
  courses: Course[];
  totalCourses: number;
  isFiltered: boolean;
  onRemove: (id: string) => void;
  onEdit: (course: Course) => void;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onOpenCreate?: () => void;
  onOpenImport?: () => void;
  onClearFilters?: () => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  totalCourses,
  isFiltered,
  onRemove,
  onEdit,
  onToggle,
  onToggleAll,
  onOpenCreate,
  onOpenImport,
  onClearFilters,
}) => {
  const { t, language } = useTranslation();

  const getTypeBadgeClass = (type: Course['type']) => {
    if (type === '必修') {
      return 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300';
    }
    if (type === '选修') {
      return 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300';
    }
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200';
  };

  const allSelected =
    courses.length > 0 && courses.every(course => course.isActive);
  const someSelected = courses.some(course => course.isActive);
  const activeCount = courses.filter(course => course.isActive).length;
  const activeCredits = courses
    .filter(course => course.isActive)
    .reduce((sum, course) => sum + course.credits, 0);

  if (courses.length === 0) {
    if (totalCourses > 0 && isFiltered) {
      return (
        <section className="paper-panel flex min-h-[18rem] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[hsl(var(--surface-2))] text-primary">
            <SearchX size={28} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold tracking-[-0.04em] text-main">
              {t('empty_filtered_courses_title')}
            </h3>
            <p className="type-body-sm mt-2 max-w-md">
              {t('empty_filtered_courses_desc')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onClearFilters}
              className="primary-button"
              disabled={!onClearFilters}
            >
              {t('clear_filters')}
            </button>
            <button
              type="button"
              onClick={onOpenCreate}
              className="ghost-button"
              disabled={!onOpenCreate}
            >
              <Plus size={16} />
              {t('new_course')}
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="paper-panel flex min-h-[18rem] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[hsl(var(--surface-2))] text-primary">
          <BookOpen size={28} />
        </div>
        <div>
          <h3 className="text-xl font-extrabold tracking-[-0.04em] text-main">
            {t('empty_courses_title')}
          </h3>
          <p className="type-body-sm mt-2 max-w-md">
            {t('empty_courses_desc')}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onOpenCreate}
            className="primary-button"
            disabled={!onOpenCreate}
          >
            <Plus size={16} />
            {t('new_course')}
          </button>
          <button
            type="button"
            onClick={onOpenImport}
            className="ghost-button"
            disabled={!onOpenImport}
          >
            <Upload size={16} />
            {t('import_courses')}
          </button>
        </div>
      </section>
    );
  }

  if (courses.length > 50) {
    return (
      <VirtualCourseList
        courses={courses}
        onRemove={onRemove}
        onEdit={onEdit}
        onToggle={onToggle}
      />
    );
  }

  return (
    <section className="paper-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-primary/10 px-5 py-4 lg:flex-row lg:items-end lg:justify-between lg:px-6">
        <div>
          <div className="section-kicker">
            {language === 'zh' ? '课程档案表' : 'Course Ledger'}
          </div>
          <div className="mt-2 text-lg font-extrabold tracking-[-0.04em] text-main">
            {language === 'zh'
              ? `共 ${courses.length} 门课程，当前计入 ${activeCount} 门`
              : `${courses.length} courses, ${activeCount} active`}
          </div>
          <p className="type-body-sm mt-1">
            {language === 'zh'
              ? `已计学分 ${activeCredits.toFixed(1)}，表格优先展示高频判断信息。`
              : `${activeCredits.toFixed(1)} active credits. The table is tuned for fast scanning.`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="status-chip">
            {language === 'zh'
              ? `已计入 ${activeCount}`
              : `${activeCount} active`}
          </span>
          <span className="status-chip">
            {language === 'zh'
              ? `学分 ${activeCredits.toFixed(1)}`
              : `${activeCredits.toFixed(1)} credits`}
          </span>
        </div>
      </div>

      <div className="max-h-[42rem] overflow-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-[hsl(var(--surface-1))]">
            <tr className="border-b border-primary/10 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              <th className="w-14 px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={() => onToggleAll(!allSelected)}
                  className="rounded-md p-1.5 transition-colors hover:bg-[hsl(var(--surface-2))]"
                  title={allSelected ? '取消全选' : '全选'}
                  aria-label={allSelected ? '取消全选' : '全选'}
                >
                  {allSelected ? (
                    <CheckSquare size={18} className="text-primary" />
                  ) : (
                    <Square size={18} className="text-muted" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3">
                {language === 'zh' ? '课程' : 'Course'}
              </th>
              <th className="w-24 px-4 py-3 text-right">
                {language === 'zh' ? '学分' : 'Credits'}
              </th>
              <th className="w-24 px-4 py-3 text-right">
                {language === 'zh' ? '成绩' : 'Score'}
              </th>
              <th className="w-24 px-4 py-3 text-right">
                {language === 'zh' ? '绩点' : 'GPA'}
              </th>
              <th className="w-32 px-4 py-3 text-center">
                {language === 'zh' ? '类型' : 'Type'}
              </th>
              <th className="w-32 px-4 py-3 text-center">
                {language === 'zh' ? '学期' : 'Term'}
              </th>
              <th className="w-28 px-4 py-3 text-center">
                {language === 'zh' ? '操作' : 'Actions'}
              </th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course, index) => (
              <tr
                key={course.id}
                className={`border-b border-primary/5 transition-colors hover:bg-[hsl(var(--surface-2))] ${
                  course.isActive ? '' : 'opacity-65'
                }`}
              >
                <td className="px-4 py-3 text-center">
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
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="min-w-8 pt-0.5 text-right text-[11px] font-semibold text-muted">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="line-clamp-1 text-sm font-semibold text-main">
                        {course.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {course.isCore ? (
                          <span className="table-chip border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200">
                            {language === 'zh' ? '核心' : 'Core'}
                          </span>
                        ) : null}
                        {!course.isActive ? (
                          <span className="table-chip">
                            {language === 'zh' ? '未计入' : 'Excluded'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="num-inline text-sm font-semibold text-main">
                    {course.credits.toFixed(course.credits % 1 === 0 ? 0 : 1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`num-inline text-sm font-semibold ${
                      course.score >= 90
                        ? 'text-emerald-600 dark:text-emerald-300'
                        : course.score < 60
                          ? 'text-[hsl(var(--color-accent))]'
                          : 'text-main'
                    }`}
                  >
                    {course.score}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="num-inline text-sm font-semibold text-primary">
                    {course.gpa.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`table-chip ${getTypeBadgeClass(course.type)}`}
                  >
                    {course.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="table-chip">{course.semester}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(course)}
                      className="rounded-[0.75rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-2 text-muted transition-colors hover:border-primary/20 hover:text-primary"
                      title={language === 'zh' ? '编辑课程' : 'Edit course'}
                      aria-label={
                        language === 'zh' ? '编辑课程' : 'Edit course'
                      }
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(course.id)}
                      className="rounded-[0.75rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-2 text-muted transition-colors hover:border-rose-500/20 hover:text-rose-600 dark:hover:text-rose-300"
                      title={language === 'zh' ? '删除课程' : 'Delete course'}
                      aria-label={
                        language === 'zh' ? '删除课程' : 'Delete course'
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-primary/10 px-5 py-3 text-sm text-muted md:flex-row md:items-center md:justify-between lg:px-6">
        <div>
          {language === 'zh'
            ? `当前显示 ${courses.length} 门课程`
            : `${courses.length} courses visible`}
        </div>
        <div>
          {someSelected
            ? language === 'zh'
              ? `其中 ${activeCount} 门参与 GPA 计算`
              : `${activeCount} of them affect GPA`
            : language === 'zh'
              ? '可在左侧勾选列中批量调整计入状态'
              : 'Use the left selection column to include or exclude courses'}
        </div>
      </div>
    </section>
  );
};
