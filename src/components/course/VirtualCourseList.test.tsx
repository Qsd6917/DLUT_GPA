import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import VirtualCourseList from './VirtualCourseList';
import type { Course } from '../../types';

const makeCourses = (count: number): Course[] => Array.from({ length: count }, (_, index) => ({
  id: `course-${index}`,
  name: `课程 ${index + 1}`,
  credits: 2,
  score: 80,
  gpa: 3,
  isActive: true,
  semester: '1-1',
  type: '必修',
  isCore: false,
}));

const renderList = (courses: Course[], initialLanguage: 'zh' | 'en' = 'zh') => {
  const callbacks = { onRemove: vi.fn(), onEdit: vi.fn(), onToggle: vi.fn() };
  renderWithProviders(<VirtualCourseList courses={courses} {...callbacks} />, { initialLanguage });
  return callbacks;
};

describe('VirtualCourseList', () => {
  test('renders only the visible window plus overscan for 83 courses', () => {
    renderList(makeCourses(83));

    const region = screen.getByRole('region', { name: '课程列表' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(screen.getAllByRole('button', { name: /排除课程/ }).length).toBeLessThan(83);
    expect(screen.getByText('课程 1')).toBeInTheDocument();
    expect(screen.queryByText('课程 83')).not.toBeInTheDocument();
  });

  test('updates the rendered window after scrolling', async () => {
    renderList(makeCourses(83));
    const scroller = screen.getByRole('region', { name: '课程列表' });

    fireEvent.scroll(scroller, { target: { scrollTop: 4440 } });

    await waitFor(() => expect(screen.queryByText('课程 1')).not.toBeInTheDocument());
    expect(screen.getAllByRole('button', { name: /排除课程/ }).length).toBeLessThan(83);
  });

  test('forwards toggle, edit and remove actions for the selected course', () => {
    const courses = makeCourses(2);
    const callbacks = renderList(courses);

    fireEvent.click(screen.getByRole('button', { name: '排除课程：课程 1' }));
    fireEvent.click(screen.getByRole('button', { name: '编辑课程：课程 1' }));
    fireEvent.click(screen.getByRole('button', { name: '删除课程：课程 1' }));

    expect(callbacks.onToggle).toHaveBeenCalledWith('course-0');
    expect(callbacks.onEdit).toHaveBeenCalledWith(courses[0]);
    expect(callbacks.onRemove).toHaveBeenCalledWith('course-0');
  });

  test('uses course-specific English action labels', () => {
    renderList(makeCourses(1), 'en');

    expect(screen.getByRole('region', { name: 'Course list' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exclude course: 课程 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit course: 课程 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete course: 课程 1' })).toBeInTheDocument();
  });

  test('uses the minimum viewport height for empty and short lists', () => {
    const { unmount } = renderWithProviders(
      <VirtualCourseList courses={[]} onRemove={vi.fn()} onEdit={vi.fn()} onToggle={vi.fn()} />
    );
    expect(screen.getByRole('region', { name: '课程列表' })).toHaveStyle({ height: '360px' });

    unmount();
    renderList(makeCourses(2));
    expect(screen.getByRole('region', { name: '课程列表' })).toHaveStyle({ height: '360px' });
  });
});
