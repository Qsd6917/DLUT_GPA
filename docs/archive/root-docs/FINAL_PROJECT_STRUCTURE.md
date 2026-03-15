# DLUT GPA 计算器 - 专业软件工程结构

## 项目概述

本项目采用现代化的前端工程结构，遵循行业最佳实践，为大连理工大学学生提供专业的GPA计算与分析工具。

## 目录结构

```
dlut-gpa/
├── frontend/                 # 前端代码 (React + TypeScript)
│   ├── src/                  # 源代码
│   │   ├── components/       # 可复用UI组件
│   │   │   ├── ui/           # 基础UI组件
│   │   │   ├── layout/       # 布局组件
│   │   │   ├── analytics/    # 分析相关组件
│   │   │   └── course/       # 课程相关组件
│   │   ├── pages/            # 页面组件
│   │   ├── hooks/            # 自定义React hooks
│   │   ├── contexts/         # React上下文
│   │   ├── services/         # API和服务
│   │   ├── utils/            # 工具函数
│   │   ├── types/            # TypeScript类型定义
│   │   ├── assets/           # 静态资源
│   │   │   ├── styles/       # 样式文件
│   │   │   └── images/       # 图片资源
│   │   └── constants/        # 常量定义
│   ├── public/               # 静态公共资源
│   ├── tests/                # 测试文件
│   │   ├── unit/             # 单元测试
│   │   ├── integration/      # 集成测试
│   │   └── e2e/             # 端到端测试
│   ├── package.json          # 前端依赖配置
│   ├── package-lock.json     # 依赖锁定文件
│   ├── tsconfig.json         # TypeScript配置
│   ├── vite.config.ts        # Vite构建配置
│   └── .env.example          # 环境变量示例
├── docs/                     # 文档
│   ├── api/                  # API文档
│   ├── guides/               # 使用指南
│   ├── architecture/         # 架构文档
│   └── changelog.md          # 变更日志
├── scripts/                  # 构建和部署脚本
│   ├── build/                # 构建脚本
│   ├── deploy/               # 部署脚本
│   └── dev/                  # 开发脚本
├── assets/                   # 设计资产
│   ├── icons/                # 图标文件
│   ├── images/               # 图片资源
│   └── logos/                # Logo资源
├── .github/                  # GitHub配置
│   ├── workflows/            # CI/CD工作流
│   └── ISSUE_TEMPLATE/       # Issue模板
├── mocks/                    # Mock数据
├── config/                   # 项目配置
├── tests/                    # 整体测试配置
├── PROJECT_STANDARD.md       # 项目标准
├── DEVELOPMENT_SETUP.md      # 开发环境配置
├── README.md                 # 项目说明
├── package.json              # 项目根配置
├── tsconfig.json             # TypeScript根配置
├── .gitignore                # Git忽略规则
├── .eslintrc.js              # ESLint配置
├── .prettierrc               # Prettier配置
├── .editorconfig             # Editor配置
└── LICENSE                   # 许可证
```

## 技术栈

### 核心技术
- **Frontend Framework**: React 18 with Hooks
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: Zustand (轻量级状态管理)

### 开发工具
- **Code Formatting**: Prettier
- **Linting**: ESLint with TypeScript plugin
- **Testing**: Vitest + React Testing Library
- **Accessibility**: axe-core, react-axe
- **Type Checking**: TypeScript strict mode

### 性能优化
- **Bundle Splitting**: Dynamic imports
- **Virtual Scrolling**: react-window for large lists
- **Debouncing**: Optimized search/filtering
- **Image Optimization**: Lazy loading
- **Caching**: Effective use of React.memo

## 开发规范

### 代码组织
1. **组件化** - 每个功能模块封装为独立组件
2. **模块化** - 按功能领域组织代码
3. **类型安全** - 全面使用TypeScript
4. **可测试性** - 组件和函数设计便于测试

### 命名规范
- **组件文件**: PascalCase (e.g., `CourseList.tsx`)
- **Hook文件**: camelCase (e.g., `useCourseData.ts`)
- **工具函数**: camelCase (e.g., `calculateGPA.ts`)
- **样式文件**: kebab-case (e.g., `course-list.module.css`)
- **常量**: UPPER_SNAKE_CASE (e.g., `MAX_COURSE_CREDITS`)

### 提交规范
使用 conventional commits 规范：
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构代码
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动

## 测试策略

### 测试金字塔
- **单元测试**: 70% - 测试独立函数和组件
- **集成测试**: 20% - 测试组件协作
- **端到端测试**: 10% - 测试用户流程

### 测试工具
- **框架**: Vitest
- **React测试**: React Testing Library
- **覆盖率**: @vitest/coverage-v8
- **UI测试**: @vitest/ui

## 部署策略

### 构建流程
1. 代码检查 (ESLint + TypeScript)
2. 单元测试执行
3. 构建打包
4. 包大小分析
5. 部署到CDN

### 环境管理
- **开发**: `development`
- **预发布**: `staging`
- **生产**: `production`

## 质量保证

### 自动化检查
- Git hooks 阻止不良提交
- CI流水线自动化测试
- 代码覆盖率要求 >80%
- 性能预算限制

### 代码审查
- 最少1人批准
- 关注性能、安全、可维护性
- 遵循最佳实践

## 维护指南

### 版本管理
- 使用语义化版本控制 (SemVer)
- 每次发布更新CHANGELOG.md
- 保持向后兼容性

### 依赖管理
- 定期更新依赖
- 监控安全漏洞
- 使用锁文件确保一致性

---

本项目结构遵循现代前端开发最佳实践，确保代码质量、可维护性和团队协作效率。