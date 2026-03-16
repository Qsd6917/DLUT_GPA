import React, { useState, useRef } from 'react';
import { Upload, Camera, Scan, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { Course } from '../../types';

interface OcrScannerProps {
  onCoursesParsed: (courses: Course[]) => void;
}

let tesseractModulePromise: Promise<typeof import('tesseract.js')> | null = null;

const loadTesseractModule = () => {
  if (!tesseractModulePromise) {
    tesseractModulePromise = import('tesseract.js');
  }

  return tesseractModulePromise;
};

const parseOcrResult = (text: string): Course[] => {
  const lineRegex = /^(.+?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/;
  const courses: Course[] = [];
  const keys = new Set<string>();

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  lines.forEach((line) => {
    const match = line.match(lineRegex);
    if (!match) return;

    const [, name, creditsStr, scoreStr] = match;
    const cleanName = name.trim().replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s/-]/g, '');
    const credits = parseFloat(creditsStr);
    const score = parseFloat(scoreStr);

    if (!cleanName || Number.isNaN(credits) || Number.isNaN(score) || credits < 0 || score < 0 || score > 100) {
      return;
    }

    const dedupeKey = `${cleanName}|${credits}|${score}`;
    if (keys.has(dedupeKey)) return;
    keys.add(dedupeKey);

    let type: '必修' | '选修' | '任选' = '选修';
    if (cleanName.includes('必修') || cleanName.includes('数学') || cleanName.includes('英语') || cleanName.includes('政治')) {
      type = '必修';
    } else if (cleanName.includes('任选') || cleanName.includes('讲座')) {
      type = '任选';
    }

    const isCore =
      cleanName.includes('数学') ||
      cleanName.includes('专业') ||
      cleanName.includes('核心') ||
      cleanName.includes('程序') ||
      cleanName.includes('算法');

    courses.push({
      id: globalThis.crypto?.randomUUID?.() ?? `${cleanName}-${credits}-${score}`,
      name: cleanName,
      credits,
      score,
      gpa: score,
      isActive: true,
      semester: '未知学期',
      type,
      isCore,
    });
  });

  return courses;
};

export const OcrScanner: React.FC<OcrScannerProps> = ({ onCoursesParsed }) => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';

    setError(null);
    setIsScanning(true);
    setProgress(0);

    try {
      const { recognize } = await loadTesseractModule();
      const result = await recognize(file, 'chi_sim+eng', {
        logger: (message) => {
          if (message.status === 'recognizing text') {
            setProgress(Math.round(message.progress * 100));
          }
        },
      });

      const parsedCourses = parseOcrResult(result.data.text);

      if (parsedCourses.length === 0) {
        setError(t('ocr_no_courses_found'));
      } else {
        onCoursesParsed(parsedCourses);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError(t('ocr_error_occurred'));
    } finally {
      setIsScanning(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="rounded-2xl border border-primary/10 bg-white/55 p-5 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-primary/20 dark:bg-white/[0.03] dark:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-main flex items-center gap-2">
          <Scan size={18} className="text-primary" />
          {t('ocr_import_title')}
        </h3>
      </div>

      <div 
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isScanning
            ? 'border-primary/40 bg-primary/10'
            : 'border-slate-300/80 bg-white/45 hover:border-primary/40 dark:border-white/10 dark:bg-white/[0.02]'
        }`}
        onClick={triggerFileSelect}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
          disabled={isScanning}
        />
        
        <div className="flex flex-col items-center justify-center gap-3">
          <Camera size={48} className={`mx-auto ${isScanning ? 'text-primary' : 'text-muted'}`} />
          
          {isScanning ? (
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-sm mb-1">
                <span>{t('ocr_scanning')}...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-white/10">
                <div 
                  className="h-2.5 rounded-full bg-primary transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <>
              <p className="font-medium text-main">{t('ocr_upload_prompt')}</p>
              <p className="text-sm text-muted">{t('ocr_supported_formats')}</p>
              <button 
                className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-on-primary transition-opacity hover:opacity-90"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileSelect();
                }}
              >
                <Upload size={16} />
                {t('upload_image')}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-700 dark:text-red-300">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-4 text-xs text-muted">
        <p>{t('ocr_instruction_line1')}</p>
        <p>{t('ocr_instruction_line2')}</p>
      </div>
    </div>
  );
};
