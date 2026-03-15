import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
  sandboxBanner?: React.ReactNode;
  isSandboxMode: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  header,
  sandboxBanner,
  isSandboxMode,
}) => {
  return (
    <div className={`min-h-screen pb-12 font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-300 ${isSandboxMode ? 'bg-amber-50/50 dark:bg-amber-950/20' : 'bg-slate-50 text-main dark:bg-gray-950'}`}>
      {header}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>

      {sandboxBanner}
    </div>
  );
};
