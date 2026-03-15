# DLUT GPA 计算器项目结构概览

```
dlut-gpa/                           # 项目根目录
├── docs/                           # 文档目录
│   ├── README.md                   # 项目文档
│   ├── PROJECT_STRUCTURE.md        # 项目结构说明
│   ├── CONTRIBUTING.md             # 贡献指南
│   ├── CHANGELOG.md                # 变更日志
│   ├── ACCESSIBILITY_REPORT.md     # 无障碍报告
│   └── API.md                      # API 文档
├── src/                            # 源代码目录
│   ├── app/                        # 主应用程序组件
│   ├── components/                 # UI组件
│   │   ├── analytics/              # 分析相关组件
│   │   ├── course/                 # 课程管理组件
│   │   ├── data/                   # 数据管理组件
│   │   ├── layout/                 # 布局组件
│   │   └── common/                 # 通用组件
│   ├── contexts/                   # React上下文
│   ├── hooks/                      # 自定义React钩子
│   ├── services/                   # 业务逻辑服务
│   ├── types/                      # TypeScript类型定义
│   ├── utils/                      # 工具函数
│   └── assets/                     # 静态资源
│       └── styles/                 # 样式文件
├── tests/                          # 测试文件
│   ├── unit/                       # 单元测试
│   ├── integration/                # 集成测试
│   └── e2e/                        # 端到端测试
├── scripts/                        # 脚本文件
│   └── build/                      # 构建脚本
├── public/                         # 公共资源
├── dist/                           # 构建输出目录
├── node_modules/                   # 依赖包
├── package.json                    # 项目配置
├── package-lock.json               # 锁定依赖版本
├── tsconfig.json                   # TypeScript配置
├── vite.config.ts                  # Vite构建配置
├── .gitignore                      # Git忽略规则
└── README.md                       # 项目说明
```

## 项目特点

✅ **现代技术栈**: React + TypeScript + Vite
✅ **性能优化**: 代码分割、虚拟滚动、防抖处理
✅ **无障碍设计**: 符合WCAG 2.1 AA标准
✅ **响应式布局**: 适配多种设备
✅ **PWA支持**: 可安装的Web应用
✅ **国际化**: 支持多语言
✅ **组件化**: 清晰的组件结构
✅ **类型安全**: 完整的TypeScript支持

## 快速启动

```bash
npm install    # 安装依赖
npm run dev   # 启动开发服务器
npm run build # 构建生产版本
```

## 核心功能

- GPA计算与分析
- 课程管理
- 数据可视化
- AI学术顾问
- 数据导入导出
- 沙盒模式
- 多主题支持