import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ExperimentLab } from '../ExperimentLab';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { CalculationMethod, Course, ExperimentSession } from '../../../types';
import { calculateCourseGpa } from '../../../services/gpaService';

const course = (
  id: string,
  name: string,
  score: number,
  overrides: Partial<Course> = {}
): Course => ({
  id,
  name,
  credits: 3,
  score,
  gpa: calculateCourseGpa(score, CalculationMethod.SUBTRACTIVE),
  isActive: true,
  semester: '3-1',
  type: '必修',
  isCore: true,
  ...overrides,
});

const baseline = [
  course('control', '自动控制原理A', 80),
  course('ai', '人工智能概论', 90, {
    semester: '3-2',
    type: '选修',
    isCore: false,
  }),
  course('health', '健康教育', 75, {
    semester: '2-1',
    type: '任选',
    isCore: false,
    isActive: false,
  }),
];

const createExperiment = (draftCourses = baseline): ExperimentSession => ({
  baselineCourses: baseline.map(item => ({ ...item })),
  draftCourses: draftCourses.map(item => ({ ...item })),
});

const renderLab = (
  experiment: ExperimentSession | null,
  props: Partial<React.ComponentProps<typeof ExperimentLab>> = {}
) => {
  const handlers = {
    onStart: vi.fn(),
    onUpdateCourseScore: vi.fn(),
    onRemoveCourse: vi.fn(),
    onRestoreCourse: vi.fn(),
    onReset: vi.fn(),
    onDiscard: vi.fn(),
    onCommit: vi.fn(),
  };

  renderWithProviders(
    <ExperimentLab
      experiment={experiment}
      maximumGpa={5}
      {...handlers}
      {...props}
    />
  );

  return handlers;
};

describe('ExperimentLab', () => {
  test('inactive state only presents the start action without course controls', () => {
    const handlers = renderLab(null);

    expect(screen.getByRole('heading', { name: '成绩实验室' })).toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '开始实验' }));
    expect(handlers.onStart).toHaveBeenCalledTimes(1);
  });

  test('shows baseline and draft metrics and accepts zero from the number input and slider', () => {
    const handlers = renderLab(createExperiment());

    expect(screen.getByText('基线 GPA')).toBeInTheDocument();
    expect(screen.getByText('实验 GPA')).toBeInTheDocument();
    expect(screen.getByText('GPA 变化')).toBeInTheDocument();
    expect(screen.getByText('平均分变化')).toBeInTheDocument();
    expect(screen.getByText('学分变化')).toBeInTheDocument();
    expect(screen.getByText('改动课程')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '目标 GPA 计算器' })).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole('spinbutton', { name: '自动控制原理A 实验分数' }),
      { target: { value: '0' } }
    );
    expect(handlers.onUpdateCourseScore).toHaveBeenLastCalledWith('control', 0);

    fireEvent.change(
      screen.getByRole('slider', { name: '自动控制原理A 分数滑块' }),
      { target: { value: '64' } }
    );
    expect(handlers.onUpdateCourseScore).toHaveBeenLastCalledWith('control', 64);
  });

  test('filters by search, semester, type, core, changed state, and inclusion', () => {
    const draft = baseline.map(item =>
      item.id === 'control' ? { ...item, score: 81 } : { ...item }
    );
    renderLab(createExperiment(draft));

    expect(screen.getByText('自动控制原理A')).toBeInTheDocument();
    expect(screen.getByText('人工智能概论')).toBeInTheDocument();
    expect(screen.queryByText('健康教育')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: '仅看已改' }));
    expect(screen.getByText('自动控制原理A')).toBeInTheDocument();
    expect(screen.queryByText('人工智能概论')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: '仅看已改' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '显示未计入' }));
    expect(screen.getByText('健康教育')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('searchbox', { name: '搜索实验课程' }), {
      target: { value: '人工智能' },
    });
    expect(screen.getByText('人工智能概论')).toBeInTheDocument();
    expect(screen.queryByText('自动控制原理A')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('实验学期'), {
      target: { value: '3-1' },
    });
    expect(screen.getByText('暂无匹配课程')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('实验学期'), {
      target: { value: 'ALL' },
    });
    fireEvent.change(screen.getByRole('searchbox', { name: '搜索实验课程' }), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('实验课程类型'), {
      target: { value: '选修' },
    });
    expect(screen.getByText('人工智能概论')).toBeInTheDocument();
    expect(screen.queryByText('自动控制原理A')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('实验课程类型'), {
      target: { value: 'ALL' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: '仅核心课' }));
    expect(screen.getByText('自动控制原理A')).toBeInTheDocument();
    expect(screen.queryByText('人工智能概论')).not.toBeInTheDocument();
  });

  test('restores one changed course to its baseline snapshot', () => {
    const draft = baseline.map(item =>
      item.id === 'control' ? { ...item, score: 96 } : { ...item }
    );
    const handlers = renderLab(createExperiment(draft));

    fireEvent.click(
      screen.getByRole('button', { name: '恢复自动控制原理A' })
    );
    expect(handlers.onRestoreCourse).toHaveBeenCalledWith(baseline[0]);
  });

  test('restores added and removed courses from the changed-only view', () => {
    const addedCourse = course('added', '新增实验课', 88);
    const draft = [baseline[0], baseline[2], addedCourse];
    const handlers = renderLab(createExperiment(draft));

    fireEvent.click(screen.getByRole('checkbox', { name: '仅看已改' }));

    expect(screen.getByText('人工智能概论')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '恢复新增实验课' }));
    expect(handlers.onRemoveCourse).toHaveBeenCalledWith('added');

    fireEvent.click(screen.getByRole('button', { name: '恢复人工智能概论' }));
    expect(handlers.onRestoreCourse).toHaveBeenCalledWith(baseline[1]);
  });

  test('virtualizes a large course editor instead of mounting every slider', () => {
    const manyCourses = Array.from({ length: 83 }, (_, index) =>
      course(`course-${index}`, `课程 ${index + 1}`, 70 + (index % 20))
    );
    renderLab({
      baselineCourses: manyCourses.map(item => ({ ...item })),
      draftCourses: manyCourses.map(item => ({ ...item })),
    });

    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThan(0);
    expect(sliders.length).toBeLessThan(83);
  });
});

