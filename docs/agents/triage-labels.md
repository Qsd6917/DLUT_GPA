# Triage 标签

五个标准角色到本仓库实际标签串的映射。标签已在 GitHub 仓库中创建，`gh label list` 可核实。

| 角色         | 实际标签          | 含义                                   | 颜色                     |
| ------------ | ----------------- | -------------------------------------- | ------------------------ |
| 待评估       | `needs-triage`    | 新进来的 issue，尚未判断归属           | `#e99695`                |
| 待补信息     | `needs-info`      | 缺少复现条件、环境或数据，无法动手     | `#d876e3`                |
| 可交给 agent | `ready-for-agent` | 信息齐全、范围明确，agent 可直接实施   | `#0e8a16`                |
| 需人工处理   | `ready-for-human` | 需要真机、外部账号、人工判断或用户拍板 | `#fbca04`                |
| 有意不做     | `wontfix`         | 明确否决，理由必须写在 issue 里        | `#ffffff`（GitHub 默认） |

## 流转

```text
新建 → needs-triage
         ├─ 信息不足 ──────────────→ needs-info ──(补齐)──→ needs-triage
         ├─ 可自动化 ──────────────→ ready-for-agent
         ├─ 需人判断/外部条件 ─────→ ready-for-human
         └─ 判定不做 ──────────────→ wontfix（关闭，写理由）
```

同一 issue 只保留一个「可执行性」标签。`enhancement` / `bug` / `documentation` 这类
**类型标签**可以与上面的角色标签并存，不受此限。

## 纪律

- 标签只写在文档里而不建到仓库 = 流程空转。改动此文档必须同步 `gh label list` 的实况。
- 从 `needs-info` 移到 `ready-*` 时，先确认缺的信息真的补上了，不能凭印象。
- 关闭为 `not planned` 时必须同时加 `wontfix`，否则下次会话会把它当成待办重开。
