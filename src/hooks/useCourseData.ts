import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Course,
  CourseType,
  CalculationMethod,
  ExperimentSession,
} from '../types';
import { calculateCourseGpa } from '../services/gpaService';
import { compareExperimentCourses } from '../services/experimentService';
import { SAMPLE_COURSES, DEFAULT_CALCULATION_METHOD } from '../utils/constants';

const STORAGE_KEY = 'dlut_gpa_courses_transcript_20260704';
const STORAGE_SEED_KEY = 'dlut_gpa_courses_seed';
const CURRENT_SEED_ID = 'transcript-20260704-qian-dayu-v2';
const createCourseId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

interface CourseDataState {
  officialCourses: Course[];
  experiment: ExperimentSession | null;
}

const cloneCourses = (courses: Course[]) => courses.map(course => ({ ...course }));

const getInitialTranscriptCourses = (method: CalculationMethod): Course[] =>
  SAMPLE_COURSES.map(c => ({
    ...c,
    gpa: calculateCourseGpa(c.score, method),
  }));

const isInitialTranscriptCourses = (courses: Course[]) =>
  courses.length === SAMPLE_COURSES.length && courses.every((course, index) => {
    const baseline = SAMPLE_COURSES[index];
    return course.id === baseline.id &&
      course.name === baseline.name &&
      course.credits === baseline.credits &&
      course.score === baseline.score &&
      course.isActive === baseline.isActive &&
      course.semester === baseline.semester &&
      course.type === baseline.type &&
      course.isCore === baseline.isCore;
  });

