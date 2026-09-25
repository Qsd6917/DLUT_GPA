import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { useTranslation } from '../../../contexts/LanguageContext';
import { CalculationMethod } from '../../../types';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { TargetGpaCalculator } from '../TargetGpaCalculator';

const renderPlanner = (
  props: Partial<React.ComponentProps<typeof TargetGpaCalculator>> = {},
  options: Parameters<typeof renderWithProviders>[1] = {}
) =>
  renderWithProviders(
    <TargetGpaCalculator
      currentGpa={3.2}
      currentCredits={3}
      method={CalculationMethod.SUBTRACTIVE}
      {...props}
    />,
    options
  );

const expectAssociatedError = (input: HTMLElement, message: string) => {
  expect(input).toHaveAttribute('aria-invalid', 'true');
  const panel = input.closest('[role="tabpanel"]');
  expect(panel).toBeInTheDocument();
  const error = within(panel as HTMLElement).getByText(message);
  expect(input).toHaveAttribute('aria-describedby', error.id);
};

const LanguageSwitchingPlanner = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <>
      <button
        type="button"
        onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
      >
        switch test language
      </button>
      <TargetGpaCalculator
        currentGpa={3.2}
        currentCredits={3}
        method={CalculationMethod.SUBTRACTIVE}
      />
    </>
  );
};

