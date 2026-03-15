# 项目结构标准

## 根目录结构
```
dlut-gpa/
├── frontend/                 # 前端代码
│   ├── src/                  # 源代码
│   │   ├── components/       # 可复用UI组件
│   │   ├── pages/            # 页面组件
│   │   ├── hooks/            # 自定义React hooks
│   │   ├── contexts/         # React上下文
│   │   ├── services/         # API和服务
│   │   ├── utils/            # 工具函数
│   │   ├── types/            # TypeScript类型定义
│   │   ├── assets/           # 静态资源
│   │   │   ├── styles/       # CSS/SCSS文件
│   │   │   └── images/       # 图片资源
│   │   └── constants/        # 常量定义
│   ├── public/               # 静态公共资源
│   ├── tests/                # 前端测试
│   │   ├── unit/             # 单元测试
│   │   ├── integration/      # 集成测试
│   │   └── e2e/             # 端到端测试
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── backend/                  # 后端代码（如果需要）
│   ├── src/
│   ├── tests/
│   ├── config/
│   ├── package.json
│   └── .env.example
├── docs/                     # 文档
│   ├── api/                  # API文档
│   ├── guides/               # 指南文档
│   ├── architecture/         # 架构文档
│   └── changelog.md
├── assets/                   # 设计资产
│   ├── icons/                # 图标文件
│   ├── images/               # 图片资源
│   └── logos/                # Logo资源
├── scripts/                  # 构建和部署脚本
│   ├── build/                # 构建脚本
│   ├── deploy/               # 部署脚本
│   └── dev/                  # 开发脚本
├── .github/                  # GitHub配置
│   ├── workflows/            # CI/CD工作流
│   └── ISSUE_TEMPLATE/       # Issue模板
├── mocks/                    # Mock数据
├── config/                   # 项目配置
├── tests/                    # 整体测试配置
├── .gitignore
├── .editorconfig
├── .prettierrc
├── .eslintrc.js
├── README.md
├── LICENSE
└── package.json (项目根)
```

## 前端组件组织原则

### 1. 按功能领域组织
```
components/
├── ui/                     # 通用UI组件
│   ├── Button/
│   ├── Input/
│   └── Modal/
├── layout/                 # 布局组件
│   ├── Header/
│   ├── Sidebar/
│   └── Footer/
├── forms/                  # 表单相关组件
│   ├── FormField/
│   └── FormValidator/
├── analytics/              # 分析相关组件
├── course/                 # 课程相关组件
└── common/                 # 通用业务组件
```

### 2. 页面组织
```
pages/
├── Dashboard/
├── Courses/
├── Analytics/
├── Settings/
└── NotFound/
```

## 命名约定

### 文件命名
- 组件文件: `PascalCase` (例如 `CourseList.tsx`)
- 钩子文件: `camelCase` (例如 `useCourseData.ts`)
- 工具函数: `camelCase` (例如 `calculateGPA.ts`)
- 样式文件: `kebab-case` (例如 `course-list.module.css`)

### 组件命名
- 主要组件: 与文件名相同 (例如 `CourseList.tsx` -> `CourseList`)
- 子组件: `ParentComponentChildComponent` (例如 `CourseListHeader`)

## 配置文件标准

### TypeScript配置
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### ESLint配置
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'import',
    'unused-imports'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'unused-imports/no-unused-imports': 'error'
  }
};
```

## Git工作流

### 分支策略
- `main` - 生产就绪代码
- `develop` - 开发主分支
- `feature/*` - 功能开发分支
- `hotfix/*` - 紧急修复分支
- `release/*` - 发布准备分支

### 提交消息规范
```
<type>(<scope>): <short summary>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

类型包括: feat, fix, docs, style, refactor, test, chore

## 测试策略

### 测试金字塔
- 单元测试: 70%
- 集成测试: 20%
- E2E测试: 10%

### 测试文件组织
```
tests/
├── __mocks__/              # Mock文件
├── __fixtures__/           # 测试数据
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── api/
│   └── pages/
└── e2e/
    ├── specs/
    └── support/
```

## 部署配置

### 构建脚本
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 环境管理

### 环境文件
- `.env.example` - 环境变量示例
- `.env.development` - 开发环境
- `.env.production` - 生产环境
- `.env.test` - 测试环境

此结构遵循现代前端工程的最佳实践，确保代码的可维护性、可扩展性和团队协作效率。