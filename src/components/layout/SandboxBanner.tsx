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
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-20">
      <div className="max-w-4xl mx-auto bg-amber-900/90 text-white backdrop-blur-md rounded-2xl shadow-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-xl text-white shadow-sm animate-pulse">
            <FlaskConical size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm">{t('sandbox_active')}</h4>
            <p className="text-xs text-amber-200">{t('sandbox_banner')}</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onDiscard}
            className="flex-1 sm:flex-none px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <XCircle size={16} />
            {t('exit_sandbox_discard')}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 sm:flex-none px-6 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-900/50 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {t('exit_sandbox_save')}
          </button>
        </div>
      </div>
    </div>
  );
};
