import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Course, GpaStats } from '../../types';
import { X, Share2, Download } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface ShareableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GpaStats;
  courses: Course[];
}

let html2CanvasModulePromise: Promise<typeof import('html2canvas')> | null = null;

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

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
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
    if (!element || isExporting) return;

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
        onclone: (clonedDocument) => {
          const clonedElement = clonedDocument.getElementById('shareable-report-content');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.transform = 'none';
            (clonedElement as HTMLElement).style.overflow = 'visible';

            const clonedCard = clonedElement.querySelector('[data-shareable-report-card="1"]');
            if (clonedCard) {
              (clonedCard as HTMLElement).style.transform = 'none';
            }
          }
        },
      });

      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = getExportFileName();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getExportFileName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : '导出失败');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,6,23,0.68)] p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shareable-report-modal-title"
        className="w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-[0_28px_90px_rgba(15,23,42,0.16)] backdrop-blur-xl animate-in zoom-in-95 duration-200 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_32px_90px_rgba(2,6,23,0.56)]"
      >
        <div className="flex items-center justify-between border-b border-primary/10 px-6 py-5">
          <h3 id="shareable-report-modal-title" className="text-lg font-bold text-main flex items-center gap-2">
            <Share2 size={20} className="text-primary" />
            成绩报告
          </h3>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200/80 bg-white/80 p-2 text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-8 text-center">
          {exportError && (
            <div className="p-3 bg-red-500/10 text-red-600 rounded-xl text-sm">
              {exportError}
            </div>
          )}

          <div
            ref={reportRef}
            id="shareable-report-content"
            className="space-y-6 rounded-2xl border border-primary/10 bg-white/50 p-4 text-center dark:bg-white/[0.03]"
          >
            <div
              data-shareable-report-card="1"
              className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 text-on-primary shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-transform hover:scale-[1.02]"
            >
              <p className="text-on-primary/80 font-medium mb-2 uppercase tracking-widest text-xs">Weighted GPA</p>
              <h1 className="data-figure mb-4 text-6xl font-semibold tracking-tighter">{stats.weightedGpa.toFixed(3)}</h1>
              <div className="flex justify-center gap-4 text-sm font-medium opacity-90">
                <span>{stats.totalCredits} 学分</span>
                <span>{stats.weightedAverageScore.toFixed(2)} 分</span>
              </div>
            </div>

            <p className="text-sm text-muted">
              包含 {courses.length} 门课程的统计数据
            </p>
          </div>

          <button
            onClick={handleExportPng}
            disabled={isExporting}
            className="w-full py-3 bg-text-main text-surface rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-text-main/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            {isExporting ? '正在生成图片...' : '导出图片（PNG）'}
          </button>
        </div>
      </div>
    </div>
  );
};
