import React, { useState } from 'react';
import { Calculator, Target } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

interface TargetGpaCalculatorProps {
  currentGpa: number;
  currentCredits: number;
}

export const TargetGpaCalculator: React.FC<TargetGpaCalculatorProps> = ({
  currentGpa,
  currentCredits,
}) => {
  const { language } = useTranslation();
  const [targetGpa, setTargetGpa] = useState<string>('3.8');
  const [futureCredits, setFutureCredits] = useState<string>('20');
  const [result, setResult] = useState<number | null>(null);

  const calculateRequired = () => {
    const target = parseFloat(targetGpa);
    const future = parseFloat(futureCredits);

    if (Number.isNaN(target) || Number.isNaN(future) || future <= 0) {
      return;
    }

    const required =
      (target * (currentCredits + future) - currentGpa * currentCredits) /
      future;
    setResult(required);
  };

  return (
    <div className="paper-panel p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-primary/10 bg-[hsl(var(--surface-2))] text-[hsl(var(--color-accent))]">
          <Target size={18} />
        </div>
        <div>
          <div className="section-kicker">
            {language === 'zh' ? '目标推算' : 'Projection'}
          </div>
          <h3 className="type-section-title text-main">目标 GPA 计算器</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="type-label">
              {language === 'zh' ? '目标 GPA' : 'Target GPA'}
            </span>
            <input
              id="target-gpa"
              type="number"
              step="0.01"
              value={targetGpa}
              onChange={e => setTargetGpa(e.target.value)}
              className="num-input w-full rounded-[0.95rem] border border-primary/10 bg-[hsl(var(--surface-2))] px-3.5 py-2.5 text-sm text-main outline-none transition-colors focus:border-primary focus:bg-surface"
            />
          </label>

          <label className="space-y-1.5">
            <span className="type-label">
              {language === 'zh' ? '剩余学分' : 'Remaining Credits'}
            </span>
            <input
              id="future-credits"
              type="number"
              step="0.5"
              value={futureCredits}
              onChange={e => setFutureCredits(e.target.value)}
              className="num-input w-full rounded-[0.95rem] border border-primary/10 bg-[hsl(var(--surface-2))] px-3.5 py-2.5 text-sm text-main outline-none transition-colors focus:border-primary focus:bg-surface"
            />
          </label>
        </div>

        <button onClick={calculateRequired} className="primary-button w-full">
          <Calculator size={16} />
          {language === 'zh' ? '计算所需成绩' : 'Calculate Required GPA'}
        </button>

        {result !== null ? (
          <div className="rounded-[1rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-4">
            <div className="figure-label text-center">
              {language === 'zh'
                ? '后续课程平均绩点需达到'
                : 'Required future average'}
            </div>
            <div
              className={`result-value mt-3 text-center ${
                result > 4.0
                  ? 'text-[hsl(var(--color-accent))]'
                  : result < 0
                    ? 'text-muted'
                    : 'text-primary'
              }`}
            >
              {result > 4.0
                ? '> 4.0'
                : result < 0
                  ? language === 'zh'
                    ? '已达成'
                    : 'Reached'
                  : result.toFixed(3)}
            </div>
            {result > 4.0 ? (
              <p className="type-body-sm mt-2 text-center text-[hsl(var(--color-accent))]">
                {language === 'zh'
                  ? '目标过高，按当前剩余学分几乎无法完成。'
                  : 'The target is too high for the remaining credit load.'}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};
