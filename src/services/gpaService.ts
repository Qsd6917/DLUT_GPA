import {
  CalculationMethod,
  Course,
  GpaStats,
  TargetGpaInput,
  TargetGpaResult,
  TargetScorePlanInput,
  TargetScorePlanResult,
  SemesterTrend,
} from '../types';

const TARGET_SCORE_STEPS = 1000;

export function getMaximumGpa(method: CalculationMethod): number {
  switch (method) {
    case CalculationMethod.SUBTRACTIVE:
    case CalculationMethod.LINEAR:
      return 5;
    case CalculationMethod.SCALE_4_5:
      return 4.5;
    case CalculationMethod.WES:
    case CalculationMethod.STD_4_0:
    case CalculationMethod.PKU_4_0:
      return 4;
  }
}

export function calculateTargetScorePlan(
  input: TargetScorePlanInput
): TargetScorePlanResult {
  const maximumGpa = getMaximumGpa(input.method);

  if (!Number.isFinite(input.currentGpa)) {
    return { status: 'invalid', field: 'currentGpa', reason: 'required' };
  }
  if (!Number.isFinite(input.currentCredits)) {
    return { status: 'invalid', field: 'currentCredits', reason: 'required' };
  }
  if (!Number.isFinite(input.targetGpa)) {
    return { status: 'invalid', field: 'targetGpa', reason: 'required' };
  }
  if (input.currentCredits < 0) {
    return { status: 'invalid', field: 'currentCredits', reason: 'positive' };
  }
  if (input.currentGpa < 0 || input.currentGpa > maximumGpa) {
    return { status: 'invalid', field: 'currentGpa', reason: 'out-of-range' };
  }
  if (input.targetGpa < 0 || input.targetGpa > maximumGpa) {
    return { status: 'invalid', field: 'targetGpa', reason: 'out-of-range' };
  }
  if (input.courses.length === 0) {
    return { status: 'invalid', field: 'courses', reason: 'no-courses' };
  }

  const seenCourseIds = new Set<string>();
  for (const course of input.courses) {
    if (course.id.trim().length === 0) {
      return { status: 'invalid', field: 'courses', reason: 'required' };
    }
    if (seenCourseIds.has(course.id)) {
      return {
        status: 'invalid',
        field: 'courses',
        reason: 'out-of-range',
        courseId: course.id,
      };
    }
    seenCourseIds.add(course.id);

    if (!Number.isFinite(course.credits)) {
      return {
        status: 'invalid',
        field: 'courseCredits',
        reason: 'required',
        courseId: course.id,
      };
    }
    if (course.credits <= 0) {
      return {
        status: 'invalid',
        field: 'courseCredits',
        reason: 'positive',
        courseId: course.id,
      };
    }
    if (course.score.mode === 'fixed' && !Number.isFinite(course.score.value)) {
      return {
        status: 'invalid',
        field: 'fixedScore',
        reason: 'required',
        courseId: course.id,
      };
    }
    if (
      course.score.mode === 'fixed' &&
      (course.score.value < 0 || course.score.value > 100)
    ) {
      return {
        status: 'invalid',
        field: 'fixedScore',
        reason: 'out-of-range',
        courseId: course.id,
      };
    }
  }

  const currentQuality = input.currentGpa * input.currentCredits;
  if (!Number.isFinite(currentQuality)) {
    return {
      status: 'invalid',
      field: 'currentCredits',
      reason: 'out-of-range',
    };
  }

  let plannedCredits = 0;
  let fixedQuality = 0;
  let autoCredits = 0;
  for (const course of input.courses) {
    const nextPlannedCredits = plannedCredits + course.credits;
    if (!Number.isFinite(nextPlannedCredits)) {
      return {
        status: 'invalid',
        field: 'courseCredits',
        reason: 'out-of-range',
        courseId: course.id,
      };
    }
    plannedCredits = nextPlannedCredits;

    if (!Number.isFinite(input.currentCredits + plannedCredits)) {
      return {
        status: 'invalid',
        field: 'courseCredits',
        reason: 'out-of-range',
        courseId: course.id,
      };
    }

    if (course.score.mode === 'auto') {
      const nextAutoCredits = autoCredits + course.credits;
      if (!Number.isFinite(nextAutoCredits)) {
        return {
          status: 'invalid',
          field: 'courseCredits',
          reason: 'out-of-range',
          courseId: course.id,
        };
      }
      autoCredits = nextAutoCredits;
      continue;
    }

    const courseQuality =
      calculateCourseGpa(course.score.value, input.method) * course.credits;
    const nextFixedQuality = fixedQuality + courseQuality;
    if (!Number.isFinite(courseQuality) || !Number.isFinite(nextFixedQuality)) {
      return {
        status: 'invalid',
        field: 'courseCredits',
        reason: 'out-of-range',
        courseId: course.id,
      };
    }
    fixedQuality = nextFixedQuality;

    if (!Number.isFinite(currentQuality + fixedQuality)) {
      return {
        status: 'invalid',
        field: 'courseCredits',
        reason: 'out-of-range',
        courseId: course.id,
      };
    }
  }

  const combinedCredits = input.currentCredits + plannedCredits;
  const baseQuality = currentQuality + fixedQuality;
  const targetQuality = input.targetGpa * combinedCredits;
  if (!Number.isFinite(targetQuality)) {
    return { status: 'invalid', field: 'courses', reason: 'out-of-range' };
  }

  let bestPossibleQuality = baseQuality;
  for (const course of input.courses) {
    if (course.score.mode === 'fixed') continue;

    const courseQuality = maximumGpa * course.credits;
    const nextBestPossibleQuality = bestPossibleQuality + courseQuality;
    if (
      !Number.isFinite(courseQuality) ||
      !Number.isFinite(nextBestPossibleQuality)
    ) {
      return {
        status: 'invalid',
        field: 'courseCredits',
        reason: 'out-of-range',
        courseId: course.id,
      };
    }
    bestPossibleQuality = nextBestPossibleQuality;
  }

  const scoresFor = (automaticScore: number) =>
    input.courses.map(course => ({
      courseId: course.id,
      score: course.score.mode === 'auto' ? automaticScore : course.score.value,
    }));
  const projectedGpaFor = (automaticScore: number) =>
    (baseQuality +
      calculateCourseGpa(automaticScore, input.method) * autoCredits) /
    combinedCredits;

  if (autoCredits === 0) {
    const projectedGpa = baseQuality / combinedCredits;
    const courseScores = scoresFor(0);
    if (projectedGpa >= input.targetGpa) {
      return {
        status: 'feasible',
        recommendedScore: null,
        projectedGpa,
        requiredAutoGpa: null,
        courseScores,
      };
    }
    return {
      status: 'unreachable',
      bestPossibleGpa: projectedGpa,
      shortfall: input.targetGpa - projectedGpa,
      courseScores,
    };
  }

  const bestPossibleGpa = bestPossibleQuality / combinedCredits;
  if (bestPossibleGpa < input.targetGpa) {
    return {
      status: 'unreachable',
      bestPossibleGpa,
      shortfall: input.targetGpa - bestPossibleGpa,
      courseScores: scoresFor(100),
    };
  }

  const requiredAutoGpa = Math.max(
    0,
    (targetQuality - baseQuality) / autoCredits
  );
  for (let step = 0; step <= TARGET_SCORE_STEPS; step += 1) {
    const recommendedScore = step / 10;
    const projectedGpa = projectedGpaFor(recommendedScore);
    if (projectedGpa >= input.targetGpa) {
      return {
        status: 'feasible',
        recommendedScore,
        projectedGpa,
        requiredAutoGpa,
        courseScores: scoresFor(recommendedScore),
      };
    }
  }

  return {
    status: 'unreachable',
    bestPossibleGpa,
    shortfall: input.targetGpa - bestPossibleGpa,
    courseScores: scoresFor(100),
  };
}

