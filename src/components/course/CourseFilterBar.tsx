import React, { useMemo, useState } from 'react';
import { Book, Filter, Search, Star, X } from 'lucide-react';
import { CourseType } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import useDebounce from '../../hooks/useDebounce';
import { FilterDropdown, FilterDropdownOption } from '../common/FilterDropdown';

interface CourseFilterBarProps {
  selectedSemesters: string[];
  setSelectedSemesters: React.Dispatch<React.SetStateAction<string[]>>;
  filterType: 'ALL' | CourseType;
  setFilterType: React.Dispatch<React.SetStateAction<'ALL' | CourseType>>;
  filterCore: boolean;
  setFilterCore: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  semesterOptions: string[];
  isSandboxMode: boolean;
  isFiltered: boolean;
  onClearFilters: () => void;
}

type OpenDropdown = 'semester' | 'type' | null;

const TYPE_OPTIONS = ['ALL', '必修', '选修', '任选'] as const;

export const CourseFilterBar: React.FC<CourseFilterBarProps> = ({
  selectedSemesters,
  setSelectedSemesters,
  filterType,
  setFilterType,
  filterCore,
  setFilterCore,
  searchTerm,
  onSearchChange,
  semesterOptions,
  isSandboxMode,
  isFiltered,
  onClearFilters,
}) => {
  const { t } = useTranslation();
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const selectedSemester = selectedSemesters[0] ?? 'ALL';

  const semesterDropdownOptions = useMemo<FilterDropdownOption[]>(
    () => [
      { value: 'ALL', label: t('all_semesters') },
      ...semesterOptions.map((semester) => ({ value: semester, label: semester })),
    ],
    [semesterOptions, t]
  );

  const typeDropdownOptions = useMemo<FilterDropdownOption[]>(
    () =>
      TYPE_OPTIONS.map((type) => ({
        value: type,
        label:
          type === 'ALL'
            ? t('all_types')
            : t(`type_${type === '必修' ? 'compulsory' : type === '选修' ? 'elective' : 'optional'}`),
      })),
    [t]
  );

  const buttonTone = isSandboxMode
    ? 'border-amber-400/30 bg-amber-500/10 text-amber-100 hover:border-amber-300/40'
    : 'border-primary/15 bg-background/55 text-main hover:border-primary/35 hover:text-primary';
  const baseButton = `inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${buttonTone}`;
  const selectedTypeLabel =
    filterType === 'ALL'
      ? t('all_types')
      : t(`type_${filterType === '必修' ? 'compulsory' : filterType === '选修' ? 'elective' : 'optional'}`);

  return (
    <section className="paper-panel filter-toolbar-panel p-4 sm:p-5">
      <div className="relative z-20 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            icon={<Filter size={15} />}
            label={selectedSemester === 'ALL' ? t('all_semesters') : selectedSemester}
            menuLabel={t('filter_semester')}
            options={semesterDropdownOptions}
            selectedValue={selectedSemester}
            isOpen={openDropdown === 'semester'}
            onOpenChange={(open) => setOpenDropdown(open ? 'semester' : null)}
            onSelect={(value) => setSelectedSemesters(value === 'ALL' ? [] : [value])}
            triggerClassName={baseButton}
            menuWidth={280}
          />

          <FilterDropdown
            icon={<Book size={15} />}
            label={selectedTypeLabel}
            menuLabel={t('filter_type')}
            options={typeDropdownOptions}
            selectedValue={filterType}
            isOpen={openDropdown === 'type'}
            onOpenChange={(open) => setOpenDropdown(open ? 'type' : null)}
            onSelect={(value) => setFilterType(value as 'ALL' | CourseType)}
            triggerClassName={baseButton}
            menuWidth={220}
          />

          <button
            type="button"
            onClick={() => setFilterCore((value) => !value)}
            className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
              filterCore
                ? 'border-amber-400/30 bg-amber-500/10 text-amber-100'
                : buttonTone
            }`}
            aria-pressed={filterCore}
          >
            <Star size={15} className={filterCore ? 'fill-current' : ''} />
            <span>{t('core_only')}</span>
          </button>

          {isFiltered ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-muted transition-colors hover:border-primary/20 hover:text-primary"
            >
              <X size={15} />
              <span>{t('clear_filters')}</span>
            </button>
          ) : null}
        </div>

        <div className="relative w-full xl:w-[22rem]">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-full border border-primary/15 bg-background/55 py-3 pl-11 pr-12 text-sm text-main outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          {debouncedSearchTerm !== searchTerm ? (
            <span className="type-label absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted">SYNC</span>
          ) : null}
        </div>
      </div>
    </section>
  );
};
