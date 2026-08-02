import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
  isExperimentActive: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  header,
  isExperimentActive,
}) => {
  return (
    <div
      className={`app-shell pb-20 lg:pb-12 transition-colors duration-300 ${isExperimentActive ? 'after:opacity-100' : ''}`}
    >
      <div className="relative z-20">{header}</div>
      <main className="relative z-10 mx-auto max-w-[94rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
};
