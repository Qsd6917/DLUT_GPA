import { fireEvent, screen, waitFor } from '@testing-library/react';
import React, { useRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ShareableReportModal } from '../ShareableReportModal';
import { renderWithProviders } from '../../../test/renderWithProviders';

const html2canvasMock = vi.hoisted(() => vi.fn());

vi.mock('html2canvas', () => ({
  default: html2canvasMock,
}));

const stats = {
  totalCredits: 30,
  weightedGpa: 3.52,
  weightedAverageScore: 84.5,
  courseCount: 8,
  scoreDistribution: [],
  compulsoryCredits: 20,
  compulsoryWeightedGpa: 3.41,
};

const courses = Array.from({ length: 8 }, (_, index) => ({
  id: `course-${index}`,
  name: `课程 ${index + 1}`,
  credits: index === 0 ? 4 : 3,
  score: 80 + index,
  gpa: 3.2 + index / 10,
  isActive: true,
  semester: '2024-2025-1',
  type: '必修' as const,
}));

const renderReport = (
  props: Partial<React.ComponentProps<typeof ShareableReportModal>> = {}
) =>
  renderWithProviders(
    <ShareableReportModal
      isOpen={true}
      onClose={() => {}}
      stats={stats}
      courses={courses}
      calculationMethodLabel="DLUT 5.0"
      isExperiment={false}
      totalCourseCount={83}
      filteredCourseCount={10}
      hasActiveFilters={true}
      generatedAt={new Date('2026-07-12T01:30:00.000Z')}
      {...props}
    />
  );

describe('ShareableReportModal', () => {
  beforeEach(() => {
    html2canvasMock.mockReset();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:report'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.style.overflow = '';
  });

  test('closes when escape is pressed', () => {
    const onClose = vi.fn();

    renderReport({ onClose });

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('keeps an existing body scroll lock after closing', () => {
    document.body.style.overflow = 'hidden';

    const { rerender } = renderWithProviders(
      <ShareableReportModal
        isOpen={true}
        onClose={() => {}}
        stats={stats}
        courses={courses}
        calculationMethodLabel="DLUT 5.0"
        isExperiment={false}
        totalCourseCount={83}
        filteredCourseCount={10}
        hasActiveFilters={true}
        generatedAt={new Date('2026-07-12T01:30:00.000Z')}
      />
    );

    expect(screen.getByRole('dialog', { name: '成绩报告' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '成绩报告' })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <ShareableReportModal
        isOpen={false}
        onClose={() => {}}
        stats={stats}
        courses={courses}
        calculationMethodLabel="DLUT 5.0"
        isExperiment={false}
        totalCourseCount={83}
        filteredCourseCount={10}
        hasActiveFilters={true}
        generatedAt={new Date('2026-07-12T01:30:00.000Z')}
      />
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  test('uses the shared report numeric styling for the preview GPA', () => {
    renderReport();

    const previewValue = screen.getByText('3.520');
    expect(previewValue).toHaveClass('report-value');
  });

  test('shows report metadata, experiment plan, current scope, and the same metrics as the page', () => {
    renderReport({ isExperiment: true });

    expect(screen.getByText('生成时间')).toBeInTheDocument();
    expect(screen.getByText('2026-07-12 09:30')).toBeInTheDocument();
    expect(screen.getByText('计算方法')).toBeInTheDocument();
    expect(screen.getAllByText('DLUT 5.0').length).toBeGreaterThan(0);
    expect(screen.getByText('数据模式')).toBeInTheDocument();
    expect(screen.getByText('实验方案')).toBeInTheDocument();
    expect(screen.getByText('计入口径')).toBeInTheDocument();
    expect(
      screen.getAllByText('当前筛选中计入 GPA 的 8 / 10 门课程（全部 83 门）')
        .length
    ).toBeGreaterThan(0);

    expect(screen.getByText('3.520')).toBeInTheDocument();
    expect(screen.getByText('30.0')).toBeInTheDocument();
    expect(screen.getByText('84.50')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  test('keeps the preview open after export fails and allows retrying successfully', async () => {
    html2canvasMock
      .mockRejectedValueOnce(new Error('canvas failed'))
      .mockResolvedValueOnce({
        toBlob: (resolve: (blob: Blob | null) => void) =>
          resolve(new Blob(['png'], { type: 'image/png' })),
      });

    renderReport();

    fireEvent.click(screen.getByRole('button', { name: '导出图片' }));

    expect(await screen.findByText('canvas failed')).toBeInTheDocument();
    expect(screen.getByText('学业报告预览')).toBeInTheDocument();
    expect(screen.getByText('3.520')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '导出图片' }));

    await waitFor(() => expect(html2canvasMock).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.queryByText('canvas failed')).not.toBeInTheDocument()
    );
  });

  test('focuses the dialog close control and restores focus to the share trigger after escape closes it', async () => {
    const Harness = () => {
      const [isOpen, setIsOpen] = useState(false);
      const shareButtonRef = useRef<HTMLButtonElement>(null);

      return (
        <>
          <button
            type="button"
            ref={shareButtonRef}
            onClick={() => setIsOpen(true)}
          >
            分享报告
          </button>
          <ShareableReportModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            stats={stats}
            courses={courses}
            calculationMethodLabel="DLUT 5.0"
            isExperiment={false}
            totalCourseCount={83}
            filteredCourseCount={10}
            hasActiveFilters={true}
            generatedAt={new Date('2026-07-12T01:30:00.000Z')}
            returnFocusRef={shareButtonRef}
          />
        </>
      );
    };

    renderWithProviders(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: '分享报告' }));

    const closeButton = screen.getByRole('button', { name: '关闭报告弹窗' });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: '成绩报告' })).not.toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: '分享报告' })).toHaveFocus();
  });
});
