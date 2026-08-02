import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import App from './App';
import { renderWithProviders } from '../test/renderWithProviders';

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [false, vi.fn()],
    needRefresh: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

const renderApp = () => renderWithProviders(<App />);

const STORAGE_KEY = 'dlut_gpa_courses_transcript_20260704';
const SEED_KEY = 'dlut_gpa_courses_seed';
const CURRENT_SEED = 'transcript-20260704-qian-dayu-v2';

const expectBefore = (earlier: HTMLElement, later: HTMLElement) => {
  expect(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
};

describe('App shell', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test(
    'opens on overview and supports section navigation',
    async () => {
    renderApp();

    expect(screen.getByRole('button', { name: '总览' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: '课程' }));
    expect(screen.getByRole('button', { name: '新建课程' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '分析' }));
    expect(screen.getByRole('tab', { name: /总览分析/ })).toHaveAttribute('aria-selected', 'true');
    },
    15000
  );

  test('exposes one accessible primary navigation control per section', () => {
    renderApp();

    expect(screen.getAllByRole('button', { name: '总览' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: '课程' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: '分析' })).toHaveLength(1);
  });

  test('renders core metrics before distribution, trend, and target GPA sections in DOM order', async () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: '分析' }));
    const analysis = screen.getByRole('region', { name: '学业数据分析' });
    const scopeHeading = within(analysis).getByText('当前计入 GPA');
    const weightedGpa = within(analysis).getByText('加权 GPA');
    expect(within(analysis).getByText('加权平均分')).toBeInTheDocument();
    expect(within(analysis).getAllByText('已计入学分').length).toBeGreaterThan(0);
    expect(within(analysis).getByText('计入课程数')).toBeInTheDocument();

    const distribution = await within(analysis).findByRole('heading', { name: '成绩分布' });
    const trend = await within(analysis).findByRole('heading', { name: '学期趋势' });
    const targetGpa = await within(analysis).findByRole('heading', { name: '目标 GPA 计算器' });

    expectBefore(scopeHeading, weightedGpa);
    expectBefore(weightedGpa, distribution);
    expectBefore(weightedGpa, trend);
    expectBefore(distribution, targetGpa);
    expectBefore(trend, targetGpa);
  }, 15000);

  test('starts an experiment from the header and navigates to the experiment analysis view', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: '开始实验' }));

    const analysis = screen.getByRole('region', { name: '学业数据分析' });
    expect(within(analysis).getByRole('tab', { name: /成绩实验/ })).toHaveAttribute('aria-selected', 'true');
    expect(await within(analysis).findByRole('heading', { name: '成绩实验室' })).toBeInTheDocument();
  }, 15000);

  test('shares the working draft and marks it as an experiment plan', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: '开始实验' }));

    const [scoreInput] = await screen.findAllByRole('spinbutton', {
      name: /实验分数/,
    });
    fireEvent.change(scoreInput, { target: { value: '100' } });

    const pageGpa = screen
      .getByText('实验 GPA')
      .parentElement?.querySelector('.figure-value')?.textContent;

    fireEvent.click(screen.getByRole('button', { name: '分享报告' }));

    const report = await screen.findByRole('dialog', { name: '成绩报告' });
    expect(within(report).getByText('实验方案')).toBeInTheDocument();
    expect(within(report).getAllByText('DLUT 5.0').length).toBeGreaterThan(0);
    expect(within(report).getByText(pageGpa ?? '')).toHaveClass(
      'report-value'
    );
  }, 15000);

  test('discards an experiment back to official data and commits an experiment after confirmation', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: '开始实验' }));
    const [firstInput] = await screen.findAllByRole('spinbutton', { name: /实验分数/ });
    const officialScore = firstInput.getAttribute('value');
    fireEvent.change(firstInput, { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: '放弃实验' }));
    fireEvent.click(screen.getByRole('button', { name: '确认放弃' }));
    expect(screen.queryByRole('heading', { name: '成绩实验室' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '开始实验' }));
    const [restartedInput] = await screen.findAllByRole('spinbutton', { name: /实验分数/ });
    expect(restartedInput).toHaveValue(Number(officialScore));
    fireEvent.change(restartedInput, { target: { value: '99' } });
    fireEvent.click(screen.getByRole('button', { name: '应用到正式数据' }));
    fireEvent.click(screen.getByRole('button', { name: '确认应用' }));

    fireEvent.click(screen.getByRole('button', { name: '开始实验' }));
    expect((await screen.findAllByRole('spinbutton', { name: /实验分数/ }))[0]).toHaveValue(99);
  }, 15000);

  test('explains an empty active-course state without rendering analysis charts', async () => {
    localStorage.setItem(STORAGE_KEY, '[]');
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: '分析' }));
    const analysis = screen.getByRole('region', { name: '学业数据分析' });

    expect(within(analysis).getByRole('heading', { name: '暂无可分析课程' })).toBeInTheDocument();
    expect(within(analysis).getByText('请先添加课程或将课程设为计入 GPA。')).toBeInTheDocument();
    expect(within(analysis).queryByRole('heading', { name: '成绩分布' })).not.toBeInTheDocument();
    expect(within(analysis).queryByRole('heading', { name: '学期趋势' })).not.toBeInTheDocument();
    expect(within(analysis).queryByRole('table', { name: '成绩分布数据' })).not.toBeInTheDocument();
    expect(within(analysis).queryByRole('table', { name: '学期趋势数据' })).not.toBeInTheDocument();
  }, 15000);

  test(
    'opens and closes the course entry drawer from the courses section',
    () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: '课程' }));
    fireEvent.click(screen.getByRole('button', { name: '新建课程' }));

    expect(screen.getByRole('dialog', { name: '新建课程' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '新建课程' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: '新建课程' })).not.toBeInTheDocument();
    },
    15000
  );

  test(
    'filters courses by semester and type, then restores the full list after clearing filters',
    async () => {
      renderApp();

      fireEvent.click(screen.getByRole('button', { name: '课程' }));

      fireEvent.click(screen.getAllByRole('button', { name: /全部学期/i })[0]);
      fireEvent.click(await screen.findByRole('option', { name: '2-2' }));

      expect(await screen.findByText('程序设计基础A课程设计')).toBeInTheDocument();
      expect(screen.queryByText('健康教育')).not.toBeInTheDocument();

      fireEvent.click(screen.getAllByRole('button', { name: /全部类型/i })[0]);
      fireEvent.click(await screen.findByRole('option', { name: '必修' }));

      expect(screen.getByText('程序设计基础A课程设计')).toBeInTheDocument();
      expect(screen.queryByText('人工智能概论')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '清除筛选' }));
      expect(await screen.findByText('健康教育')).toBeInTheDocument();
    },
    15000
  );

  test(
    'shows a filtered empty state and clears back to the course list',
    async () => {
      renderApp();

      fireEvent.click(screen.getByRole('button', { name: '课程' }));
      fireEvent.click(screen.getAllByRole('button', { name: /全部学期/i })[0]);
      fireEvent.click(await screen.findByRole('option', { name: '3-3' }));

      expect(await screen.findByText('暂无匹配课程')).toBeInTheDocument();
      expect(screen.getByText('当前筛选条件下没有课程，尝试清除筛选或切换其他条件。')).toBeInTheDocument();

      const emptyState = screen.getByText('暂无匹配课程').closest('section') as HTMLElement;
      fireEvent.click(within(emptyState).getByRole('button', { name: '清除筛选' }));
      expect(await screen.findByText('健康教育')).toBeInTheDocument();
    },
    15000
  );
});
