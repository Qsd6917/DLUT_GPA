import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const getActivePlannerPanel = () => {
  const planner = screen
    .getByRole('heading', { name: '目标成绩规划' })
    .closest('section');
  expect(planner).toBeInTheDocument();
  return within(planner as HTMLElement).getByRole('tabpanel');
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

  test('shows WES as a 4.0 scale on the page and in the shared report', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'DLUT 5.0' }));
    const methodOptions = within(
      screen.getByRole('listbox', { name: 'GPA 算法' })
    ).getAllByRole('option');
    const wesOption = methodOptions.find(option =>
      option.textContent?.startsWith('WES ')
    );
    expect(wesOption).toBeDefined();
    fireEvent.click(wesOption as HTMLElement);

    const visibleWesLabels = screen.getAllByText(/^WES /);
    expect(visibleWesLabels.length).toBeGreaterThanOrEqual(2);
    visibleWesLabels.forEach(label => {
      expect(label).toHaveTextContent(/^WES 4\.0$/);
    });
    expect(screen.queryAllByText('WES 5.0')).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: '分享报告' }));

    const report = await screen.findByRole('dialog', { name: '成绩报告' });
    expect(within(report).getAllByText('WES 4.0').length).toBeGreaterThan(0);
    expect(within(report).queryAllByText('WES 5.0')).toHaveLength(0);
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
    const targetGpa = await within(analysis).findByRole('heading', { name: '目标成绩规划' });

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
    expect(
      await within(analysis).findByRole(
        'heading',
        { name: '成绩实验室' },
        { timeout: 5000 }
      )
    ).toBeInTheDocument();
    const overviewPanel = document.getElementById('analysis-panel-overview');
    const experimentPanel = document.getElementById(
      'analysis-panel-experiment'
    );
    expect(overviewPanel).toBeInTheDocument();
    expect(experimentPanel).toBeInTheDocument();
    expect(
      within(overviewPanel as HTMLElement).queryAllByRole('heading', {
        name: '目标成绩规划',
        hidden: true,
      })
    ).toHaveLength(0);
    expect(
      within(overviewPanel as HTMLElement).queryAllByRole('heading', {
        name: '成绩分布',
        hidden: true,
      })
    ).toHaveLength(0);
    expect(
      within(overviewPanel as HTMLElement).queryAllByRole('heading', {
        name: '学期趋势',
        hidden: true,
      })
    ).toHaveLength(0);
    expect(
      within(experimentPanel as HTMLElement).getByRole('heading', {
        name: '目标成绩规划',
      })
    ).toBeInTheDocument();
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

  test('keeps the planner baseline independent from semester filters', async () => {
    const courses = [
      {
        id: 'planner-low',
        name: '规划样例低分课',
        credits: 3,
        score: 70,
        gpa: 2,
        isActive: true,
        semester: '1-1',
        type: '必修',
        isCore: false,
      },
      {
        id: 'planner-high',
        name: '规划样例高分课',
        credits: 3,
        score: 90,
        gpa: 4,
        isActive: true,
        semester: '2-2',
        type: '必修',
        isCore: false,
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: '分析' }));
    expect(await screen.findByLabelText('规划基线当前 GPA')).toHaveTextContent('3.000');

    fireEvent.click(screen.getByRole('button', { name: '课程' }));
    fireEvent.click(screen.getAllByRole('button', { name: /全部学期/i })[0]);
    fireEvent.click(await screen.findByRole('option', { name: '1-1' }));
    fireEvent.click(screen.getByRole('button', { name: '分析' }));

    expect(await screen.findByLabelText('规划基线当前 GPA')).toHaveTextContent('3.000');
  }, 15000);

  test('keeps the planner visible with the overall baseline when filters match no courses', async () => {
    const courses = [
      {
        id: 'planner-empty-filter-low',
        name: '规划样例低分课',
        credits: 3,
        score: 70,
        gpa: 2,
        isActive: true,
        semester: '1-1',
        type: '必修',
        isCore: false,
      },
      {
        id: 'planner-empty-filter-high',
        name: '规划样例高分课',
        credits: 3,
        score: 90,
        gpa: 4,
        isActive: true,
        semester: '2-2',
        type: '必修',
        isCore: false,
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: '课程' }));
    fireEvent.click(screen.getAllByRole('button', { name: /全部学期/i })[0]);
    fireEvent.click(await screen.findByRole('option', { name: '3-3' }));
    fireEvent.click(screen.getByRole('button', { name: '分析' }));

    const analysis = screen.getByRole('region', { name: '学业数据分析' });
    expect(
      within(analysis).getByRole('heading', { name: '暂无可分析课程' })
    ).toBeInTheDocument();
    expect(
      await within(analysis).findByRole('heading', { name: '目标成绩规划' })
    ).toBeInTheDocument();
    expect(within(analysis).getByLabelText('规划基线当前 GPA')).toHaveTextContent(
      '3.000'
    );
    expect(
      within(analysis).queryByRole('heading', { name: '成绩分布' })
    ).not.toBeInTheDocument();
    expect(
      within(analysis).queryByRole('heading', { name: '学期趋势' })
    ).not.toBeInTheDocument();
  }, 15000);

  test('keeps every analysis tab target mounted while loading only the active non-overview view', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: '分析' }));

    const analysis = screen.getByRole('region', { name: '学业数据分析' });
    const tabs = within(analysis)
      .getAllByRole('tab')
      .filter(tab =>
        tab.getAttribute('aria-controls')?.startsWith('analysis-panel-')
      );
    expect(tabs).toHaveLength(4);
    for (const tab of tabs) {
      const panelId = tab.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      expect(document.getElementById(panelId ?? '')).toBeInTheDocument();
    }

    const overviewPanel = document.getElementById('analysis-panel-overview');
    const radarPanel = document.getElementById('analysis-panel-radar');
    expect(overviewPanel).not.toHaveAttribute('hidden');
    expect(radarPanel).toHaveAttribute('hidden');

    await user.click(within(analysis).getByRole('tab', { name: /学业雷达/ }));
    expect(overviewPanel).toHaveAttribute('hidden');
    expect(radarPanel).not.toHaveAttribute('hidden');
  }, 15000);

  test('preserves planner edits while visiting radar, advisor, and experiment views', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: '分析' }));
    await screen.findByRole('heading', { name: '目标成绩规划' });
    fireEvent.change(within(getActivePlannerPanel()).getByLabelText('目标 GPA'), {
      target: { value: '4.2' },
    });
    await user.click(screen.getByRole('button', { name: '添加未来课程' }));
    fireEvent.change(screen.getByLabelText('未来课程 2 名称'), {
      target: { value: '高等代数进阶' },
    });
    await user.click(
      screen.getByRole('radio', { name: '未来课程 2 固定分数' })
    );
    fireEvent.change(screen.getByLabelText('未来课程 2 固定分数值'), {
      target: { value: '96' },
    });

    const analysis = screen.getByRole('region', { name: '学业数据分析' });
    for (const tabName of [/学业雷达/, /智能建议/, /成绩实验/]) {
      await user.click(within(analysis).getByRole('tab', { name: tabName }));
      await user.click(
        within(analysis).getByRole('tab', { name: /总览分析/ })
      );

      expect(
        within(getActivePlannerPanel()).getByLabelText('目标 GPA')
      ).toHaveValue(4.2);
      expect(screen.getByLabelText('未来课程 2 名称')).toHaveValue(
        '高等代数进阶'
      );
      expect(screen.getByLabelText('未来课程 2 固定分数值')).toHaveValue(96);
    }
  }, 15000);

  test('keeps planner edits in component memory without changing saved courses', async () => {
    const courses = [
      {
        id: 'planner-storage',
        name: '正式课程',
        credits: 3,
        score: 90,
        gpa: 4,
        isActive: true,
        semester: '1-1',
        type: '必修',
        isCore: false,
      },
    ];
    const savedCourses = JSON.stringify(courses);
    localStorage.setItem(STORAGE_KEY, savedCourses);
    localStorage.setItem(SEED_KEY, CURRENT_SEED);
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: '分析' }));
    await screen.findByRole('heading', { name: '目标成绩规划' });
    fireEvent.change(within(getActivePlannerPanel()).getByLabelText('目标 GPA'), {
      target: { value: '4.2' },
    });
    fireEvent.click(screen.getByRole('button', { name: '添加未来课程' }));
    fireEvent.change(screen.getByLabelText('未来课程 2 名称'), {
      target: { value: '只存在于规划器' },
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBe(savedCourses);
    fireEvent.click(screen.getByRole('button', { name: '课程' }));
    expect(await screen.findByText('正式课程')).toBeInTheDocument();
    expect(screen.queryByText('只存在于规划器')).not.toBeInTheDocument();
  }, 15000);
});
