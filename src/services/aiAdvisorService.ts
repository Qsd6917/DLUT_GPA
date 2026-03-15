import { Course } from '../types';
import { StudentProfile, CoursePerformance, Recommendation, LearningStrategy, AIDashboardData } from '../types/aiAdvisor';

// Mock course performance database - in a real app, this would come from aggregated student data
const MOCK_COURSE_PERFORMANCE_DATA: CoursePerformance[] = [
  {
    courseId: 'MATH101',
    courseName: '高等数学',
    avgScore: 78,
    difficulty: 7,
    prerequisiteScores: {}
  },
  {
    courseId: 'PHYS201',
    courseName: '大学物理',
    avgScore: 75,
    difficulty: 8,
    prerequisiteScores: {
      'MATH101': 70
    }
  },
  {
    courseId: 'CS101',
    courseName: '计算机科学导论',
    avgScore: 82,
    difficulty: 6,
    prerequisiteScores: {}
  },
  {
    courseId: 'ENG101',
    courseName: '大学英语',
    avgScore: 85,
    difficulty: 4,
    prerequisiteScores: {}
  }
];

/**
 * Calculate student's subject-wise performance based on their courses
 */
function analyzeSubjectPerformance(courses: Course[]): Record<string, { avgScore: number, totalCredits: number }> {
  const subjectMap: Record<string, { scores: number[], credits: number[] }> = {};
  
  // Simple heuristic to categorize courses by subject based on name
  courses.forEach(course => {
    let subject = 'General';
    
    // Determine subject based on course name
    if (course.name.includes('数学') || course.name.includes('Math')) {
      subject = 'Mathematics';
    } else if (course.name.includes('物理') || course.name.includes('Phys')) {
      subject = 'Physics';
    } else if (course.name.includes('英语') || course.name.includes('Eng')) {
      subject = 'English';
    } else if (course.name.includes('计算机') || course.name.includes('Computer') || course.name.includes('CS')) {
      subject = 'Computer Science';
    } else if (course.name.includes('化学') || course.name.includes('Chem')) {
      subject = 'Chemistry';
    } else if (course.name.includes('生物') || course.name.includes('Bio')) {
      subject = 'Biology';
    }
    
    if (!subjectMap[subject]) {
      subjectMap[subject] = { scores: [], credits: [] };
    }
    
    subjectMap[subject].scores.push(course.score);
    subjectMap[subject].credits.push(course.credits);
  });
  
  const result: Record<string, { avgScore: number, totalCredits: number }> = {};
  Object.entries(subjectMap).forEach(([subject, data]) => {
    const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const totalCredits = data.credits.reduce((a, b) => a + b, 0);
    result[subject] = { avgScore, totalCredits };
  });
  
  return result;
}

/**
 * Determine student's strengths and weaknesses based on subject performance
 */
function identifyStrengthsAndWeaknesses(subjectPerformance: Record<string, { avgScore: number, totalCredits: number }>): { strengths: string[], weaknesses: string[] } {
  const entries = Object.entries(subjectPerformance);
  if (entries.length === 0) {
    return { strengths: [], weaknesses: [] };
  }
  
  // Calculate average score across all subjects
  const overallAvg = entries.reduce((sum, [, perf]) => sum + perf.avgScore, 0) / entries.length;
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  entries.forEach(([subject, perf]) => {
    if (perf.avgScore > overallAvg + 5) { // Strength threshold
      strengths.push(subject);
    } else if (perf.avgScore < overallAvg - 5) { // Weakness threshold
      weaknesses.push(subject);
    }
  });
  
  return { strengths, weaknesses };
}

/**
 * Predict success probability for a course based on student profile
 */
function predictSuccessProbability(studentProfile: StudentProfile, course: CoursePerformance): number {
  // Base probability from course difficulty
  let probability = 1 - (course.difficulty / 10);
  
  // Adjust based on student's subject strengths/weaknesses
  let subjectMatchFactor = 1.0;
  const subjectPerformance = analyzeSubjectPerformance(studentProfile.courses);
  
  // Determine the likely subject of the course
  let courseSubject = 'General';
  if (course.courseName.includes('数学') || course.courseName.includes('Math')) {
    courseSubject = 'Mathematics';
  } else if (course.courseName.includes('物理') || course.courseName.includes('Phys')) {
    courseSubject = 'Physics';
  } else if (course.courseName.includes('英语') || course.courseName.includes('Eng')) {
    courseSubject = 'English';
  } else if (course.courseName.includes('计算机') || course.courseName.includes('Computer') || course.courseName.includes('CS')) {
    courseSubject = 'Computer Science';
  }
  
  if (subjectPerformance[courseSubject]) {
    // Compare to overall average to determine if this is a strength/weakness area
    const allSubjects = Object.values(subjectPerformance);
    const overallAvg = allSubjects.reduce((sum, perf) => sum + perf.avgScore, 0) / allSubjects.length;
    const courseSubjectAvg = subjectPerformance[courseSubject].avgScore;
    
    if (courseSubjectAvg > overallAvg + 5) {
      // This is a strength area
      subjectMatchFactor = 1.2;
    } else if (courseSubjectAvg < overallAvg - 5) {
      // This is a weakness area
      subjectMatchFactor = 0.7;
    }
  }
  
  probability *= subjectMatchFactor;
  
  // Adjust based on prerequisites
  if (Object.keys(course.prerequisiteScores).length > 0) {
    let prereqSatisfaction = 0;
    let prereqCount = 0;
    
    for (const [prereqId, requiredScore] of Object.entries(course.prerequisiteScores)) {
      const prereqCourse = studentProfile.courses.find(c => c.id === prereqId);
      if (prereqCourse) {
        prereqSatisfaction += Math.min(1.0, prereqCourse.score / requiredScore);
        prereqCount++;
      }
    }
    
    if (prereqCount > 0) {
      const avgPrereqSatisfaction = prereqSatisfaction / prereqCount;
      probability *= avgPrereqSatisfaction;
    }
  }
  
  // Ensure probability stays within bounds
  probability = Math.max(0.1, Math.min(0.95, probability));
  
  return probability;
}

