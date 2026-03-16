import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import AIAdvisorPanel from '../AIAdvisorPanel';

const courses = [
  {
    id: 'course-1',
    name: '高等数学',
    credits: 4,
    score: 82,
    gpa: 3.2,
    semester: '2024-1',
    type: '必修' as const,
    isCore: true,
    isActive: true,
  },
];

const gpaStats = {
  totalCredits: 4,
  weightedGpa: 3.25,
  weightedAverageScore: 82,
  courseCount: 1,
  scoreDistribution: [{ name: '80-89', value: 1 }],
  compulsoryCredits: 4,
  compulsoryWeightedGpa: 3.25,
};

describe('AIAdvisorPanel', () => {
  test('uses the shared numeric emphasis style in analysis progress cards', () => {
    render(<AIAdvisorPanel courses={courses} gpaStats={gpaStats} targetGPA={3.8} />);

    fireEvent.click(screen.getByRole('button', { name: '技能分析' }));

    const currentGpaValue = screen.getByText('3.25');
    const targetGpaValue = screen.getByText('3.80');

    expect(currentGpaValue).toHaveClass('result-value');
    expect(targetGpaValue).toHaveClass('result-value');
  });
});
