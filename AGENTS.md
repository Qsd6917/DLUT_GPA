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
  改动它会改变所有新用户与「重置」后的数据，属于难逆变更。
- **`SAMPLE_COURSES` 无法复现成绩单上的汇总数（已实测，2026-11-07）**：成绩单显示已获得学分
  149.50、平均学分绩点 3.81、加权平均成绩 87.4，但用当前数据集按 `SUBTRACTIVE` 算出的是
  143.00 学分、3.8668、88.67（`calculateStats` 只统计 74 门 `isActive`，9 门等级制课程被排除）。
  把 9 门「通过」课程按 85 分计入，得到 151.50 学分、3.8462、88.46；把 85 分换成 95 分，
  得到 3.9023、89.02；按 2026 分段制算则是 3.6031。**没有任何组合同时命中 149.50 / 3.81 / 87.4**。
  唯一凑得出 149.50 的方式是「总学分减去大创 2 学分」，但那样绩点只有 3.6987。
  结论：数据集与成绩单汇总值之间存在尚未解释的差异，**不要在文档或界面里声称二者一致**；
  需要时先逐门核对成绩单原件。
- **DLUT 5.0 算法**：`SUBTRACTIVE`，`(score - 50) / 10`，满分 5.0；低于 60 分记 0。
  依据《大连理工大学本科生成绩管理办法》（2018-09-01 施行）第六条的成绩绩点表：
  0-60 分记 0，60-61 记 1.0，61-62 记 1.1，…，99-100 记 4.9，100 记 5.0，
  即 `绩点 = 成绩/10 - 5`（`score/10 - 5` 与 `(score-50)/10` 等价）。来源
  <https://drise.dlut.edu.cn/info/1241/4553.htm>。
- **同一所学校存在两套并行口径，不要混用**：奖学金与学业排名的平均绩点自 2026 年起改用
  分段折算制（[90,100]→4.0、[85,90)→3.5、[80,85)→3.0、[75,80)→2.5、[70,75)→2.0、
  [65,70)→1.5、[60,65)→1.0、[0,60)→0，见《大连理工大学本科生奖学金评审实施细则》
  2026-03-06 修订版）。本项目的 `SUBTRACTIVE` 对应的是**成绩管理办法的学分绩点口径**，
  不是奖学金排名口径；界面上不得表述为「奖学金/推免排名用此算法」。
- **等级制成绩不计入平均学分绩点**：成绩管理办法原文「等级制成绩不计入平均学分绩点」，
  「通过/不通过」按等级制记载。这与本项目 `isActive=false` 的处理一致。
- **同门课程每次考核成绩均计入**：原文「同门课程的每次考核成绩均计入平均学分绩点」，
  即重修/补考不覆盖原成绩、各自作为一条记录参与计算。本项目当前**没有重修/补考标记字段**，
  录两次就是两条独立课程，与该口径形式一致，但没有去重或合并逻辑，改动前需先设计。
- **补考与缓考的记载方式**：补考成绩按实际成绩记载并注明「补考」；缓考课程成绩记为
  「申请缓考」，补考通过后按一考成绩记载。缓考本身不产生额外绩点记录。
- **其余算法**（`LINEAR`、`WES`、`STD_4_0`、`PKU_4_0`、`SCALE_4_5`）是参照对照口径，不是 DLUT 官方算法，
  界面上应保持可区分，不得表述为学校规定。
- **统计口径**：`calculateStats` 只统计 `isActive` 的课程；`compulsoryCredits` 仅统计 `type === '必修'`。
- **目标成绩规划器**只存在于组件内存，不写入正式课程数据；目标分析始终基于全部计入课程，
  不受搜索/学期/类型筛选影响。

## 已知的坑

- `scripts/build/` 与根目录 `build/` 同名。`.gitignore` 与 `.git/info/exclude` 里的 `build/`
  **必须写成 `/build/` 锚定根目录**，否则会连带忽略 `scripts/build/`，且 `git status` 看不见。
- CI 在 Node 24 与 26 两条 LTS 线上跑（Node 20 已于 2026-04-30 EOL，不再测试）。
  `engines` 已与 `jsdom@28` 的要求对齐为 `^20.19.0 || ^22.12.0 || >=24.0.0`，改依赖时保持同步。
- `format:check` 已在 CI 中，全仓格式化于 2026-11-06 完成。新增代码必须符合 prettier 风格；
  `docs/archive/` 经 `.prettierignore` 排除，不要对它格式化。
- 涉及时间的测试断言必须与运行时区无关：`ShareableReportModal` 用 `getHours()/getDate()` 渲染本地时间，
  硬编码期望值会让 CI(UTC) 与本地(UTC+8) 结果不同。用同一套格式化逻辑推导期望值。
