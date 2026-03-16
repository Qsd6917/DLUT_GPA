import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { GpaSimulationMode } from '../GpaSimulationMode';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { CalculationMethod, Course } from '../../../types';
import { calculateCourseGpa } from '../../../services/gpaService';

const renderWithLanguage = (ui: React.ReactElement) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('GpaSimulationMode', () => {
  test('uses a simulated score of 0 instead of falling back to the original score', async () => {
    const onSimulatedStats = vi.fn();
    const course: Course = {
      id: 'course-1',
      name: '自动控制原理A',
      credits: 4,
      score: 80,
      gpa: calculateCourseGpa(80, CalculationMethod.SUBTRACTIVE),
      isActive: true,
      semester: '3-1',
      type: '必修',
      isCore: true,
    };

    renderWithLanguage(
      <GpaSimulationMode
        courses={[course]}
        method={CalculationMethod.SUBTRACTIVE}
        onSimulatedStats={onSimulatedStats}
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByText('0.0')).toBeInTheDocument();
      expect(onSimulatedStats).toHaveBeenLastCalledWith(
        expect.objectContaining({
          weightedGpa: 0,
          weightedAverageScore: 0,
        })
      );
    });
  });
});
