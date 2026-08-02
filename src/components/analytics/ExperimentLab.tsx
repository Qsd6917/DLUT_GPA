import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  FlaskConical,
  Minus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  Course,
  CourseType,
  ExperimentCourseChange,
  ExperimentSession,
} from '../../types';
import { compareExperimentCourses } from '../../services/experimentService';
import { useTranslation } from '../../contexts/LanguageContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { TargetGpaCalculator } from './TargetGpaCalculator';

export interface ExperimentLabProps {
  experiment: ExperimentSession | null;
  maximumGpa: number;
  onStart: () => void;
  onUpdateCourseScore: (id: string, score: number) => void;
  onRemoveCourse: (id: string) => void;
  onRestoreCourse: (course: Course) => void;
  onReset: () => void;
  onDiscard: () => void;
  onCommit: () => void;
}

interface ExperimentCommandBarProps {
  changeCount: number;
  onReset: () => void;
  onDiscard: () => void;
  onCommit: () => void;
}

type PendingAction = 'discard' | 'commit' | null;

const clampScore = (score: number) => Math.min(100, Math.max(0, score));

const formatDelta = (value: number, digits: number) => {
  const normalized = Math.abs(value) < 10 ** -(digits + 1) ? 0 : value;
  return `${normalized > 0 ? '+' : ''}${normalized.toFixed(digits)}`;
};

