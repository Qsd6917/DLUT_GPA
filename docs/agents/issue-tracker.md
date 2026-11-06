# Issue Tracker 约定

## 选型

本仓库的任务与规格统一记录在 **GitHub Issues**：`Qsd6917/DLUT_GPA`（私有仓库）。

判定依据：`git remote -v` 指向 `https://github.com/Qsd6917/DLUT_GPA.git`，因此走 GitHub + `gh` CLI 口径。

## 为什么不用别的

| 方案                   | 不用的理由                                       |
| ---------------------- | ------------------------------------------------ |
| `.scratch/` 等本地目录 | 不入库，任务写完即丢，无人再看                   |
| `TODO.md`              | 与 git 历史重复，且容易和文档混在一起            |
| 纯靠 commit message    | 无法承载「还没做」「被阻塞」「有意不做」三种状态 |

## CLI 操作约定

```bash
# 建
gh issue create --title "<标题>" --body "<正文>" --label needs-triage

# 读 / 列
gh issue list --state open
gh issue view <编号>

# 评论（记录进展、结论、证据）
gh issue comment <编号> --body "<内容>"

# 打标（triage 流转）
gh issue edit <编号> --add-label ready-for-agent --remove-label needs-triage

# 关闭
gh issue close <编号> --reason completed      # 做完了
gh issue close <编号> --reason "not planned"  # 有意不做，同时加 wontfix 标签
```

## 纪律

- 一个 issue 只装一件事。跨多件事的拆开，用 `Blocked by` 写依赖。
- 关闭前必须在评论里留下结论或证据，不能只点关闭。
- 「有意不做」必须写理由和替代方案，并加 `wontfix`——否则后续会话会好心重建。
- 状态变化写进 issue，不写进治理文档；治理文档只链接 issue 编号。

## PR 作为请求面

默认关闭。本仓库当前是单人维护（协作者 1 人），不接受外部 PR；
外部反馈走 Issue。若将来开启协作，再在此处补 PR 流程。
