import { createEvent, fireEvent, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { CalculationMethod } from '../../../types';
import { Header } from '../Header';

type HeaderProps = React.ComponentProps<typeof Header>;

const noop = () => {};

/**
 * 让 Header 处于真实受控状态（section / method），
 * 这样断言的是用户可见的结果，而不只是回调被调用。
 */
const ControlledHeader = (overrides: Partial<HeaderProps> = {}) => {
  const [activeSection, setActiveSection] =
    useState<HeaderProps['activeSection']>('overview');
  const [method, setMethod] = useState(CalculationMethod.SUBTRACTIVE);

  return (
    <Header
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      isExperimentActive={false}
      onReset={noop}
      onDataMgmt={noop}
      onShare={noop}
      onOpenExperiment={noop}
      method={method}
      setMethod={setMethod}
      {...overrides}
    />
  );
};

const renderHeader = (
  overrides: Partial<HeaderProps> = {},
  options: Parameters<typeof renderWithProviders>[1] = {}
) => renderWithProviders(<ControlledHeader {...overrides} />, options);

const getHeader = () => {
  const header = document.querySelector('header');
  expect(header).not.toBeNull();
  return header as HTMLElement;
};

/** 移动端工具面板开启时是 header 的最后一个子节点。 */
const getMobilePanel = () => {
  const panel = getHeader().lastElementChild;
  expect(panel).not.toBeNull();
  expect(panel).toHaveClass('lg:hidden');
  return panel as HTMLElement;
};

/** 同名按钮数量：桌面工具栏常驻一份，移动端面板开启后再多一份。 */
const countButtonsNamed = (name: string) =>
  screen.queryAllByRole('button', { name }).length;

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  describe('基础渲染', () => {
    test('renders the brand block and the localized primary navigation', () => {
      renderHeader();

      expect(screen.getByText('DLUT GPA')).toBeInTheDocument();
      expect(screen.getByText('Academic Console')).toBeInTheDocument();

      const nav = screen.getByRole('navigation', { name: '主导航' });
      expect(within(nav).getAllByRole('button')).toHaveLength(3);
      ['总览', '课程', '分析'].forEach(label => {
        expect(
          within(nav).getByRole('button', { name: label })
        ).toBeInTheDocument();
      });
    });

    test('moves the active section marker as the user switches sections', () => {
      renderHeader();

      const nav = screen.getByRole('navigation', { name: '主导航' });
      const overview = within(nav).getByRole('button', { name: '总览' });
      expect(overview).toHaveAttribute('aria-pressed', 'true');
      expect(overview).toHaveAttribute('aria-current', 'page');

      fireEvent.click(within(nav).getByRole('button', { name: '分析' }));

      expect(within(nav).getByRole('button', { name: '分析' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(overview).toHaveAttribute('aria-pressed', 'false');
      expect(overview).not.toHaveAttribute('aria-current');
    });
  });

  describe('桌面工具栏', () => {
    test('invokes every desktop toolbar action', () => {
      const onDataMgmt = vi.fn();
      const onShare = vi.fn();
      const onReset = vi.fn();
      const onOpenExperiment = vi.fn();

      renderHeader({ onDataMgmt, onShare, onReset, onOpenExperiment });

      fireEvent.click(screen.getByRole('button', { name: '数据管理' }));
      fireEvent.click(screen.getByRole('button', { name: '分享报告' }));
      fireEvent.click(screen.getByRole('button', { name: '重置' }));
      fireEvent.click(screen.getByRole('button', { name: '开始实验' }));

      expect(onDataMgmt).toHaveBeenCalledTimes(1);
      expect(onShare).toHaveBeenCalledTimes(1);
      expect(onReset).toHaveBeenCalledTimes(1);
      expect(onOpenExperiment).toHaveBeenCalledTimes(1);
    });

    test('swaps experiment copy and shows the running chip while active', () => {
      renderHeader({ isExperimentActive: true });

      expect(
        screen.getByRole('button', { name: '返回实验室' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: '开始实验' })
      ).not.toBeInTheDocument();
      expect(screen.getByText('实验进行中')).toBeInTheDocument();
    });

    test('hides the running chip when no experiment is active', () => {
      renderHeader();

      expect(screen.queryByText('实验进行中')).not.toBeInTheDocument();
    });
  });

  describe('主题切换', () => {
    test('updates the documentElement class and the persisted theme', () => {
      renderHeader({}, { initialTheme: 'light' });

      expect(document.documentElement).toHaveClass('light');

      fireEvent.click(screen.getByRole('button', { name: '深色主题' }));

      expect(document.documentElement).toHaveClass('dark');
      expect(document.documentElement).not.toHaveClass('light');
      expect(localStorage.getItem('dlut_gpa_theme')).toBe('dark');

      fireEvent.click(screen.getByRole('button', { name: '浅色主题' }));

      expect(document.documentElement).toHaveClass('light');
      expect(document.documentElement).not.toHaveClass('dark');
      expect(localStorage.getItem('dlut_gpa_theme')).toBe('light');
    });
  });

  describe('语言切换', () => {
    test('switches copy between English and Chinese in place', async () => {
      renderHeader({}, { initialLanguage: 'en' });

      expect(
        await screen.findByRole('button', { name: 'Data Mgmt' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('navigation', { name: 'Primary' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Switch language' })
      ).toHaveTextContent('en');

      fireEvent.click(screen.getByRole('button', { name: 'Switch language' }));

      expect(
        screen.getByRole('button', { name: '数据管理' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('navigation', { name: '主导航' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '切换语言' })
      ).toHaveTextContent('zh');

      fireEvent.click(screen.getByRole('button', { name: '切换语言' }));

      expect(
        screen.getByRole('button', { name: 'Data Mgmt' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Share Report' })
      ).toBeInTheDocument();
    });
  });

  describe('GPA 算法下拉', () => {
    test('opens the listbox, applies a selection, and closes again', () => {
      renderHeader();

      const trigger = screen.getByRole('button', { name: 'DLUT 5.0' });
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      fireEvent.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      const listbox = screen.getByRole('listbox', { name: 'GPA 算法' });
      const activeOption = within(listbox).getByRole('option', {
        name: /DLUT 5\.0/,
      });
      expect(activeOption).toHaveAttribute('aria-selected', 'true');
      expect(activeOption).toHaveTextContent('启用');
      expect(
        within(listbox).getByRole('option', { name: 'Std 4.0' })
      ).toHaveAttribute('aria-selected', 'false');

      fireEvent.click(within(listbox).getByRole('option', { name: 'Std 4.0' }));

      expect(trigger).toHaveTextContent('Std 4.0');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    test('toggles closed when the trigger is clicked twice', () => {
      renderHeader();

      const trigger = screen.getByRole('button', { name: 'DLUT 5.0' });
      fireEvent.click(trigger);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    test('moves focus with roving keyboard navigation', () => {
      renderHeader();

      fireEvent.click(screen.getByRole('button', { name: 'DLUT 5.0' }));
      const listbox = screen.getByRole('listbox', { name: 'GPA 算法' });
      const options = within(listbox).getAllByRole('option');

      expect(options[0]).toHaveAttribute('tabindex', '0');
      options.slice(1).forEach(option => {
        expect(option).toHaveAttribute('tabindex', '-1');
      });

      fireEvent.keyDown(listbox, { key: 'ArrowDown' });
      expect(options[1]).toHaveFocus();

      fireEvent.keyDown(listbox, { key: 'ArrowUp' });
      expect(options[options.length - 1]).toHaveFocus();

      fireEvent.keyDown(listbox, { key: 'Home' });
      expect(options[0]).toHaveFocus();

      fireEvent.keyDown(listbox, { key: 'End' });
      expect(options[options.length - 1]).toHaveFocus();

      fireEvent.keyDown(listbox, { key: 'Escape' });
      expect(options[options.length - 1]).toHaveFocus();
    });

    test('falls back to the DLUT label for an unknown stored method', () => {
      renderHeader({
        method: 'UNKNOWN' as unknown as CalculationMethod,
      });

      const trigger = screen.getByRole('button', { name: 'DLUT 5.0' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);
      const listbox = screen.getByRole('listbox', { name: 'GPA 算法' });
      within(listbox)
        .getAllByRole('option')
        .forEach(option => {
          expect(option).toHaveAttribute('aria-selected', 'false');
        });
    });

    test('closes on an outside mousedown but stays open on an inside one', () => {
      renderHeader();

      const trigger = screen.getByRole('button', { name: 'DLUT 5.0' });
      fireEvent.click(trigger);
      const listbox = screen.getByRole('listbox', { name: 'GPA 算法' });

      fireEvent.mouseDown(
        within(listbox).getByRole('option', { name: 'Std 4.0' })
      );
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('移动端分支', () => {
    test('mobile experiment link opens the lab without following the anchor', () => {
      const onOpenExperiment = vi.fn();
      renderHeader({ onOpenExperiment });

      const link = screen.getByRole('link', { name: '开始实验' });
      expect(link).toHaveAttribute('href', '#experiment');

      const clickEvent = createEvent.click(link);
      fireEvent(link, clickEvent);

      expect(clickEvent.defaultPrevented).toBe(true);
      expect(onOpenExperiment).toHaveBeenCalledTimes(1);
    });

    test('mobile experiment link mirrors the running experiment state', () => {
      renderHeader({ isExperimentActive: true });

      expect(
        screen.getByRole('link', { name: '返回实验室' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: '开始实验' })
      ).not.toBeInTheDocument();
    });

    test('toggles the mobile tools panel and wires every action inside it', () => {
      const onDataMgmt = vi.fn();
      const onShare = vi.fn();
      const onReset = vi.fn();
      renderHeader({ onDataMgmt, onShare, onReset });

      const toggle = screen.getByRole('button', { name: '打开工具' });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(countButtonsNamed('数据管理')).toBe(1);
      expect(countButtonsNamed('浅色主题')).toBe(1);

      fireEvent.click(toggle);

      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(countButtonsNamed('数据管理')).toBe(2);

      const panel = getMobilePanel();
      expect(
        within(panel).getByRole('button', { name: '数据管理' })
      ).toBeInTheDocument();
      expect(
        within(panel).getByRole('button', { name: '分享报告' })
      ).toBeInTheDocument();
      expect(
        within(panel).getByRole('button', { name: '重置' })
      ).toBeInTheDocument();
      expect(
        within(panel).getByRole('group', { name: '浅色主题' })
      ).toBeInTheDocument();

      fireEvent.click(within(panel).getByRole('button', { name: '数据管理' }));
      fireEvent.click(within(panel).getByRole('button', { name: '分享报告' }));
      fireEvent.click(within(panel).getByRole('button', { name: '重置' }));

      expect(onDataMgmt).toHaveBeenCalledTimes(1);
      expect(onShare).toHaveBeenCalledTimes(1);
      expect(onReset).toHaveBeenCalledTimes(1);

      fireEvent.click(within(panel).getByRole('button', { name: '浅色主题' }));
      expect(document.documentElement).toHaveClass('light');
      expect(localStorage.getItem('dlut_gpa_theme')).toBe('light');

      fireEvent.click(within(panel).getByRole('button', { name: 'zh' }));
      expect(
        within(panel).getByRole('button', { name: 'Data Mgmt' })
      ).toBeInTheDocument();
      expect(
        within(panel).getByRole('button', { name: 'en' })
      ).toBeInTheDocument();

      fireEvent.click(within(panel).getByRole('button', { name: 'en' }));
      expect(
        within(panel).getByRole('button', { name: '数据管理' })
      ).toBeInTheDocument();
      expect(
        within(panel).getByRole('button', { name: 'zh' })
      ).toBeInTheDocument();

      fireEvent.click(toggle);

      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(countButtonsNamed('数据管理')).toBe(1);
      expect(getHeader().lastElementChild).toHaveClass('mx-auto');
    });
  });
});
