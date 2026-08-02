import { describe, it, expect } from 'vitest';
import {
  calculateCourseGpa,
  calculateStats,
  calculateTargetGpa,
  calculateSemesterTrends,
} from '../gpaService';
import { CalculationMethod, Course } from '../../types';

describe('gpaService', () => {
  describe('calculateCourseGpa', () => {
    it('should return 0 for scores below 60', () => {
      expect(calculateCourseGpa(59, CalculationMethod.SUBTRACTIVE)).toBe(0);
      expect(calculateCourseGpa(0, CalculationMethod.SUBTRACTIVE)).toBe(0);
    });

    describe('DLUT 5.0 (SUBTRACTIVE)', () => {
      it('should calculate correctly: (Score - 50) / 10', () => {
        expect(calculateCourseGpa(100, CalculationMethod.SUBTRACTIVE)).toBe(5.0);
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

    describe('WES 5.0 (WES)', () => {
        // Based on common WES algorithm or the one implemented
        // Implementation: >=85:4.0, >=75:3.0, >=60:2.0
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
        isCore: true
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
        isCore: false
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
        isCore: false
      }
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
      ['non-finite expected GPA', { expectedFutureGpa: Number.NaN }, 'expectedFutureGpa'],
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
      expect(calculateTargetGpa({ currentGpa: 5.1, currentCredits: 10, targetGpa: 4, futureCredits: 10, expectedFutureGpa: 4, maximumGpa: 5 })).toMatchObject({ status: 'invalid', field: 'currentGpa' });
    });

    it('clamps the required future GPA to zero when the target is already achieved', () => {
      expect(calculateTargetGpa({ currentGpa: 4, currentCredits: 100, targetGpa: 3.5, futureCredits: 20, expectedFutureGpa: 3, maximumGpa: 5 })).toMatchObject({ status: 'reachable', outlook: 'achieved', requiredFutureGpa: 0 });
    });
  });

  describe('calculateSemesterTrends', () => {
    it('aggregates valid active courses by semester and orders semesters naturally', () => {
      const courses: Course[] = [
        { id: 'a', name: 'A', credits: 2, score: 80, gpa: 3, isActive: true, semester: '2-1', type: '必修' },
        { id: 'b', name: 'B', credits: 4, score: 90, gpa: 4, isActive: true, semester: '1-2', type: '必修' },
        { id: 'c', name: 'C', credits: 2, score: 70, gpa: 2, isActive: true, semester: '1-2', type: '选修' },
        { id: 'd', name: 'D', credits: 3, score: 0, gpa: 0, isActive: true, semester: '1-2', type: '选修' },
        { id: 'e', name: 'E', credits: 3, score: 100, gpa: 5, isActive: false, semester: '1-2', type: '选修' },
      ];
      expect(calculateSemesterTrends(courses)).toEqual([
        { semester: '1-2', gpa: 20 / 9, averageScore: 500 / 9, credits: 9, courseCount: 3 },
        { semester: '2-1', gpa: 3, averageScore: 80, credits: 2, courseCount: 1 },
      ]);
    });
  });
});
