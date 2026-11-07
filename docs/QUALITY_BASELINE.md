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
- `npm run test:run`：31 个测试文件、338 项测试通过
- `npm run test:coverage`：通过，`All files` 93.09% statements
- `npm run build`：通过，转换 2462 个模块

构建输出包含 `caniuse-lite is outdated` 提示；该提示不影响本轮类型检查、测试、覆盖率或生产构建结果。

## 覆盖率基线

`npm run test:coverage` 使用 Vitest + V8 coverage。

| 范围                      | Statements | Branches | Functions |  Lines |
| ------------------------- | ---------: | -------: | --------: | -----: |
| All files                 |     93.09% |   81.26% |    79.32% | 93.09% |
| `TargetGpaCalculator.tsx` |     99.13% |   96.15% |   100.00% | 99.13% |
| `gpaService.ts`           |     97.24% |   94.74% |   100.00% | 97.24% |
| `safeStorage.ts`          |    100.00% |   93.75% |   100.00% |   100% |
| `courseDisplay.ts`        |    100.00% |  100.00% |   100.00% |   100% |
| `LanguageContext.tsx`     |    100.00% |  100.00% |   100.00% |   100% |
| `LoadingContext.tsx`      |    100.00% |  100.00% |   100.00% |   100% |
| `ConfirmDialog.tsx`       |    100.00% |   94.11% |   100.00% |   100% |
| `ReloadPrompt.tsx`        |    100.00% |  100.00% |   100.00% |   100% |
| `Header.tsx`              |    100.00% |   96.66% |   100.00% |   100% |
| `ErrorBoundary.tsx`       |    100.00% |  100.00% |   100.00% |   100% |

2026-11-07 上线前审查与修复（第二轮）：

- 测试总数 223 → **338**，文件数 25 → **31**；`All files` 90.22/80.24/76.33 → **93.09/81.26/79.32**。
- 新增测试文件：`ErrorBoundary`(5)、`SampleDataBanner`(5)、`StorageBlockedBanner`(3)、
  `safeStorage`(26)、`gpaService.edge`(41)、`EditCourseModal`(13)、`CourseList.dirtyData`(6)，
  以及 `OcrScanner` 1→7、`DataManagementModal` 3→10、`ThemeContext` +3、`useCourseData` +4。
- 删除 `ScoreDistributionHistogram.tsx`（191 行零引用死代码）及其测试。
- 审查报告列出的 4 个 P0 与 12 个 P1 的处理情况见 `CHANGELOG.md`。

2026-11-06 补测说明：

- 本轮新增 4 个测试文件、42 个用例，测试总数 171 → 213，文件数 20 → 24。
  `LanguageContext` 99.45%→100%、`ConfirmDialog` 50.5%→100%、`ReloadPrompt` 0%→100%、`Header` 83.61%→100%。
- 删除 `src/utils/contrast.ts`（零引用死代码，35 行），`utils` 目录覆盖率由 78.14% 升至 99.28%。
- 当时 `LoadingContext.tsx` 是唯一低于 80% 的模块（56.92%），已于 2026-11-07 补齐至 100%，见下。

2026-11-07 修复说明：

- `ConfirmDialog` 修复三个并发缺陷，测试 14 → 16 例（总数 213 → 215），分支覆盖率 93.10% → 94.11%。
  剩余未覆盖的 58、60 两行是 `?? []` 空值兜底与「无可聚焦元素时提前返回」，两个按钮都不接受
  `disabled`，这两条分支当前不可达，属防御性代码，不为覆盖率改动组件 API。
  两个新增用例都验证过「在旧实现上失败、在新实现上通过」，确属回归防护。
- `All files` 89.92% → 89.94%，`branches` 80.03% → 80.07%。
- `Header` 移动端工具面板的语言按钮补 `title` / `aria-label`，与桌面版一致；测试同步改为按可访问名
  定位并断言按钮文本显示当前语言，用例数不变（15 例）。

2026-11-07 补测说明（`LoadingContext`）：

- 新增 `src/contexts/__tests__/LoadingContext.test.tsx`（8 例），模块覆盖率 56.92% → **100%**（四项全满）。
  覆盖：初始空态无遮罩、单任务注册并渲染消息、多任务并发全部列出、按 id 只移除目标任务、
  最后一个任务移除后遮罩消失、同 id 二次 `showLoading` 覆盖消息而不新增条目、隐藏未知 id 为空操作、
  Provider 外调用 `useLoading` 抛错。
