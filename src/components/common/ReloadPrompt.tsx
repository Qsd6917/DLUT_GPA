import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { X, RefreshCw } from 'lucide-react';

export const ReloadPrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log(`SW Registered: ${r}`);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-md animate-in slide-in-from-bottom-4 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_28px_70px_rgba(2,6,23,0.48)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-main">
            {offlineReady ? '应用已就绪' : '发现新版本'}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {offlineReady 
              ? '应用已缓存，可离线使用。' 
              : '有新的内容可用，点击刷新以更新。'}
          </p>
        </div>
        <button onClick={close} className="text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-white">
          <X size={16} />
        </button>
      </div>
      
      {needRefresh && (
        <button 
          onClick={() => updateServiceWorker(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-xs font-bold text-on-primary transition-colors hover:bg-primary/90"
        >
          <RefreshCw size={14} />
          刷新更新
        </button>
      )}
    </div>
  );
};
