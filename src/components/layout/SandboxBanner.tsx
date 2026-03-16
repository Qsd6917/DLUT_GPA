import React from 'react';
import { FlaskConical, Save, XCircle } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

interface SandboxBannerProps {
  onDiscard: () => void;
  onSave: () => void;
}

export const SandboxBanner: React.FC<SandboxBannerProps> = ({ onDiscard, onSave }) => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-[94rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex items-center gap-3 rounded-full border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-amber-100">
        <div className="rounded-full bg-amber-400/20 p-2 text-amber-200">
          <FlaskConical size={16} />
        </div>
        <div>
          <div className="text-sm font-semibold text-amber-50">{t('sandbox_active')}</div>
          <p className="text-xs text-amber-100/80">{t('sandbox_banner')}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <button
          type="button"
          onClick={onDiscard}
          className="ghost-button border-amber-400/25 bg-amber-500/10 text-amber-100 hover:border-amber-300/40 hover:text-amber-50"
        >
          <XCircle size={14} />
          {t('exit_sandbox_discard')}
        </button>
        <button type="button" onClick={onSave} className="primary-button bg-amber-300 px-4 py-2.5 text-xs text-amber-950 shadow-[0_16px_32px_rgba(251,191,36,0.24)]">
          <Save size={14} />
          {t('exit_sandbox_save')}
        </button>
      </div>
    </div>
  );
};
