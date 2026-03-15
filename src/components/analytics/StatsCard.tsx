import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  colorClass: string;
  comparisonValue?: string | number;
  isSandbox?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
  colorClass,
  comparisonValue,
  isSandbox = false,
}) => {
  const numValue = parseFloat(value.toString());
  const numComparison = comparisonValue ? parseFloat(comparisonValue.toString()) : undefined;
  
  let diff = 0;
  let diffNode = null;

  if (isSandbox && numComparison !== undefined && !isNaN(numComparison)) {
    diff = numValue - numComparison;
    const absDiff = Math.abs(diff);
    const formattedDiff = absDiff.toFixed(3); // Assuming GPA precision
    
    if (diff > 0.001) {
      diffNode = (
        <span className="flex items-center text-emerald-500 text-xs font-bold bg-white/90 px-1.5 py-0.5 rounded-md shadow-sm">
          <ArrowUp size={12} strokeWidth={3} />
          {formattedDiff}
        </span>
      );
    } else if (diff < -0.001) {
      diffNode = (
        <span className="flex items-center text-rose-500 text-xs font-bold bg-white/90 px-1.5 py-0.5 rounded-md shadow-sm">
          <ArrowDown size={12} strokeWidth={3} />
          {formattedDiff}
        </span>
      );
    } else {
        diffNode = (
        <span className="flex items-center text-muted text-xs font-bold bg-white/90 px-1.5 py-0.5 rounded-md shadow-sm">
          <Minus size={12} strokeWidth={3} />
        </span>
      );
    }
  }

  return (
    <div className={`p-6 rounded-2xl transition-all duration-300 relative overflow-hidden group dark:border dark:border-white/10 ${colorClass}`}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className={`text-sm font-bold tracking-wide mb-1 opacity-90`}>{title}</p>
          <div className="flex items-end gap-2">
             <h3 className="text-3xl font-extrabold tracking-tight leading-none">
                {value}
             </h3>
             {diffNode}
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-inner dark:bg-black/20`}>
          {icon}
        </div>
      </div>
      
      <div className="relative z-10">
        <p className={`text-xs font-medium opacity-80 flex items-center gap-1`}>
            {description}
        </p>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
      <div className="absolute -left-6 -top-6 w-20 h-20 bg-white opacity-5 rounded-full blur-lg"></div>
    </div>
  );
};