describe('TargetGpaCalculator', () => {
  test('scopes every id and tab relationship to its own calculator instance', () => {
    const { container } = renderWithProviders(
      <>
        <TargetGpaCalculator
          currentGpa={3.2}
          currentCredits={3}
          method={CalculationMethod.SUBTRACTIVE}
        />
        <TargetGpaCalculator
          currentGpa={3.2}
          currentCredits={3}
          method={CalculationMethod.SUBTRACTIVE}
        />
      </>
    );

    const calculators = screen.getAllByRole('region', {
      name: '目标成绩规划',
    });
    expect(calculators).toHaveLength(2);

    for (const calculator of calculators) {
      const credits = within(calculator).getByLabelText('未来课程 1 学分');
      fireEvent.change(credits, { target: { value: '' } });
      const creditsErrorId = credits.getAttribute('aria-describedby');
      expect(creditsErrorId).toBeTruthy();
      expect(calculator).toContainElement(
        document.getElementById(creditsErrorId ?? '')
      );

      const tabs = within(calculator).getAllByRole('tab');
      expect(tabs).toHaveLength(2);
      for (const tab of tabs) {
        const panelId = tab.getAttribute('aria-controls');
        const panel = document.getElementById(panelId ?? '');
        expect(panelId).toBeTruthy();
        expect(calculator).toContainElement(panel);
        expect(panel).toHaveAttribute('aria-labelledby', tab.id);
      }

      fireEvent.click(within(calculator).getByRole('tab', { name: '快速估算' }));
      const remainingCredits = within(calculator).getByLabelText('剩余学分');
      fireEvent.change(remainingCredits, { target: { value: '' } });
      const quickErrorId = remainingCredits.getAttribute('aria-describedby');
      expect(quickErrorId).toBeTruthy();
      expect(calculator).toContainElement(
        document.getElementById(quickErrorId ?? '')
      );
    }

    const ids = Array.from(container.querySelectorAll('[id]'), element =>
      element.id
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('opens the per-course planner by default with complete tab semantics', () => {
    renderPlanner();

    const quickTab = screen.getByRole('tab', { name: '快速估算' });
    const plannerTab = screen.getByRole('tab', { name: '逐课规划' });
    const activePanel = screen.getByRole('tabpanel');
    const quickPanel = document.getElementById(
      quickTab.getAttribute('aria-controls') ?? ''
    );
    const plannerPanel = document.getElementById(
      plannerTab.getAttribute('aria-controls') ?? ''
    );

    expect(screen.getByRole('heading', { name: '目标成绩规划' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: '目标成绩规划模式' })).toBeInTheDocument();
    expect(plannerTab).toHaveAttribute('aria-selected', 'true');
    expect(plannerTab).toHaveAttribute('tabindex', '0');
    expect(quickTab).toHaveAttribute('aria-selected', 'false');
    expect(quickTab).toHaveAttribute('tabindex', '-1');
    expect(quickPanel).toBeInTheDocument();
    expect(plannerPanel).toBeInTheDocument();
    expect(quickTab).toHaveAttribute('aria-controls', quickPanel?.id);
    expect(plannerTab).toHaveAttribute('aria-controls', plannerPanel?.id);
    expect(activePanel).toBe(plannerPanel);
    expect(quickPanel).toHaveAttribute('hidden');
    expect(plannerPanel).not.toHaveAttribute('hidden');
    expect(plannerPanel).toHaveAttribute('aria-labelledby', plannerTab.id);
    expect(screen.getByLabelText('未来课程 1 名称')).toHaveValue('未来课程 1');
    expect(
      screen.queryByRole('spinbutton', { name: '剩余学分' })
    ).not.toBeInTheDocument();

    fireEvent.click(quickTab);
    expect(quickPanel).not.toHaveAttribute('hidden');
    expect(plannerPanel).toHaveAttribute('hidden');
    expect(screen.getByRole('tabpanel')).toBe(quickPanel);
  });

  test('switches and focuses tabs with Arrow, Home, and End keys', () => {
    renderPlanner();

    const quickTab = screen.getByRole('tab', { name: '快速估算' });
    const plannerTab = screen.getByRole('tab', { name: '逐课规划' });

    fireEvent.keyDown(plannerTab, { key: 'ArrowLeft' });
    expect(quickTab).toHaveAttribute('aria-selected', 'true');
    expect(quickTab).toHaveFocus();

    fireEvent.keyDown(quickTab, { key: 'End' });
    expect(plannerTab).toHaveAttribute('aria-selected', 'true');
    expect(plannerTab).toHaveFocus();

    fireEvent.keyDown(plannerTab, { key: 'Home' });
    expect(quickTab).toHaveAttribute('aria-selected', 'true');
    expect(quickTab).toHaveFocus();

    fireEvent.keyDown(quickTab, { key: 'ArrowRight' });
    expect(plannerTab).toHaveAttribute('aria-selected', 'true');
    expect(plannerTab).toHaveFocus();
  });

  test('finds the minimum 94.0 score for a subtractive-scale auto course', () => {
    renderPlanner();

    const result = screen.getByRole('status');
    expect(within(result).getByText('最低均衡建议分数')).toBeInTheDocument();
    expect(within(result).getByText('94.0')).toHaveClass('result-value');
    expect(within(result).getByText('预计累计 GPA 3.800')).toBeInTheDocument();
    expect(
      within(result).getByLabelText('未来课程 1：94.0 分')
    ).toBeInTheDocument();
    expect(result).toHaveAttribute('aria-live', 'polite');
  });

  test('respects a WES score step and recommends 75.0 instead of a continuous score', () => {
    renderPlanner({
      currentGpa: 3,
      currentCredits: 3,
      method: CalculationMethod.WES,
    });

    fireEvent.change(within(screen.getByRole('tabpanel')).getByLabelText('目标 GPA'), {
      target: { value: '3' },
    });

    expect(screen.getByRole('status')).toHaveTextContent('75.0');
    expect(screen.getByRole('status')).toHaveTextContent('预计累计 GPA 3.000');
  });

  test('keeps dynamic course labels stable and never reuses a removed row identity', () => {
    renderPlanner();

    fireEvent.click(screen.getByRole('button', { name: '添加未来课程' }));
    expect(screen.getByLabelText('未来课程 1 名称')).toBeInTheDocument();
    expect(screen.getByLabelText('未来课程 2 名称')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '删除未来课程 1' }));
    expect(screen.queryByLabelText('未来课程 1 名称')).not.toBeInTheDocument();
    expect(screen.getByLabelText('未来课程 2 名称')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '添加未来课程' }));
    expect(screen.getByLabelText('未来课程 2 名称')).toBeInTheDocument();
    expect(screen.getByLabelText('未来课程 3 名称')).toBeInTheDocument();
  });

  test('moves focus to the next, previous, then add-course control after deletions', async () => {
    const user = userEvent.setup();
    renderPlanner();

    await user.click(screen.getByRole('button', { name: '添加未来课程' }));
    await user.click(screen.getByRole('button', { name: '添加未来课程' }));

    await user.click(screen.getByRole('button', { name: '删除未来课程 2' }));
    expect(screen.getByLabelText('未来课程 3 名称')).toHaveFocus();

    await user.click(screen.getByRole('button', { name: '删除未来课程 3' }));
    expect(screen.getByLabelText('未来课程 1 名称')).toHaveFocus();

    await user.click(screen.getByRole('button', { name: '删除未来课程 1' }));
    expect(screen.getByRole('button', { name: '添加未来课程' })).toHaveFocus();
  });

  test('shows a fixed-score input only for fixed mode and reports a reached fixed plan', () => {
    renderPlanner();

    expect(screen.queryByLabelText('未来课程 1 固定分数值')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: '未来课程 1 固定分数' }));
    const fixedScore = screen.getByLabelText('未来课程 1 固定分数值');
    expectAssociatedError(fixedScore, '请输入未来课程 1 固定分数');

    fireEvent.change(fixedScore, { target: { value: '94' } });
    const result = screen.getByRole('status');
    expect(within(result).getByText('固定方案已达标')).toBeInTheDocument();
    expect(within(result).getByText('预计累计 GPA 3.800')).toBeInTheDocument();
    expect(
      within(result).getByLabelText('未来课程 1：94.0 分')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: '未来课程 1 自动规划' }));
    expect(screen.queryByLabelText('未来课程 1 固定分数值')).not.toBeInTheDocument();
  });

  test('shows an action prompt after every future course is removed', () => {
    renderPlanner();

    fireEvent.click(screen.getByRole('button', { name: '删除未来课程 1' }));

    expect(screen.getByText('请添加至少一门未来课程开始规划。')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test.each([
    {
      label: '目标 GPA',
      prepare: () => undefined,
      value: '',
      message: '请输入目标 GPA',
    },
    {
      label: '未来课程 1 学分',
      prepare: () => undefined,
      value: '',
      message: '请输入未来课程 1 学分',
    },
    {
      label: '未来课程 1 学分',
      prepare: () => undefined,
      value: '0',
      message: '未来课程 1 学分必须大于 0',
    },
    {
      label: '未来课程 1 固定分数值',
      prepare: () =>
        fireEvent.click(
          screen.getByRole('radio', { name: '未来课程 1 固定分数' })
        ),
      value: '101',
      message: '固定分数应在 0–100 之间',
    },
  ])(
    'associates the $label validation message with its field',
    ({ label, prepare, value, message }) => {
      renderPlanner();
      prepare();
      const input = within(screen.getByRole('tabpanel')).getByLabelText(label);
      fireEvent.change(input, { target: { value } });
      expectAssociatedError(input, message);
      expect(screen.queryByText('最低均衡建议分数')).not.toBeInTheDocument();
    }
  );

  test('reports the highest possible GPA and remaining gap for an unreachable plan', () => {
    renderPlanner({ currentGpa: 0, currentCredits: 100 });
    fireEvent.change(within(screen.getByRole('tabpanel')).getByLabelText('目标 GPA'), {
      target: { value: '5' },
    });

    const result = screen.getByRole('status');
    expect(within(result).getByText('当前方案无法达标')).toBeInTheDocument();
    expect(within(result).getByText('最高可能 GPA 0.146')).toBeInTheDocument();
    expect(within(result).getByText('距离目标 4.854')).toBeInTheDocument();
    expect(
      within(result).getByLabelText('未来课程 1：100.0 分')
    ).toBeInTheDocument();
  });

  test('retains quick-estimate calculations and field-level errors', () => {
    renderPlanner({ currentCredits: 100 });
    fireEvent.click(screen.getByRole('tab', { name: '快速估算' }));
    const quickPanel = screen.getByRole('tabpanel');

    fireEvent.change(within(quickPanel).getByLabelText('目标 GPA'), {
      target: { value: '3.3' },
    });
    fireEvent.change(within(quickPanel).getByLabelText('预期平均绩点'), {
      target: { value: '3.8' },
    });
    expect(screen.getByText('按当前计划可达到目标')).toBeInTheDocument();
    expect(screen.getByText(/预计累计 GPA 3.300/)).toBeInTheDocument();

    const remainingCredits = within(quickPanel).getByLabelText('剩余学分');
    fireEvent.change(remainingCredits, { target: { value: '0' } });
    expectAssociatedError(remainingCredits, '剩余学分必须大于 0');
    expect(screen.queryByText('按当前计划可达到目标')).not.toBeInTheDocument();
  });

  test('localizes planning labels and actions in English', async () => {
    renderPlanner({}, { initialLanguage: 'en' });

    expect(
      await screen.findByRole('heading', { name: 'Target score planning' })
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Per-course plan' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Future course 1 Auto plan' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Future course 1 Fixed score' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add future course' })).toBeInTheDocument();
  });

  test('updates untouched default names across language changes without overwriting custom names', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitchingPlanner />);

    expect(screen.getByLabelText('未来课程 1 名称')).toHaveValue('未来课程 1');

    await user.click(screen.getByRole('button', { name: 'switch test language' }));
    expect(screen.getByLabelText('Future course 1 name')).toHaveValue(
      'Future course 1'
    );

    await user.click(screen.getByRole('button', { name: 'switch test language' }));
    const localizedDefault = screen.getByLabelText('未来课程 1 名称');
    expect(localizedDefault).toHaveValue('未来课程 1');
    await user.clear(localizedDefault);
    await user.type(localizedDefault, '自定义课程');

    await user.click(screen.getByRole('button', { name: 'switch test language' }));
    expect(screen.getByLabelText('Future course 1 name')).toHaveValue(
      '自定义课程'
    );
    await user.click(screen.getByRole('button', { name: 'switch test language' }));
    expect(screen.getByLabelText('未来课程 1 名称')).toHaveValue('自定义课程');
  });

  test('shows each suggested course name once while preserving its accessible score label', () => {
    renderPlanner();

    const result = screen.getByRole('status');
    const suggestion = within(result).getByLabelText('未来课程 1：94.0 分');
    expect(suggestion.textContent?.match(/未来课程 1/g)).toHaveLength(1);
    expect(within(suggestion).getByText('94.0 分')).toBeInTheDocument();
  });

  test('renders a readable target scale with current, target, outcome, and maximum values', () => {
    renderPlanner();

    const scale = screen.getByRole('img', {
      name: '达标刻度线：当前 GPA 3.200，目标 GPA 3.800，预计 GPA 3.800，理论上限 5.000',
    });
    expect(within(scale).getByText('当前 3.200')).toBeInTheDocument();
    expect(within(scale).getByText('目标 3.800')).toBeInTheDocument();
    expect(within(scale).getByText('预计 3.800')).toBeInTheDocument();
    expect(within(scale).getByText('上限 5.000')).toBeInTheDocument();
  });
});
