import React, { useEffect, useRef, useState } from 'react';
import { Book, Check, ChevronDown, Filter, Search, Star } from 'lucide-react';
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
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
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
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const semesterRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (semesterRef.current && !semesterRef.current.contains(event.target as Node)) {
        setIsSemesterOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSemester = (semester: string) => {
    if (selectedSemesters.includes(semester)) {
      setSelectedSemesters((prev) => prev.filter((item) => item !== semester));
    } else {
      setSelectedSemesters((prev) => [...prev, semester]);
    }
  };

  const buttonTone = isSandboxMode
    ? 'border-amber-400/30 bg-amber-500/10 text-amber-100 hover:border-amber-300/40'
    : 'border-primary/15 bg-background/55 text-main hover:border-primary/35 hover:text-primary';
  const baseButton = `inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${buttonTone}`;

  return (
    <section className="paper-panel overflow-visible p-4">
      <div className="relative z-20 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative" ref={semesterRef}>
            <button type="button" onClick={() => setIsSemesterOpen((value) => !value)} className={baseButton}>
              <Filter size={15} />
              <span>
                {selectedSemesters.length === 0 ? t('all_semesters') : t('selected_semesters', selectedSemesters.length)}
              </span>
              <ChevronDown size={14} className={`transition-transform ${isSemesterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSemesterOpen ? (
              <div className="paper-panel absolute left-0 top-full mt-3 w-72 p-2">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted">{t('filter_semester')}</div>
                <button
                  type="button"
                  onClick={() => setSelectedSemesters([])}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm ${
                    selectedSemesters.length === 0 ? 'bg-primary/12 font-semibold text-primary' : 'hover:bg-background/60'
                  }`}
                >
                  <span>{t('all_semesters')}</span>
                  {selectedSemesters.length === 0 ? <Check size={15} /> : null}
                </button>
                <div className="my-2 h-px bg-primary/10" />
                <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                  {semesters.map((semester) => (
                    <button
                      key={semester}
                      type="button"
                      onClick={() => toggleSemester(semester)}
                      className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm ${
                        selectedSemesters.includes(semester) ? 'bg-primary/12 font-medium text-primary' : 'hover:bg-background/60'
                      }`}
                    >
                      <span>{semester}</span>
                      {selectedSemesters.includes(semester) ? <Check size={15} /> : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative" ref={typeRef}>
            <button type="button" onClick={() => setIsTypeOpen((value) => !value)} className={baseButton}>
              <Book size={15} />
              <span>
                {filterType === 'ALL'
                  ? t('all_types')
                  : t(`type_${filterType === '必修' ? 'compulsory' : filterType === '选修' ? 'elective' : 'optional'}`)}
              </span>
              <ChevronDown size={14} className={`transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTypeOpen ? (
              <div className="paper-panel absolute left-0 top-full mt-3 w-44 p-2">
                {['ALL', '必修', '选修', '任选'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFilterType(type as 'ALL' | CourseType);
                      setIsTypeOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm ${
                      filterType === type ? 'bg-primary/12 font-semibold text-primary' : 'hover:bg-background/60'
                    }`}
                  >
                    <span>
                      {type === 'ALL'
                        ? t('all_types')
                        : t(`type_${type === '必修' ? 'compulsory' : type === '选修' ? 'elective' : 'optional'}`)}
                    </span>
                    {filterType === type ? <Check size={15} /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setFilterCore((value) => !value)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
              filterCore
                ? 'border-amber-400/30 bg-amber-500/10 text-amber-100'
                : buttonTone
            }`}
          >
            <Star size={15} className={filterCore ? 'fill-current' : ''} />
            <span>{t('core_only')}</span>
          </button>
        </div>

        <div className="relative w-full xl:w-[22rem]">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-full border border-primary/15 bg-background/55 py-3 pl-11 pr-12 text-sm text-main outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          {debouncedSearchTerm !== searchTerm ? (
            <span className="data-figure absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted">SYNC</span>
          ) : null}
        </div>
      </div>
    </section>
  );
};
