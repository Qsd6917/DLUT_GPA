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
    <div className="fixed bottom-4 right-4 p-4 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] animate-in slide-in-from-bottom-4 flex flex-col gap-2 max-w-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-800 text-sm">
            {offlineReady ? '应用已就绪' : '发现新版本'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {offlineReady 
              ? '应用已缓存，可离线使用。' 
              : '有新的内容可用，点击刷新以更新。'}
          </p>
        </div>
        <button onClick={close} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      
      {needRefresh && (
        <button 
          onClick={() => updateServiceWorker(true)}
          className="w-full py-2 bg-dlut-blue hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} />
          刷新更新
        </button>
      )}
    </div>
  );
};
