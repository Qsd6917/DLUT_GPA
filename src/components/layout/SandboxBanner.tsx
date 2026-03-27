import React from 'react';
import { FlaskConical, Save, XCircle } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

interface SandboxBannerProps {
  onDiscard: () => void;
  onSave: () => void;
}

export const SandboxBanner: React.FC<SandboxBannerProps> = ({
  onDiscard,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-[94rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex items-center gap-3 rounded-[1rem] border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-[hsl(var(--color-accent))]">
        <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-amber-500/12">
          <FlaskConical size={16} />
        </div>
        <div>
          <div className="text-sm font-semibold text-main">
            {t('sandbox_active')}
          </div>
          <p className="type-body-sm mt-1">{t('sandbox_banner')}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <button type="button" onClick={onDiscard} className="ghost-button">
          <XCircle size={14} />
          {t('exit_sandbox_discard')}
        </button>
        <button type="button" onClick={onSave} className="primary-button">
          <Save size={14} />
          {t('exit_sandbox_save')}
        </button>
      </div>
    </div>
  );
};
