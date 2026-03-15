# DLUT GPA 计算器项目结构

## 当前结构

```text
dlut-gpa/
├── docs/
│   ├── accessibility/            # 可访问性与对比度分析产物
│   ├── archive/                  # 历史文档归档
│   ├── README.md
│   ├── API.md
│   ├── CONTRIBUTING.md
│   ├── CHANGELOG.md
│   └── PROJECT_STRUCTURE.md
├── src/
│   ├── app/                      # 应用入口与页面编排
│   ├── assets/styles/            # Tailwind 与补丁样式
│   ├── components/               # 组件
│   ├── contexts/                 # Theme / Language / Loading
│   ├── hooks/                    # 自定义 hooks
│   ├── services/                 # 纯业务逻辑
│   ├── test/                     # Vitest setup
│   ├── types/                    # 类型定义
│   └── utils/                    # 工具函数
├── config/                       # Vite / Tailwind 配置
├── public/                       # 公共静态资源
├── scripts/build/                # 构建脚本说明
├── tests/                        # 测试约定与说明
├── dist/                         # 构建输出
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## 约定

- 根目录只保留入口配置和最小说明文件，不再堆放阶段性报告。
- `docs/` 是唯一文档根目录；历史材料进入 `docs/archive/`。
- `src/` 之外不再保留前端源码壳层。
- 空目录不保留；新目录必须承载真实文件。
