import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { Course, GpaStats } from '../../types';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useTranslation } from '../../contexts/LanguageContext';

interface ShareableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GpaStats;
  courses: Course[];
}

let html2CanvasModulePromise: Promise<typeof import('html2canvas')> | null =
  null;

const loadHtml2Canvas = async () => {
  if (!html2CanvasModulePromise) {
    html2CanvasModulePromise = import('html2canvas');
  }

  const module = await html2CanvasModulePromise;
  return module.default;
};

export const ShareableReportModal: React.FC<ShareableReportModalProps> = ({
  isOpen,
  onClose,
  stats,
  courses,
}) => {
  const { language } = useTranslation();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getExportFileName = useCallback(() => {
    const now = new Date();
    const pad2 = (n: number) => String(n).padStart(2, '0');
    const y = now.getFullYear();
    const m = pad2(now.getMonth() + 1);
    const d = pad2(now.getDate());
    const hh = pad2(now.getHours());
    const mm = pad2(now.getMinutes());
    const ss = pad2(now.getSeconds());
    return `DLUT-GPA_${y}${m}${d}_${hh}${mm}${ss}.png`;
  }, []);

  const handleExportPng = async () => {
    const element = reportRef.current;
    if (!element || isExporting) {
      return;
    }

    setExportError(null);
    setIsExporting(true);

    try {
      const html2canvas = await loadHtml2Canvas();
      const rect = element.getBoundingClientRect();
      const scale = Math.min(3, Math.max(2, window.devicePixelRatio || 1));

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
      });

      const blob: Blob | null = await new Promise(resolve =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (!blob) {
        throw new Error(
          language === 'zh' ? '图片生成失败' : 'Failed to generate image'
        );
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getExportFileName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : language === 'zh'
            ? '导出失败'
            : 'Export failed'
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(2,6,23,0.5)] p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shareable-report-modal-title"
        className="paper-panel flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-primary/10 px-6 py-4">
          <div>
            <div className="section-kicker">
              {language === 'zh' ? '分享导出' : 'Share Export'}
            </div>
            <h3
              id="shareable-report-modal-title"
              className="mt-1 text-lg font-extrabold tracking-[-0.04em] text-main"
            >
              {language === 'zh' ? '成绩报告' : 'Grade Report'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-primary/10 bg-[hsl(var(--surface-2))] text-muted transition-colors hover:border-primary/20 hover:text-main"
            aria-label={
              language === 'zh' ? '关闭报告弹窗' : 'Close report modal'
            }
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {exportError ? (
            <div className="rounded-[0.9rem] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
              {exportError}
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_16rem]">
            <div
              ref={reportRef}
              id="shareable-report-content"
              className="rounded-[1.15rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-5"
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="figure-label text-primary">
                      {language === 'zh'
                        ? '大连理工大学 GPA 摘要'
                        : 'DLUT GPA Summary'}
                    </div>
                    <div className="mt-2 text-xl font-extrabold tracking-[-0.04em] text-main">
                      {language === 'zh' ? '学业报告预览' : 'Academic Snapshot'}
                    </div>
                  </div>
                  <div className="rounded-[0.85rem] border border-primary/10 bg-surface px-3 py-1.5 text-sm font-semibold text-primary">
                    DLUT 5.0
                  </div>
                </div>

                <div className="rounded-[1rem] border border-primary/10 bg-surface p-5">
                  <div className="figure-label">
                    {language === 'zh' ? '加权 GPA' : 'Weighted GPA'}
                  </div>
                  <div className="report-value mt-3 text-main">
                    {stats.weightedGpa.toFixed(3)}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="metric-card">
                      <div className="figure-label">
                        {language === 'zh' ? '总学分' : 'Credits'}
                      </div>
                      <div className="mt-2 text-lg font-extrabold tracking-[-0.04em] text-main">
                        {stats.totalCredits.toFixed(1)}
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="figure-label">
                        {language === 'zh' ? '均分' : 'Average'}
                      </div>
                      <div className="mt-2 text-lg font-extrabold tracking-[-0.04em] text-main">
                        {stats.weightedAverageScore.toFixed(2)}
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="figure-label">
                        {language === 'zh' ? '课程数' : 'Courses'}
                      </div>
                      <div className="mt-2 text-lg font-extrabold tracking-[-0.04em] text-main">
                        {courses.length}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1rem] border border-primary/10 bg-surface px-4 py-3 text-sm text-muted">
                  {language === 'zh'
                    ? `统计范围包含当前已计入的 ${courses.length} 门课程，可直接导出为图片。`
                    : `The summary covers ${courses.length} included courses and can be exported directly as an image.`}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-4">
                <div className="figure-label">
                  {language === 'zh' ? '导出说明' : 'Export Notes'}
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  <li>
                    {language === 'zh'
                      ? '导出内容为当前已计入课程的学业摘要。'
                      : 'The export uses currently included courses only.'}
                  </li>
                  <li>
                    {language === 'zh'
                      ? '适合发给同学、导师或用于阶段记录。'
                      : 'Suitable for peers, advisors, or personal snapshots.'}
                  </li>
                </ul>
              </div>

              <div className="rounded-[1rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-4">
                <div className="figure-label">
                  {language === 'zh' ? '输出格式' : 'Output'}
                </div>
                <div className="mt-2 text-sm font-semibold text-main">PNG</div>
                <p className="type-body-sm mt-2">
                  {language === 'zh'
                    ? '保持卡片预览样式，方便直接分享。'
                    : 'Keeps the same card layout for direct sharing.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-primary/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="type-body-sm flex items-center gap-2">
            <Share2 size={14} />
            <span>
              {language === 'zh'
                ? '导出前请确认当前筛选和计入状态正确。'
                : 'Confirm the current filters and inclusion state before export.'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleExportPng}
            disabled={isExporting}
            className="primary-button sm:min-w-[12rem]"
          >
            <Download size={16} />
            {isExporting
              ? language === 'zh'
                ? '正在导出...'
                : 'Exporting...'
              : language === 'zh'
                ? '导出图片'
                : 'Export PNG'}
          </button>
        </div>
      </div>
    </div>
  );
};
