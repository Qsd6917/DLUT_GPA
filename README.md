# DLUT GPA 计算器

> 面向大连理工大学学生的 GPA 计算、课程管理与学业分析工具。

## 项目状态

- 单一前端工程入口：根目录安装依赖并运行命令
- 技术栈：React 18、TypeScript、Vite、Tailwind CSS、Vitest
- 当前质量基线：以仓库现有 CI 命令为准（`type-check`、`lint`、`test:run`、`build`）；本次文档不虚构未运行结果
- CI：`.github/workflows/ci.yml` 使用 Node 20，按 `npm ci → type-check → lint → test:run → build` 顺序复现本地质量门

## 默认课程数据

- 课程控制台默认数据位于 `src/utils/constants.ts` 的 `SAMPLE_COURSES`
- 当前默认数据已根据 2026-07-04 中文成绩单同步，共 83 门课程
- 成绩单显示已获得学分 149.50、平均学分绩点 3.81、加权平均成绩 87.4
- 项目沿用现有规则：成绩为 `通过` 或 `0` 的课程默认不计入 GPA 计算，但仍保留在课程控制台中
- 2026-07-04 中文成绩单已固定为新的初始数据集，旧版 `localStorage` 课程缓存不会覆盖它；点击“重置”也会回到这份成绩单数据

## 快速开始

### 环境要求

- Node.js 18+
- npm 8+

### 本地开发

```bash
npm install
npm run dev
```

### Windows 一键启动

在项目根目录双击 `一键启动.bat`，脚本会自动检查依赖、选择可用端口、启动开发服务器并打开浏览器。

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
├── .github/workflows/ci.yml  # CI
└── package.json
```

## 功能概览

- 多种 GPA 算法
- 课程新增、编辑、筛选、批量计入/排除
- 成绩分布、毕业进度、目标 GPA 计算
- 实验室：正式课程与内存草稿隔离，实时比较并显式应用或放弃
- Excel / JSON / OCR 导入导出
- 分享报告导出 PNG
- 智能学业建议（本地规则分析，不上传个人数据）

## 性能策略

- 非首屏模块懒加载：数据管理、分享报告、雷达图、实验室、智能建议、目标 GPA、毕业进度、学期趋势
- 重型依赖保持分包：`xlsx`、`html2canvas` 和大型 Recharts 图表代码不进入主入口
- 当前主入口 gzip 基线约 23.84 KiB，详见 `docs/QUALITY_BASELINE.md`
- 输入搜索防抖
- 构建阶段手动分包

## 文档

- [项目说明](./docs/README.md)
- [自我改进记忆](./docs/self-improvement/README.md)
- [API 文档](./docs/API.md)
- [质量与性能基线](./docs/QUALITY_BASELINE.md)
- [贡献指南](./docs/CONTRIBUTING.md)
- [变更记录](./docs/CHANGELOG.md)

## 许可证

MIT
