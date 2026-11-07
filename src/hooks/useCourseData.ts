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
import {
  readJSON,
  readString,
  remove,
  writeJSON,
  writeString,
} from '../utils/safeStorage';

const STORAGE_KEY = 'dlut_gpa_courses_transcript_20260704';
const STORAGE_SEED_KEY = 'dlut_gpa_courses_seed';
// seed 版本号只用于判断本地缓存是否属于当前内置数据集，不应携带任何个人信息。
// 旧值 'transcript-20260704-qian-dayu-v2' 含真实姓名，会随仓库公开分发。
// 改名后老用户的 seed 不匹配，会走一次「重新载入示例数据」——这与既有升级行为一致。
const CURRENT_SEED_ID = 'transcript-20260704-sample-v3';
const createCourseId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * `readJSON` 的 fallback 哨兵：用于区分「JSON 损坏 / 读取失败」与「合法但
 * 不是数组」两种情况。前者回退初始成绩单，后者保留空列表。
 */
const INVALID_JSON = Symbol('invalid-json');

interface CourseDataState {
  officialCourses: Course[];
  experiment: ExperimentSession | null;
}

const cloneCourses = (courses: Course[]) =>
  courses.map(course => ({ ...course }));

const getInitialTranscriptCourses = (method: CalculationMethod): Course[] =>
  SAMPLE_COURSES.map(c => ({
    ...c,
    gpa: calculateCourseGpa(c.score, method),
  }));

const isInitialTranscriptCourses = (courses: Course[]) =>
  courses.length === SAMPLE_COURSES.length &&
  courses.every((course, index) => {
    const baseline = SAMPLE_COURSES[index];
    return (
      course.id === baseline.id &&
      course.name === baseline.name &&
      course.credits === baseline.credits &&
      course.score === baseline.score &&
      course.isActive === baseline.isActive &&
      course.semester === baseline.semester &&
      course.type === baseline.type &&
      course.isCore === baseline.isCore
    );
  });

