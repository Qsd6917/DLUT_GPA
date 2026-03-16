import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ScoreDistributionChart } from '../ScoreDistributionChart';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { LanguageProvider } from '../../../contexts/LanguageContext';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
    Pie: ({ children }: { children: React.ReactNode }) => <g>{children}</g>,
    Cell: () => null,
    Tooltip: () => null,
  };
});

const mockStats = {
  totalCredits: 30,
  weightedGpa: 3.5,
  weightedAverageScore: 85,
  courseCount: 5,
  scoreDistribution: [
    { name: '90-100', value: 2 },
    { name: '80-89', value: 1 },
    { name: '70-79', value: 1 },
    { name: '60-69', value: 0 },
    { name: '<60', value: 1 },
  ],
  compulsoryCredits: 20,
  compulsoryWeightedGpa: 3.2,
};

describe('ScoreDistributionChart', () => {
  test('renders center GPA with the lighter numeric font treatment', () => {
    const { container } = render(
      <ThemeProvider>
        <LanguageProvider>
          <ScoreDistributionChart stats={mockStats} />
        </LanguageProvider>
      </ThemeProvider>
    );

    const centerValue = screen.getByText('3.500');
    expect(centerValue.tagName.toLowerCase()).toBe('tspan');
    expect(centerValue).toHaveAttribute('font-family', 'var(--font-numeric)');
    expect(centerValue).toHaveAttribute('font-weight', '600');
    expect(container.querySelector('text tspan')).toBe(centerValue);
  });
});
