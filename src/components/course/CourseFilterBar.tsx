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
  const { t, language } = useTranslation();
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const selectedSemester = selectedSemesters[0] ?? 'ALL';

  const semesterDropdownOptions = useMemo<FilterDropdownOption[]>(
    () => [
      { value: 'ALL', label: t('all_semesters') },
      ...semesterOptions.map(semester => ({
        value: semester,
        label: semester,
      })),
    ],
    [semesterOptions, t]
  );

  const typeDropdownOptions = useMemo<FilterDropdownOption[]>(
    () =>
      TYPE_OPTIONS.map(type => ({
        value: type,
        label:
          type === 'ALL'
            ? t('all_types')
            : t(
                `type_${type === '必修' ? 'compulsory' : type === '选修' ? 'elective' : 'optional'}`
              ),
      })),
    [t]
  );

  const selectedTypeLabel =
    filterType === 'ALL'
      ? t('all_types')
      : t(
          `type_${filterType === '必修' ? 'compulsory' : filterType === '选修' ? 'elective' : 'optional'}`
        );

  const buttonTone = isSandboxMode
    ? 'border-amber-400/30 text-[hsl(var(--color-accent))]'
    : 'border-primary/10 text-main';
  const baseButton = `inline-flex h-11 items-center gap-2 rounded-[0.82rem] border bg-surface px-3.5 text-sm font-semibold transition-colors hover:border-primary/20 hover:text-primary dark:bg-[hsl(var(--surface-2))] ${buttonTone}`;

  return (
    <section className="paper-panel filter-toolbar-panel p-4">
      <div className="relative z-20 flex flex-col gap-3">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="relative order-1 w-full">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              size={16}
            />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={event => onSearchChange(event.target.value)}
              className="w-full rounded-[0.9rem] border border-primary/10 bg-[hsl(var(--surface-2))] py-3 pl-11 pr-12 text-sm text-main outline-none transition-all placeholder:text-muted focus:border-primary focus:bg-surface"
            />
            {debouncedSearchTerm !== searchTerm ? (
              <span className="type-label absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted">
                {language === 'zh' ? '同步中' : 'Sync'}
              </span>
            ) : null}
          </div>

          <div className="order-2 flex flex-wrap items-center gap-2 xl:justify-end">
            <FilterDropdown
              icon={<Filter size={15} />}
              label={
                selectedSemester === 'ALL'
                  ? t('all_semesters')
                  : selectedSemester
              }
              menuLabel={t('filter_semester')}
              options={semesterDropdownOptions}
              selectedValue={selectedSemester}
              isOpen={openDropdown === 'semester'}
              onOpenChange={open => setOpenDropdown(open ? 'semester' : null)}
              onSelect={value =>
                setSelectedSemesters(value === 'ALL' ? [] : [value])
              }
              triggerClassName={baseButton}
              menuWidth={240}
            />

            <FilterDropdown
              icon={<Book size={15} />}
              label={selectedTypeLabel}
              menuLabel={t('filter_type')}
              options={typeDropdownOptions}
              selectedValue={filterType}
              isOpen={openDropdown === 'type'}
              onOpenChange={open => setOpenDropdown(open ? 'type' : null)}
              onSelect={value => setFilterType(value as 'ALL' | CourseType)}
              triggerClassName={baseButton}
              menuWidth={220}
            />

            <button
              type="button"
              onClick={() => setFilterCore(value => !value)}
              className={`inline-flex h-11 items-center gap-2 rounded-[0.82rem] border bg-surface px-3.5 text-sm font-semibold transition-colors hover:border-primary/20 dark:bg-[hsl(var(--surface-2))] ${
                filterCore
                  ? 'border-amber-400/30 text-[hsl(var(--color-accent))]'
                  : 'border-primary/10 text-main'
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
                className="inline-flex h-11 items-center gap-2 rounded-[0.82rem] border border-primary/10 bg-surface px-3.5 text-sm font-semibold text-muted transition-colors hover:border-primary/20 hover:text-primary dark:bg-[hsl(var(--surface-2))]"
              >
                <X size={15} />
                <span>{t('clear_filters')}</span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-primary/10 pt-3 text-sm text-muted">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {language === 'zh' ? '筛选状态' : 'Filters'}
          </span>
          <span className="status-chip">
            {selectedSemester === 'ALL' ? t('all_semesters') : selectedSemester}
          </span>
          <span className="status-chip">{selectedTypeLabel}</span>
          {filterCore ? (
            <span className="status-chip">{t('core_only')}</span>
          ) : null}
          {searchTerm.trim() ? (
            <span className="status-chip">
              {language === 'zh'
                ? `搜索：${searchTerm.trim()}`
                : `Search: ${searchTerm.trim()}`}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
};
