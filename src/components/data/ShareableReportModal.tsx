import React, { useCallback, useRef, useState } from 'react';
import { Course, GpaStats } from '../../types';
import { X, Share2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShareableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GpaStats;
  courses: Course[];
}

export const ShareableReportModal: React.FC<ShareableReportModalProps> = ({
  isOpen,
  onClose,
  stats,
  courses,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-primary/10 bg-background/50">
          <h3 className="text-lg font-bold text-main flex items-center gap-2">
            <Share2 size={20} className="text-primary" />
            成绩报告
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-muted/10 rounded-full transition-colors">
            <X size={20} className="text-muted" />
          </button>
        </div>
        
        <div className="p-8 space-y-6 text-center">
          {exportError && (
            <div className="p-3 bg-red-500/10 text-red-600 rounded-xl text-sm">
              {exportError}
            </div>
          )}

          <div
            ref={reportRef}
            id="shareable-report-content"
            className="space-y-6 text-center bg-surface rounded-2xl p-4"
          >
            <div
              data-shareable-report-card="1"
              className="bg-gradient-to-br from-primary to-primary/80 text-on-primary p-8 rounded-3xl shadow-xl transform hover:scale-[1.02] transition-transform"
            >
              <p className="text-on-primary/80 font-medium mb-2 uppercase tracking-widest text-xs">Weighted GPA</p>
              <h1 className="text-6xl font-black tracking-tighter mb-4">{stats.weightedGpa.toFixed(3)}</h1>
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