export const useCourseData = () => {
  const [data, setData] = useState<CourseDataState>({
    officialCourses: [],
    experiment: null,
  });
  const [hydrated, setHydrated] = useState(false);
  // 写入失败（配额满 / 存储被禁用）时置为 true，供 UI 提示用户
  // 「改动没有保存到本地」。初始值 false 表示尚未观察到失败。
  const [storageBlocked, setStorageBlocked] = useState(false);
  // 存储里的 seed 属于外部来源时，本应用刻意不写入（避免覆盖对方数据），
  // 但这意味着本次编辑不会保存。这个状态让界面能明确告诉用户。
  const [persistenceBlocked, setPersistenceBlocked] = useState(false);
  const [method, setMethod] = useState<CalculationMethod>(
    DEFAULT_CALCULATION_METHOD
  );
  const courses = data.experiment?.draftCourses ?? data.officialCourses;
  const isExperimentActive = data.experiment !== null;

  // 当前展示的是否仍是内置示例数据（用户未做过任何改动）。
  // 供界面显示「这不是你的成绩」的提示条——新用户首访看到的 83 门课、
  // GPA 3.867 来自示例成绩单，此前完全没有标注。
  const isSampleData =
    hydrated &&
    !isExperimentActive &&
    isInitialTranscriptCourses(data.officialCourses);

  // Initialize data
  useEffect(() => {
    // 存储不可用（Safari 阻止所有 Cookie、机房策略）时 readString 返回 null，
    // 相当于「首次访问」，直接回退到默认成绩单，而不是让整站崩掉。
    const savedRaw = readString(STORAGE_KEY);
    const isCurrentSeed = readString(STORAGE_SEED_KEY) === CURRENT_SEED_ID;
    const hasSavedData = savedRaw !== null && isCurrentSeed;
    let initialCourses: Course[] = getInitialTranscriptCourses(
      DEFAULT_CALCULATION_METHOD
    );

    if (hasSavedData) {
      // 用哨兵区分「JSON 损坏」与「合法但非数组」两种情况，保持与原有
      // 迁移行为一致：损坏 → 回退初始成绩单；合法非数组 → 空列表。
      const parsed = readJSON<Course[] | typeof INVALID_JSON>(
        STORAGE_KEY,
        INVALID_JSON
      );
      if (parsed === INVALID_JSON) {
        initialCourses = getInitialTranscriptCourses(
          DEFAULT_CALCULATION_METHOD
        );
      } else {
        initialCourses = Array.isArray(parsed) ? parsed : [];
      }

      if (initialCourses.length > 0) {
        // Migration: Ensure 'type' and 'isCore' exists
        initialCourses = initialCourses.map(c => ({
          ...c,
          type: c.type || '必修',
          isCore: c.isCore !== undefined ? c.isCore : false,
          gpa: calculateCourseGpa(c.score, DEFAULT_CALCULATION_METHOD),
        }));
      }
    }

    if (!hasSavedData) {
      // 写失败不阻断启动：用户仍能使用本次会话，只是下次打开需要重新初始化。
      const wroteSeed = writeString(STORAGE_SEED_KEY, CURRENT_SEED_ID);
      const wroteCourses = writeJSON(STORAGE_KEY, initialCourses);
      if (!wroteSeed || !wroteCourses) {
        setStorageBlocked(true);
      }
    }

    setData({ officialCourses: initialCourses, experiment: null });
    setHydrated(true);
  }, []);

  // Persist courses
  useEffect(() => {
    if (hydrated && !data.experiment) {
      const isCurrentSeed = readString(STORAGE_SEED_KEY) === CURRENT_SEED_ID;

      if (!isCurrentSeed && !isInitialTranscriptCourses(data.officialCourses)) {
        // 该分支的真实意图：存储里的 seed 属于别的版本/外部来源时，不单方面改写它，
        // 避免本应用覆盖掉对方的数据。
        //
        // 但原来的实现只是静默 return —— 用户在这个分支下改了一晚上课程，
        // 关掉标签页全部丢失，界面上没有任何提示。这里保持「不写入」的语义不变，
        // 改为把状态暴露给界面，让用户至少知道「本次修改不会保存」。
        setPersistenceBlocked(true);
        return;
      }

      const wroteSeed = writeString(STORAGE_SEED_KEY, CURRENT_SEED_ID);
      const wroteCourses = writeJSON(STORAGE_KEY, data.officialCourses);
      setStorageBlocked(!wroteSeed || !wroteCourses);
      setPersistenceBlocked(false);
    }
  }, [data.experiment, data.officialCourses, hydrated]);

  // Recalculate GPAs when method changes
  useEffect(() => {
    if (!hydrated) return;
    const recalculate = (items: Course[]) =>
      items.map(course => ({
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

  const addCourse = useCallback(
    (
      name: string,
      credits: number,
      score: number,
      semester: string,
      type: CourseType,
      isCore: boolean
    ) => {
      const newCourse: Course = {
        id: createCourseId(),
        name,
        credits,
        score,
        semester,
        type,
        isCore,
        gpa: calculateCourseGpa(score, method),
        isActive: true,
      };
      updateWorkingCourses(prev => [...prev, newCourse]);
    },
    [method, updateWorkingCourses]
  );

  const removeCourse = useCallback(
    (id: string) => {
      updateWorkingCourses(prev => prev.filter(c => c.id !== id));
    },
    [updateWorkingCourses]
  );

  const toggleCourse = useCallback(
    (id: string) => {
      updateWorkingCourses(prev =>
        prev.map(c => (c.id === id ? { ...c, isActive: !c.isActive } : c))
      );
    },
    [updateWorkingCourses]
  );

  const updateCourse = useCallback(
    (updated: Course) => {
      updateWorkingCourses(prev =>
        prev.map(c => (c.id === updated.id ? updated : c))
      );
    },
    [updateWorkingCourses]
  );

  const saveCourse = useCallback(
    (
      id: string,
      name: string,
      credits: number,
      score: number,
      semester: string,
      type: CourseType,
      isCore: boolean
    ) => {
      updateWorkingCourses(prev =>
        prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              name,
              credits,
              score,
              semester,
              type,
              isCore,
              gpa: calculateCourseGpa(score, method),
            };
          }
          return c;
        })
      );
    },
    [method, updateWorkingCourses]
  );

  const updateCourseScore = useCallback(
    (id: string, score: number) => {
      updateWorkingCourses(prev =>
        prev.map(course =>
          course.id === id
            ? { ...course, score, gpa: calculateCourseGpa(score, method) }
            : course
        )
      );
    },
    [method, updateWorkingCourses]
  );

  const importData = useCallback(
    (importedCourses: Course[], mode: 'replace' | 'merge') => {
      const processedCourses = importedCourses.map(c => ({
        ...c,
        id: c.id || createCourseId(),
        isActive: c.isActive !== undefined ? c.isActive : true,
        semester: c.semester || '未知学期',
        type: c.type || '必修',
        isCore: c.isCore ?? false,
        gpa: calculateCourseGpa(c.score, method),
      }));

      if (mode === 'replace') {
        updateWorkingCourses(() => processedCourses);
      } else {
        const newCourses = processedCourses.map(c => ({
          ...c,
          id: createCourseId(),
        }));
        updateWorkingCourses(prev => [...prev, ...newCourses]);
      }
    },
    [method, updateWorkingCourses]
  );

  const resetData = useCallback(() => {
    if (!data.experiment) {
      remove(STORAGE_KEY);
      const wroteSeed = writeString(STORAGE_SEED_KEY, CURRENT_SEED_ID);
      if (!wroteSeed) {
        setStorageBlocked(true);
      }
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
    setData(prev =>
      prev.experiment
        ? {
            ...prev,
            experiment: {
              ...prev.experiment,
              draftCourses: cloneCourses(prev.experiment.baselineCourses),
            },
          }
        : prev
    );
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
      const existingIndex = draftCourses.findIndex(
        item => item.id === course.id
      );

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
        const insertionIndex =
          nextBaselineIndex >= 0
            ? nextBaselineIndex
            : draftCourses.reduce(
                (lastIndex, item, index) =>
                  baselineOrder.has(item.id) ? index + 1 : lastIndex,
                0
              );
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
    setData(prev => (prev.experiment ? { ...prev, experiment: null } : prev));
  }, []);

  const commitExperiment = useCallback(() => {
    setData(prev =>
      prev.experiment
        ? {
            officialCourses: cloneCourses(prev.experiment.draftCourses),
            experiment: null,
          }
        : prev
    );
  }, []);

  const setAllActive = useCallback(
    (active: boolean, filteredIds?: Set<string>) => {
      if (filteredIds) {
        updateWorkingCourses(prev =>
          prev.map(c =>
            filteredIds.has(c.id) ? { ...c, isActive: active } : c
          )
        );
      } else {
        updateWorkingCourses(prev =>
          prev.map(c => ({ ...c, isActive: active }))
        );
      }
    },
    [updateWorkingCourses]
  );

  const hasUnsavedExperimentChanges = useMemo(
    () =>
      data.experiment
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
    isSampleData,
    // 可选扩展字段：localStorage 写入失败（配额满 / 存储被禁用）时为 true。
    // 新增而非替换既有字段，App.tsx 等调用方即使不读取也能编译。
    storageBlocked,
    persistenceBlocked,
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
