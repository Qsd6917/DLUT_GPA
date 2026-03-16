import React, { useState } from 'react';
import { Target, Calculator } from 'lucide-react';

interface TargetGpaCalculatorProps {
  currentGpa: number;
  currentCredits: number;
}

export const TargetGpaCalculator: React.FC<TargetGpaCalculatorProps> = ({
  currentGpa,
  currentCredits,
}) => {
  const [targetGpa, setTargetGpa] = useState<string>('3.8');
  const [futureCredits, setFutureCredits] = useState<string>('20');
  const [result, setResult] = useState<number | null>(null);

  const calculateRequired = () => {
    const target = parseFloat(targetGpa);
    const future = parseFloat(futureCredits);
    
    if (isNaN(target) || isNaN(future) || future <= 0) return;
    
    // (Current * CurCred + Future * FutCred) / (CurCred + FutCred) = Target
    // Future * FutCred = Target * (CurCred + FutCred) - Current * CurCred
    // Future = (Target * (CurCred + FutCred) - Current * CurCred) / FutCred
    
    const required = (target * (currentCredits + future) - currentGpa * currentCredits) / future;
    setResult(required);
  };

  return (
    <div className="paper-panel p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-[1.2rem] border border-[hsl(var(--color-accent))]/15 bg-[hsla(var(--color-accent),0.08)] p-3 text-[hsl(var(--color-accent))]">
          <Target size={20} />
        </div>
        <div>
          <div className="section-kicker">Projection</div>
          <h3 className="text-2xl leading-none text-main sm:text-3xl">目标 GPA 计算器</h3>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="target-gpa" className="block text-xs font-bold text-muted uppercase tracking-[0.24em] mb-1.5">目标 GPA</label>
            <input 
              id="target-gpa"
              type="number" 
              step="0.01"
              value={targetGpa}
              onChange={e => setTargetGpa(e.target.value)}
              className="w-full rounded-2xl border border-primary/15 bg-background/70 px-3 py-2.5 text-sm font-semibold text-main outline-none focus:border-[hsl(var(--color-accent))] focus:ring-4 focus:ring-[hsla(var(--color-accent),0.12)]"
            />
          </div>
          <div>
            <label htmlFor="future-credits" className="block text-xs font-bold text-muted uppercase tracking-[0.24em] mb-1.5">剩余学分</label>
            <input 
              id="future-credits"
              type="number" 
              step="0.5"
              value={futureCredits}
              onChange={e => setFutureCredits(e.target.value)}
              className="w-full rounded-2xl border border-primary/15 bg-background/70 px-3 py-2.5 text-sm font-semibold text-main outline-none focus:border-[hsl(var(--color-accent))] focus:ring-4 focus:ring-[hsla(var(--color-accent),0.12)]"
            />
          </div>
        </div>
        
        <button 
          onClick={calculateRequired}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsla(var(--color-accent),0.1)] py-3 font-semibold text-[hsl(var(--color-accent))] transition-colors hover:bg-[hsla(var(--color-accent),0.16)]"
        >
          <Calculator size={16} />
          计算所需成绩
        </button>
        
        {result !== null && (
          <div className="mt-4 rounded-[1.4rem] border border-primary/10 bg-background/55 p-4 animate-in fade-in slide-in-from-top-2">
            <p className="figure-label mb-2 text-center">后续课程平均绩点需达到</p>
            <div className={`text-center text-4xl font-black ${result > 4.0 ? 'text-[hsl(var(--color-accent))]' : result < 0 ? 'text-muted' : 'text-emerald-600'}`}>
              {result > 4.0 ? '> 4.0' : result < 0 ? '已达成' : result.toFixed(3)}
            </div>
            {result > 4.0 && (
              <p className="mt-2 text-center text-[11px] font-semibold text-[hsl(var(--color-accent))]">目标过高，当前剩余学分内几乎无法达成</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
