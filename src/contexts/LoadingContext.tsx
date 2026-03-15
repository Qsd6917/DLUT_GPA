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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-primary/20">
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