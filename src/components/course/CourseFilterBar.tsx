import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, Check, Book, Star, Search } from 'lucide-react';
import { CourseType } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import useDebounce from '../../hooks/useDebounce';

interface CourseFilterBarProps {
  selectedSemesters: string[];
  setSelectedSemesters: React.Dispatch<React.SetStateAction<string[]>>;
  filterType: 'ALL' | CourseType;
  setFilterType: React.Dispatch<React.SetStateAction<'ALL' | CourseType>>;
  filterCore: boolean;
  setFilterCore: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;  // 当前显示的搜索词
  onSearchChange: (searchTerm: string) => void;  // 处理搜索词变更
  semesters: string[];
  isSandboxMode: boolean;
}

export const CourseFilterBar: React.FC<CourseFilterBarProps> = ({
  selectedSemesters,
  setSelectedSemesters,
  filterType,
  setFilterType,
  filterCore,
  setFilterCore,
  searchTerm,
  onSearchChange,
  semesters,
  isSandboxMode,
}) => {
  const { t } = useTranslation();
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [isTypeFilterDropdownOpen, setIsTypeFilterDropdownOpen] = useState(false);
  const typeFilterRef = useRef<HTMLDivElement>(null);

  // 使用防抖的搜索词
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (typeFilterRef.current && !typeFilterRef.current.contains(event.target as Node)) {
        setIsTypeFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSemester = (sem: string) => {
    if (selectedSemesters.includes(sem)) {
      setSelectedSemesters(prev => prev.filter(s => s !== sem));
    } else {
      setSelectedSemesters(prev => [...prev, sem]);
    }
  };

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl shadow-soft border relative z-20 transition-all hover:shadow-md ${isSandboxMode ? 'bg-amber-50 border-amber-200' : 'bg-surface border-primary/10'}`}>

        <div className="flex flex-wrap items-center gap-3">
            {/* Semester Filter */}
            <div className="relative" ref={filterRef}>
                <button
                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 text-sm font-semibold shadow-sm ${isSandboxMode ? 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100' : 'bg-background hover:bg-surface border-primary/20 hover:border-primary hover:text-primary text-main'}`}
                >
                    <Filter size={15} />
                    <span>
                        {selectedSemesters.length === 0
                            ? t('all_semesters')
                            : t('selected_semesters', selectedSemesters.length)}
                    </span>
                    <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-surface rounded-2xl shadow-xl border border-primary/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                        <div className="px-3 py-2 text-xs font-bold text-muted uppercase tracking-wider">{t('filter_semester')}</div>
                        <div
                            onClick={() => setSelectedSemesters([])}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm mb-1 transition-colors ${selectedSemesters.length === 0 ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-background text-main'}`}
                        >
                            <span>{t('all_semesters')}</span>
                            {selectedSemesters.length === 0 && <Check size={16} />}
                        </div>
                        <div className="h-px bg-primary/10 my-1"></div>
                        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                            {semesters.map(sem => (
                                <div
                                    key={sem}
                                    onClick={() => toggleSemester(sem)}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm mb-1 transition-colors ${selectedSemesters.includes(sem) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-background text-main'}`}
                                >
                                    <span className="truncate">{sem}</span>
                                    {selectedSemesters.includes(sem) && <Check size={16} />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Type Filter */}
            <div className="relative" ref={typeFilterRef}>
                 <button
                    onClick={() => setIsTypeFilterDropdownOpen(!isTypeFilterDropdownOpen)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 text-sm font-semibold shadow-sm ${isSandboxMode ? 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100' : 'bg-background hover:bg-surface border-primary/20 hover:border-primary hover:text-primary text-main'}`}
                >
                    <Book size={15} />
                    <span>
                        {filterType === 'ALL' ? t('all_types') : t(`type_${filterType === '必修' ? 'compulsory' : filterType === '选修' ? 'elective' : 'optional'}` as any)}
                    </span>
                    <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${isTypeFilterDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isTypeFilterDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-40 bg-surface rounded-2xl shadow-xl border border-primary/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                        <div className="px-3 py-2 text-xs font-bold text-muted uppercase tracking-wider">{t('filter_type')}</div>
                        {['ALL', '必修', '选修', '任选'].map((type) => (
                            <div
                                key={type}
                                onClick={() => {
                                    setFilterType(type as any);
                                    setIsTypeFilterDropdownOpen(false);
                                }}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm mb-1 transition-colors ${filterType === type ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-background text-main'}`}
                            >
                                <span>{type === 'ALL' ? t('all_types') : t(`type_${type === '必修' ? 'compulsory' : type === '选修' ? 'elective' : 'optional'}` as any)}</span>
                                {filterType === type && <Check size={16} />}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Core Filter Toggle */}
            <button
                onClick={() => setFilterCore(!filterCore)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 text-sm font-semibold shadow-sm ${
                    filterCore
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-700 ring-1 ring-yellow-200'
                        : isSandboxMode
                            ? 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100'
                            : 'bg-background hover:bg-surface border-primary/20 hover:border-yellow-300 hover:text-yellow-600 text-main'
                }`}
            >
                <Star size={15} className={filterCore ? 'fill-yellow-600' : ''} />
                <span>{t('core_only')}</span>
            </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
                <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}  // 使用新的回调函数
                    className="pl-10 pr-4 py-2.5 text-sm border border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary w-full transition-all bg-background focus:bg-surface text-main placeholder:text-muted"
                />
                {/* 显示使用防抖值的指示器 */}
                {debouncedSearchTerm !== searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted">
                    搜索中...
                  </div>
                )}
            </div>
        </div>
    </div>
  );
};
