# API 文档

本文只记录当前源码中真实存在并被调用的前端接口。项目没有服务端网络 API；课程数据保存在浏览器本地存储中。

## 数据模型

### Course

定义位置：`src/types/index.ts`

```typescript
export interface Course {
  id: string;
  name: string;
  credits: number;
  score: number;
  gpa: number;
  isActive: boolean;
  semester: string;
  type: '必修' | '选修' | '任选';
  isCore?: boolean;
}
```

说明：

- `score` 使用百分制数值。成绩单中的“通过”类课程在默认数据中以 `score: 0`、`isActive: false` 保留。
- `isActive` 表示是否计入 GPA 与统计。
- `isCore` 是可选字段，缺失时导入与迁移逻辑按 `false` 处理。

### CalculationMethod

定义位置：`src/types/index.ts`

```typescript
export enum CalculationMethod {
  SUBTRACTIVE = 'SUBTRACTIVE',
  LINEAR = 'LINEAR',
  WES = 'WES',
  STD_4_0 = 'STD_4_0',
  PKU_4_0 = 'PKU_4_0',
  SCALE_4_5 = 'SCALE_4_5',
}
```

默认方法在 `src/utils/constants.ts` 中配置为 `CalculationMethod.SUBTRACTIVE`，即大连理工 5.0 口径。

### GpaStats

定义位置：`src/types/index.ts`

```typescript
export interface GpaStats {
  totalCredits: number;
  weightedGpa: number;
  weightedAverageScore: number;
  courseCount: number;
  scoreDistribution: {
    name: string;
    value: number;
    credits?: number;
    percentage?: number;
  }[];
  compulsoryCredits: number;
  compulsoryWeightedGpa: number;
}
```

`GpaStats` 由 `calculateStats` 生成，统计对象应为当前计入 GPA 的课程集合；不要在 UI 中重复实现另一套近似统计模型。

### SemesterTrend

定义位置：`src/types/index.ts`

```typescript
export interface SemesterTrend {
  semester: string;
  gpa: number;
  averageScore: number;
  credits: number;
  courseCount: number;
}
```

### TargetGpaInput / TargetGpaResult

定义位置：`src/types/index.ts`

```typescript
export interface TargetGpaInput {
  currentGpa: number;
  currentCredits: number;
  targetGpa: number;
  futureCredits: number;
  expectedFutureGpa: number;
  maximumGpa: number;
}

export type TargetGpaResult =
  | {
      status: 'reachable';
      outlook: 'achieved' | 'on-track' | 'needs-higher';
      requiredFutureGpa: number;
      projectedGpa: number;
    }
  | {
      status: 'unreachable';
      requiredFutureGpa: number;
      projectedGpa: number;
    }
  | {
      status: 'invalid';
      field: keyof TargetGpaInput;
      reason: 'required' | 'positive' | 'out-of-range';
    };
```

## GPA 服务

定义位置：`src/services/gpaService.ts`

### calculateCourseGpa(score, method)

```typescript
calculateCourseGpa(score: number, method: CalculationMethod): number
```

按指定算法把百分制成绩转换为绩点。`score < 60` 返回 `0`。目前支持：

- `SUBTRACTIVE`：大连理工 5.0，`(score - 50) / 10`
- `LINEAR`：线性 5.0，`score / 20`
- `WES`：WES 4.0 分段
- `STD_4_0`：标准 4.0 分段
- `PKU_4_0`：北大 4.0 公式
- `SCALE_4_5`：4.5 分段

### calculateStats(courses)

```typescript
calculateStats(courses: Course[]): GpaStats
```

计算课程统计。函数内部会再次过滤 `isActive`，因此传入全量课程或已计入课程都能得到只统计激活课程的结果。统计包含：

- 计入课程学分、加权 GPA、加权平均分、课程数
- 必修课学分与必修课加权 GPA
- 成绩区间分布、区间学分、区间课程占比

当计入学分为 `0` 时，GPA 与均分返回 `0`，避免 UI 出现 `NaN`。

### calculateSemesterTrends(courses)

```typescript
calculateSemesterTrends(courses: Course[]): SemesterTrend[]
```

按学期生成趋势数据。只统计 `isActive === true` 且 `credits > 0` 的课程；`score === 0` 但仍被计入的课程会沿用现有业务规则参与计算。

### calculateTargetGpa(input)

```typescript
calculateTargetGpa(input: TargetGpaInput): TargetGpaResult
```

目标 GPA 纯函数。UI 只负责收集输入和展示结果，不在 JSX 中重复公式。

返回结果：