export function calculateTargetGpa(input: TargetGpaInput): TargetGpaResult {
  const numericFields = Object.entries(input) as [
    keyof TargetGpaInput,
    number,
  ][];
  const missing = numericFields.find(([, value]) => !Number.isFinite(value));
  if (missing) {
    return { status: 'invalid', field: missing[0], reason: 'required' };
  }
  if (input.futureCredits <= 0) {
    return { status: 'invalid', field: 'futureCredits', reason: 'positive' };
  }
  if (input.currentCredits < 0) {
    return { status: 'invalid', field: 'currentCredits', reason: 'positive' };
  }
  if (input.maximumGpa <= 0) {
    return { status: 'invalid', field: 'maximumGpa', reason: 'positive' };
  }
  if (input.currentGpa < 0 || input.currentGpa > input.maximumGpa) {
    return { status: 'invalid', field: 'currentGpa', reason: 'out-of-range' };
  }
  if (input.targetGpa < 0 || input.targetGpa > input.maximumGpa) {
    return { status: 'invalid', field: 'targetGpa', reason: 'out-of-range' };
  }
  if (
    input.expectedFutureGpa < 0 ||
    input.expectedFutureGpa > input.maximumGpa
  ) {
    return {
      status: 'invalid',
      field: 'expectedFutureGpa',
      reason: 'out-of-range',
    };
  }

  const combinedCredits = input.currentCredits + input.futureCredits;
  const requiredFutureGpa =
    (input.targetGpa * combinedCredits -
      input.currentGpa * input.currentCredits) /
    input.futureCredits;
  const projectedGpa =
    (input.currentGpa * input.currentCredits +
      input.expectedFutureGpa * input.futureCredits) /
    combinedCredits;
  if (input.currentGpa >= input.targetGpa) {
    return {
      status: 'reachable',
      outlook: 'achieved',
      requiredFutureGpa: 0,
      projectedGpa,
    };
  }
  const shared = {
    requiredFutureGpa: Math.max(0, requiredFutureGpa),
    projectedGpa,
  };

  if (requiredFutureGpa > input.maximumGpa) {
    return { status: 'unreachable', ...shared };
  }
  return {
    status: 'reachable',
    outlook:
      input.expectedFutureGpa + Number.EPSILON >= requiredFutureGpa
        ? 'on-track'
        : 'needs-higher',
    ...shared,
  };
}

