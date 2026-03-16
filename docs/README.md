# DLUT GPA 计算器项目文档

## 目录
1. [项目概述](#项目概述)
2. [快速开始](#快速开始)
3. [功能介绍](#功能介绍)
4. [架构说明](#架构说明)
5. [性能优化](#性能优化)
6. [开发指南](#开发指南)
7. [API 说明](#api-说明)
8. [部署指南](#部署指南)
9. [贡献指南](#贡献指南)
10. [自我改进记忆](#自我改进记忆)
11. [许可证](#许可证)

## 项目概述

DLUT GPA 计算器是专门为大连理工大学学生设计的GPA计算和分析工具。该项目基于 React 和 TypeScript 构建，提供了完整的课程管理、GPA计算、数据分析等功能。

### 技术栈
- React 18+ (with hooks)
- TypeScript
- TailwindCSS
- Vite (构建工具)
- Lucide React (图标库)
- Recharts (图表库)
- PWA (渐进式Web应用)

### 核心特性
- 多种GPA计算方式（加权平均、百分制转绩点等）
- 课程管理和成绩录入
- 数据可视化（图表分析）
- AI学术顾问功能
- 沙盒模式（数据实验）
- 无障碍访问支持（符合WCAG 2.1 AA标准）
- 国际化支持（中英双语）

## 快速开始

### 环境要求
- Node.js v18 或更高版本
- npm 或 yarn

### 安装依赖
```bash
cd dlut-gpa
npm install
```

### 开发模式启动
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 功能介绍

### 1. GPA计算
- **加权平均GPA**：根据学分权重计算总体GPA
- **必修课GPA**：单独计算必修课的GPA
- **百分制转绩点**：支持百分制成绩转换为大连理工绩点

### 2. 课程管理
- **添加课程**：录入课程名称、学分、成绩、学期等信息
- **编辑课程**：修改已有课程信息
- **删除课程**：移除不需要的课程
- **课程筛选**：按学期、类型、核心课程等条件筛选
- **批量操作**：批量激活/停用课程

### 3. 数据分析
- **成绩分布图表**：可视化展示成绩分布
- **GPA趋势分析**：展示GPA变化趋势
- **目标GPA计算器**：预测达到目标GPA所需的策略
- **毕业进度追踪**：监控学分完成情况

### 4. AI学术顾问
- **个性化推荐**：基于学习成绩推荐适合的课程
- **学习策略建议**：提供个性化的学习策略
- **学术风险预警**：识别潜在的学术风险
- **技能差距分析**：分析技能短板并提供改进方案

### 5. 数据管理
- **数据导入/导出**：支持JSON格式数据导入导出
- **沙盒模式**：在不影响原始数据的情况下进行实验
- **数据分享**：生成可分享的成绩报告

### 6. 可视化功能
- **雷达图**：多维度展示学术能力
- **直方图**：成绩分布可视化
- **趋势图**：GPA和成绩趋势展示

## 架构说明

### 项目结构
```
src/
├── app/                    # 主应用程序组件
├── components/             # 可复用UI组件
│   ├── analytics/          # 分析相关组件
│   ├── course/             # 课程管理组件
│   ├── data/               # 数据管理组件
│   ├── layout/             # 布局组件
│   └── common/             # 通用组件
├── contexts/               # React上下文
├── hooks/                  # 自定义React钩子
├── services/               # 业务逻辑服务
├── types/                  # TypeScript类型定义
├── utils/                  # 工具函数
└── assets/                 # 静态资源
    └── styles/             # 样式文件
```

### 主要组件说明

#### App.tsx
- 应用主组件，协调所有功能模块
- 管理全局状态和UI交互
- 控制页面布局和导航

#### useCourseData Hook
- 管理课程数据的增删改查
- 提供数据持久化功能
- 支持沙盒模式操作

#### useCourseFilter Hook
- 实现课程筛选和搜索功能
- 提供统计数据计算
- 管理筛选条件状态

#### AIAdvisorPanel
- 提供本地规则驱动的学术分析
- 实现个性化推荐算法

## 性能优化

### 代码分割
- 使用 React.lazy 实现组件懒加载
- 按需加载大型功能模块（如AI顾问面板）
- 减少初始包大小

### 防抖处理
- 在搜索功能中使用防抖算法
- 减少不必要的重新渲染
- 提升用户体验

### 内存优化
- 合理使用React.memo优化组件
- 避免不必要的重新渲染
- 有效管理组件生命周期

## 开发指南

### 添加新功能

#### 1. 创建新组件
```typescript
// components/new-feature/NewFeature.tsx
import React from 'react';

interface NewFeatureProps {
  // props 定义
}

const NewFeature: React.FC<NewFeatureProps> = ({}) => {
  return (
    <div className="new-feature">
      {/* 组件内容 */}
    </div>
  );
};

export default NewFeature;
```

#### 2. 创建新 Hook
```typescript
// hooks/useNewFeature.ts
import { useState, useEffect } from 'react';

const useNewFeature = () => {
  const [data, setData] = useState<any>(null);

  // 实现逻辑

  return { data };
};

export default useNewFeature;
```

#### 3. 类型定义
```typescript
// types/index.ts
export interface NewFeatureData {
  // 类型定义
}
```

### 最佳实践

#### 代码规范
- 使用TypeScript编写类型安全的代码
- 遵循React Hooks最佳实践
- 组件保持单一职责原则
- 使用TailwindCSS进行样式设计

#### 性能优化
- 对大数据量列表使用虚拟滚动
- 为频繁触发的事件添加防抖/节流
- 合理使用React.memo避免不必要的重渲染
- 使用懒加载减少初始包大小

#### 可访问性
- 遵循WCAG 2.1 AA标准
- 提供足够的颜色对比度
- 确保键盘导航功能
- 添加适当的ARIA标签

## API 说明

### 数据模型

#### Course 接口
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
}
```

#### GpaStats 接口
```typescript
interface GpaStats {
  weightedGpa: number;          // 加权平均GPA
  compulsoryWeightedGpa: number; // 必修课GPA
  weightedAverageScore: number;  // 加权平均分
  totalCredits: number;         // 总学分
  compulsoryCredits: number;    // 必修课学分
  courseCount: number;          // 课程总数
}
```

### 核心 Hook

#### useCourseData
```typescript
const {
  courses,           // 课程数组
  hydrated,          // 数据加载状态
  method,            // GPA计算方法
  setMethod,         // 设置计算方法
  isSandboxMode,     // 沙盒模式状态
  addCourse,         // 添加课程
  removeCourse,      // 删除课程
  toggleCourse,      // 切换课程激活状态
  saveCourse,        // 保存课程
  importData,        // 导入数据
  resetData,         // 重置数据
  enterSandbox,      // 进入沙盒模式
  exitSandbox,       // 退出沙盒模式
  setAllActive       // 批量设置激活状态
} = useCourseData();
```

#### useCourseFilter
```typescript
const {
  searchTerm,        // 搜索关键词
  setSearchTerm,     // 设置搜索关键词
  selectedSemesters, // 选中的学期
  setSelectedSemesters, // 设置选中的学期
  filterType,        // 课程类型过滤
  setFilterType,     // 设置课程类型过滤
  filterCore,        // 核心课程过滤
  setFilterCore,     // 设置核心课程过滤
  semesters,         // 学期列表
  filteredCourses,   // 过滤后的课程
  activeCourses,     // 激活的课程
  stats,             // 统计数据
  originalStats      // 原始统计数据
} = useCourseFilter(courses, originalCourses, isSandboxMode);
```

## 部署指南

### 构建生产版本
```bash
npm run build
```

构建后的文件会生成在 `dist` 目录中。

### 部署选项

#### 1. 静态服务器部署
将 `dist` 目录内容部署到任何静态文件服务器。

#### 2. GitHub Pages
使用 GitHub Pages 部署：
```bash
npm install -g serve
serve -s dist
```

#### 3. Netlify/Vercel
- 选择项目根目录
- 设置构建命令为 `npm run build`
- 设置发布目录为 `dist`

### 环境配置

#### 环境变量
当前前端可直接运行，不依赖外部 API 基础地址配置。

## 贡献指南

### 开发流程

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码质量

#### 代码审查清单
- [ ] 代码遵循项目编码规范
- [ ] 功能按预期工作
- [ ] 已添加必要测试
- [ ] 文档已更新
- [ ] 性能没有负面影响
- [ ] 可访问性已考虑

#### 测试策略
```bash
npm run type-check
npm run lint
npm run test:run
npm run build
```

### 报告问题

当报告问题时，请包含以下信息：
- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 截图（如有必要）
- 浏览器和操作系统信息

## 自我改进记忆

项目在 [docs/self-improvement/README.md](./self-improvement/README.md) 中维护轻量级自我改进记录，用于保存模式、会话经验和当前工作记忆，不参与运行时代码与构建产物。

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](../LICENSE) 文件了解详情。

---

感谢您使用 DLUT GPA 计算器！如果您有任何问题或建议，请随时提交 issue 或 pull request。