const ExperimentCommandBar: React.FC<ExperimentCommandBarProps> = ({
  changeCount,
  onReset,
  onDiscard,
  onCommit,
}) => {
  const { t } = useTranslation();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const isDirty = changeCount > 0;
  useBodyScrollLock(pendingAction !== null);

  useEffect(() => {
    if (!pendingAction) return undefined;
    const returnFocusTarget = returnFocusRef.current;
    confirmButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setPendingAction(null);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      returnFocusTarget?.focus();
    };
  }, [pendingAction]);

  const requestDiscard = (event: React.MouseEvent<HTMLButtonElement>) => {
    returnFocusRef.current = event.currentTarget;
    if (isDirty) setPendingAction('discard');
    else onDiscard();
  };

  const requestCommit = (event: React.MouseEvent<HTMLButtonElement>) => {
    returnFocusRef.current = event.currentTarget;
    if (isDirty) setPendingAction('commit');
  };

  const confirmAction = () => {
    const action = pendingAction;
    setPendingAction(null);
    if (action === 'discard') onDiscard();
    if (action === 'commit') onCommit();
  };

  return (
    <>
      <div className="paper-panel sticky bottom-3 z-20 flex flex-col gap-3 border-amber-400/25 bg-surface/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300">
            <FlaskConical size={17} />
          </div>
          <div>
            <div className="text-sm font-semibold text-main">
              {t('experiment_change_count', changeCount)}
            </div>
            <div className="text-xs text-muted">{t('experiment_not_saved')}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={!isDirty}
            className="ghost-button disabled:cursor-not-allowed disabled:opacity-45"
          >
            <RotateCcw size={15} />
            {t('experiment_reset')}
          </button>
          <button type="button" onClick={requestDiscard} className="ghost-button">
            <X size={15} />
            {t('experiment_discard')}
          </button>
          <button
            type="button"
            onClick={requestCommit}
            disabled={!isDirty}
            className="primary-button disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Check size={15} />
            {t('experiment_commit')}
          </button>
        </div>
      </div>

      {pendingAction ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={t('experiment_cancel')}
            tabIndex={-1}
            className="absolute inset-0 bg-[rgba(2,6,23,0.55)] backdrop-blur-sm"
            onClick={() => setPendingAction(null)}
          />
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="experiment-confirm-title"
            tabIndex={-1}
            className="paper-panel relative z-10 w-full max-w-md border-amber-400/25 p-6 shadow-2xl"
          >
            <div className="section-kicker text-amber-600 dark:text-amber-300">
              {t('experiment_label')}
            </div>
            <h3 id="experiment-confirm-title" className="type-section-title mt-2 text-main">
              {pendingAction === 'discard'
                ? t('experiment_discard_title')
                : t('experiment_commit_title')}
            </h3>
            <p className="type-body-sm mt-3">
              {pendingAction === 'discard'
                ? t('experiment_discard_desc')
                : t('experiment_commit_desc')}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="ghost-button"
              >
                {t('experiment_cancel')}
              </button>
              <button
                type="button"
                ref={confirmButtonRef}
                onClick={confirmAction}
                className="primary-button"
              >
                {pendingAction === 'discard'
                  ? t('experiment_confirm_discard')
                  : t('experiment_confirm_commit')}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
};

const ROW_HEIGHT = 148;
const LIST_HEIGHT = 520;
const OVERSCAN_ROWS = 4;

interface CourseEditorProps {
  courses: Course[];
  baselineById: Map<string, Course>;
  changedIds: Set<string>;
  changes: ExperimentCourseChange[];
  onUpdateCourseScore: (id: string, score: number) => void;
  onRemoveCourse: (id: string) => void;
  onRestoreCourse: (course: Course) => void;
}

const ExperimentCourseEditor = memo(
  ({
    courses,
    baselineById,
    changedIds,
    changes,
    onUpdateCourseScore,
    onRemoveCourse,
    onRestoreCourse,
  }: CourseEditorProps) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [semester, setSemester] = useState('ALL');
    const [type, setType] = useState<'ALL' | CourseType>('ALL');
    const [coreOnly, setCoreOnly] = useState(false);
    const [changedOnly, setChangedOnly] = useState(false);
    const [showExcluded, setShowExcluded] = useState(false);
    const [scrollTop, setScrollTop] = useState(0);
    const animationFrameRef = useRef<number>();
    const pendingScrollTopRef = useRef(0);

    useEffect(
      () => () => {
        if (animationFrameRef.current !== undefined) {
          window.cancelAnimationFrame(animationFrameRef.current);
        }
      },
      []
    );

    const removedCourses = useMemo(
      () => changes
        .filter(change => change.kinds.includes('removed'))
        .flatMap(change => change.baselineCourse ? [change.baselineCourse] : []),
      [changes]
    );
    const semesters = useMemo(
      () => Array.from(new Set([...courses, ...removedCourses].map(course => course.semester))).sort(),
      [courses, removedCourses]
    );

    const filteredCourses = useMemo(() => {
      const query = search.trim().toLocaleLowerCase();
      const candidates = changedOnly
        ? [...courses.filter(course => changedIds.has(course.id)), ...removedCourses]
        : courses;
      return candidates.filter(course => {
        if (!showExcluded && !course.isActive) return false;
        if (semester !== 'ALL' && course.semester !== semester) return false;
        if (type !== 'ALL' && course.type !== type) return false;
        if (coreOnly && !course.isCore) return false;
        if (query && !course.name.toLocaleLowerCase().includes(query)) return false;
        return true;
      });
    }, [changedIds, changedOnly, coreOnly, courses, removedCourses, search, semester, showExcluded, type]);

    useEffect(() => setScrollTop(0), [changedOnly, coreOnly, search, semester, showExcluded, type]);

    const viewportHeight = Math.min(
      LIST_HEIGHT,
      Math.max(ROW_HEIGHT, filteredCourses.length * ROW_HEIGHT)
    );
    const visibleWindow = useMemo(() => {
      const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN_ROWS * 2;
      const rawStart = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_ROWS);
      const maxStart = Math.max(0, filteredCourses.length - visibleCount);
      const start = Math.min(rawStart, maxStart);
      return {
        start,
        courses: filteredCourses.slice(start, start + visibleCount),
      };
    }, [filteredCourses, scrollTop, viewportHeight]);

    const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
      pendingScrollTopRef.current = event.currentTarget.scrollTop;
      if (animationFrameRef.current !== undefined) return;
      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = undefined;
        setScrollTop(pendingScrollTopRef.current);
      });
    }, []);

    const changeScore = (id: string, value: string) => {
      const score = Number(value);
      if (Number.isFinite(score)) onUpdateCourseScore(id, clampScore(score));
    };

    return (
      <section className="paper-panel overflow-hidden" aria-labelledby="experiment-course-editor-title">
        <div className="border-b border-primary/10 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.85rem] bg-amber-500/10 text-amber-600 dark:text-amber-300">
              <SlidersHorizontal size={17} />
            </div>
            <div>
              <h3 id="experiment-course-editor-title" className="type-section-title text-main">
                {t('experiment_editor_title')}
              </h3>
              <p className="type-body-sm mt-1">{t('experiment_editor_desc')}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 lg:grid-cols-[minmax(14rem,1fr)_auto_auto]">
            <label className="relative">
              <span className="sr-only">{t('experiment_search_label')}</span>
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                aria-label={t('experiment_search_label')}
                placeholder={t('experiment_search_placeholder')}
                className="h-11 w-full rounded-[0.85rem] border border-primary/10 bg-[hsl(var(--surface-2))] pl-10 pr-3 text-sm text-main outline-none focus:border-primary"
              />
            </label>
            <label className="sr-only" htmlFor="experiment-semester">{t('experiment_semester')}</label>
            <select
              id="experiment-semester"
              value={semester}
              onChange={event => setSemester(event.target.value)}
              aria-label={t('experiment_semester')}
              className="h-11 rounded-[0.85rem] border border-primary/10 bg-[hsl(var(--surface-2))] px-3 text-sm text-main"
            >
              <option value="ALL">{t('all_semesters')}</option>
              {semesters.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <label className="sr-only" htmlFor="experiment-type">{t('experiment_type')}</label>
            <select
              id="experiment-type"
              value={type}
              onChange={event => setType(event.target.value as 'ALL' | CourseType)}
              aria-label={t('experiment_type')}
              className="h-11 rounded-[0.85rem] border border-primary/10 bg-[hsl(var(--surface-2))] px-3 text-sm text-main"
            >
              <option value="ALL">{t('all_types')}</option>
              <option value="必修">{t('type_compulsory')}</option>
              <option value="选修">{t('type_elective')}</option>
              <option value="任选">{t('type_optional')}</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {[
              [coreOnly, setCoreOnly, t('core_only')],
              [changedOnly, setChangedOnly, t('experiment_changed_only')],
              [showExcluded, setShowExcluded, t('experiment_show_excluded')],
            ].map(([checked, setter, label]) => (
              <label key={String(label)} className="inline-flex items-center gap-2 text-sm font-semibold text-main">
                <input
                  type="checkbox"
                  checked={checked as boolean}
                  onChange={event => (setter as React.Dispatch<React.SetStateAction<boolean>>)(event.target.checked)}
                  className="h-4 w-4 accent-amber-500"
                />
                {String(label)}
              </label>
            ))}
            <span className="ml-auto text-xs text-muted">
              {t('experiment_visible_count', filteredCourses.length)}
            </span>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">{t('empty_filtered_courses_title')}</div>
        ) : (
          <div
            role="region"
            aria-label={t('experiment_course_list')}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            className="overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
            style={{ height: viewportHeight }}
            onScroll={handleScroll}
          >
            <div className="relative" style={{ height: filteredCourses.length * ROW_HEIGHT }}>
              {visibleWindow.courses.map((course, offset) => {
                const index = visibleWindow.start + offset;
                const baseline = baselineById.get(course.id);
                const changed = changedIds.has(course.id);
                const removed = !courses.some(item => item.id === course.id);
                const scoreDelta = baseline ? course.score - baseline.score : 0;
                return (
                  <article
                    key={course.id}
                    className="absolute left-0 right-0 border-b border-primary/10 px-4 py-4 [contain:layout_paint] sm:px-5"
                    style={{ height: ROW_HEIGHT, transform: `translateY(${index * ROW_HEIGHT}px)` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-main">{course.name}</div>
                        <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted">
                          <span>{course.semester}</span><span>·</span><span>{course.type}</span><span>·</span><span>{course.credits} {t('credits')}</span>
                          {!course.isActive ? <span className="text-amber-600 dark:text-amber-300">· {t('experiment_excluded')}</span> : null}
                          {removed ? <span className="text-amber-600 dark:text-amber-300">· {t('experiment_draft_removed')}</span> : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {changed ? (
                          <span className="num-inline text-xs text-amber-600 dark:text-amber-300">
                            {formatDelta(scoreDelta, 0)}
                          </span>
                        ) : null}
                        {changed ? (
                          <button
                            type="button"
                            onClick={() => baseline
                              ? onRestoreCourse({ ...baseline })
                              : onRemoveCourse(course.id)}
                            aria-label={`${t('experiment_restore')}${course.name}`}
                            className="rounded-lg border border-primary/10 p-2 text-muted hover:text-primary"
                          >
                            <RotateCcw size={14} />
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {removed ? (
                      <p className="type-body-sm mt-3">
                        {t('experiment_restore_hint')}
                      </p>
                    ) : <div className="mt-3 grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3">
                      <label>
                        <span className="sr-only">{`${course.name} ${t('experiment_score')}`}</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={course.score}
                          onChange={event => changeScore(course.id, event.target.value)}
                          aria-label={`${course.name} ${t('experiment_score')}`}
                          className="num-input h-10 w-full rounded-[0.75rem] border border-primary/10 bg-[hsl(var(--surface-2))] px-3 text-main outline-none focus:border-primary"
                        />
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={course.score}
                        onChange={event => changeScore(course.id, event.target.value)}
                        aria-label={`${course.name} ${t('experiment_score_slider')}`}
                        aria-valuetext={`${course.score} ${t('score_points')}`}
                        className="h-2 w-full cursor-pointer accent-amber-500"
                      />
                    </div>}
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    );
  }
);

ExperimentCourseEditor.displayName = 'ExperimentCourseEditor';

export const ExperimentLab: React.FC<ExperimentLabProps> = ({
  experiment,
  maximumGpa,
  onStart,
  onUpdateCourseScore,
  onRemoveCourse,
  onRestoreCourse,
  onReset,
  onDiscard,
  onCommit,
}) => {
  const { t } = useTranslation();
  const comparison = useMemo(
    () => experiment
      ? compareExperimentCourses(experiment.baselineCourses, experiment.draftCourses)
      : null,
    [experiment]
  );

  if (!experiment || !comparison) {
    return (
      <section className="paper-panel overflow-hidden border-amber-400/20 p-6 sm:p-8">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <div className="section-kicker text-amber-600 dark:text-amber-300">{t('experiment_label')}</div>
            <h3 className="type-section-title mt-2 text-main">{t('experiment_title')}</h3>
            <p className="type-body-sm mt-3 max-w-2xl">{t('experiment_inactive_desc')}</p>
          </div>
          <button type="button" onClick={onStart} className="primary-button bg-amber-600 hover:bg-amber-700">
            <FlaskConical size={16} />
            {t('experiment_start')}
          </button>
        </div>
      </section>
    );
  }

  const baselinePosition = Math.min(100, Math.max(0, comparison.baselineStats.weightedGpa / maximumGpa * 100));
  const draftPosition = Math.min(100, Math.max(0, comparison.draftStats.weightedGpa / maximumGpa * 100));
  const changedIds = new Set(comparison.changes.map(change => change.courseId));
  const baselineById = new Map(experiment.baselineCourses.map(course => [course.id, course]));
  const DirectionIcon = comparison.gpaDelta > 0.0005 ? ArrowUp : comparison.gpaDelta < -0.0005 ? ArrowDown : Minus;
  const directionText = comparison.gpaDelta > 0.0005
    ? t('experiment_direction_up')
    : comparison.gpaDelta < -0.0005
      ? t('experiment_direction_down')
      : t('experiment_direction_same');

  return (
    <div className="space-y-4">
      <section className="paper-panel overflow-hidden border-amber-400/20 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="section-kicker text-amber-600 dark:text-amber-300">{t('experiment_label')}</div>
            <h3 className="type-section-title mt-2 text-main">{t('experiment_title')}</h3>
            <p className="type-body-sm mt-2">{t('experiment_active_desc')}</p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-700 dark:text-amber-200" aria-live="polite">
            <DirectionIcon size={15} />
            <span>{directionText}</span>
            <span className="num-inline">{formatDelta(comparison.gpaDelta, 3)}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="metric-card">
            <div className="figure-label">{t('experiment_baseline_gpa')}</div>
            <div className="figure-value mt-2 text-main">{comparison.baselineStats.weightedGpa.toFixed(3)}</div>
          </div>
          <div className="metric-card border-amber-400/20">
            <div className="figure-label">{t('experiment_draft_gpa')}</div>
            <div className="figure-value mt-2 text-amber-600 dark:text-amber-300">{comparison.draftStats.weightedGpa.toFixed(3)}</div>
          </div>
        </div>

        <div className="mt-5 rounded-[1rem] border border-primary/10 bg-[hsl(var(--surface-2))] px-5 py-6" aria-label={t('experiment_track_label')}>
          <div className="relative h-2 rounded-full bg-primary/10">
            <div className="absolute inset-y-0 rounded-full bg-amber-500/35" style={{ left: `${Math.min(baselinePosition, draftPosition)}%`, width: `${Math.abs(draftPosition - baselinePosition)}%` }} />
            <span className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" style={{ left: `${baselinePosition}%` }} />
            <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-surface bg-amber-500 shadow" style={{ left: `${draftPosition}%` }} />
          </div>
          <div className="mt-4 flex justify-between gap-4 text-xs text-muted">
            <span>{t('experiment_baseline_short')} {comparison.baselineStats.weightedGpa.toFixed(3)}</span>
            <span className="text-right">{t('experiment_draft_short')} {comparison.draftStats.weightedGpa.toFixed(3)}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [t('experiment_gpa_delta'), formatDelta(comparison.gpaDelta, 3)],
            [t('experiment_average_delta'), formatDelta(comparison.averageScoreDelta, 2)],
            [t('experiment_credits_delta'), formatDelta(comparison.creditsDelta, 1)],
            [t('experiment_changed_courses'), String(comparison.changes.length)],
          ].map(([label, value]) => (
            <div key={label} className="metric-card">
              <div className="figure-label">{label}</div>
              <div className="num-inline mt-2 text-lg font-bold text-main">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <ExperimentCourseEditor
        courses={experiment.draftCourses}
        baselineById={baselineById}
        changedIds={changedIds}
        changes={comparison.changes}
        onUpdateCourseScore={onUpdateCourseScore}
        onRemoveCourse={onRemoveCourse}
        onRestoreCourse={onRestoreCourse}
      />

      <TargetGpaCalculator
        currentGpa={comparison.draftStats.weightedGpa}
        currentCredits={comparison.draftStats.totalCredits}
        maximumGpa={maximumGpa}
      />

      <ExperimentCommandBar
        changeCount={comparison.changes.length}
        onReset={onReset}
        onDiscard={onDiscard}
        onCommit={onCommit}
      />
      <span className="sr-only" aria-live="polite">
        {t('experiment_change_count', comparison.changes.length)}
      </span>
    </div>
  );
};
