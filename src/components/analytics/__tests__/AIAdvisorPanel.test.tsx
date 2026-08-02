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
    render(<AIAdvisorPanel courses={courses} gpaStats={gpaStats} targetGPA={3.8} maximumGpa={5} />);

    fireEvent.click(screen.getByRole('button', { name: '技能分析' }));

    const currentGpaValue = screen.getByText('3.25');
    const targetGpaValue = screen.getByText('3.80');

    expect(currentGpaValue).toHaveClass('result-value');
    expect(targetGpaValue).toHaveClass('result-value');
  });

  test('scales progress against the selected 5.0 GPA method', () => {
    const { container } = render(<AIAdvisorPanel courses={courses} gpaStats={{ ...gpaStats, weightedGpa: 4 }} targetGPA={4.5} maximumGpa={5} />);
    fireEvent.click(screen.getByRole('button', { name: '技能分析' }));
    expect(container.querySelector('[style="width: 80%;"]')).toBeInTheDocument();
    expect(container.querySelector('[style="width: 90%;"]')).toBeInTheDocument();
  });

  test('does not fabricate a required percentage score without a future credit plan', () => {
    render(<AIAdvisorPanel courses={courses} gpaStats={gpaStats} targetGPA={4.2} maximumGpa={4.5} />);
    fireEvent.click(screen.getByRole('button', { name: '技能分析' }));
    expect(screen.getByText('请在目标 GPA 计算器中设置剩余学分和预期绩点')).toBeInTheDocument();
    expect(screen.queryByText(/后续课程平均分需要约/)).not.toBeInTheDocument();
  });

  test('shows an evidence empty state instead of a no-risk conclusion', () => {
    render(<AIAdvisorPanel courses={[]} gpaStats={{ ...gpaStats, totalCredits: 0, courseCount: 0 }} targetGPA={3.8} maximumGpa={5} />);
    expect(screen.getByText('暂无可分析课程')).toBeInTheDocument();
    expect(screen.queryByText('当前没有明显学术风险')).not.toBeInTheDocument();
  });
});
