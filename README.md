# DLUT GPA 计算器

> 面向大连理工大学学生的 GPA 计算、课程管理与学业分析工具。

## 项目状态

- 单一前端工程入口：根目录安装依赖并运行命令
- 技术栈：React 18、TypeScript、Vite、Tailwind CSS、Vitest
- 当前质量基线：`type-check`、`lint`、`test:run`、`build` 全部通过

## 快速开始

### 环境要求

- Node.js 18+
- npm 8+

### 本地开发

```bash
npm install
npm run dev
```

### 常用命令

```bash
npm run type-check
npm run lint
npm run test:run
npm run test:coverage
npm run build
npm run preview
```

## 目录结构

```text
dlut-gpa/
├── src/
│   ├── app/                  # 应用入口与页面编排
│   ├── assets/               # 样式与资源
│   ├── components/           # 业务与通用组件
│   ├── contexts/             # Theme / Language / Loading
│   ├── hooks/                # 自定义 hooks
│   ├── services/             # GPA、智能建议等纯服务
│   ├── test/                 # Vitest setup
│   ├── types/                # 类型定义
│   └── utils/                # 工具函数
├── config/                   # Vite / Tailwind / TS 配置
├── public/                   # 静态资源
├── docs/                     # 项目文档
├── tests/                    # 测试说明
├── .github/workflows/ci.yml  # CI
└── package.json
```

## 功能概览

- 多种 GPA 算法
- 课程新增、编辑、筛选、批量计入/排除
- 成绩分布、毕业进度、目标 GPA 计算
- 沙盒模式
- Excel / JSON / OCR 导入导出
- 分享报告导出 PNG
- 智能学业建议（本地规则分析，不上传个人数据）

## 性能策略

- 非首屏模块懒加载：数据管理、分享报告、雷达图、仿真面板、智能建议
- 输入搜索防抖
- 构建阶段手动分包

## 文档

- [项目说明](./docs/README.md)
- [API 文档](./docs/API.md)
- [贡献指南](./docs/CONTRIBUTING.md)
- [变更记录](./docs/CHANGELOG.md)

## 许可证

MIT
