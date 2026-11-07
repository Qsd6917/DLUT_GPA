import { describe, it, expect } from 'vitest';
import {
  calculateCourseGpa,
  calculateStats,
  calculateSemesterTrends,
  getMaximumGpa,
} from '../gpaService';
import { CalculationMethod, Course } from '../../types';

const ALL_METHODS = Object.values(CalculationMethod);

const course = (overrides: Partial<Course>): Course => ({
  id: 'c',
  name: 'Course',
  credits: 2,
  score: 80,
  gpa: 3,
  isActive: true,
  semester: '1-1',
  type: '必修',
  ...overrides,
});

describe('gpaService input defence', () => {
  describe('calculateCourseGpa out-of-range scores', () => {
    it.each(ALL_METHODS)(
      'never exceeds the scale ceiling for score 150 (%s)',
      method => {
        const gpa = calculateCourseGpa(150, method);
        expect(gpa).toBeLessThanOrEqual(getMaximumGpa(method));
      }
    );

    it('clamps 150 to the perfect-score value instead of overshooting', () => {
      // 钳制到 100 后，各算法都取到自己的满分。
      expect(calculateCourseGpa(150, CalculationMethod.SUBTRACTIVE)).toBe(5);
      expect(calculateCourseGpa(150, CalculationMethod.LINEAR)).toBe(5);
      expect(calculateCourseGpa(150, CalculationMethod.WES)).toBe(4);
      expect(calculateCourseGpa(150, CalculationMethod.STD_4_0)).toBe(4);
      expect(calculateCourseGpa(150, CalculationMethod.PKU_4_0)).toBe(4);
      expect(calculateCourseGpa(150, CalculationMethod.SCALE_4_5)).toBe(4.5);
    });

    it('never returns a negative GPA for an over-range score', () => {
      // 旧实现里 PKU_4_0 对 150 分会算出 -0.6875。
      ALL_METHODS.forEach(method => {
        expect(calculateCourseGpa(150, method)).toBeGreaterThanOrEqual(0);
      });
    });

    it.each(ALL_METHODS)('returns 0 for a negative score (%s)', method => {
      expect(calculateCourseGpa(-5, method)).toBe(0);
    });

    it.each(ALL_METHODS)('returns 0 for NaN (%s)', method => {
      expect(calculateCourseGpa(Number.NaN, method)).toBe(0);
    });

    it.each(ALL_METHODS)('returns 0 for Infinity (%s)', method => {
      expect(calculateCourseGpa(Number.POSITIVE_INFINITY, method)).toBe(0);
      expect(calculateCourseGpa(Number.NEGATIVE_INFINITY, method)).toBe(0);
    });

    it('keeps the score < 60 rule unchanged', () => {
      ALL_METHODS.forEach(method => {
        expect(calculateCourseGpa(59.99, method)).toBe(0);
        expect(calculateCourseGpa(0, method)).toBe(0);
      });
    });

    it('keeps in-range values identical to the documented formulas', () => {
      expect(calculateCourseGpa(100, CalculationMethod.SUBTRACTIVE)).toBe(5);
      expect(calculateCourseGpa(85, CalculationMethod.SUBTRACTIVE)).toBe(3.5);
      expect(calculateCourseGpa(60, CalculationMethod.SUBTRACTIVE)).toBe(1);
      expect(calculateCourseGpa(100, CalculationMethod.LINEAR)).toBe(5);
      expect(calculateCourseGpa(90, CalculationMethod.PKU_4_0)).toBe(3.8125);
      expect(calculateCourseGpa(100, CalculationMethod.PKU_4_0)).toBe(4);
    });
  });

  describe('calculateStats with invalid course data', () => {
    it('stays finite and non-negative with negative credits mixed in', () => {
      const stats = calculateStats([
        course({ id: 'negative', credits: -4, score: 90, gpa: 4 }),
        course({ id: 'normal', credits: 2, score: 90, gpa: 4 }),
      ]);

      // 负学分被排除在累加之外，只剩 2 学分那门课。
      expect(stats.totalCredits).toBe(2);
      expect(stats.weightedGpa).toBe(4);
      expect(stats.weightedAverageScore).toBe(90);
      expect(stats.compulsoryCredits).toBe(2);
      expect(stats.compulsoryWeightedGpa).toBe(4);

      expect(Number.isFinite(stats.weightedGpa)).toBe(true);
      expect(Number.isFinite(stats.weightedAverageScore)).toBe(true);
      expect(stats.weightedGpa).toBeGreaterThanOrEqual(0);
      expect(stats.weightedAverageScore).toBeGreaterThanOrEqual(0);
    });

    it('returns 0 rather than Infinity when every credit is negative', () => {
      const stats = calculateStats([
        course({ id: 'a', credits: -2, score: 90, gpa: 4 }),
        course({ id: 'b', credits: -3, score: 90, gpa: 4 }),
      ]);

      // 旧实现：正负抵消到 0 学分时 weightedGpa 可能变成 Infinity。
      expect(stats.totalCredits).toBe(0);
      expect(stats.weightedGpa).toBe(0);
      expect(stats.weightedAverageScore).toBe(0);
      expect(stats.compulsoryCredits).toBe(0);
      expect(stats.compulsoryWeightedGpa).toBe(0);
      expect(Number.isFinite(stats.weightedGpa)).toBe(true);
    });

    it('ignores NaN credits without poisoning the other totals', () => {
      const stats = calculateStats([
        course({ id: 'nan-credits', credits: Number.NaN, score: 90, gpa: 4 }),
        course({ id: 'ok', credits: 3, score: 80, gpa: 3 }),
      ]);

      expect(stats.totalCredits).toBe(3);
      expect(stats.weightedGpa).toBe(3);
      expect(stats.weightedAverageScore).toBe(80);
      expect(Number.isFinite(stats.weightedAverageScore)).toBe(true);
      expect(
        stats.scoreDistribution.every(b => Number.isFinite(b.credits))
      ).toBe(true);
    });

    it('ignores NaN scores instead of bucketing them as <60', () => {
      const stats = calculateStats([
        course({ id: 'nan-score', credits: 2, score: Number.NaN, gpa: 3 }),
        course({ id: 'ok', credits: 2, score: 95, gpa: 4.5 }),
      ]);

      expect(stats.weightedAverageScore).toBe(95);
      expect(stats.weightedGpa).toBe(4.5);
      expect(stats.scoreDistribution[0]).toMatchObject({
        name: '90-100',
        value: 1,
        credits: 2,
        percentage: 100,
      });
      expect(stats.scoreDistribution[4]).toMatchObject({
        name: '<60',
        value: 0,
        credits: 0,
      });
    });

    it('ignores NaN GPA values', () => {
      const stats = calculateStats([
        course({ id: 'nan-gpa', credits: 2, score: 80, gpa: Number.NaN }),
        course({ id: 'ok', credits: 2, score: 80, gpa: 3 }),
      ]);

      expect(stats.weightedGpa).toBe(3);
      expect(Number.isFinite(stats.weightedGpa)).toBe(true);
    });

    it('never reports a negative weighted GPA for legacy negative values', () => {
      // 历史脏数据里可能存着 PKU_4_0 对 150 分算出的 -0.6875。
      const stats = calculateStats([
        course({ id: 'legacy', credits: 2, score: 90, gpa: -0.6875 }),
      ]);

      expect(stats.weightedGpa).toBe(0);
      expect(stats.weightedGpa).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(stats.weightedGpa)).toBe(true);
      expect(stats.weightedAverageScore).toBe(90);
    });

    it('keeps the isActive filter as the only inclusion rule', () => {
      const stats = calculateStats([
        course({ id: 'active', credits: 2, score: 90, gpa: 4 }),
        course({
          id: 'inactive',
          credits: 100,
          score: 100,
          gpa: 5,
          isActive: false,
        }),
      ]);

      expect(stats.courseCount).toBe(1);
      expect(stats.totalCredits).toBe(2);
      expect(stats.weightedGpa).toBe(4);
    });

    it('still counts zero-credit active courses in courseCount and distribution', () => {
      // 既有口径：0 学分课程计入课程数与分布档位，只是不参与学分与加权求和。
      const stats = calculateStats([
        course({ id: 'zero', credits: 0, score: 97, gpa: 4.7 }),
        course({ id: 'ok', credits: 2, score: 80, gpa: 3 }),
      ]);

      expect(stats.courseCount).toBe(2);
      expect(stats.totalCredits).toBe(2);
      expect(stats.weightedGpa).toBe(3);
      expect(stats.weightedAverageScore).toBe(80);
      expect(stats.scoreDistribution[0]).toMatchObject({
        name: '90-100',
        value: 1,
        credits: 0,
        percentage: 50,
      });
    });

    it('returns all zeros for an empty list', () => {
      const stats = calculateStats([]);
      expect(stats.totalCredits).toBe(0);
      expect(stats.weightedGpa).toBe(0);
      expect(stats.weightedAverageScore).toBe(0);
      expect(stats.courseCount).toBe(0);
      expect(stats.compulsoryWeightedGpa).toBe(0);
    });
  });

  describe('calculateSemesterTrends with invalid course data', () => {
    it('produces no NaN for zero-credit courses', () => {
      // 旧实现里 0 学分课程会被过滤掉，整个学期随之消失。
      const trends = calculateSemesterTrends([
        course({ id: 'zero', credits: 0, score: 90, gpa: 4 }),
      ]);

      trends.forEach(trend => {
        expect(Number.isFinite(trend.gpa)).toBe(true);
        expect(Number.isFinite(trend.averageScore)).toBe(true);
        expect(Number.isFinite(trend.credits)).toBe(true);
        expect(trend.gpa).toBeGreaterThanOrEqual(0);
        expect(trend.averageScore).toBeGreaterThanOrEqual(0);
      });
      expect(trends).toEqual([]);
    });

    it('never divides by a zero credit total', () => {
      const trends = calculateSemesterTrends([
        course({ id: 'a', credits: 0, score: 90, gpa: 4, semester: '1-1' }),
        course({ id: 'b', credits: 0, score: 70, gpa: 2, semester: '1-1' }),
      ]);

      expect(trends).toEqual([]);
    });

    it('skips NaN credits, scores and GPAs', () => {
      const trends = calculateSemesterTrends([
        course({ id: 'nan-credits', credits: Number.NaN, semester: '1-1' }),
        course({ id: 'nan-score', score: Number.NaN, semester: '1-1' }),
        course({ id: 'nan-gpa', gpa: Number.NaN, semester: '1-1' }),
        course({
          id: 'ok',
          credits: 2,
          score: 90,
          gpa: 4,
          semester: '1-1',
        }),
      ]);

      expect(trends).toEqual([
        {
          semester: '1-1',
          gpa: 4,
          averageScore: 90,
          credits: 2,
          courseCount: 1,
        },
      ]);
    });

    it('never reports a negative GPA for legacy negative values', () => {
      // 历史脏数据里可能存着 PKU_4_0 对 150 分算出的 -0.6875。
      const trends = calculateSemesterTrends([
        course({ id: 'legacy', credits: 2, score: 90, gpa: -0.6875 }),
      ]);

      expect(trends).toEqual([
        {
          semester: '1-1',
          gpa: 0,
          averageScore: 90,
          credits: 2,
          courseCount: 1,
        },
      ]);
      expect(trends[0].gpa).toBeGreaterThanOrEqual(0);
    });
  });
});
