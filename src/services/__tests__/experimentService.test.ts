import { describe, expect, it } from 'vitest';
import { calculateStats } from '../gpaService';
import { compareExperimentCourses } from '../experimentService';
import { Course } from '../../types';

const course = (overrides: Partial<Course>): Course => ({
  id: 'course-1',
  name: '高等数学',
  credits: 4,
  score: 80,
  gpa: 3,
  isActive: true,
  semester: '1-1',
  type: '必修',
  isCore: true,
  ...overrides,
});

describe('compareExperimentCourses', () => {
  it('returns calculated baseline, draft, and metric deltas', () => {
    const baseline = [course({})];
    const draft = [course({ score: 90, gpa: 4 })];

    const comparison = compareExperimentCourses(baseline, draft);

    expect(comparison.baselineStats).toEqual(calculateStats(baseline));
    expect(comparison.draftStats).toEqual(calculateStats(draft));
    expect(comparison.gpaDelta).toBeCloseTo(1);
    expect(comparison.averageScoreDelta).toBeCloseTo(10);
    expect(comparison.creditsDelta).toBe(0);
  });

  it('classifies added, removed, score, included, and metadata changes by course', () => {
    const baseline = [
      course({ id: 'changed' }),
      course({ id: 'removed', name: '大学物理' }),
    ];
    const draft = [
      course({
        id: 'changed',
        name: '数学分析',
        credits: 5,
        score: 95,
        gpa: 4.5,
        isActive: false,
        semester: '1-2',
        type: '选修',
        isCore: false,
      }),
      course({ id: 'added', name: '线性代数' }),
    ];

    expect(compareExperimentCourses(baseline, draft).changes).toEqual([
      {
        courseId: 'changed',
        kinds: ['score', 'included', 'metadata'],
        baselineCourse: baseline[0],
        draftCourse: draft[0],
      },
      {
        courseId: 'removed',
        kinds: ['removed'],
        baselineCourse: baseline[1],
      },
      {
        courseId: 'added',
        kinds: ['added'],
        draftCourse: draft[1],
      },
    ]);
  });

  it('ignores GPA-only recalculation so changing calculation method is not a course edit', () => {
    const baseline = [course({ gpa: 3 })];
    const draft = [course({ gpa: 4 })];

    expect(compareExperimentCourses(baseline, draft).changes).toEqual([]);
  });
});