/**
 * 加权平均的安全除法：分母非正或非有限、分子非有限时一律返回 0，
 * 避免 NaN / Infinity / 负值从统计结果里泄漏出去。
 */
function safeWeightedAverage(weightedTotal: number, credits: number): number {
  if (!Number.isFinite(weightedTotal) || !Number.isFinite(credits)) return 0;
  if (credits <= 0) return 0;
  return weightedTotal / credits;
}

/**
 * 把单个课程的绩点 / 成绩归一成可参与累加的非负值。
 * 负值只可能来自历史脏数据（例如旧版 PKU_4_0 对 150 分算出的 -0.6875），
 * 没有成绩语义，按 0 计；对合法数据是恒等变换。
 */
function nonNegative(value: number): number {
  return value > 0 ? value : 0;
}

export function calculateSemesterTrends(courses: Course[]): SemesterTrend[] {
  const groups = new Map<string, Course[]>();
  courses
    .filter(
      course =>
        course.isActive &&
        Number.isFinite(course.credits) &&
        course.credits > 0 &&
        Number.isFinite(course.score) &&
        Number.isFinite(course.gpa)
    )
    .forEach(course =>
      groups.set(course.semester, [
        ...(groups.get(course.semester) ?? []),
        course,
      ])
    );
  return [...groups.entries()]
    .sort(([left], [right]) =>
      left.localeCompare(right, undefined, { numeric: true })
    )
    .map(([semester, items]) => {
      const credits = items.reduce((sum, course) => sum + course.credits, 0);
      const weightedGpa = items.reduce(
        (sum, course) => sum + nonNegative(course.gpa) * course.credits,
        0
      );
      const weightedScore = items.reduce(
        (sum, course) => sum + nonNegative(course.score) * course.credits,
        0
      );
      return {
        semester,
        gpa: safeWeightedAverage(weightedGpa, credits),
        averageScore: safeWeightedAverage(weightedScore, credits),
        credits,
        courseCount: items.length,
      };
    });
}

