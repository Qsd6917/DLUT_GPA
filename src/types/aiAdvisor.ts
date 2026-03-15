import { Course, GpaStats } from './index';

export interface CoursePerformance {
  courseId: string;
  courseName: string;
  avgScore: number;
  difficulty: number; // 1-10 scale
  prerequisiteScores: Record<string, number>; // Prerequisite course ID to required score mapping
}

export interface StudentProfile {
  id: string;
  courses: Course[];
  gpaStats: GpaStats;
  strengths: string[]; // Subject areas of strength
  weaknesses: string[]; // Subject areas needing improvement
  preferredSchedule: 'morning' | 'afternoon' | 'evening' | 'flexible'; // Time preferences
  studyHoursPerWeek: number; // Available study hours
  targetGPA: number;
  careerGoals: string[]; // Career interests
}

export interface Recommendation {
  courseId: string;
  courseName: string;
  confidence: number; // 0-1 scale
  predictedGrade: number;
  successProbability: number; // 0-1 scale
  reason: string; // Why this course is recommended
  suggestedStudyTime: number; // Hours per week recommended for this course
}

export interface LearningStrategy {
  courseId: string;
  strategies: string[]; // List of recommended study strategies
  resources: string[]; // Recommended resources
  timeline: string; // Study timeline suggestion
  difficultyAssessment: 'low' | 'medium' | 'high';
}

export interface AIDashboardData {
  recommendations: Recommendation[];
  learningStrategies: LearningStrategy[];
  academicRisks: string[]; // Potential risks to academic success
  milestonePredictions: {
    targetGpaDate: Date | null; // Estimated date to reach target GPA
    graduationProjection: Date; // Projected graduation date
  };
  skillGapAnalysis: {
    skill: string;
    proficiency: number; // 0-1 scale
    improvementPriority: number; // 1-5 scale
  }[];
}