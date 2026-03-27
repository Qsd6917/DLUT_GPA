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
    <div
      className={`app-shell pb-12 transition-colors duration-300 ${isSandboxMode ? 'after:opacity-100' : ''}`}
    >
      <div className="relative z-20">{header}</div>
      {sandboxBanner ? (
        <div className="relative z-20 border-b border-primary/10">
          {sandboxBanner}
        </div>
      ) : null}
      <main className="relative z-10 mx-auto max-w-[94rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
};
