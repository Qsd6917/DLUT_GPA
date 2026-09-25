# 质量与性能基线

记录日期：2026-08-08

## 质量命令

本地和 CI 使用同一组质量命令：

```bash
npm ci
npm run type-check
npm run lint
npm run test:run
npm run build
```

当前本地验证结果：

- `npm run type-check`：通过
- `npm run lint`：通过
- `npm run test:run`：20 个测试文件、171 项测试通过
- `npm run test:coverage`：通过
- `npm run build`：通过，转换 2461 个模块；本次串行快照用时 8.77 秒
- `npm run format:check`：退出码 `1`。Phase 0 与当前检查均报告同一组 64 个文件级问题（`src` 51 个、文档 13 个，`README.md` 通过）；本轮 15 个修改文件中，除 `README.md` 外的其他触及文件仍在该全局格式债务列表中。该命令当前不在 CI 中，本轮未执行全仓库格式重写（broad rewrite）

构建输出包含 `caniuse-lite is outdated` 提示；该提示不影响本轮类型检查、测试、覆盖率或生产构建结果。

## 覆盖率基线

`npm run test:coverage` 使用 Vitest + V8 coverage。

| 范围 | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| All files | 89.32% | 78.48% | 69.33% | 89.32% |
| `TargetGpaCalculator.tsx` | 99.13% | 96.15% | 100.00% | 99.13% |
| `gpaService.ts` | 91.44% | 92.98% | 100.00% | 91.44% |

本轮不设置任意全局 80% CI 阈值。后续新增或重构时，优先守住以下关键逻辑：

- `useCourseData`：默认 seed、旧缓存迁移、空数组、损坏 JSON、重置、沙盒隔离
- `gpaService`：课程绩点、统计口径、学期趋势、目标 GPA 结果类型
- `ShareableReportModal`：页面与报告指标一致、导出失败可恢复、焦点恢复、滚动锁
- `VirtualCourseList`：83 门课程窗口化渲染和编辑/删除/计入回调

## 生产包体基线

`npm run build` 当前主要输出如下。Vite 资源体积使用十进制 `kB`；PWA precache 汇总保留构建工具输出的 `KiB`。

| Chunk | 原始体积 | gzip |
| --- | ---: | ---: |
| `assets/index-*.js` | 95.87 kB | 28.84 kB |
| `assets/TargetGpaCalculator-*.js` | 14.42 kB | 3.97 kB |
| `assets/react-vendor-*.js` | 133.93 kB | 43.13 kB |
| `assets/generateCategoricalChart-*.js` | 350.45 kB | 98.55 kB |
| `assets/xlsx-*.js` | 429.03 kB | 143.08 kB |
| `assets/index-*.css` | 48.95 kB | 9.67 kB |

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

当前 CI 使用 Node 20。仓库 `package.json` 仍声明 Node `>=18.0.0`，但锁定的 `jsdom@28.1.0` 要求 Node `^20.19.0 || ^22.12.0 || >=24.0.0`；这是已知的开发/测试环境契约不一致，本轮未更改 `engines` 或依赖版本。`@vitejs/plugin-react@latest` 当前要求 Vite 8 和 Node 20.19+，不作为本轮升级目标。
