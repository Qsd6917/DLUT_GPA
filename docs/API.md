# API 文档

## 概述

DLUT GPA 计算器提供了一套完整的前端 API，用于处理 GPA 计算、课程管理、数据分析等功能。

## 核心 API

### GPA 计算 API

#### calculateGPA(courses, method)
计算给定课程的GPA

**参数:**
- `courses` (Course[]): 课程数组
- `method` (string): 计算方法 ('standard' | 'dalian_university')

**返回:**
- `gpa` (number): 计算得到的GPA值
- `weightedAverage` (number): 加权平均分
- `totalCredits` (number): 总学分

#### calculateSubjectGPAs(courses)
计算各学科的GPA

**参数:**
- `courses` (Course[]): 课程数组

**返回:**
- `subjectGPAs` (Object): 按学科分类的GPA对象

### 课程管理 API

#### addCourse(courseData)
添加新课程

**参数:**
- `courseData` (Partial<Course>): 课程数据

**返回:**
- `Course`: 添加的课程对象

#### updateCourse(courseId, updates)
更新课程信息

**参数:**
- `courseId` (string): 课程ID
- `updates` (Partial<Course>): 更新数据

**返回:**
- `Course`: 更新后的课程对象

#### removeCourse(courseId)
删除课程

**参数:**
- `courseId` (string): 课程ID

**返回:**
- `boolean`: 操作是否成功

### 数据过滤 API

#### filterCourses(courses, filters)
根据条件过滤课程

**参数:**
- `courses` (Course[]): 课程数组
- `filters` (Filters): 过滤条件

**返回:**
- `Course[]`: 过滤后的课程数组

#### searchCourses(courses, searchTerm)
搜索课程

**参数:**
- `courses` (Course[]): 课程数组
- `searchTerm` (string): 搜索词

**返回:**
- `Course[]`: 匹配的课程数组

## 数据模型

### Course
```typescript
interface Course {
  id: string;           // 课程唯一标识
  name: string;         // 课程名称
  credits: number;      // 学分
  score: number;        // 成绩（百分制）
  gpa: number;          // 绩点
  semester: string;     // 学期
  type: '必修' | '选修' | '任选'; // 课程类型
  isCore: boolean;      // 是否为核心课程
  isActive: boolean;    // 是否计入GPA计算
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
}
```

### GpaStats
```typescript
interface GpaStats {
  weightedGpa: number;          // 加权平均GPA
  compulsoryWeightedGpa: number; // 必修课GPA
  weightedAverageScore: number;  // 加权平均分
  totalCredits: number;         // 总学分
  compulsoryCredits: number;    // 必修课学分
  courseCount: number;          // 课程总数
  subjectGPAs: Record<string, number>; // 按学科分类的GPA
}
```

### Filters
```typescript
interface Filters {
  searchTerm?: string;          // 搜索词
  semesters?: string[];         // 选定的学期
  types?: string[];             // 课程类型
  coreOnly?: boolean;           // 仅显示核心课程
  activeOnly?: boolean;         // 仅显示激活课程
}
```

## 上下文 API

### useCourseData
管理所有课程数据的状态

**暴露的方法:**
- `courses`: 课程数组
- `addCourse(data)`: 添加课程
- `removeCourse(id)`: 删除课程
- `updateCourse(id, data)`: 更新课程
- `toggleCourse(id)`: 切换课程激活状态
- `importData(data)`: 导入数据
- `exportData()`: 导出数据

### useCourseFilter
处理课程过滤逻辑

**暴露的方法:**
- `filteredCourses`: 过滤后的课程
- `stats`: 统计数据
- `setFilters(filters)`: 设置过滤条件

## 工具函数 API

### GPA 计算工具
- `scoreToGPA(score)`: 将百分制分数转换为GPA
- `gpaToLetter(gpa)`: 将GPA转换为字母等级
- `calculateSemesterGPAs(courses)`: 计算学期GPA

### 数据处理工具
- `validateCourse(course)`: 验证课程数据
- `sanitizeCourseData(data)`: 清理课程数据
- `calculateCreditDistribution(courses)`: 计算学分分布

## 服务 API

### 数据持久化服务
- `saveData(data)`: 保存数据到本地存储
- `loadData()`: 从本地存储加载数据
- `clearData()`: 清除所有数据
- `backupData()`: 创建数据备份

### 导出服务
- `exportAsJSON(data)`: 导出为JSON格式
- `exportAsCSV(data)`: 导出为CSV格式
- `generateReport(data)`: 生成分析报告

## 错误处理

所有API方法都遵循相同的错误处理模式：

```typescript
try {
  const result = await someAPIMethod(params);
  // 处理成功结果
} catch (error) {
  if (error instanceof ValidationError) {
    // 处理数据验证错误
  } else if (error instanceof CalculationError) {
    // 处理计算错误
  } else {
    // 处理其他错误
  }
}
```

## 使用示例

### 计算GPA
```javascript
import { calculateGPA } from './services/gpaCalculator';

const courses = [
  { name: '数学', credits: 4, score: 95 },
  { name: '物理', credits: 3, score: 87 }
];

const { gpa, weightedAverage } = calculateGPA(courses, 'dalian_university');
console.log(`GPA: ${gpa}, 平均分: ${weightedAverage}`);
```

### 添加课程
```javascript
import { useCourseData } from './hooks/useCourseData';

function AddCourseForm() {
  const { addCourse } = useCourseData();

  const handleSubmit = (courseData) => {
    addCourse(courseData);
  };

  return (
    // 表单组件
  );
}
```

## 版本兼容性

当前API版本: v1.0.0

计划中的破坏性变更将通过新版本号发布，并提供迁移指南。

## 测试 API

所有API方法都有对应的测试用例，可以通过以下命令运行:

```bash
npm run test:api
```