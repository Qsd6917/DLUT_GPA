import React from 'react';

interface StorageBlockedBannerProps {
  visible: boolean;
  language: 'zh' | 'en';
  /**
   * 阻断原因：
   * - 'unavailable'：浏览器不允许写入（隐私模式、禁用站点数据、配额满）
   * - 'externalSeed'：存储属于外部来源，本应用刻意不覆盖，本次编辑不会保存
   */
  reason?: 'unavailable' | 'externalSeed';
}

/**
 * 本地存储不可用时的警告条。
 *
 * 两种情况会触发：
 * 1. 浏览器禁止站点数据（Safari「阻止所有 Cookie」、部分机房策略）或配额已满。
 * 2. 存储里的 seed 属于别的版本/来源，本应用刻意不写入以避免覆盖对方数据。
 *
 * 这两种情况此前都是静默失败——用户改了一晚上课程，关掉标签页全部丢失，
 * 界面上没有任何提示。
 */
export const StorageBlockedBanner: React.FC<StorageBlockedBannerProps> = ({
  visible,
  language,
  reason = 'unavailable',
}) => {
  if (!visible) return null;

  const isZh = language === 'zh';
  const isExternal = reason === 'externalSeed';

  const message = isExternal
    ? isZh
      ? '检测到本页面保存的数据来自其他版本或其他工具，为避免覆盖它，本次的修改不会被保存。建议先导出 JSON 备份，再点击「重置」重新开始。'
      : 'The saved data here comes from a different version or tool. To avoid overwriting it, your changes will not be saved. Export a JSON backup first, then use Reset to start fresh.'
    : isZh
      ? '浏览器不允许本页面保存数据（可能是隐私模式、禁用了站点数据，或存储空间已满）。你这次的修改不会被保存，关闭页面后会丢失。请先导出 JSON 备份。'
      : 'This browser is not allowing the page to save data (private mode, blocked site data, or storage full). Your changes will be lost when you close the page. Export a JSON backup first.';

  return (
    <div
      role="alert"
      className="mx-auto mb-4 flex max-w-[94rem] items-start gap-3 rounded-[var(--radius-control)] border border-rose-500/40 bg-rose-500/10 px-4 py-3"
    >
      <span
        className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-300"
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
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </span>
      <p className="flex-1 text-sm leading-relaxed text-main">{message}</p>
    </div>
  );
};