describe('ExperimentCommandBar', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  test('asks in an accessible dialog before discarding or applying dirty changes', () => {
    const draft = baseline.map(item =>
      item.id === 'control' ? { ...item, score: 96 } : { ...item }
    );
    const handlers = renderLab(createExperiment(draft));

    fireEvent.click(screen.getByRole('button', { name: '放弃实验' }));
    const discardDialog = screen.getByRole('dialog', { name: '放弃实验？' });
    fireEvent.click(
      screen.getByRole('button', { name: '确认放弃' })
    );
    expect(discardDialog).not.toBeInTheDocument();
    expect(handlers.onDiscard).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '应用到正式数据' }));
    expect(
      screen.getByRole('dialog', { name: '应用实验结果？' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '确认应用' }));
    expect(handlers.onCommit).toHaveBeenCalledTimes(1);
  });

  test('discards a clean experiment directly and disables apply', () => {
    const handlers = renderLab(createExperiment());

    const apply = screen.getByRole('button', { name: '应用到正式数据' });
    expect(apply).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '放弃实验' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(handlers.onDiscard).toHaveBeenCalledTimes(1);
  });

  test('traps focus, locks scrolling, closes with Escape, and restores trigger focus', async () => {
    const draft = baseline.map(item =>
      item.id === 'control' ? { ...item, score: 96 } : { ...item }
    );
    renderLab(createExperiment(draft));
    const trigger = screen.getByRole('button', { name: '放弃实验' });

    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: '放弃实验？' });
    const cancel = within(dialog).getByRole('button', { name: '取消' });
    const confirm = within(dialog).getByRole('button', { name: '确认放弃' });
    expect(confirm).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(window, { key: 'Tab' });
    expect(cancel).toHaveFocus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(confirm).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(dialog).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(document.body.style.overflow).toBe('');
  });
});
