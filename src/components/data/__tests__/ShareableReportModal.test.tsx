import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ShareableReportModal } from '../ShareableReportModal';

const stats = {
  totalCredits: 30,
  weightedGpa: 3.52,
  weightedAverageScore: 84.5,
  courseCount: 8,
  scoreDistribution: [],
  compulsoryCredits: 20,
  compulsoryWeightedGpa: 3.41,
};

describe('ShareableReportModal', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  test('closes when escape is pressed', () => {
    const onClose = vi.fn();

    render(
      <ShareableReportModal
        isOpen={true}
        onClose={onClose}
        stats={stats}
        courses={[]}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('keeps an existing body scroll lock after closing', () => {
    document.body.style.overflow = 'hidden';

    const { rerender } = render(
      <ShareableReportModal
        isOpen={true}
        onClose={() => {}}
        stats={stats}
        courses={[]}
      />
    );

    expect(screen.getByText('成绩报告')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <ShareableReportModal
        isOpen={false}
        onClose={() => {}}
        stats={stats}
        courses={[]}
      />
    );

    expect(document.body.style.overflow).toBe('hidden');
  });
});
