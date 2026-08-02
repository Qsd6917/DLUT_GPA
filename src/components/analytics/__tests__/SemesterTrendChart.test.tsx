import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { SemesterTrendChart } from '../SemesterTrendChart';
import { renderWithProviders } from '../../../test/renderWithProviders';

describe('SemesterTrendChart', () => {
  test('provides an accessible semester summary with GPA, score, credits and course count', () => {
    renderWithProviders(<SemesterTrendChart trends={[{ semester: '1-2', gpa: 3.5, averageScore: 85, credits: 20, courseCount: 6 }]} />);
    const table = screen.getByRole('table', { name: '学期趋势数据' });
    expect(table).toHaveTextContent('1-2');
    expect(table).toHaveTextContent('3.500');
    expect(table).toHaveTextContent('85.00');
    expect(table).toHaveTextContent('20.0');
    expect(table).toHaveTextContent('6');
  });
});
