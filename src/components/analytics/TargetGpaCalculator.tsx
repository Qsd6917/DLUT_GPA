import React, { useMemo, useState } from 'react';
import { Target } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { calculateTargetGpa } from '../../services/gpaService';
import { TargetGpaResult } from '../../types';

interface TargetGpaCalculatorProps {
  currentGpa: number;
  currentCredits: number;
  maximumGpa?: number;
}

export const TargetGpaCalculator: React.FC<TargetGpaCalculatorProps> = ({
  currentGpa,
  currentCredits,
  maximumGpa = 5,
}) => {
  const { t } = useTranslation();
  const [targetGpa, setTargetGpa] = useState('3.8');
  const [futureCredits, setFutureCredits] = useState('20');
  const [expectedFutureGpa, setExpectedFutureGpa] = useState('4');
  const result = useMemo<TargetGpaResult>(() => {
      if (targetGpa.trim() === '') return { status: 'invalid', field: 'targetGpa', reason: 'required' };
      if (futureCredits.trim() === '') return { status: 'invalid', field: 'futureCredits', reason: 'required' };
      if (expectedFutureGpa.trim() === '') return { status: 'invalid', field: 'expectedFutureGpa', reason: 'required' };
      return calculateTargetGpa({
        currentGpa,
        currentCredits,
        targetGpa: Number(targetGpa),
        futureCredits: Number(futureCredits),
        expectedFutureGpa: Number(expectedFutureGpa),
        maximumGpa,
      });
    },
    [currentGpa, currentCredits, expectedFutureGpa, futureCredits, maximumGpa, targetGpa]
  );

  const labels = { target: t('target_gpa'), credits: t('remaining_credits'), expected: t('expected_average_gpa') };
  const error = result.status === 'invalid'
    ? result.reason === 'required'
      ? t('required_field', result.field === 'targetGpa' ? t('target_gpa') : result.field === 'futureCredits' ? t('remaining_credits') : t('expected_average_gpa'))
      : result.field === 'futureCredits'
      ? t('remaining_credits_positive')
      : result.field === 'targetGpa'
        ? t('target_required', maximumGpa)
        : t('expected_gpa_range', maximumGpa)
    : null;

  return (
    <section className="paper-panel p-5 sm:p-6" aria-labelledby="target-gpa-title">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-primary/10 bg-[hsl(var(--surface-2))] text-[hsl(var(--color-accent))]"><Target size={18} /></div>
        <div><div className="section-kicker">{t('target_projection')}</div><h3 id="target-gpa-title" className="type-section-title text-main">{t('target_gpa_calculator')}</h3></div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-[1rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-3">
        <div><div className="figure-label">{t('current_gpa_short')}</div><div className="num-inline mt-1 text-lg text-main">{currentGpa.toFixed(3)}</div></div>
        <div><div className="figure-label">{t('included_credits_short')}</div><div className="num-inline mt-1 text-lg text-main">{currentCredits.toFixed(1)}</div></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          [labels.target, targetGpa, setTargetGpa, '0.01', 'targetGpa'],
          [labels.credits, futureCredits, setFutureCredits, '0.5', 'futureCredits'],
          [labels.expected, expectedFutureGpa, setExpectedFutureGpa, '0.01', 'expectedFutureGpa'],
        ].map(([label, value, setter, step, field]) => (
          <label key={label as string} className="space-y-1.5"><span className="type-label">{label as string}</span><input type="number" step={step as string} value={value as string} onChange={event => (setter as React.Dispatch<React.SetStateAction<string>>)(event.target.value)} aria-invalid={result.status === 'invalid' && result.field === field} aria-describedby={result.status === 'invalid' && result.field === field ? `target-gpa-error-${field}` : undefined} className="num-input w-full rounded-[0.95rem] border border-primary/10 bg-[hsl(var(--surface-2))] px-3.5 py-2.5 text-sm text-main outline-none focus:border-primary" /></label>
        ))}
      </div>
      {error && result.status === 'invalid' ? <p id={`target-gpa-error-${result.field}`} className="mt-3 text-sm text-red-600" role="alert">{error}</p> : null}
      {result.status !== 'invalid' ? (
        <div className={`mt-4 rounded-[1rem] border p-4 ${result.status === 'reachable' && result.outlook === 'on-track' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5'}`} aria-live="polite">
          <div className="font-semibold text-main">{result.status === 'unreachable' ? t('not_reachable') : result.outlook === 'achieved' ? t('target_achieved') : result.outlook === 'on-track' ? t('plan_reaches_target') : t('higher_future_gpa_required')}</div>
          <p className="type-body-sm mt-1">{t('required_future_projected', result.requiredFutureGpa.toFixed(3), result.projectedGpa.toFixed(3))}</p>
          <div className="result-value mt-3 text-primary">{result.requiredFutureGpa.toFixed(3)}</div>
        </div>
      ) : null}
    </section>
  );
};
