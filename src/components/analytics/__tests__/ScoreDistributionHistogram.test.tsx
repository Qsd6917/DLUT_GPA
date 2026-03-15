import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreDistributionHistogram } from '../ScoreDistributionHistogram';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { LanguageProvider } from '../../../contexts/LanguageContext';

declare global {
  const vi: any;
}

// Mock data similar to what comes from the gpaService
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
    { name: '<60', value: 1 }
  ],
  compulsoryCredits: 20,
  compulsoryWeightedGpa: 3.2
};

// Mock the ResponsiveContainer to avoid issues with dimensions in tests
(vi as any).mock('recharts', async () => {
  const actual = await (vi as any).importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: '100%', height: '400px' }}>{children}</div>
    ),
  };
});

describe('ScoreDistributionHistogram', () => {
  it('renders without crashing', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <ScoreDistributionHistogram stats={mockStats} />
        </LanguageProvider>
      </ThemeProvider>
    );

    // Check if the main container is rendered
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('displays correct number of data points in legend', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <ScoreDistributionHistogram stats={mockStats} />
        </LanguageProvider>
      </ThemeProvider>
    );

    // Check if all score ranges are displayed in the legend
    expect(screen.getByText('90-100')).toBeInTheDocument();
    expect(screen.getByText('80-89')).toBeInTheDocument();
    expect(screen.getByText('70-79')).toBeInTheDocument();
    expect(screen.getByText('60-69')).toBeInTheDocument();
    expect(screen.getByText('<60')).toBeInTheDocument();
  });
});