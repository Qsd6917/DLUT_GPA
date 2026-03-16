import React from 'react';
import { BookOpen, CheckSquare, Edit, Plus, SearchX, Square, Trash2, Upload } from 'lucide-react';
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
  const { t } = useTranslation();
  const getTypeBadgeClass = (type: Course['type']) => {
    if (type === '必修') {
      return 'border-red-500/20 bg-red-500/10 text-red-600 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-400';
    }
    if (type === '选修') {
      return 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400';
    }
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200';
  };
  const allSelected = courses.length > 0 && courses.every((course) => course.isActive);
  const someSelected = courses.some((course) => course.isActive);
  const activeCount = courses.filter((course) => course.isActive).length;
  const activeCredits = courses.filter((course) => course.isActive).reduce((sum, course) => sum + course.credits, 0);

  if (courses.length === 0) {
    if (totalCourses > 0 && isFiltered) {
      return (
        <section className="paper-panel flex min-h-[20rem] flex-col items-center justify-center gap-5 p-8 text-center sm:p-12">
          <div className="rounded-[1.6rem] border border-primary/15 bg-primary/10 p-4 text-primary">
            <SearchX size={32} />
          </div>
          <div>
            <h3 className="type-page-title text-main">{t('empty_filtered_courses_title')}</h3>
            <p className="type-body-sm mt-2 max-w-md">{t('empty_filtered_courses_desc')}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={onClearFilters} className="primary-button" disabled={!onClearFilters}>
              {t('clear_filters')}
            </button>
            <button type="button" onClick={onOpenCreate} className="ghost-button" disabled={!onOpenCreate}>
              <Plus size={16} />
              {t('new_course')}
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="paper-panel flex min-h-[20rem] flex-col items-center justify-center gap-5 p-8 text-center sm:p-12">
        <div className="rounded-[1.6rem] border border-primary/15 bg-primary/10 p-4 text-primary">
          <BookOpen size={32} />
        </div>
        <div>
          <h3 className="type-page-title text-main">{t('empty_courses_title')}</h3>
          <p className="type-body-sm mt-2 max-w-md">{t('empty_courses_desc')}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={onOpenCreate} className="primary-button" disabled={!onOpenCreate}>
            <Plus size={16} />
            {t('new_course')}
          </button>
          <button type="button" onClick={onOpenImport} className="ghost-button" disabled={!onOpenImport}>
            <Upload size={16} />
            {t('import_courses')}
          </button>
        </div>
      </section>
    );
  }

  if (courses.length > 50) {
    return <VirtualCourseList courses={courses} onRemove={onRemove} onEdit={onEdit} onToggle={onToggle} />;
  }

  return (
    <section className="paper-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-primary/10 px-5 py-5 lg:flex-row lg:items-end lg:justify-between lg:px-6">
        <div>
          <div className="section-kicker">Ledger</div>
          <h3 className="type-section-title mt-2 text-main">课程档案</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="metric-card min-w-[10rem]">
            <div className="figure-label">Entries</div>
            <div className="mt-2 data-figure text-lg text-main">{courses.length}</div>
          </div>
          <div className="metric-card min-w-[10rem]">
            <div className="figure-label">Active Credits</div>
            <div className="mt-2 data-figure text-lg text-main">{activeCredits.toFixed(1)}</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-primary/10 bg-slate-900/5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted dark:bg-white/[0.03]">
              <th className="w-14 p-4 text-center">
                <button
                  type="button"
                  onClick={() => onToggleAll(!allSelected)}
                  className="rounded-full p-1.5 hover:bg-primary/10"
                  title={allSelected ? '取消全选' : '全选'}
                >
                  {allSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-muted" />}
                </button>
              </th>
              <th className="p-4">课程</th>
              <th className="w-24 p-4 text-center">学分</th>
              <th className="w-24 p-4 text-center">成绩</th>
              <th className="w-24 p-4 text-center">绩点</th>
              <th className="w-28 p-4 text-center">类型</th>
              <th className="w-28 p-4 text-center">学期</th>
              <th className="w-28 p-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr
                key={course.id}
                className={`group border-b border-primary/5 transition-colors hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.05] ${
                  course.isActive ? '' : 'bg-slate-900/[0.03] opacity-55 dark:bg-white/[0.02]'
                }`}
              >
                <td className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => onToggle(course.id)}
                    className="rounded-full p-1.5 hover:bg-primary/10"
                    aria-label={course.isActive ? 'exclude course' : 'include course'}
                  >
                    {course.isActive ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-muted" />}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="data-figure min-w-7 pt-1 text-[10px] tracking-[0.08em] text-muted">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-main">
                        {course.isCore ? <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-accent))]" /> : null}
                        <span className="line-clamp-1">{course.name}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        {course.isCore ? <span className="table-chip border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200">核心</span> : null}
                        {!course.isActive ? <span className="table-chip">未计入</span> : null}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className="data-figure text-sm text-main">{course.credits}</span>
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`data-figure text-sm ${
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
                <td className="p-4 text-center">
                  <span className="data-figure text-sm text-primary">{course.gpa.toFixed(2)}</span>
                </td>
                <td className="p-4 text-center">
                  <span className={`table-chip ${getTypeBadgeClass(course.type)}`}>{course.type}</span>
                </td>
                <td className="p-4 text-center">
                  <span className="table-chip">{course.semester}</span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(course)}
                      className="rounded-full border border-primary/10 p-2 text-muted opacity-35 transition-all hover:border-primary/30 hover:text-primary group-hover:opacity-100"
                      title="编辑"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(course.id)}
                      className="rounded-full border border-primary/10 p-2 text-muted opacity-35 transition-all hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))] group-hover:opacity-100"
                      title="删除"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-primary/10 bg-slate-900/[0.03] px-5 py-4 text-sm text-muted dark:bg-white/[0.02] md:flex-row md:items-center md:justify-between lg:px-6">
        <div>
          共 {courses.length} 门课程
          {someSelected ? <span className="ml-2 text-primary">计入 {activeCount} 门</span> : null}
        </div>
        <div className="type-label text-xs tracking-[0.1em]">LEDGER READY</div>
      </div>
    </section>
  );
};
