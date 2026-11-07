import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, beforeEach, vi } from 'vitest';
import { useCourseData } from '../useCourseData';
import { CalculationMethod, Course } from '../../types';
import { compareExperimentCourses } from '../../services/experimentService';
import {
  resetSafeStorageState,
  isStorageAvailable,
} from '../../utils/safeStorage';

const STORAGE_KEY = 'dlut_gpa_courses_transcript_20260704';
const SEED_KEY = 'dlut_gpa_courses_seed';
const CURRENT_SEED = 'transcript-20260704-sample-v3';
const LEGACY_STORAGE_KEY = 'dlut_gpa_courses_v3';

const savedCourse: Course = {
  id: 'saved-1',
  name: '测试课程',
  credits: 3,
  score: 80,
  gpa: 3,
  isActive: true,
  semester: '1-1',
  type: '必修',
  isCore: false,
};

describe('useCourseData', () => {
  beforeEach(() => {
    // safeStorage 的可用性探测结果是模块级缓存，用例之间必须重置
    resetSafeStorageState();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetSafeStorageState();
  });

  test('seeds the 83-course transcript on first load', async () => {
    const { result } = renderHook(() => useCourseData());

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.courses).toHaveLength(83);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toHaveLength(
      83
    );
    expect(localStorage.getItem(SEED_KEY)).toBe(CURRENT_SEED);
  });

  test('replaces data associated with an old seed', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));
    localStorage.setItem(SEED_KEY, 'old-seed');

    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.courses).toHaveLength(83);
    expect(result.current.courses).not.toContainEqual(savedCourse);
    expect(localStorage.getItem(SEED_KEY)).toBe(CURRENT_SEED);
  });

  test('does not let the legacy storage key override the transcript baseline', async () => {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify([savedCourse]));
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.courses).toHaveLength(83);
    expect(result.current.courses).not.toContainEqual(savedCourse);
  });

  test('does not treat a modified transcript with the same summary as the seed baseline', async () => {
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.courses).toHaveLength(83));
    const storedBaseline = localStorage.getItem(STORAGE_KEY);
    const modified = {
      ...result.current.courses[20],
      name: '摘要不变但内容已修改',
    };

    localStorage.setItem(SEED_KEY, 'external-old-seed');
    act(() => result.current.updateCourse(modified));

    await waitFor(() =>
      expect(result.current.courses[20].name).toBe(modified.name)
    );
    expect(localStorage.getItem(SEED_KEY)).toBe('external-old-seed');
    expect(localStorage.getItem(STORAGE_KEY)).toBe(storedBaseline);
  });

  test('preserves edited data for the current seed', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);

    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.courses).toEqual([savedCourse]);
  });

  test('falls back to the transcript when current-seed JSON is invalid', async () => {
    localStorage.setItem(STORAGE_KEY, '{bad json');
    localStorage.setItem(SEED_KEY, CURRENT_SEED);

    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.courses).toHaveLength(83);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toHaveLength(
      83
    );
  });

  test('resetData restores and persists the transcript baseline', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.courses).toHaveLength(1));

    act(() => result.current.resetData());

    await waitFor(() => {
      expect(result.current.courses).toHaveLength(83);
      expect(
        JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      ).toHaveLength(83);
    });
  });

  test('starts an isolated experiment without overwriting persisted courses', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.courses).toHaveLength(1));

    act(() => result.current.startExperiment());
    act(() => result.current.removeCourse(savedCourse.id));

    expect(result.current.isExperimentActive).toBe(true);
    expect(result.current.experiment?.baselineCourses).toEqual([savedCourse]);
    expect(result.current.experiment?.draftCourses).toEqual([]);
    expect(result.current.courses).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([
      savedCourse,
    ]);
  });

  test('re-entering an experiment preserves its original baseline and current draft', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.startExperiment());
    act(() => result.current.updateCourseScore(savedCourse.id, 90));
    act(() => result.current.startExperiment());

    expect(result.current.experiment?.baselineCourses[0].score).toBe(80);
    expect(result.current.experiment?.draftCourses[0].score).toBe(90);
    expect(result.current.courses[0].score).toBe(90);
  });

  test('supports zero in updateCourseScore and recalculates its GPA', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.startExperiment());
    act(() => result.current.updateCourseScore(savedCourse.id, 0));

    expect(result.current.courses[0]).toMatchObject({ score: 0, gpa: 0 });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([
      savedCourse,
    ]);
  });

  test('applies all working-course mutators to the draft and discard restores official data', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    const persisted = localStorage.getItem(STORAGE_KEY);

    act(() => result.current.startExperiment());
    act(() => {
      result.current.toggleCourse(savedCourse.id);
      result.current.saveCourse(
        savedCourse.id,
        '草稿课程',
        4,
        88,
        '2-1',
        '选修',
        true
      );
      result.current.importData(
        [{ ...savedCourse, id: 'imported', name: '导入课程' }],
        'merge'
      );
      result.current.setAllActive(false);
    });

    expect(result.current.courses).toHaveLength(2);
    expect(result.current.courses[0]).toMatchObject({
      name: '草稿课程',
      credits: 4,
      score: 88,
      semester: '2-1',
      type: '选修',
      isCore: true,
      isActive: false,
    });
    expect(result.current.courses[1]).toMatchObject({
      name: '导入课程',
      isActive: false,
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBe(persisted);

    act(() => result.current.discardExperiment());

    expect(result.current.isExperimentActive).toBe(false);
    expect(result.current.experiment).toBeNull();
    expect(result.current.courses).toEqual([savedCourse]);
  });

  test('resetExperiment restores the session baseline and clears dirty leave protection', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.startExperiment());
    const cleanEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);

    act(() => result.current.removeCourse(savedCourse.id));
    const dirtyEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);

    act(() => result.current.resetExperiment());
    expect(result.current.courses).toEqual([savedCourse]);
    const resetEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(resetEvent);
    expect(resetEvent.defaultPrevented).toBe(false);
  });

  test('restores removed baseline courses in stable order and removes added draft courses', async () => {
    const secondCourse = { ...savedCourse, id: 'saved-2', name: '第二门课程' };
    const thirdCourse = { ...savedCourse, id: 'saved-3', name: '第三门课程' };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([savedCourse, secondCourse, thirdCourse])
    );
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.courses).toHaveLength(3));

    act(() => result.current.startExperiment());
    act(() => {
      result.current.removeCourse(secondCourse.id);
      result.current.addCourse('新增课程', 2, 86, '4-1', '选修', false);
    });
    const addedCourse = result.current.courses.find(
      item => item.name === '新增课程'
    );

    expect(addedCourse).toBeDefined();
    act(() => {
      result.current.removeCourse(addedCourse!.id);
      result.current.restoreExperimentCourse(secondCourse);
    });

    expect(result.current.courses.map(item => item.id)).toEqual([
      savedCourse.id,
      secondCourse.id,
      thirdCourse.id,
    ]);
    expect(
      compareExperimentCourses(
        result.current.experiment!.baselineCourses,
        result.current.experiment!.draftCourses
      ).changes
    ).toEqual([]);
  });

  test('resetData only replaces the draft while an experiment is active', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    const persisted = localStorage.getItem(STORAGE_KEY);

    act(() => result.current.startExperiment());
    act(() => result.current.resetData());

    expect(result.current.courses).toHaveLength(83);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(persisted);

    act(() => result.current.discardExperiment());
    expect(result.current.courses).toEqual([savedCourse]);
  });

  test('commitExperiment promotes and persists the draft', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.startExperiment());
    act(() => result.current.updateCourseScore(savedCourse.id, 92));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')[0].score).toBe(
      80
    );

    act(() => result.current.commitExperiment());

    expect(result.current.isExperimentActive).toBe(false);
    expect(result.current.courses[0].score).toBe(92);
    await waitFor(() => {
      expect(
        JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')[0].score
      ).toBe(92);
    });
  });

  test('recalculates official, baseline, and draft GPA on method changes without dirtying the experiment', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.startExperiment());
    act(() => result.current.setMethod(CalculationMethod.LINEAR));

    await waitFor(() => {
      expect(result.current.experiment?.baselineCourses[0].gpa).toBe(4);
      expect(result.current.experiment?.draftCourses[0].gpa).toBe(4);
    });
    const cleanEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);

    act(() => result.current.discardExperiment());
    expect(result.current.courses[0].gpa).toBe(4);
  });

  test('does not expose the legacy sandbox API', async () => {
    const { result } = renderHook(() => useCourseData());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current).not.toHaveProperty('isSandboxMode');
    expect(result.current).not.toHaveProperty('originalCourses');
    expect(result.current).not.toHaveProperty('enterSandbox');
    expect(result.current).not.toHaveProperty('exitSandbox');
  });

  test('persists an empty course list and reloads it without restoring defaults', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);

    const { result, unmount } = renderHook(() => useCourseData());

    await waitFor(() => {
      expect(result.current.hydrated).toBe(true);
      expect(result.current.courses).toHaveLength(1);
    });

    act(() => {
      result.current.removeCourse(savedCourse.id);
    });

    await waitFor(() => {
      expect(result.current.courses).toHaveLength(0);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('[]');
    });

    unmount();

    const { result: reloaded } = renderHook(() => useCourseData());

    await waitFor(() => {
      expect(reloaded.current.hydrated).toBe(true);
      expect(reloaded.current.courses).toHaveLength(0);
      expect(reloaded.current.method).toBe(CalculationMethod.SUBTRACTIVE);
    });
  });

  describe('localStorage 不可用时的降级行为', () => {
    test('首次加载读取抛 SecurityError 时仍回退到内置成绩单', async () => {
      // Safari「阻止所有 Cookie」/ 机房策略：连读都不行，应用必须还能用。
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      });

      const { result } = renderHook(() => useCourseData());

      await waitFor(() => expect(result.current.hydrated).toBe(true));
      expect(result.current.courses).toHaveLength(83);
    });

    test('写入抛 QuotaExceededError 时把 storageBlocked 暴露给 UI', async () => {
      // 先让探测通过，模拟「本来能用、后来配额满了」
      expect(isStorageAvailable()).toBe(true);
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new DOMException('quota exceeded', 'QuotaExceededError');
      });

      const { result } = renderHook(() => useCourseData());

      await waitFor(() => expect(result.current.hydrated).toBe(true));
      // 用户仍能看到数据（不因为存不下就白屏）
      expect(result.current.courses).toHaveLength(83);
      // 但失败必须可见，不能静默
      await waitFor(() => expect(result.current.storageBlocked).toBe(true));
    });

    test('正常环境写入成功时 storageBlocked 保持 false', async () => {
      const { result } = renderHook(() => useCourseData());

      await waitFor(() => expect(result.current.hydrated).toBe(true));
      expect(result.current.storageBlocked).toBe(false);
    });

    test('写入恢复后 storageBlocked 回到 false', async () => {
      expect(isStorageAvailable()).toBe(true);
      const setItemSpy = vi
        .spyOn(localStorage, 'setItem')
        .mockImplementation(() => {
          throw new DOMException('quota exceeded', 'QuotaExceededError');
        });

      const { result } = renderHook(() => useCourseData());
      await waitFor(() => expect(result.current.storageBlocked).toBe(true));

      // 用户清理了浏览器存储。注意此处走 resetData：它会重写 seed，
      // 从而让持久化 effect 重新进入可写入分支。
      // （普通编辑走不到这里——seed 缺失 + 数据非初始的分支是已知 P1-2 问题，
      //  本次任务明确不修。）
      setItemSpy.mockRestore();
      act(() => result.current.resetData());

      await waitFor(() => expect(result.current.storageBlocked).toBe(false));
      expect(
        JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      ).toHaveLength(83);
    });
  });

  // 回归：AGENTS.md 的领域规则是「通过与 0 分不计入 GPA」。
  // 原先 addCourse 无条件 isActive: true，录一门 0 分课会让 GPA 从 4.000 掉到 2.000。
  describe('新增课程的计入状态', () => {
    test('does not count a zero-score course toward GPA by default', async () => {
      const { result } = renderHook(() => useCourseData());
      await waitFor(() => expect(result.current.hydrated).toBe(true));

      act(() => {
        result.current.addCourse('缺考课程', 3, 0, '4-1', '必修', false);
      });

      const added = result.current.courses.find(c => c.name === '缺考课程');
      expect(added).toBeDefined();
      expect(added?.isActive).toBe(false);
    });

    test('counts a course with a positive score', async () => {
      const { result } = renderHook(() => useCourseData());
      await waitFor(() => expect(result.current.hydrated).toBe(true));

      act(() => {
        result.current.addCourse('正常课程', 3, 86, '4-1', '必修', false);
      });

      const added = result.current.courses.find(c => c.name === '正常课程');
      expect(added?.isActive).toBe(true);
    });
  });
});