export function calculateCourseGpa(
  score: number,
  method: CalculationMethod
): number {
  // 非有限数（NaN / ±Infinity）没有可用的成绩语义，直接记 0，
  // 否则 SUBTRACTIVE / LINEAR / PKU_4_0 会把它继续传下去。
  if (!Number.isFinite(score)) return 0;

  // 越界成绩（导入脏数据、手工录入、OCR 误识别）先钳制回 [0, 100] 的有效区间，
  // 再走原有算法，保证结果不会超出该算法满分（如 150 分不再得到 10.0）。
  const clampedScore = Math.min(100, Math.max(0, score));

  if (clampedScore < 60) return 0;

  switch (method) {
    case CalculationMethod.SUBTRACTIVE: // DLUT 5.0
      return (clampedScore - 50) / 10;

    case CalculationMethod.LINEAR: // 5.0
      return clampedScore / 20;

    case CalculationMethod.WES: // WES 4.0
      if (clampedScore >= 85) return 4.0;
      if (clampedScore >= 75) return 3.0;
      if (clampedScore >= 60) return 2.0;
      return 0;

    case CalculationMethod.STD_4_0: // Standard 4.0
      if (clampedScore >= 90) return 4.0;
      if (clampedScore >= 80) return 3.0;
      if (clampedScore >= 70) return 2.0;
      if (clampedScore >= 60) return 1.0;
      return 0;

    case CalculationMethod.PKU_4_0: // Peking University 4.0
      return 4 - (3 * Math.pow(100 - clampedScore, 2)) / 1600;

    case CalculationMethod.SCALE_4_5: // 4.5 Scale
      if (clampedScore >= 90) return 4.5;
      if (clampedScore >= 85) return 4.0;
      if (clampedScore >= 80) return 3.5;
      if (clampedScore >= 75) return 3.0;
      if (clampedScore >= 70) return 2.5;
      if (clampedScore >= 65) return 2.0;
      if (clampedScore >= 60) return 1.5;
      return 0;

    default:
      return (clampedScore - 50) / 10;
  }
}

export function calculateStats(courses: Course[]): GpaStats {
  const activeCourses = courses.filter(c => c.isActive);

  // 第二道过滤只校验「数据本身可用」：学分、成绩、绩点必须都是有限数，且学分不为负。
  // 它不改 isActive 的纳入语义——0 学分课程仍然计入课程数与分布档位（与既有口径一致），
  // 只是把 NaN / Infinity / 负学分这类脏数据挡在统计之外：一个 NaN 会顺着累加污染
  // 整条统计链，NaN 成绩还会被误归进「<60」档。
  const validCourses = activeCourses.filter(
    c =>
      Number.isFinite(c.credits) &&
      c.credits >= 0 &&
      Number.isFinite(c.score) &&
      Number.isFinite(c.gpa)
  );

  // 累加口径再收紧一步：只有学分 > 0 的课程参与学分与加权求和，
  // 否则负学分会让加权值突破满分、让分母归零（→ Infinity）或与其他课程正负抵消。
  const countableCourses = validCourses.filter(c => c.credits > 0);

  const totalCredits = countableCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalWeightedGpa = countableCourses.reduce(
    (sum, c) => sum + nonNegative(c.gpa) * c.credits,
    0
  );
  const totalWeightedScore = countableCourses.reduce(
    (sum, c) => sum + nonNegative(c.score) * c.credits,
    0
  );

  const compulsoryCourses = countableCourses.filter(c => c.type === '必修');
  const compulsoryCredits = compulsoryCourses.reduce(
    (sum, c) => sum + c.credits,
    0
  );
  const compulsoryWeightedGpa = compulsoryCourses.reduce(
    (sum, c) => sum + nonNegative(c.gpa) * c.credits,
    0
  );

  // Score Distribution
  const distribution = [
    { name: '90-100', value: 0, credits: 0, percentage: 0 },
    { name: '80-89', value: 0, credits: 0, percentage: 0 },
    { name: '70-79', value: 0, credits: 0, percentage: 0 },
    { name: '60-69', value: 0, credits: 0, percentage: 0 },
    { name: '<60', value: 0, credits: 0, percentage: 0 },
  ];

  validCourses.forEach(c => {
    const bucket =
      c.score >= 90
        ? 0
        : c.score >= 80
          ? 1
          : c.score >= 70
            ? 2
            : c.score >= 60
              ? 3
              : 4;
    distribution[bucket].value++;
    distribution[bucket].credits += c.credits;
  });
  distribution.forEach(bucket => {
    bucket.percentage =
      validCourses.length > 0 ? (bucket.value / validCourses.length) * 100 : 0;
  });

  return {
    totalCredits,
    weightedGpa: safeWeightedAverage(totalWeightedGpa, totalCredits),
    weightedAverageScore: safeWeightedAverage(totalWeightedScore, totalCredits),
    courseCount: validCourses.length,
    scoreDistribution: distribution,
    compulsoryCredits,
    compulsoryWeightedGpa: safeWeightedAverage(
      compulsoryWeightedGpa,
      compulsoryCredits
    ),
  };
}
