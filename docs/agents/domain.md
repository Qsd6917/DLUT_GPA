# Domain 文档布局

## 单上下文

本仓库采用 **single-context** 布局，不是 monorepo。

判定依据：无 `pnpm-workspace.yaml`，`package.json` 无 `workspaces` 字段，根目录只有一个 `src/`。
`config/`、`scripts/`、`tests/` 都是配套目录，不是独立包。

## 事实放哪

| 事实类型                     | owner                                                  | 说明                                 |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------ |
| 领域概念、算法口径、统计规则 | [`AGENTS.md`](../../AGENTS.md) 的「领域事实」节        | GPA 计算口径、默认数据集、不计入规则 |
| 目录职责与结构               | [`docs/PROJECT_STRUCTURE.md`](../PROJECT_STRUCTURE.md) | 有什么、在哪                         |
| 质量阈值与包体基线           | [`docs/QUALITY_BASELINE.md`](../QUALITY_BASELINE.md)   | 覆盖率、gzip 体积                    |
| 难逆决策与版本变更           | [`docs/CHANGELOG.md`](../CHANGELOG.md)                 | append 为主                          |

## 消费规则

1. 先读 `AGENTS.md` 的领域事实节，再动 `src/services/` 下任何计算逻辑。
2. 术语必须与代码一致：说「计入」就是 `isActive`，说「必修」就是 `type === '必修'`，
   说「5.0 算法」就是 `CalculationMethod.SUBTRACTIVE`。不要发明新词。
3. 文档与代码冲突时**以代码和实测为准**，并把差异记进对应文档。

## 冲突处理

同一事实若在两处出现不同说法：

- 判定哪处是 owner（见上表），另一处改成链接。
- 若无法判定，在 `docs/CHANGELOG.md` 追加一条带日期的显式说明，标注两处位置，不静默改写历史。

## 何时升格为多上下文

出现以下任一情况再考虑拆 `CONTEXT-MAP.md`：

- 引入后端服务并独立部署
- 出现 `packages/*` 且各自有 `src/`
- 启用 workspace 协议

在此之前不预留空目录（与 `docs/PROJECT_STRUCTURE.md` 的「空目录不保留」一致）。
