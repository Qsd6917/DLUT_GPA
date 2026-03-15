# 开发环境配置

## 项目设置

### 1. 系统要求
- **操作系统**: Windows 10+, macOS 10.15+, 或 Linux
- **Node.js**: v18.0.0 或更高版本
- **npm**: v8.0.0 或更高版本
- **Git**: v2.0 或更高版本

### 2. 克隆项目
```bash
git clone https://github.com/your-username/dlut-gpa.git
cd dlut-gpa
```

### 3. 安装依赖
```bash
npm install

# 安装开发工具（可选）
npm install -g typescript vite eslint prettier
```

## 项目结构详解

```
dlut-gpa/
├── src/                      # 前端代码
│   ├── app/                  # 应用入口
│   ├── components/           # 组件
│   ├── contexts/             # React 上下文
│   ├── hooks/                # 自定义 hooks
│   ├── services/             # API 和纯逻辑服务
│   ├── test/                 # Vitest setup
│   ├── types/                # TypeScript 类型
│   └── utils/                # 工具函数
├── public/                   # 静态资源
├── config/                   # Vite / Tailwind / TS 配置
├── tests/                    # 测试说明与约定
├── docs/                     # 文档
├── scripts/                  # 构建和部署脚本
├── .github/                  # GitHub配置
├── .gitignore                # Git忽略规则
├── .editorconfig             # 编辑器配置
└── README.md                 # 项目说明
```

## 开发工具配置

### 1. VS Code 推荐配置

创建 `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.tsx": "typescriptreact",
    "*.ts": "typescript"
  }
}
```

### 2. ESLint 配置

创建 `.eslintrc.cjs`:

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
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jsx-a11y/recommended',
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
    'unused-imports',
    'jsx-a11y'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        'vars': 'all',
        'varsIgnorePattern': '^_',
        'args': 'after-used',
        'argsIgnorePattern': '^_'
      }
    ],
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off'
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
};
```

### 3. Prettier 配置

创建 `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### 4. EditorConfig 配置

创建 `.editorconfig`:

```
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

## 环境变量配置

### 1. 创建环境文件

```bash
# 在 frontend 目录下
cp .env.example .env
```

### 2. 环境变量示例

```
# .env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_TITLE="DLUT GPA 计算器"
VITE_APP_VERSION="2.1.0"
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Google Analytics ID
VITE_SENTRY_DSN=""  # Sentry错误追踪DSN
```

## 开发命令

### 1. 基础命令
```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 检查类型
npm run type-check

# 代码检查
npm run lint

# 修复代码格式
npm run lint:fix

# 运行测试
npm run test

# 运行测试并生成覆盖率
npm run test:coverage
```

### 2. 开发专用命令
```bash
# 在开发环境下打开浏览器
npm run dev -- --open

# 指定端口启动
npm run dev -- --port 4000

# 监听所有网络接口
npm run dev -- --host

# 构建并分析包大小
npm run build -- --mode analyze
```

## 代码规范

### 1. TypeScript 规范
- 所有组件必须有明确的类型定义
- 使用接口(interface)而非类型别名(type)定义对象结构
- 严格模式下使用 `strict: true`

### 2. React 规范
- 使用函数组件和Hooks
- 遵循Hooks规则 (只在顶层调用)
- 使用 `React.memo` 优化组件
- 合理使用 `useCallback` 和 `useMemo`

### 3. 命名规范
- 组件: PascalCase (`CourseList.tsx`)
- Hook: camelCase (`useCourseData.ts`)
- 工具函数: camelCase (`calculateGPA.ts`)
- 样式类: kebab-case (`course-list.module.css`)

## 测试配置

### 1. Vitest 配置

创建 `vite.config.ts` 中的测试配置:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/node_modules/**',
        'tests/**',
        'vite.config.ts',
        'coverage/**',
        '**/types/**',
        '**/*.d.ts',
        '**/constants/**'
      ]
    }
  }
})
```

### 2. 测试示例

```typescript
// tests/unit/components/CourseList.test.tsx
import { render, screen } from '@testing-library/react';
import CourseList from '@/components/course/CourseList';
import { Course } from '@/types';

const mockCourses: Course[] = [
  {
    id: '1',
    name: '高等数学',
    credits: 5,
    score: 95,
    gpa: 4.0,
    semester: '2023-1',
    type: '必修',
    isCore: true,
    isActive: true
  }
];

describe('CourseList', () => {
  test('renders course list correctly', () => {
    render(<CourseList
      courses={mockCourses}
      onRemove={vi.fn()}
      onEdit={vi.fn()}
      onToggle={vi.fn()}
      onToggleAll={vi.fn()}
    />);

    expect(screen.getByText('高等数学')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
  });
});
```

## 调试技巧

### 1. 浏览器调试
- 使用 React Developer Tools
- 使用 Redux DevTools (如果使用Redux)
- 启用 source map 进行更好的错误定位

### 2. 性能调试
- 使用 React Profiler
- 使用 Chrome DevTools Performance 面板
- 使用 bundle analyzer 检查包大小

### 3. 常用调试命令
```bash
# 启用调试模式
npm run dev -- --debug

# 检查包大小
npm run build -- --mode analyze

# 运行测试时显示详细输出
npm run test -- --verbose
```

## 常见问题解决

### 1. 依赖问题
```bash
# 清理缓存并重新安装
rm -rf node_modules package-lock.json
npm install

# 或者使用npm ci
npm ci
```

### 2. 类型错误
```bash
# 检查所有类型问题
npm run type-check

# 查看详细错误信息
npx tsc --noEmit
```

### 3. 构建错误
- 检查 TypeScript 错误
- 验证导入路径是否正确
- 确认所有必需的依赖已安装

遵循这些配置指南，您可以快速搭建一个专业、高效的开发环境。