- `reachable`：参数合法，目标在允许绩点范围内可达到；`outlook` 区分已达到、按当前预期可达到、需要更高未来绩点。
- `unreachable`：参数合法，但所需未来绩点超过 `maximumGpa`。
- `invalid`：字段缺失、非正数或超出绩点范围。

## 智能建议服务

定义位置：`src/services/aiAdvisorService.ts`

### getAIRecommendations(studentProfile)

```typescript
getAIRecommendations(studentProfile: StudentProfile): AIDashboardData
```

本地规则分析函数，不发起外部 AI 请求，也不上传成绩数据。它基于当前计入且学分大于 0 的课程生成：

- 推荐课程
- 学习策略
- 学术风险
- 里程碑预测
- 技能差距分析

当没有可分析课程时返回空建议，避免生成伪个性化结论。

相关类型在 `src/types/aiAdvisor.ts` 中定义。

## Hook 接口

### useCourseData()

定义位置：`src/hooks/useCourseData.ts`

```typescript
const {
  courses,
  hydrated,
  method,
  setMethod,
  experiment,
  isExperimentActive,
  addCourse,
  removeCourse,
  toggleCourse,
  updateCourse,
  saveCourse,
  importData,
  resetData,
  updateCourseScore,
  startExperiment,
  resetExperiment,
  restoreExperimentCourse,
  discardExperiment,
  commitExperiment,
  setAllActive,
} = useCourseData();
```

职责：

- 初始化默认成绩单数据
- 读写本地存储
- 维护 GPA 计算方法
- 增删改课程
- 导入课程数据
- 维护正式课程与当前实验草稿的隔离会话
- 批量设置课程是否计入 GPA

当前版本化存储键：

- 课程数据键：`dlut_gpa_courses_transcript_20260704`
- seed 标识键：`dlut_gpa_courses_seed`
- 当前 seed：`transcript-20260704-qian-dayu-v2`

首次打开会写入当前 seed 和 83 门默认课程。当前 seed 下的用户数据会保留；空数组是合法用户状态；损坏 JSON 会安全回退到默认成绩单。实验草稿不会写入正式课程数据；只有 `commitExperiment()` 才会持久化。

### ExperimentSession / ExperimentComparison

定义位置：`src/types/index.ts`；差异计算：`src/services/experimentService.ts`

```typescript
interface ExperimentSession { baselineCourses: Course[]; draftCourses: Course[]; }
type ExperimentChangeKind = 'added' | 'removed' | 'score' | 'included' | 'metadata';
interface ExperimentComparison {
  baselineStats: GpaStats; draftStats: GpaStats; gpaDelta: number;
  averageScoreDelta: number; creditsDelta: number; changes: ExperimentCourseChange[];
}
```

`courses` 在实验会话期间指向 `draftCourses`，页面课程、分析、目标推算和分享报告共享同一实验口径。

### useCourseFilter(courses, baselineCourses, isExperimentActive)

定义位置：`src/hooks/useCourseFilter.ts`

```typescript
const {
  searchTerm,
  setSearchTerm,
  selectedSemesters,
  setSelectedSemesters,
  filterType,
  setFilterType,
  filterCore,
  setFilterCore,
  semesters,
  semesterOptions,
  filteredCourses,
  activeCourses,
  stats,
  baselineStats,
  clearFilters,
  hasActiveFilters,
} = useCourseFilter(courses, baselineCourses, isExperimentActive);
```

职责：

- 按学期、课程类型、核心课程、搜索词过滤课程
- 生成当前筛选后的 `activeCourses`
- 使用 `calculateStats(activeCourses)` 生成页面统计
- 实验模式下按同一筛选口径计算 `baselineStats`

总览页和分享报告应复用这里产出的 `stats`、`activeCourses`、`filteredCourses` 与 `hasActiveFilters`，确保页面和报告口径一致。

## 测试工具

### renderWithProviders(ui, options)

定义位置：`src/test/renderWithProviders.tsx`

仅供测试使用。默认 Provider 顺序与应用一致：

```text
ThemeProvider -> LanguageProvider -> LoadingProvider
```

可选项：

- `initialTheme?: 'dark' | 'light'`
- `initialLanguage?: 'zh' | 'en'`

它不是生产公共 API。

## 命令

当前真实脚本见 `package.json`：

```bash
npm run type-check
npm run lint
npm run test:run
npm run test:coverage
npm run build
```

不存在 `npm run test:api`、`calculateGPA`、`calculateSubjectGPAs`、`filterCourses`、`searchCourses`、`saveData`、`loadData`、`generateReport` 等公共 API 或脚本；不要为了兼容旧文档在源码中补造无调用方接口。
