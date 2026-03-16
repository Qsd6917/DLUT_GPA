import { useState, useMemo, useCallback } from 'react';
import { Course, CourseType } from '../types';
import { calculateStats } from '../services/gpaService';
import { DEFAULT_SEMESTER_FILTER_OPTIONS } from '../utils/constants';

const semesterOrder = new Map<string, number>(DEFAULT_SEMESTER_FILTER_OPTIONS.map((semester, index) => [semester, index]));

const sortSemesters = (left: string, right: string) => {
  const leftOrder = semesterOrder.get(left);
  const rightOrder = semesterOrder.get(right);

  if (leftOrder !== undefined && rightOrder !== undefined) {
    return leftOrder - rightOrder;
  }

  if (leftOrder !== undefined) {
    return -1;
  }

  if (rightOrder !== undefined) {
    return 1;
  }

  return left.localeCompare(right, 'zh-CN', { numeric: true });
};

export const useCourseFilter = (courses: Course[], originalCourses: Course[], isSandboxMode: boolean) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | CourseType>('ALL');
  const [filterCore, setFilterCore] = useState(false);

  const semesters = useMemo(() => {
    const s = new Set(courses.map(c => c.semester));
    return Array.from(s).sort(sortSemesters);
  }, [courses]);

  const semesterOptions = useMemo(() => {
    const options = new Set<string>(DEFAULT_SEMESTER_FILTER_OPTIONS);

    semesters.forEach((semester) => {
      options.add(semester);
    });

    return Array.from(options).sort(sortSemesters);
  }, [semesters]);

  const filteredCourses = useMemo(() => {
    let result = courses;
    
    // Semester
    if (selectedSemesters.length > 0) {
        result = result.filter(c => selectedSemesters.includes(c.semester));
    }
    
    // Type
    if (filterType !== 'ALL') {
        result = result.filter(c => c.type === filterType);
    }
    
    // Core
    if (filterCore) {
        result = result.filter(c => c.isCore);
    }

    // Search
    if (searchTerm.trim()) {
        result = result.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    return result;
  }, [courses, searchTerm, selectedSemesters, filterType, filterCore]);

  const activeCourses = useMemo(() => filteredCourses.filter(c => c.isActive), [filteredCourses]);
  const stats = useMemo(() => calculateStats(activeCourses), [activeCourses]);
  const hasActiveFilters = Boolean(searchTerm.trim()) || selectedSemesters.length > 0 || filterType !== 'ALL' || filterCore;

  const originalStats = useMemo(() => {
      if (!isSandboxMode) return null;
      // We need to respect the current filter even for original stats to make comparison meaningful
      let filteredOriginal = originalCourses;
      
      if (selectedSemesters.length > 0) {
        filteredOriginal = filteredOriginal.filter(c => selectedSemesters.includes(c.semester));
      }
      if (filterType !== 'ALL') {
        filteredOriginal = filteredOriginal.filter(c => c.type === filterType);
      }
      if (filterCore) {
        filteredOriginal = filteredOriginal.filter(c => c.isCore);
      }
      if (searchTerm.trim()) {
        filteredOriginal = filteredOriginal.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      
      const activeOriginal = filteredOriginal.filter(c => c.isActive);
      return calculateStats(activeOriginal);
  }, [isSandboxMode, originalCourses, selectedSemesters, searchTerm, filterType, filterCore]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedSemesters([]);
    setFilterType('ALL');
    setFilterCore(false);
  }, []);

  return {
    searchTerm, setSearchTerm,
    selectedSemesters, setSelectedSemesters,
    filterType, setFilterType,
    filterCore, setFilterCore,
    semesters,
    semesterOptions,
    filteredCourses,
    activeCourses,
    stats,
    originalStats,
    clearFilters,
    hasActiveFilters,
  };
};
