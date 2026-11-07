/**
 * 课程数值的展示格式化。
 *
 * 历史脏数据里 `credits` / `gpa` 可能是 `null`（`JSON.stringify(NaN)` 的产物）
 * 或 `NaN`。裸调 `.toFixed()` 会抛 TypeError，把整页渲染打崩，刷新一次崩一次。
 * 这里统一用 `Number.isFinite` 守卫，非法值降级为占位符而不是抛错。
 */

/** 数值非法时显示的占位符。 */
export const INVALID_NUMBER_PLACEHOLDER = '—';

/** 学分：整数不显示小数位，否则保留 1 位。 */
export const formatCredits = (credits: unknown): string => {
  if (!Number.isFinite(credits)) return INVALID_NUMBER_PLACEHOLDER;
  const value = credits as number;
  return value.toFixed(value % 1 === 0 ? 0 : 1);
};

/** 绩点：固定 2 位小数。 */
export const formatGpa = (gpa: unknown): string => {
  if (!Number.isFinite(gpa)) return INVALID_NUMBER_PLACEHOLDER;
  return (gpa as number).toFixed(2);
};

/** 学分合计：固定 1 位小数。用于表头/状态条的汇总值。 */
export const formatCreditTotal = (total: unknown): string => {
  if (!Number.isFinite(total)) return INVALID_NUMBER_PLACEHOLDER;
  return (total as number).toFixed(1);
};

/** 把单门课程的学分安全地累加进合计，脏值按 0 计，避免 NaN 污染整列。 */
export const sumCredits = (credits: unknown): number =>
  Number.isFinite(credits) ? (credits as number) : 0;
