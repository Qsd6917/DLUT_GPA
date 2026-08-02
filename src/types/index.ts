
export type CourseType = '必修' | '选修' | '任选';

export interface Course {
  id: string;
  name: string;
  credits: number;
  score: number;
  gpa: number;
  isActive: boolean;
  semester: string;
  type: CourseType;
  isCore?: boolean; // New: Is this a core major course?
}

export enum CalculationMethod {
  SUBTRACTIVE = 'SUBTRACTIVE', // 5.0 (Score - 50) / 10
  LINEAR = 'LINEAR', // 5.0 (Score / 20)
  WES = 'WES', // WES 5.0
  STD_4_0 = 'STD_4_0', // Standard 4.0 (90-100=4.0, 80-89=3.0...)
  PKU_4_0 = 'PKU_4_0', // Peking Univ 4.0 Formula
  SCALE_4_5 = 'SCALE_4_5', // 4.5 Scale
}

export interface GpaStats {
  totalCredits: number;
  weightedGpa: number;
  weightedAverageScore: number;
  courseCount: number;
  scoreDistribution: {
    name: string;
    value: number;
    credits?: number;
    percentage?: number;
  }[];
  
  // New fields for compulsory courses
  compulsoryCredits: number;
  compulsoryWeightedGpa: number;
}

export interface ExperimentSession {
  baselineCourses: Course[];
  draftCourses: Course[];
}

export type ExperimentChangeKind =
  | 'added'
  | 'removed'
  | 'score'
  | 'included'
  | 'metadata';

export interface ExperimentCourseChange {
  courseId: string;
  kinds: ExperimentChangeKind[];
  baselineCourse?: Course;
  draftCourse?: Course;
}

export interface ExperimentComparison {
  baselineStats: GpaStats;
  draftStats: GpaStats;
  gpaDelta: number;
  averageScoreDelta: number;
  creditsDelta: number;
  changes: ExperimentCourseChange[];
}

export interface SemesterTrend {
  semester: string;
  gpa: number;
  averageScore: number;
  credits: number;
  courseCount: number;
}

export interface GraduationRequirements {
  total: number;
  compulsory: number;
  elective: number; // 选修
  optional: number; // 任选
}

export interface TargetGpaInput {
  currentGpa: number;
  currentCredits: number;
  targetGpa: number;
  futureCredits: number;
  expectedFutureGpa: number;
  maximumGpa: number;
}

export type TargetGpaResult =
  | {
      status: 'reachable';
      outlook: 'achieved' | 'on-track' | 'needs-higher';
      requiredFutureGpa: number;
      projectedGpa: number;
    }
  | {
      status: 'unreachable';
      requiredFutureGpa: number;
      projectedGpa: number;
    }
  | {
      status: 'invalid';
      field: keyof TargetGpaInput;
      reason: 'required' | 'positive' | 'out-of-range';
    };
