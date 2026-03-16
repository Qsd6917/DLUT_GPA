import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, test, beforeEach } from 'vitest';
import { useCourseData } from '../useCourseData';
import { CalculationMethod, Course } from '../../types';

const STORAGE_KEY = 'dlut_gpa_courses_v3';

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
    localStorage.clear();
  });

  test('persists an empty course list and reloads it without restoring defaults', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedCourse]));

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
});