/**
 * Predict the grade a student might achieve in a course
 */
function predictGrade(studentProfile: StudentProfile, course: CoursePerformance): number {
  const successProb = predictSuccessProbability(studentProfile, course);
  
  // Base prediction on course average, adjusted by success probability
  const adjustment = (successProb - 0.5) * 20; // Adjust up to ±20 points based on success probability
  const predictedGrade = Math.max(0, Math.min(100, course.avgScore + adjustment));
  
  return predictedGrade;
}

/**
 * Generate learning strategies for a specific course based on student profile
 */
function generateLearningStrategies(studentProfile: StudentProfile, course: CoursePerformance): LearningStrategy {
  let courseSubject = 'General';
  if (course.courseName.includes('数学') || course.courseName.includes('Math')) {
    courseSubject = 'Mathematics';
  } else if (course.courseName.includes('物理') || course.courseName.includes('Phys')) {
    courseSubject = 'Physics';
  } else if (course.courseName.includes('英语') || course.courseName.includes('Eng')) {
    courseSubject = 'English';
  } else if (course.courseName.includes('计算机') || course.courseName.includes('Computer') || course.courseName.includes('CS')) {
    courseSubject = 'Computer Science';
  }
  
  const strategies: string[] = [];
  const resources: string[] = [];
  
  // Adjust strategies based on whether this is a strength or weakness area
  const isStrengthArea = studentProfile.strengths.includes(courseSubject);
  const isWeaknessArea = studentProfile.weaknesses.includes(courseSubject);
  
  if (isWeaknessArea) {
    strategies.push(
      '分配更多时间复习基础知识',
      '寻求辅导或加入学习小组',
      '制定详细的每日学习计划'
    );
    resources.push(
      '基础概念视频教程',
      '额外练习题集',
      '在线答疑论坛'
    );
  } else if (isStrengthArea) {
    strategies.push(
      '专注于高级概念和应用',
      '帮助其他同学巩固知识',
      '探索相关领域的拓展内容'
    );
    resources.push(
      '高级教材',
      '研究项目机会',
      '竞赛参与'
    );
  } else {
    strategies.push(
      '保持当前学习节奏',
      '定期自我评估理解程度',
      '合理分配学习时间'
    );
    resources.push(
      '标准教科书',
      '课堂笔记整理',
      '课后习题练习'
    );
  }
  
  // Add strategies based on preferred schedule
  if (studentProfile.preferredSchedule === 'morning') {
    strategies.push('在上午时段安排此课程的学习');
  } else if (studentProfile.preferredSchedule === 'evening') {
    strategies.push('在晚间时段安排此课程的学习');
  }
  
  // Estimate study time based on course difficulty and student's proficiency
  const baseStudyTime = course.difficulty * 2; // Base 2 hours per difficulty unit
  let adjustedStudyTime = baseStudyTime;
  
  if (isWeaknessArea) {
    adjustedStudyTime *= 1.5; // Need extra time for weak areas
  } else if (isStrengthArea) {
    adjustedStudyTime *= 0.7; // Less time needed for strong areas
  }
  
  const difficultyAssessment = course.difficulty > 7 ? 'high' : 
                              course.difficulty > 4 ? 'medium' : 'low';
  
  return {
    courseId: course.courseId,
    strategies,
    resources,
    timeline: `建议每周投入 ${adjustedStudyTime.toFixed(1)} 小时`,
    difficultyAssessment
  };
}

/**
 * Main AI Advisor service function
 */
