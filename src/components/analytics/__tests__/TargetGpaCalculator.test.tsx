import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { TargetGpaCalculator } from '../TargetGpaCalculator';
import { renderWithProviders } from '../../../test/renderWithProviders';

describe('TargetGpaCalculator', () => {
  test('renders calculated result with shared numeric emphasis styling', () => {
    renderWithProviders(<TargetGpaCalculator currentGpa={3.2} currentCredits={100} maximumGpa={5} />);

    fireEvent.change(screen.getByLabelText('目标 GPA'), { target: { value: '3.3' } });
    const resultValue = screen.getByText('3.800');
    expect(resultValue).toHaveClass('result-value');
  });

  test('shows the projected outcome from the expected future GPA', () => {
    renderWithProviders(<TargetGpaCalculator currentGpa={3.2} currentCredits={100} maximumGpa={5} />);
    fireEvent.change(screen.getByLabelText('目标 GPA'), { target: { value: '3.3' } });
    fireEvent.change(screen.getByLabelText('预期平均绩点'), { target: { value: '3.8' } });
    expect(screen.getByText('按当前计划可达到目标')).toBeInTheDocument();
    expect(screen.getByText(/预计累计 GPA 3.300/)).toBeInTheDocument();
  });

  test('shows field-level errors and clears stale conclusions', () => {
    renderWithProviders(<TargetGpaCalculator currentGpa={3.2} currentCredits={100} maximumGpa={5} />);
    fireEvent.change(screen.getByLabelText('剩余学分'), { target: { value: '0' } });
    expect(screen.getByText('剩余学分必须大于 0')).toBeInTheDocument();
    expect(screen.queryByText(/按当前计划可达到目标/)).not.toBeInTheDocument();
  });

  test.each([
    ['目标 GPA', '请输入目标 GPA'],
    ['剩余学分', '请输入剩余学分'],
    ['预期平均绩点', '请输入预期平均绩点'],
  ])('treats an empty %s as invalid and associates the field error', (label, message) => {
    renderWithProviders(<TargetGpaCalculator currentGpa={3.2} currentCredits={100} maximumGpa={5} />);
    const input = screen.getByLabelText(label);
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const error = screen.getByText(message);
    expect(input).toHaveAttribute('aria-describedby', error.id);
  });

  test('clearly reports when the target is already achieved', () => {
    renderWithProviders(<TargetGpaCalculator currentGpa={4} currentCredits={100} maximumGpa={5} />);
    fireEvent.change(screen.getByLabelText('目标 GPA'), { target: { value: '3.5' } });
    expect(screen.getByText('当前已达到目标')).toBeInTheDocument();
    expect(screen.getByText('0.000')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '计算所需成绩' })).not.toBeInTheDocument();
  });

  test('distinguishes a higher required GPA from an impossible target', () => {
    renderWithProviders(<TargetGpaCalculator currentGpa={3} currentCredits={100} maximumGpa={5} />);
    fireEvent.change(screen.getByLabelText('目标 GPA'), { target: { value: '3.3' } });
    fireEvent.change(screen.getByLabelText('预期平均绩点'), { target: { value: '4' } });
    expect(screen.getByText('需要提高后续课程表现')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('目标 GPA'), { target: { value: '4' } });
    expect(screen.getByText('在当前剩余学分下无法达到')).toBeInTheDocument();
  });
});
