import { useState, useEffect, useCallback } from 'react';
import { Course, CourseType, CalculationMethod } from '../types';
import { calculateCourseGpa } from '../services/gpaService';
import { SAMPLE_COURSES, DEFAULT_CALCULATION_METHOD } from '../utils/constants';

const STORAGE_KEY = 'dlut_gpa_courses_v3';
const USER_DEFAULT_KEY = 'dlut_gpa_user_default';

export const useCourseData = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [originalCourses, setOriginalCourses] = useState<Course[]>([]);
  const [method, setMethod] = useState<CalculationMethod>(DEFAULT_CALCULATION_METHOD);

  // Initialize data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    let initialCourses: Course[] = [];

    if (savedData) {
      try {
        initialCourses = JSON.parse(savedData);
      } catch (e) {
        initialCourses = [];
      }
    }

    if (initialCourses.length === 0) {
      const userDefault = localStorage.getItem(USER_DEFAULT_KEY);
      if (userDefault) {
        try {
          initialCourses = JSON.parse(userDefault);
        } catch (e) {
          initialCourses = [];
        }
      }
      
      if (initialCourses.length === 0) {
        initialCourses = SAMPLE_COURSES.map(c => ({
          ...c,
          gpa: calculateCourseGpa(c.score, DEFAULT_CALCULATION_METHOD),
        }));
      }
    } else {
      // Migration: Ensure 'type' and 'isCore' exists
      initialCourses = initialCourses.map(c => ({
        ...c,
        type: c.type || '必修',
        isCore: c.isCore !== undefined ? c.isCore : false,
        gpa: calculateCourseGpa(c.score, DEFAULT_CALCULATION_METHOD)
      }));
    }

    setCourses(initialCourses);
    setHydrated(true);
  }, []);

  // Persist courses
  useEffect(() => {
    if (hydrated && courses.length > 0 && !isSandboxMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    }
  }, [courses, hydrated, isSandboxMode]);

  // Recalculate GPAs when method changes
  useEffect(() => {
    if (!hydrated) return;
    setCourses(prev => prev.map(c => ({
      ...c,
      gpa: calculateCourseGpa(c.score, method)
    })));
  }, [method, hydrated]);

  const addCourse = useCallback((name: string, credits: number, score: number, semester: string, type: CourseType, isCore: boolean) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name,
      credits,
      score,
      semester,
      type,
      isCore,
      gpa: calculateCourseGpa(score, method),
      isActive: true
    };
    setCourses(prev => [...prev, newCourse]);
  }, [method]);

  const removeCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  }, []);

  const toggleCourse = useCallback((id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  }, []);

  const updateCourse = useCallback((updated: Course) => {
    setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, []);

  const saveCourse = useCallback((id: string, name: string, credits: number, score: number, semester: string, type: CourseType, isCore: boolean) => {
    setCourses(prev => prev.map(c => {
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
  }, [method]);

  const importData = useCallback((importedCourses: Course[], mode: 'replace' | 'merge') => {
    const processedCourses = importedCourses.map(c => ({
      ...c,
      id: c.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      isActive: c.isActive !== undefined ? c.isActive : true,
      semester: c.semester || '未知学期',
      type: c.type || '必修',
      isCore: c.isCore || false,
      gpa: calculateCourseGpa(c.score, method)
    }));

    if (mode === 'replace') {
      setCourses(processedCourses);
    } else {
      const newCourses = processedCourses.map(c => ({ 
        ...c, 
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9) 
      }));
      setCourses(prev => [...prev, ...newCourses]);
    }
  }, [method]);

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    const defaultCourses = SAMPLE_COURSES.map(c => ({
        ...c,
        gpa: calculateCourseGpa(c.score, method),
    }));
    setCourses(defaultCourses);
  }, [method]);

  const enterSandbox = useCallback(() => {
    setOriginalCourses(JSON.parse(JSON.stringify(courses)));
    setIsSandboxMode(true);
  }, [courses]);

  const exitSandbox = useCallback((save: boolean) => {
    if (!save) {
      setCourses(originalCourses);
    }
    setIsSandboxMode(false);
    setOriginalCourses([]);
  }, [originalCourses]);

  const setAllActive = useCallback((active: boolean, filteredIds?: Set<string>) => {
    if (filteredIds) {
        setCourses(prev => prev.map(c => filteredIds.has(c.id) ? { ...c, isActive: active } : c));
    } else {
        setCourses(prev => prev.map(c => ({ ...c, isActive: active })));
    }
  }, []);

  return {
    courses,
    hydrated,
    method,
    setMethod,
    isSandboxMode,
    originalCourses,
    addCourse,
    removeCourse,
    toggleCourse,
    updateCourse,
    saveCourse,
    importData,
    resetData,
    enterSandbox,
    exitSandbox,
    setAllActive
  };
};
