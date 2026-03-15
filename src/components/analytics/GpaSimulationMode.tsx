import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../contexts/LanguageContext';
import { CalculationMethod, Course, GpaStats } from '../../types';
import { calculateCourseGpa, calculateStats } from '../../services/gpaService';

interface GpaSimulationModeProps {
  courses: Course[];
  method: CalculationMethod;
  onSimulatedStats: (stats: GpaStats) => void;
}

export const GpaSimulationMode: React.FC<GpaSimulationModeProps> = ({ 
  courses, 
  method,
  onSimulatedStats 
}) => {
  const { t } = useTranslation();
  const [simulatedCourses, setSimulatedCourses] = useState<Course[]>([]);
  const [originalStats, setOriginalStats] = useState<GpaStats | null>(null);

  // 初始化模拟课程
  useEffect(() => {
    // 复制原始课程数据
    const initialSimulatedCourses = courses.map(course => ({
      ...course,
      score: course.score, // 当前分数
      simulatedScore: course.score // 模拟分数（初始为当前分数）
      // 我们将使用 simulatedScore 来跟踪模拟的分数
    })) as (Course & { simulatedScore: number })[];

    setSimulatedCourses(initialSimulatedCourses);
    
    // 计算原始统计数据
    const original = calculateStats(courses);
    setOriginalStats(original);
    
    // 初始模拟统计
    onSimulatedStats(original);
  }, [courses, method, onSimulatedStats]);

  // 当模拟课程发生变化时，计算新的统计信息
  useEffect(() => {
    if (simulatedCourses.length > 0) {
      // 创建带有模拟分数的新课程数组
      const coursesWithSimulatedScores = simulatedCourses.map(course => ({
        ...course,
        score: (course as any).simulatedScore || course.score,
        gpa: calculateCourseGpa((course as any).simulatedScore || course.score, method)
      }));
      
      const simulatedStats = calculateStats(coursesWithSimulatedScores);
      onSimulatedStats(simulatedStats);
    }
  }, [simulatedCourses, method, onSimulatedStats]);

  const handleScoreChange = (id: string, newScore: number) => {
    setSimulatedCourses(prev => 
      prev.map(course => 
        course.id === id 
          ? { ...course, simulatedScore: newScore } 
          : course
      )
    );
  };

  if (!originalStats) return null;

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-soft border border-primary/10 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-main">
          {t('simulation_mode_title')}
        </h3>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xs text-muted mb-1">{t('original_gpa')}</div>
            <motion.div 
              className="text-2xl font-bold text-main"
              key={`original-${originalStats.weightedGpa}`}
              initial={{ scale: 1 }}
              animate={{ scale: 1 }}
            >
              {originalStats.weightedGpa.toFixed(3)}
            </motion.div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted mb-1">{t('simulated_gpa')}</div>
            <motion.div 
              className="text-2xl font-bold text-primary"
              key={`simulated-${calculateStats(
                simulatedCourses.map(c => ({ 
                  ...c, 
                  score: (c as any).simulatedScore || c.score,
                  gpa: calculateCourseGpa((c as any).simulatedScore || c.score, method)
                }))
              ).weightedGpa}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {calculateStats(
                simulatedCourses.map(c => ({ 
                  ...c, 
                  score: (c as any).simulatedScore || c.score,
                  gpa: calculateCourseGpa((c as any).simulatedScore || c.score, method)
                }))
              ).weightedGpa.toFixed(3)}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {simulatedCourses
          .filter(c => c.isActive) // 只显示激活的课程
          .map((course) => {
            const currentScore = (course as any).simulatedScore || course.score;
            const delta = currentScore - course.score;
            
            return (
              <div 
                key={course.id} 
                className="p-3 rounded-xl border border-primary/10 bg-background/30"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-main truncate max-w-[60%]">{course.name}</div>
                  <div className="text-sm text-muted">
                    {t('credits')}: {course.credits}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted">
                        {t('current_score')}: {course.score}
                      </span>
                      <span className={delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-600' : 'text-muted'}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentScore}
                      onChange={(e) => handleScoreChange(course.id, parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-gray-700"
                    />
                  </div>
                  
                  <div className="w-16 text-center font-bold text-primary">
                    {currentScore.toFixed(1)}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div className="mt-4 text-xs text-muted text-center">
        {t('simulation_instructions')}
      </div>
    </div>
  );
};