export const useCourseData = () => {
  const [data, setData] = useState<CourseDataState>({
    officialCourses: [],
    experiment: null,
  });
  const [hydrated, setHydrated] = useState(false);
  const [method, setMethod] = useState<CalculationMethod>(DEFAULT_CALCULATION_METHOD);
  const courses = data.experiment?.draftCourses ?? data.officialCourses;
  const isExperimentActive = data.experiment !== null;

  // Initialize data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const isCurrentSeed = localStorage.getItem(STORAGE_SEED_KEY) === CURRENT_SEED_ID;
    const hasSavedData = savedData !== null && isCurrentSeed;
    let initialCourses: Course[] = getInitialTranscriptCourses(DEFAULT_CALCULATION_METHOD);

    if (hasSavedData) {
      try {
        const parsed = JSON.parse(savedData as string);
        initialCourses = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        initialCourses = getInitialTranscriptCourses(DEFAULT_CALCULATION_METHOD);
      }

      if (initialCourses.length > 0) {
        // Migration: Ensure 'type' and 'isCore' exists
        initialCourses = initialCourses.map(c => ({
          ...c,
          type: c.type || '必修',
          isCore: c.isCore !== undefined ? c.isCore : false,
          gpa: calculateCourseGpa(c.score, DEFAULT_CALCULATION_METHOD)
        }));
      }
    }

    if (!hasSavedData) {
      localStorage.setItem(STORAGE_SEED_KEY, CURRENT_SEED_ID);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCourses));
    }

    setData({ officialCourses: initialCourses, experiment: null });
    setHydrated(true);
  }, []);

  // Persist courses
  useEffect(() => {
    if (hydrated && !data.experiment) {
      const isCurrentSeed = localStorage.getItem(STORAGE_SEED_KEY) === CURRENT_SEED_ID;
      if (!isCurrentSeed && !isInitialTranscriptCourses(data.officialCourses)) {
        return;
      }

      localStorage.setItem(STORAGE_SEED_KEY, CURRENT_SEED_ID);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.officialCourses));
    }
  }, [data.experiment, data.officialCourses, hydrated]);

  // Recalculate GPAs when method changes
  useEffect(() => {
    if (!hydrated) return;
    const recalculate = (items: Course[]) => items.map(course => ({
      ...course,
      gpa: calculateCourseGpa(course.score, method),
    }));
    setData(prev => ({
      officialCourses: recalculate(prev.officialCourses),
      experiment: prev.experiment
        ? {
            baselineCourses: recalculate(prev.experiment.baselineCourses),
            draftCourses: recalculate(prev.experiment.draftCourses),
          }
        : null,
    }));
  }, [method, hydrated]);

  const updateWorkingCourses = useCallback(
    (updater: (current: Course[]) => Course[]) => {
      setData(prev => {
        if (prev.experiment) {
          return {
            ...prev,
            experiment: {
              ...prev.experiment,
              draftCourses: updater(prev.experiment.draftCourses),
            },
          };
        }
        return { ...prev, officialCourses: updater(prev.officialCourses) };
      });
    },
    []
  );

  const addCourse = useCallback((name: string, credits: number, score: number, semester: string, type: CourseType, isCore: boolean) => {
    const newCourse: Course = {
      id: createCourseId(),
      name,
      credits,
      score,
      semester,
      type,
      isCore,
      gpa: calculateCourseGpa(score, method),
      isActive: true
    };
    updateWorkingCourses(prev => [...prev, newCourse]);
  }, [method, updateWorkingCourses]);

  const removeCourse = useCallback((id: string) => {
    updateWorkingCourses(prev => prev.filter(c => c.id !== id));
  }, [updateWorkingCourses]);

  const toggleCourse = useCallback((id: string) => {
    updateWorkingCourses(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  }, [updateWorkingCourses]);

  const updateCourse = useCallback((updated: Course) => {
    updateWorkingCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, [updateWorkingCourses]);

  const saveCourse = useCallback((id: string, name: string, credits: number, score: number, semester: string, type: CourseType, isCore: boolean) => {
    updateWorkingCourses(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          name,
          credits,
          score,
          semester,
          type,
          isCore,
          gpa: calculateCourseGpa(score, method)
        };
      }
      return c;
    }));
  }, [method, updateWorkingCourses]);

  const updateCourseScore = useCallback((id: string, score: number) => {
    updateWorkingCourses(prev => prev.map(course => course.id === id
      ? { ...course, score, gpa: calculateCourseGpa(score, method) }
      : course));
  }, [method, updateWorkingCourses]);

  const importData = useCallback((importedCourses: Course[], mode: 'replace' | 'merge') => {
    const processedCourses = importedCourses.map(c => ({
      ...c,
      id: c.id || createCourseId(),
      isActive: c.isActive !== undefined ? c.isActive : true,
      semester: c.semester || '未知学期',
      type: c.type || '必修',
      isCore: c.isCore ?? false,
      gpa: calculateCourseGpa(c.score, method)
    }));

    if (mode === 'replace') {
      updateWorkingCourses(() => processedCourses);
    } else {
      const newCourses = processedCourses.map(c => ({ 
        ...c, 
        id: createCourseId()
      }));
      updateWorkingCourses(prev => [...prev, ...newCourses]);
    }
  }, [method, updateWorkingCourses]);

  const resetData = useCallback(() => {
    if (!data.experiment) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_SEED_KEY, CURRENT_SEED_ID);
    }
    updateWorkingCourses(() => getInitialTranscriptCourses(method));
  }, [data.experiment, method, updateWorkingCourses]);

  const startExperiment = useCallback(() => {
    setData(prev => {
      if (prev.experiment) return prev;
      return {
        ...prev,
        experiment: {
          baselineCourses: cloneCourses(prev.officialCourses),
          draftCourses: cloneCourses(prev.officialCourses),
        },
      };
    });
  }, []);

  const resetExperiment = useCallback(() => {
    setData(prev => prev.experiment
      ? {
          ...prev,
          experiment: {
            ...prev.experiment,
            draftCourses: cloneCourses(prev.experiment.baselineCourses),
          },
        }
      : prev);
  }, []);

  const restoreExperimentCourse = useCallback((course: Course) => {
    setData(prev => {
      if (!prev.experiment) return prev;

      const baselineIndex = prev.experiment.baselineCourses.findIndex(
        item => item.id === course.id
      );
      if (baselineIndex < 0) return prev;

      const baselineCourse = {
        ...prev.experiment.baselineCourses[baselineIndex],
      };
      const draftCourses = cloneCourses(prev.experiment.draftCourses);
      const existingIndex = draftCourses.findIndex(item => item.id === course.id);

      if (existingIndex >= 0) {
        draftCourses[existingIndex] = baselineCourse;
      } else {
        const baselineOrder = new Map(
          prev.experiment.baselineCourses.map((item, index) => [item.id, index])
        );
        const nextBaselineIndex = draftCourses.findIndex(item => {
          const itemIndex = baselineOrder.get(item.id);
          return itemIndex !== undefined && itemIndex > baselineIndex;
        });
        const insertionIndex = nextBaselineIndex >= 0
          ? nextBaselineIndex
          : draftCourses.reduce((lastIndex, item, index) =>
              baselineOrder.has(item.id) ? index + 1 : lastIndex, 0);
        draftCourses.splice(insertionIndex, 0, baselineCourse);
      }

      return {
        ...prev,
        experiment: {
          ...prev.experiment,
          draftCourses,
        },
      };
    });
  }, []);

  const discardExperiment = useCallback(() => {
    setData(prev => prev.experiment ? { ...prev, experiment: null } : prev);
  }, []);

  const commitExperiment = useCallback(() => {
    setData(prev => prev.experiment
      ? {
          officialCourses: cloneCourses(prev.experiment.draftCourses),
          experiment: null,
        }
      : prev);
  }, []);

  const setAllActive = useCallback((active: boolean, filteredIds?: Set<string>) => {
    if (filteredIds) {
        updateWorkingCourses(prev => prev.map(c => filteredIds.has(c.id) ? { ...c, isActive: active } : c));
    } else {
        updateWorkingCourses(prev => prev.map(c => ({ ...c, isActive: active })));
    }
  }, [updateWorkingCourses]);

  const hasUnsavedExperimentChanges = useMemo(
    () => data.experiment
      ? compareExperimentCourses(
          data.experiment.baselineCourses,
          data.experiment.draftCourses
        ).changes.length > 0
      : false,
    [data.experiment]
  );

  useEffect(() => {
    if (!hasUnsavedExperimentChanges) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedExperimentChanges]);

  return {
    courses,
    hydrated,
    method,
    setMethod,
    experiment: data.experiment,
    isExperimentActive,
    addCourse,
    removeCourse,
    toggleCourse,
    updateCourse,
    saveCourse,
    updateCourseScore,
    importData,
    resetData,
    startExperiment,
    resetExperiment,
    restoreExperimentCourse,
    discardExperiment,
    commitExperiment,
    setAllActive,
  };
};
