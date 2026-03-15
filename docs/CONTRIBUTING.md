# 贡献指南

欢迎参与 DLUT GPA 计算器项目的开发！我们很高兴你能加入我们的社区。

## 开发环境设置

### 1. 克隆仓库
```bash
git clone https://github.com/your-username/dlut-gpa.git
cd dlut-gpa
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

## 代码规范

### TypeScript
- 使用 TypeScript 编写所有组件和逻辑
- 为所有公共 API 提供类型定义
- 遵循严格的 TypeScript 配置

### React 最佳实践
- 使用函数组件和 Hooks
- 组件保持单一职责原则
- 合理使用 memo、useCallback、useMemo 进行性能优化

### 代码风格
- 使用 ESLint 和 Prettier 进行代码格式化
- 遵循 Airbnb JavaScript Style Guide
- 使用有意义的变量和函数命名

## 分支管理

### 分支命名规范
- `feature/your-feature-name` - 新功能开发
- `bugfix/issue-description` - 修复错误
- `hotfix/critical-fix` - 紧急修复
- `docs/update-documentation` - 文档更新

### 开发流程
1. 从 `main` 分支创建新分支
2. 提交你的修改
3. 推送到远程仓库
4. 创建 Pull Request

## 提交信息规范

使用语义化提交信息：

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

类型说明：
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构代码
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动

## 测试

### 运行测试
```bash
# 运行所有测试
npm run test

# 运行测试并查看覆盖率
npm run test:coverage

# 运行质量基线
npm run type-check
npm run lint
```

### 测试原则
- 为新增功能编写单元测试
- 确保测试覆盖率达到 80% 以上
- 使用 Vitest 和 React Testing Library
- 优先编写行为测试而不是快照测试

## Pull Request 指南

### PR 描述模板
```
## 描述变更
简要描述本次 PR 解决的问题或新增的功能。

## 变更类型
- [ ] 修复错误
- [ ] 新功能
- [ ] 文档更新
- [ ] 性能优化
- [ ] 代码重构

## 测试验证
- [ ] 测试已添加（适用于新功能或错误修复）
- [ ] 本地测试已通过
- [ ] 代码风格检查通过
```

## Issue 报告

### Bug 报告模板
```
**版本信息**:
**浏览器**:
**操作系统**:

**描述问题**

**复现步骤**

**期望行为**

**实际行为**

**截图或视频**
```

### 功能请求模板
```
**问题描述**

**解决方案**

**替代方案**

**附加信息**
```

## 代码审查

提交的代码需要经过至少一名维护者的审查才能合并。审查重点关注：

- 代码质量和可读性
- 性能影响
- 测试覆盖率
- 安全性
- 可访问性
- 用户体验

## 技术栈

- **前端框架**: React 18+
- **语言**: TypeScript
- **样式**: TailwindCSS
- **构建工具**: Vite
- **测试**: Jest, React Testing Library
- **图标**: Lucide React
- **图表**: Recharts

## 项目结构

请参阅 PROJECT_STRUCTURE.md 了解项目的组织方式。

## 常见任务

### 添加新组件
1. 在对应的组件目录下创建新文件
2. 编写组件并提供 TypeScript 类型定义
3. 为组件添加必要的测试
4. 在父组件中导入并使用

### 修改现有功能
1. 确保有相应的测试覆盖
2. 修改代码并更新相关测试
3. 验证修改不会影响其他功能

### 发布新版本
1. 更新 CHANGELOG.md
2. 更新 package.json 中的版本号
3. 创建 Git 标签
4. 发布到 npm (如果适用)

## 社区

如果你在开发过程中遇到问题，可以通过以下方式寻求帮助：

- 提交 Issue
- 在项目的 Discussions 部分提问
- 遵循友善的交流原则

感谢你对 DLUT GPA 计算器项目的贡献！
