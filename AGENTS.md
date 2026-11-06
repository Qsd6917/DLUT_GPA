# AGENTS.md

给 agent 的入口。先读这里，再按下面的指向去读细节。

## 工作规则

- 只显式 `git add` 具体路径，不用 `git add -A` / `git add .`
- 提交信息用 Conventional Commits + 中文，例如 `feat(analytics): ...`、`fix(ci): ...`
- 只有用户明确要求时才 commit / push
- 文档与注释用中文；代码标识符与类型名用英文
- 生成物（`dist/`、`build/`、`coverage/`、`node_modules/`）不入库
- 不打印 `.env.local` 的值；新增环境变量只写键名到文档

## 改动前的硬门槛

1. `git status --short` 看工作树。不干净时先确认哪些改动属于当前任务，**禁止覆盖或提交无关改动**。
2. 改 `src/` 后必须跑完质量门（见下），全绿才谈提交。
3. 改 `package.json` 依赖后必须同步 `package-lock.json` 并提交，否则 CI 的 `npm ci` 会失败。

## 质量门

本地与 CI 使用同一组命令，缺一不可：

```bash
npm run type-check
npm run lint
npm run format:check
npm run test:run
npm run build
```

基线数值（覆盖率、包体）记录在 [`docs/QUALITY_BASELINE.md`](docs/QUALITY_BASELINE.md)。改动导致包体或覆盖率显著下降时，在同一提交里更新该文档。

## 去哪里找

本仓库的文档分四个角色，**每个事实只有一个 owner**，别处只链接不复制。

| 角色           | owner                                                                  | 装什么                         |
| -------------- | ---------------------------------------------------------------------- | ------------------------------ |
| 宪法（本文件） | `AGENTS.md`                                                            | 工作规则、质量门、跳转表       |
| 地图           | `README.md` + [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md) | 有什么、在哪、去哪找           |
| 状态           | GitHub Issues（`gh issue list`）                                       | 任务进度、阻塞、有意不做的东西 |
| 历史           | [`docs/CHANGELOG.md`](docs/CHANGELOG.md)                               | 版本变更与难逆决策             |

| 需要什么           | 看哪里                           | 怎么核实        |
| ------------------ | -------------------------------- | --------------- |
| 仓库结构与目录职责 | `docs/PROJECT_STRUCTURE.md`      | `git ls-files`  |
| 质量与性能基线     | `docs/QUALITY_BASELINE.md`       | 跑一遍质量门    |
| 测试约定           | `tests/TESTING_GUIDELINES.md`    | 对应测试文件    |
| 构建与启动脚本     | `scripts/build/BUILD_SCRIPTS.md` | 实跑一遍        |
| 任务状态与阻塞     | GitHub Issues                    | `gh issue list` |
| 为什么这么定       | `docs/CHANGELOG.md`              | 对应提交        |

阅读顺序：先看项目结构，再看 issue 状态，最后只读与当前任务相关的文档。

地图、状态和历史是**上下文**，不是命令：与代码或实测冲突时以后者为准，并把差异记下来。

## Agent skills

### Issue tracker

Issue、规格与实施任务保存在本仓库的 GitHub Issues，用 `gh` CLI 读写。详见 [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md)。

### Triage labels

使用 `needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix` 五个标签。详见 [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md)。

### Domain docs

采用 single-context 布局：领域事实放在本文件下方的「领域事实」节，难逆决策追加到 `docs/CHANGELOG.md`。详见 [`docs/agents/domain.md`](docs/agents/domain.md)。

## 领域事实

GPA 计算口径是本项目的核心正确性来源，改动前必须核对。

- **不计入 GPA 的成绩**：`通过` 与 `0` 分。课程仍保留在控制台中，但 `isActive=false`。
- **默认数据集**：`src/utils/constants.ts` 的 `SAMPLE_COURSES`，源自 2026-07-04 中文成绩单，共 83 门。
  该成绩单显示已获得学分 149.50、平均学分绩点 3.81、加权平均成绩 87.4。
  改动 `SAMPLE_COURSES` 会改变所有新用户与「重置」后的数据，属于难逆变更。
- **DLUT 5.0 算法**：`SUBTRACTIVE`，`(score - 50) / 10`，满分 5.0；低于 60 分记 0。
  这是学校现行口径，改动前需有官方文件依据。
- **其余算法**（`LINEAR`、`WES`、`STD_4_0`、`PKU_4_0`、`SCALE_4_5`）是参照对照口径，不是 DLUT 官方算法，
  界面上应保持可区分，不得表述为学校规定。
- **统计口径**：`calculateStats` 只统计 `isActive` 的课程；`compulsoryCredits` 仅统计 `type === '必修'`。
- **目标成绩规划器**只存在于组件内存，不写入正式课程数据；目标分析始终基于全部计入课程，
  不受搜索/学期/类型筛选影响。

## 已知的坑

- `scripts/build/` 与根目录 `build/` 同名。`.gitignore` 与 `.git/info/exclude` 里的 `build/`
  **必须写成 `/build/` 锚定根目录**，否则会连带忽略 `scripts/build/`，且 `git status` 看不见。
- CI 用 Node 20，本机可能是更高版本。`jsdom@28` 要求 Node `^20.19 || ^22.12 || >=24`，
  `package.json` 的 `engines` 仍写 `>=18`，这是已知契约不一致，改动前先确认。
- `format:check` 已在 CI 中，全仓格式化于 2026-11-06 完成。新增代码必须符合 prettier 风格；
  `docs/archive/` 经 `.prettierignore` 排除，不要对它格式化。
- 涉及时间的测试断言必须与运行时区无关：`ShareableReportModal` 用 `getHours()/getDate()` 渲染本地时间，
  硬编码期望值会让 CI(UTC) 与本地(UTC+8) 结果不同。用同一套格式化逻辑推导期望值。
