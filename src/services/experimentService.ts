import {
  Course,
  ExperimentChangeKind,
  ExperimentComparison,
  ExperimentCourseChange,
} from '../types';
import { calculateStats } from './gpaService';

const hasMetadataChange = (baseline: Course, draft: Course) =>
  baseline.name !== draft.name ||
  baseline.credits !== draft.credits ||
  baseline.semester !== draft.semester ||
  baseline.type !== draft.type ||
  (baseline.isCore ?? false) !== (draft.isCore ?? false);

export function compareExperimentCourses(
  baselineCourses: Course[],
  draftCourses: Course[]
): ExperimentComparison {
  const baselineStats = calculateStats(baselineCourses);
  const draftStats = calculateStats(draftCourses);
  const baselineById = new Map(baselineCourses.map(course => [course.id, course]));
  const draftById = new Map(draftCourses.map(course => [course.id, course]));
  const changes: ExperimentCourseChange[] = [];

  baselineCourses.forEach(baselineCourse => {
    const draftCourse = draftById.get(baselineCourse.id);
    if (!draftCourse) {
      changes.push({
        courseId: baselineCourse.id,
        kinds: ['removed'],
        baselineCourse,
      });
      return;
    }

    const kinds: ExperimentChangeKind[] = [];
    if (baselineCourse.score !== draftCourse.score) kinds.push('score');
    if (baselineCourse.isActive !== draftCourse.isActive) kinds.push('included');
    if (hasMetadataChange(baselineCourse, draftCourse)) kinds.push('metadata');
    if (kinds.length > 0) {
      changes.push({
        courseId: baselineCourse.id,
        kinds,
        baselineCourse,
        draftCourse,
      });
    }
  });

  draftCourses.forEach(draftCourse => {
    if (!baselineById.has(draftCourse.id)) {
      changes.push({
        courseId: draftCourse.id,
        kinds: ['added'],
        draftCourse,
      });
    }
  });

  return {
    baselineStats,
    draftStats,
    gpaDelta: draftStats.weightedGpa - baselineStats.weightedGpa,
    averageScoreDelta:
      draftStats.weightedAverageScore - baselineStats.weightedAverageScore,
    creditsDelta: draftStats.totalCredits - baselineStats.totalCredits,
    changes,
  };
}
