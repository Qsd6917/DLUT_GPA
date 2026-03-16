import React, { useEffect, useMemo, useState } from 'react';
import { Sigma, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { CalculationMethod, Course, GpaStats } from '../../types';
import { calculateCourseGpa, calculateStats } from '../../services/gpaService';

type SimulatedCourse = Course & { simulatedScore: number };

interface GpaSimulationModeProps {
  courses: Course[];
  method: CalculationMethod;
  onSimulatedStats: (stats: GpaStats) => void;
}

export const GpaSimulationMode: React.FC<GpaSimulationModeProps> = ({ courses, method, onSimulatedStats }) => {
  const { t } = useTranslation();
  const [simulatedCourses, setSimulatedCourses] = useState<SimulatedCourse[]>([]);

  useEffect(() => {
    setSimulatedCourses(
      courses.map((course) => ({
        ...course,
        simulatedScore: course.score,
      }))
    );
  }, [courses]);

  const originalStats = useMemo(() => calculateStats(courses), [courses]);

  const simulatedStats = useMemo(() => {
    const coursesWithSimulatedScores = simulatedCourses.map((course) => {
      const nextScore = course.simulatedScore ?? course.score;
      return {
        ...course,
        score: nextScore,
        gpa: calculateCourseGpa(nextScore, method),
      };
    });

    return calculateStats(coursesWithSimulatedScores);
  }, [method, simulatedCourses]);

  useEffect(() => {
    onSimulatedStats(simulatedStats);
  }, [onSimulatedStats, simulatedStats]);

  const handleScoreChange = (id: string, newScore: number) => {
    setSimulatedCourses((prev) => prev.map((course) => (course.id === id ? { ...course, simulatedScore: newScore } : course)));
  };

  return (
    <section className="paper-panel p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 border-b border-primary/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="section-kicker">Simulation</div>
          <h3 className="type-section-title mt-2 text-main">{t('simulation_mode_title')}</h3>
          <p className="type-body-sm mt-2">{t('simulation_instructions')}</p>
        </div>
        <div className="rounded-[1.2rem] border border-primary/10 bg-primary/10 p-3 text-primary">
          <SlidersHorizontal size={18} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="metric-card text-center">
          <div className="figure-label">{t('original_gpa')}</div>
          <div className="mt-3 figure-value text-main">{originalStats.weightedGpa.toFixed(3)}</div>
        </div>
        <div className="metric-card text-center">
          <div className="figure-label">{t('simulated_gpa')}</div>
          <div className="mt-3 figure-value text-primary">{simulatedStats.weightedGpa.toFixed(3)}</div>
        </div>
      </div>

      <div className="mt-6 space-y-4 max-h-[28rem] overflow-y-auto pr-1">
        {simulatedCourses
          .filter((course) => course.isActive)
          .map((course) => {
            const currentScore = course.simulatedScore ?? course.score;
            const delta = currentScore - course.score;

            return (
              <div key={course.id} className="metric-card">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-main">{course.name}</div>
                    <div className="type-body-sm mt-1">
                      {t('credits')}: {course.credits} · GPA {calculateCourseGpa(currentScore, method).toFixed(2)}
                    </div>
                  </div>
                  <div className="num-inline rounded-full border border-primary/15 px-3 py-1 text-xs text-primary">
                    <Sigma size={12} className="mr-1 inline" />
                    {currentScore.toFixed(1)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="type-body-sm">
                      {t('current_score')}: {course.score}
                    </span>
                    <span className={`num-inline ${delta > 0 ? 'text-emerald-300' : delta < 0 ? 'text-[hsl(var(--color-accent))]' : 'text-muted'}`}>
                      {delta > 0 ? '+' : ''}
                      {delta.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentScore}
                    onChange={(e) => handleScoreChange(course.id, Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-background/90 accent-primary"
                  />
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
};