- 测试总数 215 → **223**，文件数 24 → **25**；`All files` 89.94/80.07/74.55 → **90.22/80.24/76.33**。
- 至此 `contexts/` 目录只剩 `ThemeContext.tsx` 的 45-46 两行未覆盖。

本轮不设置任意全局 80% CI 阈值。后续新增或重构时，优先守住以下关键逻辑：

- `useCourseData`：默认 seed、旧缓存迁移、空数组、损坏 JSON、重置、沙盒隔离
- `gpaService`：课程绩点、统计口径、学期趋势、目标 GPA 结果类型
- `ShareableReportModal`：页面与报告指标一致、导出失败可恢复、焦点恢复、滚动锁
- `VirtualCourseList`：83 门课程窗口化渲染和编辑/删除/计入回调
- `ConfirmDialog`：焦点进入/恢复、Tab 困焦、Escape 关闭（不向 window 冒泡）、滚动锁引用计数
- `LoadingContext`：多任务并发计数、按 id 移除、同 id 覆盖、空态不渲染遮罩
- `Header`：分区切换、主题与语言切换、下拉 roving 键盘、移动端工具面板

## 生产包体基线

`npm run build` 当前主要输出如下。Vite 资源体积使用十进制 `kB`；PWA precache 汇总保留构建工具输出的 `KiB`。

| Chunk                                  |  原始体积 |      gzip |
| -------------------------------------- | --------: | --------: |
| `assets/index-*.js`（主入口）          | 104.54 kB |  32.37 kB |
| `assets/index-*.js`（异步小 chunk）    |  14.93 kB |   6.50 kB |
| `assets/TargetGpaCalculator-*.js`      |  14.42 kB |   3.97 kB |
| `assets/react-vendor-*.js`             | 133.93 kB |  43.13 kB |
| `assets/generateCategoricalChart-*.js` | 350.45 kB |  98.55 kB |
| `assets/xlsx-*.js`                     | 499.55 kB | 163.12 kB |
| `assets/index-*.css`                   |  49.43 kB |   9.78 kB |

PWA precache：26 个条目，共 1522.98 KiB。

2026-11-07 变更说明（两处增长均超 15%，按约束在此解释）：

- **主入口 gzip 28.84 → 32.37 kB（+12.2%）**：新增 ErrorBoundary、SampleDataBanner、
  StorageBlockedBanner、safeStorage 与 courseDisplay。前两者是上线必需的兜底与提示，
  safeStorage 是所有持久化路径的防护层，均无法再拆成懒加载。
- **xlsx chunk gzip 143.08 → 163.12 kB（+14.0%）**：0.18.5 → 0.20.3 的安全升级
  （消除两个 HIGH 漏洞），代价是包体增长。该 chunk 仍是独立懒加载，未进入主入口。

功能开发前的 Phase 0 实测基线为主入口 `27.14 kB`。约束不变：

- 主入口 gzip 以当前 `32.37 kB` 为基线；后续增长超过 15% 时，需要在变更说明中解释原因。
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

CI 在 Node 24 与 26 两条 LTS 线上运行（Node 20 已于 2026-04-30 EOL，不再测试）。
`package.json` 的 `engines` 为 `^22.12.0 || >=24.0.0`，仍是 `jsdom@28.1.0` 要求
`^20.19.0 || ^22.12.0 || >=24.0.0` 的子集；上界收紧是为了让 Vercel 不会解析到
已于 2026-10-01 停止构建支持的 Node 20。`@vitejs/plugin-react@latest` 要求 Vite 8，
不作为本轮升级目标。

安全相关依赖（2026-11-07）：

- `xlsx` 改为 `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`。npm 上的 xlsx 已停维护，
  0.18.5 命中 GHSA-4r6h-8v6p-xvw6（原型污染）与 GHSA-5pgg-2g8v-p4x9（ReDoS），
  0.20.3 已修复。API 兼容，调用方零改动。
- `overrides.lodash = ^4.18.1`，覆盖 recharts 与 workbox-build 传递引入的 4.17.23
  （GHSA-r5fr-rjxr-66jc 代码注入、GHSA-f23m-r3pf-42rh 原型污染）。
- `npm audit --omit=dev` 的生产依赖漏洞数为 **0**。devDependencies 里的构建工具链
  （vite/rollup/babel/postcss 等）告警不进生产包，未处理。
