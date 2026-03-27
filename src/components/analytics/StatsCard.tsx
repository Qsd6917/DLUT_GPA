import React from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  colorClass?: string;
  comparisonValue?: string | number;
  isSandbox?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
  colorClass = '',
  comparisonValue,
  isSandbox = false,
}) => {
  const numValue = Number(value);
  const numComparison =
    comparisonValue !== undefined ? Number(comparisonValue) : undefined;
  const diff =
    numComparison !== undefined && !Number.isNaN(numComparison)
      ? numValue - numComparison
      : undefined;

  const diffNode =
    isSandbox && diff !== undefined ? (
      <div
        className={`num-inline inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${
          diff > 0.001
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
            : diff < -0.001
              ? 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300'
              : 'border-primary/10 bg-[hsl(var(--surface-2))] text-muted'
        }`}
      >
        {diff > 0.001 ? (
          <ArrowUp size={12} />
        ) : diff < -0.001 ? (
          <ArrowDown size={12} />
        ) : (
          <Minus size={12} />
        )}
        {Math.abs(diff).toFixed(
          typeof value === 'number' && Number.isInteger(value) ? 0 : 3
        )}
      </div>
    ) : null;

  return (
    <article className={`paper-panel p-5 sm:p-6 ${colorClass}`}>
      <div className="relative z-10 flex h-full flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="figure-label">{title}</div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="figure-value text-main">{value}</div>
              {diffNode}
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] border border-primary/10 bg-[hsl(var(--surface-2))] text-primary dark:border-white/8">
            {icon}
          </div>
        </div>

        <p className="type-body-sm">{description}</p>
      </div>
    </article>
  );
};
