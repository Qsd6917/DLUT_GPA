import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { CourseType } from '../../types';
import { CourseFilterBar } from './CourseFilterBar';

const renderFilterBar = () => {
  const Harness = () => {
    const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
    const [filterType, setFilterType] = useState<'ALL' | CourseType>('ALL');
    const [filterCore, setFilterCore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const isFiltered = selectedSemesters.length > 0 || filterType !== 'ALL' || filterCore || Boolean(searchTerm.trim());

    return (
      <LanguageProvider>
        <CourseFilterBar
          selectedSemesters={selectedSemesters}
          setSelectedSemesters={setSelectedSemesters}
          filterType={filterType}
          setFilterType={setFilterType}
          filterCore={filterCore}
          setFilterCore={setFilterCore}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          semesterOptions={['1-1', '2-2', '3-3']}
          isSandboxMode={false}
          isFiltered={isFiltered}
          onClearFilters={() => {
            setSelectedSemesters([]);
            setFilterType('ALL');
            setFilterCore(false);
            setSearchTerm('');
          }}
        />
      </LanguageProvider>
    );
  };

  return render(<Harness />);
};

describe('CourseFilterBar', () => {
  test('renders the semester dropdown through a portal and closes on escape', async () => {
    const { container } = renderFilterBar();

    fireEvent.click(screen.getByRole('button', { name: /全部学期/i }));

    const menu = await screen.findByRole('listbox', { name: '筛选学期' });

    expect(menu).toBeInTheDocument();
    expect(container.querySelector('[role="listbox"]')).toBeNull();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox', { name: '筛选学期' })).not.toBeInTheDocument();
  });

  test('keeps only one dropdown open and closes on outside click', async () => {
    renderFilterBar();

    fireEvent.click(screen.getByRole('button', { name: /全部学期/i }));
    expect(await screen.findByRole('listbox', { name: '筛选学期' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /全部类型/i }));
    expect(screen.queryByRole('listbox', { name: '筛选学期' })).not.toBeInTheDocument();
    expect(await screen.findByRole('listbox', { name: '筛选类型' })).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('listbox', { name: '筛选类型' })).not.toBeInTheDocument();
  });
});
