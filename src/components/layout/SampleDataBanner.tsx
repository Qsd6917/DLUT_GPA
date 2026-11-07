import React from 'react';

interface SampleDataBannerProps {
  /** 当前展示的是否为内置示例数据（尚未被用户改动） */
  visible: boolean;
  language: 'zh' | 'en';
  /** 用户明确表示知道了，本次会话不再提示 */
  onDismiss: () => void;
}

/**
 * 首访示例数据提示条。
 *
 * 新用户打开页面看到的是内置的示例成绩单（83 门课、GPA 3.867），
 * 那不是用户自己的数据。此前的界面完全没有标注，用户会误以为那是自己的成绩，
 * 还能一键导出带「大连理工大学 GPA 摘要」的分享图。
 *
 * 这个横幅的职责只有一件事：让用户第一眼就知道「这些不是你的成绩」。
 * 一旦用户开始编辑或导入，示例态结束，横幅自动消失。
 */
export const SampleDataBanner: React.FC<SampleDataBannerProps> = ({
  visible,
  language,
  onDismiss,
}) => {
  if (!visible) return null;

  const isZh = language === 'zh';

  return (
    <div
      role="status"
      className="mx-auto mb-4 flex max-w-[94rem] items-start gap-3 rounded-[var(--radius-control)] border border-amber-400/40 bg-amber-400/10 px-4 py-3"
    >
      <span
        className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300"
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </span>
      <p className="flex-1 text-sm leading-relaxed text-main">
        {isZh
          ? '当前显示的是内置示例数据，不是你的成绩。开始录入或导入你自己的课程后，本提示会自动消失。'
          : 'You are viewing built-in sample data, not your own grades. This notice disappears once you add or import your own courses.'}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-[0.6rem] px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-amber-400/20 hover:text-main"
      >
        {isZh ? '知道了' : 'Got it'}
      </button>
    </div>
  );
};
