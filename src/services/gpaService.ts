import { CalculationMethod, Course, GpaStats } from '../types';

export function calculateCourseGpa(score: number, method: CalculationMethod): number {
  if (score < 60) return 0;

  switch (method) {
    case CalculationMethod.SUBTRACTIVE: // DLUT 5.0
      return (score - 50) / 10;
    
    case CalculationMethod.LINEAR: // 5.0
      return score / 20;
    
    case CalculationMethod.WES: // WES 4.0
      if (score >= 85) return 4.0;
      if (score >= 75) return 3.0;
      if (score >= 60) return 2.0;
      return 0;

    case CalculationMethod.STD_4_0: // Standard 4.0
      if (score >= 90) return 4.0;
      if (score >= 80) return 3.0;
      if (score >= 70) return 2.0;
      if (score >= 60) return 1.0;
      return 0;

    case CalculationMethod.PKU_4_0: // Peking University 4.0
      return 4 - (3 * Math.pow(100 - score, 2)) / 1600;

    case CalculationMethod.SCALE_4_5: // 4.5 Scale
      if (score >= 90) return 4.5;
      if (score >= 85) return 4.0;
      if (score >= 80) return 3.5;
      if (score >= 75) return 3.0;
      if (score >= 70) return 2.5;
      if (score >= 65) return 2.0;
      if (score >= 60) return 1.5;
      return 0;
      
    default:
      return (score - 50) / 10;
  }
}

export function calculateStats(courses: Course[]): GpaStats {
  const activeCourses = courses.filter(c => c.isActive);
  
  const totalCredits = activeCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalWeightedGpa = activeCourses.reduce((sum, c) => sum + c.gpa * c.credits, 0);
  const totalWeightedScore = activeCourses.reduce((sum, c) => sum + c.score * c.credits, 0);

  const compulsoryCourses = activeCourses.filter(c => c.type === '必修');
  const compulsoryCredits = compulsoryCourses.reduce((sum, c) => sum + c.credits, 0);
  const compulsoryWeightedGpa = compulsoryCourses.reduce((sum, c) => sum + c.gpa * c.credits, 0);

  // Score Distribution
  const distribution = [
    { name: '90-100', value: 0 },
    { name: '80-89', value: 0 },
    { name: '70-79', value: 0 },
    { name: '60-69', value: 0 },
    { name: '<60', value: 0 },
  ];

  activeCourses.forEach(c => {
    if (c.score >= 90) distribution[0].value++;
    else if (c.score >= 80) distribution[1].value++;
    else if (c.score >= 70) distribution[2].value++;
    else if (c.score >= 60) distribution[3].value++;
    else distribution[4].value++;
  });

  return {
    totalCredits,
    weightedGpa: totalCredits > 0 ? totalWeightedGpa / totalCredits : 0,
    weightedAverageScore: totalCredits > 0 ? totalWeightedScore / totalCredits : 0,
    courseCount: activeCourses.length,
    scoreDistribution: distribution,
    compulsoryCredits,
    compulsoryWeightedGpa: compulsoryCredits > 0 ? compulsoryWeightedGpa / compulsoryCredits : 0,
  };
}
