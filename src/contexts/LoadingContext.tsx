import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  loadingTasks: Map<string, string>;
  showLoading: (id: string, message: string) => void;
  hideLoading: (id: string) => void;
  isLoading: (id: string) => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingTasks, setLoadingTasks] = useState<Map<string, string>>(new Map());

  const showLoading = (id: string, message: string) => {
    setLoadingTasks(prev => new Map(prev).set(id, message));
  };

  const hideLoading = (id: string) => {
    setLoadingTasks(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  const isLoading = (id: string) => {
    return loadingTasks.has(id);
  };

  return (
    <LoadingContext.Provider value={{ loadingTasks, showLoading, hideLoading, isLoading }}>
      {children}
      {/* Loading overlay */}
      {loadingTasks.size > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,6,23,0.38)] backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-slate-950/78 dark:shadow-[0_28px_70px_rgba(2,6,23,0.48)]">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              {Array.from(loadingTasks.values()).map((message, index) => (
                <p key={index} className="text-main text-center">{message}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
