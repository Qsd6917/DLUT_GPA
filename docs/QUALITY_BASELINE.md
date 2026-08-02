# 质量与性能基线

记录日期：2026-07-12

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
- `npm run test:run`：17 个测试文件、85 项测试通过
- `npm run build`：通过
- `npm run test:coverage`：通过

## 覆盖率基线

`npm run test:coverage` 使用 Vitest + V8 coverage。

| 范围 | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| All files | 82.83% | 67.80% | 59.88% | 82.83% |
| hooks | 79.00% | 88.23% | 87.50% | 79.00% |
| services | 91.78% | 84.12% | 100.00% | 91.78% |
| components/data | 82.04% | 55.15% | 58.33% | 82.04% |

本轮不设置任意全局 80% CI 阈值。后续新增或重构时，优先守住以下关键逻辑：

- `useCourseData`：默认 seed、旧缓存迁移、空数组、损坏 JSON、重置、沙盒隔离
- `gpaService`：课程绩点、统计口径、学期趋势、目标 GPA 结果类型
- `ShareableReportModal`：页面与报告指标一致、导出失败可恢复、焦点恢复、滚动锁
- `VirtualCourseList`：83 门课程窗口化渲染和编辑/删除/计入回调

## 生产包体基线

`npm run build` 当前主要 gzip 输出：

| Chunk | gzip |
| --- | ---: |
| `assets/index-JcTHc6j9.js` | 23.84 KiB |
| `assets/react-vendor-DA0jXeBL.js` | 43.13 KiB |
| `assets/html2canvas.esm-CBrSDip1.js` | 48.03 KiB |
| `assets/generateCategoricalChart-CUNe3t8Q.js` | 98.55 KiB |
| `assets/xlsx-D_0l8YDs.js` | 143.08 KiB |
| `assets/ShareableReportModal-sdcGILdR.js` | 3.39 KiB |
| `assets/SemesterTrendChart-D76EXv3d.js` | 10.17 KiB |
| `assets/ScoreDistributionChart-B7Tjg0Ey.js` | 5.85 KiB |

约束：

- 主入口 gzip 继续控制在约 24 KiB 内。
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

该组合在 Node 18+ 支持范围内，并已消除 Vitest 4 与 Vite 5 组合触发的 `esbuild` / `oxc` 弃用警告。`@vitejs/plugin-react@latest` 当前要求 Vite 8 和 Node 20.19+，不作为本轮升级目标。
