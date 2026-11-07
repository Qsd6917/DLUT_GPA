import { screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { CourseList } from '../CourseList';
import type { Course } from '../../../types';

/**
 * 回归测试：历史脏数据里 `credits` / `gpa` 可能是 `null`。
 * 成因是旧版 EditCourseModal 用 `parseFloat('')` 得到 `NaN`，
 * `JSON.stringify` 把 `NaN` 落盘成 `null`，刷新后裸调 `.toFixed()` 抛
 * TypeError，整页白屏且每刷新一次崩一次。
 */

const dirtyCourse = (overrides: Partial<Course> = {}): Course => ({
  id: 'dirty-1',
  name: '脏数据课程',
  credits: null as unknown as number,
  score: 80,
  gpa: null as unknown as number,
  isActive: true,
  semester: '3-1',
  type: '必修',
  isCore: false,
  ...overrides,
});

const renderList = (courses: Course[]) =>
  renderWithProviders(
    <CourseList
      courses={courses}
      totalCourses={courses.length}
      isFiltered={false}
      onRemove={vi.fn()}
      onEdit={vi.fn()}
      onToggle={vi.fn()}
      onToggleAll={vi.fn()}
    />
  );

describe('CourseList 脏数据防御', () => {
  test('credits 为 null 时渲染占位符而不是抛错', () => {
    expect(() => renderList([dirtyCourse()])).not.toThrow();

    const row = screen.getByText('脏数据课程').closest('tr');
    expect(row).not.toBeNull();
    // 学分与绩点两列都应降级为占位符，不能是 NaN 或空白。
    expect(row).toHaveTextContent('—');
  });

  test('credits 与 gpa 为 NaN 时同样降级为占位符', () => {
    expect(() =>
      renderList([dirtyCourse({ credits: NaN, gpa: NaN, name: '坏值课程' })])
    ).not.toThrow();

    const row = screen.getByText('坏值课程').closest('tr');
    expect(row).toHaveTextContent('—');
    // 占位符必须真的替换掉 NaN，而不是把 NaN 渲染给用户看。
    expect(row).not.toHaveTextContent('NaN');
  });

  test('正常数值仍然按原格式渲染', () => {
    renderList([
      dirtyCourse({
        credits: 3,
        gpa: 3.8,
        name: '正常课程',
        score: 88,
      }),
    ]);

    const row = screen.getByText('正常课程').closest('tr');
    expect(row).toHaveTextContent('3');
    expect(row).toHaveTextContent('3.80');
  });

  test('同一列表里脏数据与正常数据混排时，正常行不受影响', () => {
    renderList([
      dirtyCourse(),
      dirtyCourse({
        id: 'clean-1',
        name: '正常课程',
        credits: 4.5,
        gpa: 4.15,
      }),
    ]);

    const dirtyRow = screen.getByText('脏数据课程').closest('tr');
    const cleanRow = screen.getByText('正常课程').closest('tr');

    expect(dirtyRow).toHaveTextContent('—');
    expect(cleanRow).toHaveTextContent('4.5');
    expect(cleanRow).toHaveTextContent('4.15');
  });

  test('表头学分合计不会被脏数据污染成 NaN', () => {
    renderList([
      dirtyCourse({ credits: null as unknown as number }),
      dirtyCourse({ id: 'clean-2', name: '正常课程', credits: 4.5, gpa: 4 }),
    ]);

    // 脏值按 0 计入合计，合计仍是可读数字，而不是 "NaN"。
    expect(screen.getByText(/已计学分 4\.5/)).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });
});

describe('VirtualCourseList 脏数据防御', () => {
  test('超过 50 门走虚拟列表时，脏数据同样降级为占位符而不抛错', () => {
    const courses = Array.from({ length: 60 }, (_, index) =>
      dirtyCourse({
        id: `virtual-${index}`,
        name: `虚拟课程 ${index + 1}`,
        credits: null as unknown as number,
        gpa: null as unknown as number,
      })
    );

    expect(() => renderList(courses)).not.toThrow();

    // 虚拟列表首屏渲染，脏值不能把整块列表打崩。
    expect(screen.getByText('虚拟课程 1')).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });
});
