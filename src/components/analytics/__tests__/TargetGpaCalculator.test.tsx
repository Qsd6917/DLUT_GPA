import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { TargetGpaCalculator } from '../TargetGpaCalculator';

describe('TargetGpaCalculator', () => {
  test('renders calculated result with shared numeric emphasis styling', () => {
    render(<TargetGpaCalculator currentGpa={3.2} currentCredits={100} />);

    fireEvent.change(screen.getByLabelText('目标 GPA'), { target: { value: '3.3' } });
    fireEvent.click(screen.getByRole('button', { name: '计算所需成绩' }));

    const resultValue = screen.getByText('3.800');
    expect(resultValue).toHaveClass('result-value');
  });
});
