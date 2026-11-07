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

## 处置记录（delete-zone）

记录**有意不做 / 有意删掉**的东西，防止后续会话在没有新证据时把它们重建回来。

| 路径/概念                  | 为何废弃                                                                 | 替代者                                            | 重启条件                     |
| -------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------- | ---------------------------- |
| 裸 `build/` 忽略规则       | 未锚定根目录，会连带吞掉 `scripts/build/`，且 `git status` 完全看不见    | `.gitignore` / `.git/info/exclude` 中的 `/build/` | 不得恢复裸规则               |
| `docs/archive/` 参与格式化 | 归档文档记录当时的事实，改格式会污染历史 diff                            | `.prettierignore` 排除 `docs/archive/`            | 仅当决定整体重写归档内容时   |
| `src/utils/contrast.ts`    | 零引用死代码，覆盖率恒为 0%；对比度审计脚本用的是独立 `wcag-contrast` 包 | 无（需要时直接用 `wcag-contrast`）                | 仅当要在运行时做对比度校验时 |

> 2026-11-06 更正：本轮一度将 `一键启动.bat` 记入本表并计划移除，经用户决定**保留该文件**。
> 该条目已撤回，两个启动器并存，README 已注明需同步维护。此处保留更正经记录，不静默抹除。

> 条目式记录：`[YYYY-MM-DD] removal | 废弃 X，原因…，替代…，证据（提交/链接）`。
> 本表随变更追加，不静默删除旧条目。
