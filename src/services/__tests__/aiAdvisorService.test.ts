import { describe, expect, it } from 'vitest';
import { getAIRecommendations } from '../aiAdvisorService';
import { StudentProfile } from '../../types/aiAdvisor';
import { Course, GpaStats } from '../../types';

const mockCourses: Course[] = [
  {
    id: 'math1',
    name: '高等数学A',
    credits: 5,
    score: 92,
    gpa: 4.2,
    isActive: true,
    semester: '2023-1',
    type: '必修',
    isCore: true,
  },
  {
    id: 'phys1',
    name: '大学物理',
    credits: 4,
    score: 85,
    gpa: 3.5,
    isActive: true,
    semester: '2023-1',
    type: '必修',
    isCore: true,
  },
  {
    id: 'eng1',
    name: '大学英语',
    credits: 3,
    score: 78,
    gpa: 2.8,
    isActive: true,
    semester: '2023-1',
    type: '必修',
    isCore: false,
  },
];

const mockGpaStats: GpaStats = {
  totalCredits: 12,
  weightedGpa: 3.7,
  weightedAverageScore: 86.3,
  courseCount: 3,
  scoreDistribution: [
    { name: '90-100', value: 1 },
    { name: '80-89', value: 1 },
    { name: '70-79', value: 1 },
    { name: '60-69', value: 0 },
    { name: '<60', value: 0 },
  ],
  compulsoryCredits: 12,
  compulsoryWeightedGpa: 3.7,
};

function createStudentProfile(): StudentProfile {
  return {
    id: 'student-1',
    courses: mockCourses,
    gpaStats: mockGpaStats,
    strengths: [],
    weaknesses: [],
    preferredSchedule: 'morning',
    studyHoursPerWeek: 24,
    targetGPA: 3.8,
    careerGoals: ['Software Engineering'],
  };
}

describe('getAIRecommendations', () => {
  it('does not mutate the provided student profile', () => {
    const studentProfile = createStudentProfile();
    const snapshot = structuredClone(studentProfile);

    getAIRecommendations(studentProfile);

    expect(studentProfile).toEqual(snapshot);
  });

  it('returns numeric suggested study time values', () => {
    const studentProfile = createStudentProfile();

    const result = getAIRecommendations(studentProfile);

    expect(result.recommendations.length).toBeGreaterThan(0);
    for (const recommendation of result.recommendations) {
      expect(typeof recommendation.suggestedStudyTime).toBe('number');
      expect(Number.isFinite(recommendation.suggestedStudyTime)).toBe(true);
    }
  });
});
