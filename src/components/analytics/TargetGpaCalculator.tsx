import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import {
  calculateTargetGpa,
  calculateTargetScorePlan,
  getMaximumGpa,
} from '../../services/gpaService';
import {
  CalculationMethod,
  PlannedCourseInput,
  TargetGpaResult,
  TargetScorePlanResult,
} from '../../types';

interface TargetGpaCalculatorProps {
  currentGpa: number;
  currentCredits: number;
  method: CalculationMethod;
}

type CalculatorMode = 'quick' | 'planner';

interface PlannedCourseDraft {
  id: string;
  sequence: number;
  name: string | null;
  credits: string;
  scoreMode: 'auto' | 'fixed';
  fixedScore: string;
}

const createPlannedCourse = (sequence: number): PlannedCourseDraft => ({
  id: `future-course-${sequence}`,
  sequence,
  name: null,
  credits: '3',
  scoreMode: 'auto',
  fixedScore: '',
});

const parseNumber = (value: string) =>
  value.trim() === '' ? Number.NaN : Number(value);

const clampPercent = (value: number, maximum: number) =>
  `${Math.min(100, Math.max(0, (value / maximum) * 100))}%`;

export const TargetGpaCalculator: React.FC<TargetGpaCalculatorProps> = ({
  currentGpa,
  currentCredits,
  method,
}) => {
  const { t } = useTranslation();
  const reactId = useId();
  const idPrefix = `target-score-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const headingId = `${idPrefix}-title`;
  const tabIds: Record<CalculatorMode, string> = {
    quick: `${idPrefix}-tab-quick`,
    planner: `${idPrefix}-tab-planner`,
  };
  const panelIds: Record<CalculatorMode, string> = {
    quick: `${idPrefix}-panel-quick`,
    planner: `${idPrefix}-panel-planner`,
  };
  const maximumGpa = getMaximumGpa(method);
  const [mode, setMode] = useState<CalculatorMode>('planner');
  const [targetGpa, setTargetGpa] = useState('3.8');
  const [futureCredits, setFutureCredits] = useState('20');
  const [expectedFutureGpa, setExpectedFutureGpa] = useState('4');
  const [plannedCourses, setPlannedCourses] = useState<PlannedCourseDraft[]>([
    createPlannedCourse(1),
  ]);
  const nextCourseSequence = useRef(2);
  const courseNameRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const addCourseButtonRef = useRef<HTMLButtonElement | null>(null);
  const pendingFocusTarget = useRef<string | 'add' | null>(null);
  const tabRefs = useRef<Record<CalculatorMode, HTMLButtonElement | null>>({
    quick: null,
    planner: null,
  });

  const quickResult = useMemo<TargetGpaResult>(
    () =>
      calculateTargetGpa({
        currentGpa,
        currentCredits,
        targetGpa: parseNumber(targetGpa),
        futureCredits: parseNumber(futureCredits),
        expectedFutureGpa: parseNumber(expectedFutureGpa),
        maximumGpa,
      }),
    [
      currentCredits,
      currentGpa,
      expectedFutureGpa,
      futureCredits,
      maximumGpa,
      targetGpa,
    ]
  );

  const plannerResult = useMemo<TargetScorePlanResult>(() => {
    const courses: PlannedCourseInput[] = plannedCourses.map(course => ({
      id: course.id,
      name: course.name?.trim() || t('future_course_default', course.sequence),
      credits: parseNumber(course.credits),
      score:
        course.scoreMode === 'auto'
          ? { mode: 'auto' }
          : { mode: 'fixed', value: parseNumber(course.fixedScore) },
    }));

    return calculateTargetScorePlan({
      currentGpa,
      currentCredits,
      targetGpa: parseNumber(targetGpa),
      method,
      courses,
    });
  }, [currentCredits, currentGpa, method, plannedCourses, t, targetGpa]);

  const switchMode = (nextMode: CalculatorMode, focus = false) => {
    setMode(nextMode);
    if (focus) tabRefs.current[nextMode]?.focus();
  };

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentMode: CalculatorMode
  ) => {
    const modes: CalculatorMode[] = ['quick', 'planner'];
    const currentIndex = modes.indexOf(currentMode);
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight')
      nextIndex = (currentIndex + 1) % modes.length;
    if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + modes.length) % modes.length;
    }
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = modes.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    switchMode(modes[nextIndex], true);
  };

  const updatePlannedCourse = (
    id: string,
    updater: (course: PlannedCourseDraft) => PlannedCourseDraft
  ) => {
    setPlannedCourses(courses =>
      courses.map(course => (course.id === id ? updater(course) : course))
    );
  };

  const addPlannedCourse = () => {
    const sequence = nextCourseSequence.current;
    nextCourseSequence.current += 1;
    setPlannedCourses(courses => [...courses, createPlannedCourse(sequence)]);
  };

  const removePlannedCourse = (id: string) => {
    setPlannedCourses(courses => {
      const removedIndex = courses.findIndex(course => course.id === id);
      const remainingCourses = courses.filter(course => course.id !== id);
      const nextCourse =
        remainingCourses[removedIndex] ?? remainingCourses[removedIndex - 1];
      pendingFocusTarget.current = nextCourse?.id ?? 'add';
      return remainingCourses;
    });
  };

  useEffect(() => {
    const target = pendingFocusTarget.current;
    if (!target) return;

    if (target === 'add') addCourseButtonRef.current?.focus();
    else courseNameRefs.current[target]?.focus();
    pendingFocusTarget.current = null;
  }, [plannedCourses]);

  const plannerError = useMemo(() => {
    if (plannerResult.status !== 'invalid') return null;

    if (plannerResult.field === 'targetGpa') {
      return {
        id: `${idPrefix}-error-target-gpa`,
        message:
          plannerResult.reason === 'required'
            ? t('required_field', t('target_gpa'))
            : t('target_required', maximumGpa),
      };
    }

    const course = plannedCourses.find(
      item => item.id === plannerResult.courseId
    );
    if (!course) return null;
    const courseLabel = t('future_course_default', course.sequence);

    if (plannerResult.field === 'courseCredits') {
      return {
        id: `${idPrefix}-error-credits-${course.id}`,
        courseId: course.id,
        field: 'credits' as const,
        message:
          plannerResult.reason === 'required'
            ? t(
                'required_field',
                t('planned_course_credits_label', courseLabel)
              )
            : t('planned_course_credits_positive', courseLabel),
      };
    }

    if (plannerResult.field === 'fixedScore') {
      return {
        id: `${idPrefix}-error-fixed-${course.id}`,
        courseId: course.id,
        field: 'fixedScore' as const,
        message:
          plannerResult.reason === 'required'
            ? t('required_field', t('planned_course_fixed_label', courseLabel))
            : t('fixed_score_range'),
      };
    }

    return null;
  }, [idPrefix, maximumGpa, plannedCourses, plannerResult, t]);

  const quickError = useMemo(() => {
    if (quickResult.status !== 'invalid') return null;
    const label =
      quickResult.field === 'targetGpa'
        ? t('target_gpa')
        : quickResult.field === 'futureCredits'
          ? t('remaining_credits')
          : t('expected_average_gpa');
    const message =
      quickResult.reason === 'required'
        ? t('required_field', label)
        : quickResult.field === 'futureCredits'
          ? t('remaining_credits_positive')
          : quickResult.field === 'targetGpa'
            ? t('target_required', maximumGpa)
            : t('expected_gpa_range', maximumGpa);
    return {
      id: `${idPrefix}-quick-error-${quickResult.field}`,
      field: quickResult.field,
      message,
    };
  }, [idPrefix, maximumGpa, quickResult, t]);

  const renderScale = (
    result: Exclude<TargetScorePlanResult, { status: 'invalid' }>
  ) => {
    const target = parseNumber(targetGpa);
    const outcome =
      result.status === 'feasible'
        ? result.projectedGpa
        : result.bestPossibleGpa;
    const outcomeLabel =
      result.status === 'feasible' ? t('scale_projected') : t('scale_highest');
    const ariaLabel =
      result.status === 'feasible'
        ? t(
            'target_scale_projected_label',
            currentGpa.toFixed(3),
            target.toFixed(3),
            outcome.toFixed(3),
            maximumGpa.toFixed(3)
          )
        : t(
            'target_scale_highest_label',
            currentGpa.toFixed(3),
            target.toFixed(3),
            outcome.toFixed(3),
            maximumGpa.toFixed(3)
          );

    return (
      <figure
        className="mt-5 border-t border-primary/10 pt-4"
        role="img"
        aria-label={ariaLabel}
      >
        <div className="relative mx-1 h-5" aria-hidden="true">
          <div className="absolute left-0 right-0 top-2 h-px bg-[hsl(var(--color-line))]" />
          {[
            {
              key: 'current',
              value: currentGpa,
              className: 'bg-[hsl(var(--color-text-muted))]',
            },
            { key: 'target', value: target, className: 'bg-primary' },
            {
              key: 'outcome',
              value: outcome,
              className: 'bg-[hsl(var(--color-positive))]',
            },
            {
              key: 'maximum',
              value: maximumGpa,
              className: 'bg-[hsl(var(--color-text-main))]',
            },
          ].map(({ key, value, className }) => (
            <span
              key={key}
              className={`absolute top-0 h-4 w-px ${className}`}
              style={{ left: clampPercent(value, maximumGpa) }}
            />
          ))}
        </div>
        <figcaption className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted sm:grid-cols-4">
          <span>{t('scale_current_value', currentGpa.toFixed(3))}</span>
          <span>{t('scale_target_value', target.toFixed(3))}</span>
          <span>
            {t('scale_outcome_value', outcomeLabel, outcome.toFixed(3))}
          </span>
          <span>{t('scale_maximum_value', maximumGpa.toFixed(3))}</span>
        </figcaption>
      </figure>
    );
  };

  const renderPlannerResult = () => {
    if (plannerResult.status === 'invalid') return null;

    return (
      <div
        className="rounded-[1rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-4 sm:p-5"
        role="status"
        aria-live="polite"
      >
        {plannerResult.status === 'feasible' ? (
          <>
            <div className="font-semibold text-main">
              {plannerResult.recommendedScore === null
                ? t('fixed_plan_reaches_target')
                : t('minimum_balanced_score')}
            </div>
            {plannerResult.recommendedScore !== null ? (
              <div className="result-value mt-3 text-primary">
                {plannerResult.recommendedScore.toFixed(1)}
              </div>
            ) : null}
            <p className="type-body-sm mt-2">
              {t(
                'projected_cumulative_gpa',
                plannerResult.projectedGpa.toFixed(3)
              )}
            </p>
          </>
        ) : (
          <>
            <div className="font-semibold text-main">
              {t('planner_unreachable')}
            </div>
            <p className="type-body-sm mt-2">
              {t(
                'highest_possible_gpa',
                plannerResult.bestPossibleGpa.toFixed(3)
              )}
            </p>
            <p className="type-body-sm mt-1">
              {t('target_shortfall', plannerResult.shortfall.toFixed(3))}
            </p>
          </>
        )}

        <div className="mt-4 border-t border-primary/10 pt-3">
          <div className="figure-label">{t('planned_course_scores')}</div>
          <div className="mt-2 space-y-1.5">
            {plannerResult.courseScores.map(courseScore => {
              const course = plannedCourses.find(
                item => item.id === courseScore.courseId
              );
              if (!course) return null;
              const name =
                course.name?.trim() ||
                t('future_course_default', course.sequence);
              return (
                <div
                  key={courseScore.courseId}
                  aria-label={t(
                    'course_score_line',
                    name,
                    courseScore.score.toFixed(1)
                  )}
                  className="flex min-w-0 items-center justify-between gap-3 text-sm text-main"
                >
                  <span className="min-w-0 flex-1 truncate">{name}</span>
                  <span className="num-inline shrink-0">
                    {courseScore.score.toFixed(1)} {t('score_points')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {renderScale(plannerResult)}
      </div>
    );
  };

  const quickFields = [
    {
      label: t('target_gpa'),
      value: targetGpa,
      setter: setTargetGpa,
      step: '0.01',
      field: 'targetGpa',
    },
    {
      label: t('remaining_credits'),
      value: futureCredits,
      setter: setFutureCredits,
      step: '0.5',
      field: 'futureCredits',
    },
    {
      label: t('expected_average_gpa'),
      value: expectedFutureGpa,
      setter: setExpectedFutureGpa,
      step: '0.01',
      field: 'expectedFutureGpa',
    },
  ] as const;

  return (
    <section className="paper-panel p-5 sm:p-6" aria-labelledby={headingId}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-primary/10 bg-[hsl(var(--surface-2))] text-[hsl(var(--color-accent))]">
            <Target size={18} />
          </div>
          <div>
            <div className="section-kicker">{t('target_projection')}</div>
            <h3 id={headingId} className="type-section-title text-main">
              {t('target_score_planning')}
            </h3>
          </div>
        </div>

        <div
          className="segmented-control"
          role="tablist"
          aria-label={t('target_planning_modes')}
        >
          {(
            [
              ['quick', t('quick_estimate')],
              ['planner', t('per_course_plan')],
            ] as const
          ).map(([itemMode, label]) => {
            const active = mode === itemMode;
            return (
              <button
                key={itemMode}
                ref={element => {
                  tabRefs.current[itemMode] = element;
                }}
                type="button"
                role="tab"
                id={tabIds[itemMode]}
                aria-controls={panelIds[itemMode]}
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                data-active={active}
                className="segmented-control-button"
                onClick={() => switchMode(itemMode)}
                onKeyDown={event => handleTabKeyDown(event, itemMode)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-[1rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-3">
        <div>
          <div className="figure-label">{t('current_gpa_short')}</div>
          <div
            className="num-inline mt-1 block text-lg text-main"
            aria-label={t('planner_baseline_gpa')}
          >
            {currentGpa.toFixed(3)}
          </div>
        </div>
        <div>
          <div className="figure-label">{t('included_credits_short')}</div>
          <div
            className="num-inline mt-1 block text-lg text-main"
            aria-label={t('planner_baseline_credits')}
          >
            {currentCredits.toFixed(1)}
          </div>
        </div>
      </div>

      <div
        id={panelIds.planner}
        role="tabpanel"
        aria-labelledby={tabIds.planner}
        hidden={mode !== 'planner'}
        tabIndex={mode === 'planner' ? 0 : -1}
        className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)]"
      >
        <div>
          <label className="block space-y-1.5">
            <span className="type-label">{t('target_gpa')}</span>
            <input
              type="number"
              step="0.01"
              value={targetGpa}
              onChange={event => setTargetGpa(event.target.value)}
              aria-invalid={
                plannerResult.status === 'invalid' &&
                plannerResult.field === 'targetGpa'
              }
              aria-describedby={
                plannerResult.status === 'invalid' &&
                plannerResult.field === 'targetGpa'
                  ? plannerError?.id
                  : undefined
              }
              className="num-input w-full rounded-[0.95rem] border border-primary/10 bg-[hsl(var(--surface-2))] px-3.5 py-2.5 text-sm text-main outline-none focus:border-primary"
            />
          </label>
          {plannerResult.status === 'invalid' &&
          plannerResult.field === 'targetGpa' &&
          plannerError ? (
            <p
              id={plannerError.id}
              className="mt-2 text-sm text-[hsl(var(--color-negative))]"
              role="alert"
            >
              {plannerError.message}
            </p>
          ) : null}

          <div className="mt-5">
            {plannedCourses.length === 0 ? (
              <div className="border-y border-primary/10 py-6 text-center">
                <p className="type-body-sm">{t('no_planned_courses')}</p>
              </div>
            ) : (
              plannedCourses.map(course => {
                const courseLabel = t('future_course_default', course.sequence);
                const creditsInvalid =
                  plannerResult.status === 'invalid' &&
                  plannerResult.field === 'courseCredits' &&
                  plannerResult.courseId === course.id;
                const fixedInvalid =
                  plannerResult.status === 'invalid' &&
                  plannerResult.field === 'fixedScore' &&
                  plannerResult.courseId === course.id;

                return (
                  <fieldset
                    key={course.id}
                    className="border-t border-primary/10 py-4 first:border-t-0 first:pt-0"
                  >
                    <legend className="sr-only">{courseLabel}</legend>
                    <div className="flex items-center justify-between gap-3">
                      <div className="section-kicker">{courseLabel}</div>
                      <button
                        type="button"
                        className="ghost-button min-h-0 px-2.5 py-1.5 text-[hsl(var(--color-negative))]"
                        aria-label={t('remove_future_course', courseLabel)}
                        onClick={() => removePlannedCourse(course.id)}
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">{t('remove')}</span>
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
                      <label className="space-y-1.5">
                        <span className="type-label">{t('course_name')}</span>
                        <input
                          ref={element => {
                            courseNameRefs.current[course.id] = element;
                          }}
                          type="text"
                          value={course.name ?? courseLabel}
                          placeholder={courseLabel}
                          aria-label={t(
                            'planned_course_name_label',
                            courseLabel
                          )}
                          onChange={event =>
                            updatePlannedCourse(course.id, item => ({
                              ...item,
                              name: event.target.value,
                            }))
                          }
                          className="w-full rounded-[0.95rem] border border-primary/10 bg-[hsl(var(--surface-2))] px-3.5 py-2.5 text-sm text-main outline-none focus:border-primary"
                        />
                      </label>
                      <label className="space-y-1.5">
                        <span className="type-label">{t('credits')}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={course.credits}
                          aria-label={t(
                            'planned_course_credits_label',
                            courseLabel
                          )}
                          aria-invalid={creditsInvalid}
                          aria-describedby={
                            creditsInvalid ? plannerError?.id : undefined
                          }
                          onChange={event =>
                            updatePlannedCourse(course.id, item => ({
                              ...item,
                              credits: event.target.value,
                            }))
                          }
                          className="num-input w-full rounded-[0.95rem] border border-primary/10 bg-[hsl(var(--surface-2))] px-3.5 py-2.5 text-sm text-main outline-none focus:border-primary"
                        />
                      </label>
                    </div>
                    {creditsInvalid && plannerError ? (
                      <p
                        id={plannerError.id}
                        className="mt-2 text-sm text-[hsl(var(--color-negative))]"
                        role="alert"
                      >
                        {plannerError.message}
                      </p>
                    ) : null}

                    <fieldset className="mt-3">
                      <legend className="type-label">{t('score_plan')}</legend>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                        <label className="flex items-center gap-2 text-sm text-main">
                          <input
                            type="radio"
                            name={`${idPrefix}-score-mode-${course.id}`}
                            checked={course.scoreMode === 'auto'}
                            aria-label={t(
                              'planned_course_auto_label',
                              courseLabel
                            )}
                            onChange={() =>
                              updatePlannedCourse(course.id, item => ({
                                ...item,
                                scoreMode: 'auto',
                              }))
                            }
                          />
                          {t('auto_plan')}
                        </label>
                        <label className="flex items-center gap-2 text-sm text-main">
                          <input
                            type="radio"
                            name={`${idPrefix}-score-mode-${course.id}`}
                            checked={course.scoreMode === 'fixed'}
                            aria-label={t(
                              'planned_course_fixed_label',
                              courseLabel
                            )}
                            onChange={() =>
                              updatePlannedCourse(course.id, item => ({
                                ...item,
                                scoreMode: 'fixed',
                              }))
                            }
                          />
                          {t('fixed_score')}
                        </label>
                      </div>
                    </fieldset>

                    {course.scoreMode === 'fixed' ? (
                      <div className="mt-3 max-w-[12rem]">
                        <label className="space-y-1.5">
                          <span className="type-label">{t('fixed_score')}</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={course.fixedScore}
                            aria-label={t(
                              'planned_course_fixed_score_label',
                              courseLabel
                            )}
                            aria-invalid={fixedInvalid}
                            aria-describedby={
                              fixedInvalid ? plannerError?.id : undefined
                            }
                            onChange={event =>
                              updatePlannedCourse(course.id, item => ({
                                ...item,
                                fixedScore: event.target.value,
                              }))
                            }
                            className="num-input w-full rounded-[0.95rem] border border-primary/10 bg-[hsl(var(--surface-2))] px-3.5 py-2.5 text-sm text-main outline-none focus:border-primary"
                          />
                        </label>
                        {fixedInvalid && plannerError ? (
                          <p
                            id={plannerError.id}
                            className="mt-2 text-sm text-[hsl(var(--color-negative))]"
                            role="alert"
                          >
                            {plannerError.message}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </fieldset>
                );
              })
            )}

            <button
              ref={addCourseButtonRef}
              type="button"
              className="primary-button mt-2"
              onClick={addPlannedCourse}
            >
              <Plus size={15} />
              {t('add_future_course')}
            </button>
          </div>
        </div>

        <div>{renderPlannerResult()}</div>
      </div>

      <div
        id={panelIds.quick}
        role="tabpanel"
        aria-labelledby={tabIds.quick}
        hidden={mode !== 'quick'}
        tabIndex={mode === 'quick' ? 0 : -1}
        className="mt-5"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {quickFields.map(field => {
            const invalid =
              quickResult.status === 'invalid' &&
              quickResult.field === field.field;
            return (
              <label key={field.field} className="space-y-1.5">
                <span className="type-label">{field.label}</span>
                <input
                  type="number"
                  step={field.step}
                  value={field.value}
                  onChange={event => field.setter(event.target.value)}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? quickError?.id : undefined}
                  className="num-input w-full rounded-[0.95rem] border border-primary/10 bg-[hsl(var(--surface-2))] px-3.5 py-2.5 text-sm text-main outline-none focus:border-primary"
                />
              </label>
            );
          })}
        </div>
        {quickError ? (
          <p
            id={quickError.id}
            className="mt-3 text-sm text-[hsl(var(--color-negative))]"
            role="alert"
          >
            {quickError.message}
          </p>
        ) : null}
        {quickResult.status !== 'invalid' ? (
          <div
            className="mt-4 rounded-[1rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-4"
            aria-live="polite"
          >
            <div className="font-semibold text-main">
              {quickResult.status === 'unreachable'
                ? t('not_reachable')
                : quickResult.outlook === 'achieved'
                  ? t('target_achieved')
                  : quickResult.outlook === 'on-track'
                    ? t('plan_reaches_target')
                    : t('higher_future_gpa_required')}
            </div>
            <p className="type-body-sm mt-1">
              {t(
                'required_future_projected',
                quickResult.requiredFutureGpa.toFixed(3),
                quickResult.projectedGpa.toFixed(3)
              )}
            </p>
            <div className="result-value mt-3 text-primary">
              {quickResult.requiredFutureGpa.toFixed(3)}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};