export function getAIRecommendations(studentProfile: StudentProfile): AIDashboardData {
  // Analyze subject performance
  const subjectPerformance = analyzeSubjectPerformance(studentProfile.courses);
  const strengthsAndWeaknesses = identifyStrengthsAndWeaknesses(subjectPerformance);

  const derivedProfile: StudentProfile = {
    ...studentProfile,
    strengths: strengthsAndWeaknesses.strengths,
    weaknesses: strengthsAndWeaknesses.weaknesses,
  };
  
  // Generate recommendations for potential courses
  const recommendations: Recommendation[] = [];
  
  // Filter out courses the student has already taken
  const availableCourses = MOCK_COURSE_PERFORMANCE_DATA.filter(courseData => 
    !derivedProfile.courses.some(takenCourse => takenCourse.id === courseData.courseId)
  );
  
  for (const courseData of availableCourses) {
    const predictedGrade = predictGrade(derivedProfile, courseData);
    const successProbability = predictSuccessProbability(derivedProfile, courseData);
    
    // Calculate confidence based on how well we can predict this outcome
    const confidence = 0.8; // In a real system, this would be based on data availability
    
    // Determine reason for recommendation
    let reason = '';
    const courseSubject = courseData.courseName.includes('数学') || courseData.courseName.includes('Math') ? 'Mathematics' :
                       courseData.courseName.includes('物理') || courseData.courseName.includes('Phys') ? 'Physics' :
                       courseData.courseName.includes('英语') || courseData.courseName.includes('Eng') ? 'English' :
                       courseData.courseName.includes('计算机') || courseData.courseName.includes('Computer') || courseData.courseName.includes('CS') ? 'Computer Science' : 'General';
    
    if (derivedProfile.strengths.includes(courseSubject)) {
      reason = `符合您的${courseSubject}优势领域`;
    } else if (derivedProfile.weaknesses.includes(courseSubject) && successProbability > 0.6) {
      reason = `虽然这是您的薄弱环节，但您有潜力在此取得进步`;
    } else if (successProbability > 0.8) {
      reason = '基于您的背景，预计能取得优异成绩';
    } else if (derivedProfile.careerGoals.some(goal => 
      (courseData.courseName.includes('计算机') || courseData.courseName.includes('CS')) && goal.toLowerCase().includes('tech'))) {
      reason = `符合您的职业目标: ${derivedProfile.careerGoals.find(g => g.toLowerCase().includes('tech'))}`;
    } else {
      reason = '综合考虑您的学术背景后的推荐';
    }
    
    recommendations.push({
      courseId: courseData.courseId,
      courseName: courseData.courseName,
      confidence,
      predictedGrade,
      successProbability,
      reason,
      suggestedStudyTime: Number(
        (courseData.difficulty * 2 * (derivedProfile.strengths.includes(courseSubject) ? 0.7 : 1)).toFixed(1)
      )
    });
  }
  
  // Sort recommendations by success probability
  recommendations.sort((a, b) => b.successProbability - a.successProbability);
  
  // Generate learning strategies for top recommended courses
  const learningStrategies: LearningStrategy[] = [];
  const topRecommendations = recommendations.slice(0, 3); // Top 3 recommendations
  
  for (const rec of topRecommendations) {
    const courseData = MOCK_COURSE_PERFORMANCE_DATA.find(cd => cd.courseId === rec.courseId);
    if (courseData) {
      learningStrategies.push(generateLearningStrategies(derivedProfile, courseData));
    }
  }
  
  // Identify academic risks
  const academicRisks: string[] = [];
  
  if (derivedProfile.weaknesses.length > 0) {
    academicRisks.push(`在 ${derivedProfile.weaknesses.join(', ')} 方面存在薄弱环节`);
  }
  
  if (derivedProfile.gpaStats.weightedGpa < derivedProfile.targetGPA - 0.5) {
    academicRisks.push(`当前GPA低于目标GPA较多，需要重点关注提分策略`);
  }
  
  if (derivedProfile.studyHoursPerWeek < 20) {
    academicRisks.push(`每周学习时间可能不足，建议增加学习投入`);
  }
  
  // Project milestone predictions
  const milestonePredictions = {
    targetGpaDate: null as Date | null, // Would require more complex modeling in a real system
    graduationProjection: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000) // Assume 3 years to graduation
  };
  
  // Generate skill gap analysis
  const skillGapAnalysis = Object.entries(subjectPerformance).map(([skill, perf]) => {
    // Determine priority based on how far below average this skill is
    const allSkills = Object.values(subjectPerformance);
    const avgScore = allSkills.reduce((sum, s) => sum + s.avgScore, 0) / allSkills.length;
    const proficiency = perf.avgScore / 100; // Normalize to 0-1 scale
    
    let priority = 3; // Medium priority
    if (perf.avgScore < avgScore - 10) {
      priority = 5; // High priority
    } else if (perf.avgScore < avgScore - 5) {
      priority = 4; // Above medium
    } else if (perf.avgScore > avgScore + 10) {
      priority = 1; // Low priority (strength)
    }
    
    return {
      skill,
      proficiency,
      improvementPriority: priority
    };
  });
  
  return {
    recommendations,
    learningStrategies,
    academicRisks,
    milestonePredictions,
    skillGapAnalysis
  };
}
