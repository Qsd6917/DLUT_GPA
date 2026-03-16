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
  const numComparison = comparisonValue !== undefined ? Number(comparisonValue) : undefined;
  const diff = numComparison !== undefined && !Number.isNaN(numComparison) ? numValue - numComparison : undefined;

  const diffNode =
    isSandbox && diff !== undefined ? (
      <div
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
          diff > 0.001
            ? 'bg-emerald-500/12 text-emerald-300'
            : diff < -0.001
              ? 'bg-rose-500/12 text-rose-300'
              : 'bg-white/8 text-muted'
        }`}
      >
        {diff > 0.001 ? <ArrowUp size={12} /> : diff < -0.001 ? <ArrowDown size={12} /> : <Minus size={12} />}
        {Math.abs(diff).toFixed(typeof value === 'number' && Number.isInteger(value) ? 0 : 3)}
      </div>
    ) : null;

  return (
    <article className={`paper-panel p-5 sm:p-6 ${colorClass}`}>
      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="figure-label">{title}</div>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="figure-value text-main">{value}</div>
              {diffNode}
            </div>
          </div>
          <div className="rounded-[1.2rem] border border-primary/10 bg-primary/10 p-3 text-primary shadow-[0_10px_28px_hsla(var(--color-primary),0.08)]">
            {icon}
          </div>
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{description}</p>
      </div>
    </article>
  );
};
