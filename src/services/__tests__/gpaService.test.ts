import { describe, it, expect } from 'vitest';
import {
  calculateCourseGpa,
  calculateStats,
  calculateTargetGpa,
  calculateTargetScorePlan,
  calculateSemesterTrends,
  getMaximumGpa,
} from '../gpaService';
import {
  CalculationMethod,
  Course,
  TargetScorePlanInput,
  TargetScorePlanResult,
} from '../../types';

describe('gpaService', () => {
  describe('calculateCourseGpa', () => {
    it('should return 0 for scores below 60', () => {
      expect(calculateCourseGpa(59, CalculationMethod.SUBTRACTIVE)).toBe(0);
      expect(calculateCourseGpa(0, CalculationMethod.SUBTRACTIVE)).toBe(0);
    });

    describe('DLUT 5.0 (SUBTRACTIVE)', () => {
      it('should calculate correctly: (Score - 50) / 10', () => {
        expect(calculateCourseGpa(100, CalculationMethod.SUBTRACTIVE)).toBe(
          5.0
        );
        expect(calculateCourseGpa(85, CalculationMethod.SUBTRACTIVE)).toBe(3.5);
        expect(calculateCourseGpa(60, CalculationMethod.SUBTRACTIVE)).toBe(1.0);
      });
    });

    describe('Standard 4.0 (STD_4_0)', () => {
      it('should return 4.0 for 90-100', () => {
        expect(calculateCourseGpa(90, CalculationMethod.STD_4_0)).toBe(4.0);
        expect(calculateCourseGpa(100, CalculationMethod.STD_4_0)).toBe(4.0);
      });
      it('should return 3.0 for 80-89', () => {
        expect(calculateCourseGpa(80, CalculationMethod.STD_4_0)).toBe(3.0);
        expect(calculateCourseGpa(89, CalculationMethod.STD_4_0)).toBe(3.0);
      });
      it('should return 2.0 for 70-79', () => {
        expect(calculateCourseGpa(75, CalculationMethod.STD_4_0)).toBe(2.0);
      });
      it('should return 1.0 for 60-69', () => {
        expect(calculateCourseGpa(65, CalculationMethod.STD_4_0)).toBe(1.0);
      });
    });

    describe('WES 4.0 (WES)', () => {
      // Based on common WES algorithm or the one implemented
      // Implementation: >=85:4.0, >=75:3.0, >=60:2.0
      it('uses 4.0 as both the perfect-score GPA and the scale ceiling', () => {
        expect(calculateCourseGpa(100, CalculationMethod.WES)).toBe(4);
        expect(getMaximumGpa(CalculationMethod.WES)).toBe(4);
      });
      it('should return 4.0 for >= 85', () => {
        expect(calculateCourseGpa(85, CalculationMethod.WES)).toBe(4.0);
        expect(calculateCourseGpa(90, CalculationMethod.WES)).toBe(4.0);
      });
      it('should return 3.0 for 75-84', () => {
        expect(calculateCourseGpa(75, CalculationMethod.WES)).toBe(3.0);
        expect(calculateCourseGpa(84, CalculationMethod.WES)).toBe(3.0);
      });
      it('should return 2.0 for 60-74', () => {
        expect(calculateCourseGpa(60, CalculationMethod.WES)).toBe(2.0);
        expect(calculateCourseGpa(74, CalculationMethod.WES)).toBe(2.0);
      });
    });
  });

  describe('calculateStats', () => {
    const mockCourses: Course[] = [
      {
        id: '1',
        name: 'Math',
        credits: 4,
        score: 90,
        gpa: 4.0,
        isActive: true,
        semester: '1-1',
        type: '必修',
        isCore: true,
      },
      {
        id: '2',
        name: 'English',
        credits: 2,
        score: 80,
        gpa: 3.0,
        isActive: true,
        semester: '1-1',
        type: '选修',
        isCore: false,
      },
      {
        id: '3',
        name: 'Inactive',
        credits: 2,
        score: 60,
        gpa: 1.0,
        isActive: false, // Should be ignored
        semester: '1-1',
        type: '必修',
        isCore: false,
      },
    ];

    it('should calculate weighted GPA correctly', () => {
      const stats = calculateStats(mockCourses);
      // Total Credits: 4 + 2 = 6 (Inactive ignored)
      // Weighted GPA: (4*4.0 + 2*3.0) / 6 = (16 + 6) / 6 = 22 / 6 = 3.6666...
      expect(stats.totalCredits).toBe(6);
      expect(stats.weightedGpa).toBeCloseTo(3.6667, 3);
    });

    it('should calculate weighted average score correctly', () => {
      const stats = calculateStats(mockCourses);
      // Weighted Score: (4*90 + 2*80) / 6 = (360 + 160) / 6 = 520 / 6 = 86.6666...
      expect(stats.weightedAverageScore).toBeCloseTo(86.6667, 3);
    });

    it('should calculate compulsory stats correctly', () => {
      const stats = calculateStats(mockCourses);
      // Compulsory: Only Math (Inactive ignored)
      expect(stats.compulsoryCredits).toBe(4);
      expect(stats.compulsoryWeightedGpa).toBe(4.0);
    });

    it('should count courses correctly', () => {
      const stats = calculateStats(mockCourses);
      expect(stats.courseCount).toBe(2);
    });

    it('includes credit totals and course share in every distribution bucket', () => {
      const stats = calculateStats(mockCourses);
      expect(stats.scoreDistribution[0]).toMatchObject({
        name: '90-100',
        value: 1,
        credits: 4,
        percentage: 50,
      });
      expect(stats.scoreDistribution[1]).toMatchObject({
        name: '80-89',
        value: 1,
        credits: 2,
        percentage: 50,
      });
    });
  });

  describe('calculateTargetGpa', () => {
    it('marks a plan on track when the expected future GPA reaches the target', () => {
      expect(
        calculateTargetGpa({
          currentGpa: 3.2,
          currentCredits: 100,
          targetGpa: 3.3,
          futureCredits: 20,
          expectedFutureGpa: 3.8,
          maximumGpa: 5,
        })
      ).toMatchObject({
        status: 'reachable',
        outlook: 'on-track',
        requiredFutureGpa: 3.8,
        projectedGpa: 3.3,
      });
    });

    it('asks for a higher future GPA when the target is possible but the current plan falls short', () => {
      expect(
        calculateTargetGpa({
          currentGpa: 3.2,
          currentCredits: 100,
          targetGpa: 3.4,
          futureCredits: 20,
          expectedFutureGpa: 4,
          maximumGpa: 5,
        })
      ).toMatchObject({
        status: 'reachable',
        outlook: 'needs-higher',
        requiredFutureGpa: 4.4,
      });
    });

    it('marks a target unreachable when it requires more than the selected GPA scale allows', () => {
      expect(
        calculateTargetGpa({
          currentGpa: 3,
          currentCredits: 100,
          targetGpa: 4,
          futureCredits: 20,
          expectedFutureGpa: 5,
          maximumGpa: 5,
        })
      ).toMatchObject({ status: 'unreachable', requiredFutureGpa: 9 });
    });

    it.each([
      ['zero future credits', { futureCredits: 0 }, 'futureCredits'],
      ['target above scale', { targetGpa: 5.1 }, 'targetGpa'],
      [
        'non-finite expected GPA',
        { expectedFutureGpa: Number.NaN },
        'expectedFutureGpa',
      ],
    ])('returns a field error for %s', (_label, overrides, field) => {
      expect(
        calculateTargetGpa({
          currentGpa: 3.2,
          currentCredits: 100,
          targetGpa: 3.5,
          futureCredits: 20,
          expectedFutureGpa: 4,
          maximumGpa: 5,
          ...overrides,
        })
      ).toMatchObject({ status: 'invalid', field });
    });

    it('rejects a current GPA outside the selected scale', () => {
      expect(
        calculateTargetGpa({
          currentGpa: 5.1,
          currentCredits: 10,
          targetGpa: 4,
          futureCredits: 10,
          expectedFutureGpa: 4,
          maximumGpa: 5,
        })
      ).toMatchObject({ status: 'invalid', field: 'currentGpa' });
    });

    it('clamps the required future GPA to zero when the target is already achieved', () => {
      expect(
        calculateTargetGpa({
          currentGpa: 4,
          currentCredits: 100,
          targetGpa: 3.5,
          futureCredits: 20,
          expectedFutureGpa: 3,
          maximumGpa: 5,
        })
      ).toMatchObject({
        status: 'reachable',
        outlook: 'achieved',
        requiredFutureGpa: 0,
      });
    });
  });

  describe('getMaximumGpa', () => {
    it.each([
      [CalculationMethod.SUBTRACTIVE, 5],
      [CalculationMethod.LINEAR, 5],
      [CalculationMethod.SCALE_4_5, 4.5],
      [CalculationMethod.WES, 4],
      [CalculationMethod.STD_4_0, 4],
      [CalculationMethod.PKU_4_0, 4],
    ])(
      'maps %s to its actual GPA ceiling instead of a shared default',
      (method, expected) => {
        expect(getMaximumGpa(method)).toBe(expected);
      }
    );
  });

  describe('calculateTargetScorePlan', () => {
    it('finds 94.0 as the minimum subtractive score instead of rounding the requirement down', () => {
      expect(
        calculateTargetScorePlan({
          currentGpa: 3,
          currentCredits: 10,
          targetGpa: 3.7,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'automatic',
              name: 'Automatic',
              credits: 10,
              score: { mode: 'auto' },
            },
          ],
        })
      ).toEqual({
        status: 'feasible',
        recommendedScore: 94,
        projectedGpa: 3.7,
        requiredAutoGpa: 4.4,
        courseScores: [{ courseId: 'automatic', score: 94 }],
      });
    });

    it('respects the WES 75-point step instead of treating the scale as continuous', () => {
      expect(
        calculateTargetScorePlan({
          currentGpa: 2,
          currentCredits: 10,
          targetGpa: 2.5,
          method: CalculationMethod.WES,
          courses: [
            {
              id: 'wes-course',
              name: 'WES Course',
              credits: 10,
              score: { mode: 'auto' },
            },
          ],
        })
      ).toEqual({
        status: 'feasible',
        recommendedScore: 75,
        projectedGpa: 2.5,
        requiredAutoGpa: 3,
        courseScores: [{ courseId: 'wes-course', score: 75 }],
      });
    });

    it.each([
      ['linear 5.0', CalculationMethod.LINEAR, 4, 80, 4],
      ['standard 4.0', CalculationMethod.STD_4_0, 3, 80, 3],
      ['4.5 scale', CalculationMethod.SCALE_4_5, 3.5, 80, 3.5],
      ['PKU 4.0', CalculationMethod.PKU_4_0, 3.25, 80, 3.25],
    ])(
      'finds the hand-checked minimum score for %s',
      (_label, method, targetGpa, expectedScore, expectedProjectedGpa) => {
        const result = calculateTargetScorePlan({
          currentGpa: 0,
          currentCredits: 0,
          targetGpa,
          method,
          courses: [
            {
              id: 'automatic',
              name: 'Automatic',
              credits: 1,
              score: { mode: 'auto' },
            },
          ],
        });

        expect(result).toEqual({
          status: 'feasible',
          recommendedScore: expectedScore,
          projectedGpa: expectedProjectedGpa,
          requiredAutoGpa: targetGpa,
          courseScores: [{ courseId: 'automatic', score: expectedScore }],
        });
        expect(
          result.status === 'feasible' && result.projectedGpa >= targetGpa
        ).toBe(true);
      }
    );

    it.each([
      [CalculationMethod.STD_4_0, 3, 2, 1],
      [CalculationMethod.PKU_4_0, 3.25, 3.24248125, 0.00751875],
    ])(
      'does not treat 79.9 as sufficient at the %s 80-point boundary',
      (method, targetGpa, expectedBestPossibleGpa, expectedShortfall) => {
        const result = calculateTargetScorePlan({
          currentGpa: 0,
          currentCredits: 0,
          targetGpa,
          method,
          courses: [
            {
              id: 'fixed-boundary',
              name: 'Fixed Boundary',
              credits: 1,
              score: { mode: 'fixed', value: 79.9 },
            },
          ],
        });

        expect(result).toMatchObject({
          status: 'unreachable',
          courseScores: [{ courseId: 'fixed-boundary', score: 79.9 }],
        });
        expect(
          result.status === 'unreachable' ? result.bestPossibleGpa : Number.NaN
        ).toBeCloseTo(expectedBestPossibleGpa, 10);
        expect(
          result.status === 'unreachable' ? result.shortfall : Number.NaN
        ).toBeCloseTo(expectedShortfall, 10);
      }
    );

    it('never accepts a projected GPA below the target through a positive tolerance', () => {
      const targetGpa = 1.0000000005;
      const result = calculateTargetScorePlan({
        currentGpa: 2,
        currentCredits: 1,
        targetGpa,
        method: CalculationMethod.SUBTRACTIVE,
        courses: [
          {
            id: 'automatic',
            name: 'Automatic',
            credits: 1,
            score: { mode: 'auto' },
          },
        ],
      });

      expect(result).toMatchObject({
        status: 'feasible',
        recommendedScore: 60,
        courseScores: [{ courseId: 'automatic', score: 60 }],
      });
      expect(
        result.status === 'feasible' && result.projectedGpa >= targetGpa
      ).toBe(true);
    });

    it('subtracts fixed-course quality before assigning one score to every automatic course', () => {
      const result = calculateTargetScorePlan({
        currentGpa: 3,
        currentCredits: 10,
        targetGpa: 3.5,
        method: CalculationMethod.SUBTRACTIVE,
        courses: [
          {
            id: 'auto-first',
            name: 'Auto First',
            credits: 2,
            score: { mode: 'auto' },
          },
          {
            id: 'fixed',
            name: 'Fixed',
            credits: 2,
            score: { mode: 'fixed', value: 90 },
          },
          {
            id: 'auto-last',
            name: 'Auto Last',
            credits: 1,
            score: { mode: 'auto' },
          },
        ],
      });

      expect(result).toMatchObject({
        status: 'feasible',
        recommendedScore: 98.4,
        requiredAutoGpa: 29 / 6,
        courseScores: [
          { courseId: 'auto-first', score: 98.4 },
          { courseId: 'fixed', score: 90 },
          { courseId: 'auto-last', score: 98.4 },
        ],
      });
      expect(
        result.status === 'feasible' ? result.projectedGpa : 0
      ).toBeCloseTo(3.5013333333, 10);
    });

    it('returns null automatic requirements when a fixed-only plan already reaches the target', () => {
      expect(
        calculateTargetScorePlan({
          currentGpa: 3,
          currentCredits: 10,
          targetGpa: 3.5,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'fixed',
              name: 'Fixed',
              credits: 10,
              score: { mode: 'fixed', value: 90 },
            },
          ],
        })
      ).toEqual({
        status: 'feasible',
        recommendedScore: null,
        projectedGpa: 3.5,
        requiredAutoGpa: null,
        courseScores: [{ courseId: 'fixed', score: 90 }],
      });
    });

    it('reports the fixed-only shortfall instead of inventing an automatic recommendation', () => {
      const result = calculateTargetScorePlan({
        currentGpa: 3,
        currentCredits: 10,
        targetGpa: 3.6,
        method: CalculationMethod.SUBTRACTIVE,
        courses: [
          {
            id: 'fixed',
            name: 'Fixed',
            credits: 10,
            score: { mode: 'fixed', value: 90 },
          },
        ],
      });

      expect(result).toMatchObject({
        status: 'unreachable',
        bestPossibleGpa: 3.5,
        courseScores: [{ courseId: 'fixed', score: 90 }],
      });
      expect(
        result.status === 'unreachable' ? result.shortfall : 0
      ).toBeCloseTo(0.1, 10);
    });

    it('reports the best possible GPA when automatic courses at 100 still miss the target', () => {
      expect(
        calculateTargetScorePlan({
          currentGpa: 0,
          currentCredits: 10,
          targetGpa: 3,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'automatic',
              name: 'Automatic',
              credits: 10,
              score: { mode: 'auto' },
            },
          ],
        })
      ).toEqual({
        status: 'unreachable',
        bestPossibleGpa: 2.5,
        shortfall: 0.5,
        courseScores: [{ courseId: 'automatic', score: 100 }],
      });
    });

    it('supports a student with no completed credits instead of dividing by the historical total', () => {
      expect(
        calculateTargetScorePlan({
          currentGpa: 0,
          currentCredits: 0,
          targetGpa: 1,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'first-course',
              name: 'First Course',
              credits: 2,
              score: { mode: 'auto' },
            },
          ],
        })
      ).toEqual({
        status: 'feasible',
        recommendedScore: 60,
        projectedGpa: 1,
        requiredAutoGpa: 1,
        courseScores: [{ courseId: 'first-course', score: 60 }],
      });
    });

    it('clamps an already-satisfied automatic GPA requirement to zero', () => {
      expect(
        calculateTargetScorePlan({
          currentGpa: 4,
          currentCredits: 10,
          targetGpa: 2,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'automatic',
              name: 'Automatic',
              credits: 10,
              score: { mode: 'auto' },
            },
          ],
        })
      ).toEqual({
        status: 'feasible',
        recommendedScore: 0,
        projectedGpa: 2,
        requiredAutoGpa: 0,
        courseScores: [{ courseId: 'automatic', score: 0 }],
      });
    });

    it('recommends zero when the requested target GPA is exactly zero', () => {
      expect(
        calculateTargetScorePlan({
          currentGpa: 0,
          currentCredits: 0,
          targetGpa: 0,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'automatic',
              name: 'Automatic',
              credits: 1,
              score: { mode: 'auto' },
            },
          ],
        })
      ).toEqual({
        status: 'feasible',
        recommendedScore: 0,
        projectedGpa: 0,
        requiredAutoGpa: 0,
        courseScores: [{ courseId: 'automatic', score: 0 }],
      });
    });

    it('rejects an empty course list before attempting a plan', () => {
      expect(
        calculateTargetScorePlan({
          currentGpa: 3,
          currentCredits: 10,
          targetGpa: 3.5,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [],
        })
      ).toEqual({ status: 'invalid', field: 'courses', reason: 'no-courses' });
    });

    it('identifies the zero-credit course instead of accepting a denominator-free row', () => {
      expect(
        calculateTargetScorePlan({
          currentGpa: 3,
          currentCredits: 10,
          targetGpa: 3.5,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'zero-credit',
              name: 'Zero Credit',
              credits: 0,
              score: { mode: 'auto' },
            },
          ],
        })
      ).toEqual({
        status: 'invalid',
        field: 'courseCredits',
        reason: 'positive',
        courseId: 'zero-credit',
      });
    });

    it('rejects an empty course id before it can create an ambiguous score row', () => {
      expect(
        calculateTargetScorePlan({
          currentGpa: 3,
          currentCredits: 10,
          targetGpa: 3.5,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            { id: '', name: 'Missing Id', credits: 1, score: { mode: 'auto' } },
          ],
        })
      ).toEqual({ status: 'invalid', field: 'courses', reason: 'required' });
    });

    it('identifies a duplicate course id before returning ambiguous course scores', () => {
      expect(
        calculateTargetScorePlan({
          currentGpa: 3,
          currentCredits: 10,
          targetGpa: 3.5,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'duplicate',
              name: 'First',
              credits: 1,
              score: { mode: 'auto' },
            },
            {
              id: 'duplicate',
              name: 'Second',
              credits: 1,
              score: { mode: 'auto' },
            },
          ],
        })
      ).toEqual({
        status: 'invalid',
        field: 'courses',
        reason: 'out-of-range',
        courseId: 'duplicate',
      });
    });

    const overflowCases: {
      label: string;
      input: TargetScorePlanInput;
      expected: TargetScorePlanResult;
    }[] = [
      {
        label: 'current quality points',
        input: {
          currentGpa: 5,
          currentCredits: Number.MAX_VALUE,
          targetGpa: 1,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'automatic',
              name: 'Automatic',
              credits: 1,
              score: { mode: 'auto' },
            },
          ],
        },
        expected: {
          status: 'invalid',
          field: 'currentCredits',
          reason: 'out-of-range',
        },
      },
      {
        label: 'planned credits',
        input: {
          currentGpa: 0,
          currentCredits: 0,
          targetGpa: 0,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'first-large',
              name: 'First Large',
              credits: Number.MAX_VALUE,
              score: { mode: 'auto' },
            },
            {
              id: 'second-large',
              name: 'Second Large',
              credits: Number.MAX_VALUE,
              score: { mode: 'auto' },
            },
          ],
        },
        expected: {
          status: 'invalid',
          field: 'courseCredits',
          reason: 'out-of-range',
          courseId: 'second-large',
        },
      },
      {
        label: 'fixed quality points',
        input: {
          currentGpa: 0,
          currentCredits: 0,
          targetGpa: 0,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'large-fixed',
              name: 'Large Fixed',
              credits: Number.MAX_VALUE,
              score: { mode: 'fixed', value: 100 },
            },
          ],
        },
        expected: {
          status: 'invalid',
          field: 'courseCredits',
          reason: 'out-of-range',
          courseId: 'large-fixed',
        },
      },
      {
        label: 'combined credits',
        input: {
          currentGpa: 0,
          currentCredits: Number.MAX_VALUE,
          targetGpa: 0,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'combined-overflow',
              name: 'Combined Overflow',
              credits: Number.MAX_VALUE,
              score: { mode: 'auto' },
            },
          ],
        },
        expected: {
          status: 'invalid',
          field: 'courseCredits',
          reason: 'out-of-range',
          courseId: 'combined-overflow',
        },
      },
      {
        label: 'target quality points',
        input: {
          currentGpa: 0,
          currentCredits: Number.MAX_VALUE / 4,
          targetGpa: 5,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'automatic',
              name: 'Automatic',
              credits: 1,
              score: { mode: 'auto' },
            },
          ],
        },
        expected: {
          status: 'invalid',
          field: 'courses',
          reason: 'out-of-range',
        },
      },
      {
        label: 'best-score projection',
        input: {
          currentGpa: 1,
          currentCredits: Number.MAX_VALUE * 0.75,
          targetGpa: 1.1,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'projection-overflow',
              name: 'Projection Overflow',
              credits: Number.MAX_VALUE * 0.1,
              score: { mode: 'auto' },
            },
          ],
        },
        expected: {
          status: 'invalid',
          field: 'courseCredits',
          reason: 'out-of-range',
          courseId: 'projection-overflow',
        },
      },
    ];

    it.each(overflowCases)(
      'returns an out-of-range field error when finite inputs overflow $label',
      ({ input, expected }) => {
        expect(calculateTargetScorePlan(input)).toEqual(expected);
      }
    );

    it.each([
      ['current GPA', { currentGpa: Number.NaN }, 'currentGpa', undefined],
      [
        'current credits',
        { currentCredits: Number.POSITIVE_INFINITY },
        'currentCredits',
        undefined,
      ],
      [
        'target GPA',
        { targetGpa: Number.NEGATIVE_INFINITY },
        'targetGpa',
        undefined,
      ],
      [
        'course credits',
        {
          courses: [
            {
              id: 'non-finite-credits',
              name: 'Non-finite Credits',
              credits: Number.NaN,
              score: { mode: 'auto' as const },
            },
          ],
        },
        'courseCredits',
        'non-finite-credits',
      ],
      [
        'fixed score',
        {
          courses: [
            {
              id: 'non-finite-score',
              name: 'Non-finite Score',
              credits: 1,
              score: {
                mode: 'fixed' as const,
                value: Number.POSITIVE_INFINITY,
              },
            },
          ],
        },
        'fixedScore',
        'non-finite-score',
      ],
    ])(
      'rejects a non-finite %s before numeric comparisons can pass it',
      (_label, overrides, field, courseId) => {
        const result = calculateTargetScorePlan({
          currentGpa: 3,
          currentCredits: 10,
          targetGpa: 3.5,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'automatic',
              name: 'Automatic',
              credits: 10,
              score: { mode: 'auto' },
            },
          ],
          ...overrides,
        });

        expect(result).toEqual({
          status: 'invalid',
          field,
          reason: 'required',
          ...(courseId ? { courseId } : {}),
        });
      }
    );

    it.each([
      [
        'negative current credits',
        { currentCredits: -1 },
        'currentCredits',
        'positive',
        undefined,
      ],
      [
        'current GPA above the scale',
        { currentGpa: 5.1 },
        'currentGpa',
        'out-of-range',
        undefined,
      ],
      [
        'negative target GPA',
        { targetGpa: -0.1 },
        'targetGpa',
        'out-of-range',
        undefined,
      ],
      [
        'negative course credits',
        {
          courses: [
            {
              id: 'negative-credits',
              name: 'Negative Credits',
              credits: -1,
              score: { mode: 'auto' as const },
            },
          ],
        },
        'courseCredits',
        'positive',
        'negative-credits',
      ],
      [
        'fixed score above 100',
        {
          courses: [
            {
              id: 'high-score',
              name: 'High Score',
              credits: 1,
              score: { mode: 'fixed' as const, value: 100.1 },
            },
          ],
        },
        'fixedScore',
        'out-of-range',
        'high-score',
      ],
    ])(
      'returns the documented field error for %s',
      (_label, overrides, field, reason, courseId) => {
        const result = calculateTargetScorePlan({
          currentGpa: 3,
          currentCredits: 10,
          targetGpa: 3.5,
          method: CalculationMethod.SUBTRACTIVE,
          courses: [
            {
              id: 'automatic',
              name: 'Automatic',
              credits: 10,
              score: { mode: 'auto' },
            },
          ],
          ...overrides,
        });

        expect(result).toEqual({
          status: 'invalid',
          field,
          reason,
          ...(courseId ? { courseId } : {}),
        });
      }
    );
  });

  describe('calculateSemesterTrends', () => {
    it('aggregates valid active courses by semester and orders semesters naturally', () => {
      const courses: Course[] = [
        {
          id: 'a',
          name: 'A',
          credits: 2,
          score: 80,
          gpa: 3,
          isActive: true,
          semester: '2-1',
          type: '必修',
        },
        {
          id: 'b',
          name: 'B',
          credits: 4,
          score: 90,
          gpa: 4,
          isActive: true,
          semester: '1-2',
          type: '必修',
        },
        {
          id: 'c',
          name: 'C',
          credits: 2,
          score: 70,
          gpa: 2,
          isActive: true,
          semester: '1-2',
          type: '选修',
        },
        {
          id: 'd',
          name: 'D',
          credits: 3,
          score: 0,
          gpa: 0,
          isActive: true,
          semester: '1-2',
          type: '选修',
        },
        {
          id: 'e',
          name: 'E',
          credits: 3,
          score: 100,
          gpa: 5,
          isActive: false,
          semester: '1-2',
          type: '选修',
        },
      ];
      expect(calculateSemesterTrends(courses)).toEqual([
        {
          semester: '1-2',
          gpa: 20 / 9,
          averageScore: 500 / 9,
          credits: 9,
          courseCount: 3,
        },
        {
          semester: '2-1',
          gpa: 3,
          averageScore: 80,
          credits: 2,
          courseCount: 1,
        },
      ]);
    });
  });
});
