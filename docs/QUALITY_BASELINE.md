# 质量与性能基线

记录日期：2026-08-08

> 2026-11-06 复核：下列数值在本地重新实测，与记录一致（`type-check` / `lint` / `test:run` 171 项 /
> `build` 主入口 gzip 28.84 kB / 覆盖率 89.32-78.48-69.33）。本轮同时修复了 CI 从未成功运行的问题，
> 详见 `CHANGELOG.md` 的「工程治理（2026-11-06）」。
>
> **CI 已首次全绿**：run `42234877441`，9 个步骤（Setup / Install / Type check / Lint / Format check /
> Test / Build）全部 success。此前自 2026-08-02 起 CI 一直卡在 Setup Node.js 失败。

## 质量命令

本地和 CI 使用同一组质量命令：

```bash
npm ci
npm run type-check
npm run lint
npm run format:check
npm run test:run
npm run build
```

当前本地验证结果：

- `npm run type-check`：通过
- `npm run lint`：通过
- `npm run format:check`：通过（2026-11-06 完成全仓格式化后；此前为 64 个文件不通过，现已纳入 CI）
- `npm run test:run`：20 个测试文件、171 项测试通过
- `npm run test:coverage`：通过
- `npm run build`：通过，转换 2461 个模块；本次串行快照用时 8.77 秒

构建输出包含 `caniuse-lite is outdated` 提示；该提示不影响本轮类型检查、测试、覆盖率或生产构建结果。

## 覆盖率基线

`npm run test:coverage` 使用 Vitest + V8 coverage。

| 范围                      | Statements | Branches | Functions |  Lines |
| ------------------------- | ---------: | -------: | --------: | -----: |
| All files                 |     89.92% |   80.03% |    74.55% | 89.92% |
| `TargetGpaCalculator.tsx` |     99.13% |   96.15% |   100.00% | 99.13% |
| `gpaService.ts`           |     92.50% |   92.98% |   100.00% | 92.50% |
| `LanguageContext.tsx`     |    100.00% |  100.00% |   100.00% |   100% |
| `ConfirmDialog.tsx`       |    100.00% |   93.10% |   100.00% |   100% |
| `ReloadPrompt.tsx`        |    100.00% |  100.00% |   100.00% |   100% |
| `Header.tsx`              |    100.00% |   96.66% |   100.00% |   100% |
| `LoadingContext.tsx`      |     56.92% |   50.00% |    20.00% | 56.92% |

2026-11-06 补测说明：

- 本轮新增 4 个测试文件、42 个用例，测试总数 171 → 213，文件数 20 → 24。
  `LanguageContext` 99.45%→100%、`ConfirmDialog` 50.5%→100%、`ReloadPrompt` 0%→100%、`Header` 83.61%→100%。
- 删除 `src/utils/contrast.ts`（零引用死代码，35 行），`utils` 目录覆盖率由 78.14% 升至 99.28%。
- **`LoadingContext.tsx` 是当前唯一低于 80% 的模块**（56.92%），未覆盖行为 33、42-53（loading overlay JSX）
  与 60-65（`useLoading` 的 Provider 外抛错）。它是下一个应补测的目标。

本轮不设置任意全局 80% CI 阈值。后续新增或重构时，优先守住以下关键逻辑：

- `useCourseData`：默认 seed、旧缓存迁移、空数组、损坏 JSON、重置、沙盒隔离
- `gpaService`：课程绩点、统计口径、学期趋势、目标 GPA 结果类型
- `ShareableReportModal`：页面与报告指标一致、导出失败可恢复、焦点恢复、滚动锁
- `VirtualCourseList`：83 门课程窗口化渲染和编辑/删除/计入回调
- `ConfirmDialog`：焦点进入/恢复、Tab 困焦、Escape 关闭、滚动锁保存与恢复
- `Header`：分区切换、主题与语言切换、下拉 roving 键盘、移动端工具面板

## 生产包体基线

`npm run build` 当前主要输出如下。Vite 资源体积使用十进制 `kB`；PWA precache 汇总保留构建工具输出的 `KiB`。

| Chunk                                  |  原始体积 |      gzip |
| -------------------------------------- | --------: | --------: |
| `assets/index-*.js`                    |  95.87 kB |  28.84 kB |
| `assets/TargetGpaCalculator-*.js`      |  14.42 kB |   3.97 kB |
| `assets/react-vendor-*.js`             | 133.93 kB |  43.13 kB |
| `assets/generateCategoricalChart-*.js` | 350.45 kB |  98.55 kB |
| `assets/xlsx-*.js`                     | 429.03 kB | 143.08 kB |
| `assets/index-*.css`                   |  48.95 kB |   9.67 kB |

PWA precache：24 个条目，共 1443.61 KiB。

功能开发前的 Phase 0 实测基线为主入口 `27.14 kB`、目标计算器懒加载 chunk `1.36 kB`。最终主入口为 `28.84 kB`，增长约 `6.3%`，低于 15% 的变更说明阈值；目标计算器 chunk 增至 `3.97 kB`。后者增长来自逐课编辑器、可访问标签页与刻度、字段级错误提示和完整结果展示，仍保持独立懒加载，没有把规划器实现并入主入口。

约束：

- 主入口 gzip 以当前 `28.84 kB` 为基线；后续增长超过 15% 时，需要在变更说明中解释原因。
- `xlsx`、`html2canvas` 和大型 Recharts 图表代码不得进入主入口。
- 懒加载 chunk 增长超过 15% 时，需要在变更说明中解释原因。

## 依赖兼容记录

当前测试/构建组合：

- Vite 5.4.21
- `@vitejs/plugin-react` 4.7.0
- Vitest 1.6.1
- `@vitest/coverage-v8` 1.6.1
- `@vitest/ui` 1.6.1
- jsdom 28.1.0

CI 在 Node 24 与 26 两条 LTS 线上运行（Node 20 已于 2026-04-30 EOL，不再测试）。`package.json` 的 `engines` 已与 `jsdom@28.1.0` 的要求 `^20.19.0 || ^22.12.0 || >=24.0.0` 对齐，`package-lock.json` 同步更新。`@vitejs/plugin-react@latest` 当前要求 Vite 8 和 Node 20.19+，不作为本轮升级目标。
