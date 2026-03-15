import React, { useEffect, useRef, useState } from 'react';
import { Course } from '../../types';
import { X, Upload, FileJson, AlertTriangle, FileSpreadsheet, Scan } from 'lucide-react';
import * as XLSX from 'xlsx';
import { OcrScanner } from '../common/OcrScanner';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onImport: (courses: Course[], mode: 'replace' | 'merge') => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  courses,
  onImport,
}) => {
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setMessage('');
      setIsProcessing(false);
      setImportMode('replace');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(courses, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    downloadBlob(blob, `dlut_gpa_backup_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleExportExcel = () => {
    const header = ['课程名', '学分', '成绩', '学期', '属性', '是否核心', '是否计入'];
    const rows = courses.map((c) => [
      c.name ?? '',
      c.credits ?? '',
      c.score ?? '',
      c.semester ?? '',
      c.type ?? '必修',
      c.isCore ? '是' : '否',
      c.isActive ? '是' : '否',
    ]);

    const sheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, '课程');

    const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, `dlut_gpa_courses_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const normalizeHeader = (value: unknown) =>
    String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');

  const parseBoolean = (value: unknown): boolean | null => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
      return null;
    }

    const raw = String(value ?? '').trim().toLowerCase();
    if (!raw) return null;
    if (['true', 't', 'yes', 'y', '是', '√', '1', '计入'].includes(raw)) return true;
    if (['false', 'f', 'no', 'n', '否', '×', '0', '不计入'].includes(raw)) return false;
    return null;
  };

  const parseNumber = (value: unknown): number | null => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const normalized = raw.replace(/,/g, '');
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  };

  const parseCourseType = (value: unknown): Course['type'] | null => {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    if (raw === '必修' || raw === '选修' || raw === '任选') return raw;
    const lower = raw.toLowerCase();
    if (lower.includes('compulsory') || lower.includes('required')) return '必修';
    if (lower.includes('elective')) return '选修';
    if (lower.includes('optional')) return '任选';
    if (raw.includes('必修')) return '必修';
    if (raw.includes('选修')) return '选修';
    if (raw.includes('任选')) return '任选';
    return null;
  };

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const errors: string[] = [];
          const validCourses: Course[] = [];

          json.forEach((c, index) => {
            const name = String(c?.name ?? '').trim();
            const credits = parseNumber(c?.credits);
            const score = parseNumber(c?.score);

            if (!name) errors.push(`第 ${index + 1} 条：课程名为空`);
            if (credits === null) errors.push(`第 ${index + 1} 条：学分不是数字`);
            if (score === null) errors.push(`第 ${index + 1} 条：成绩不是数字`);

            if (name && credits !== null && score !== null) {
              validCourses.push(c);
            }
          });

          if (validCourses.length === 0) {
            setMessage('');
            setError(errors.length > 0 ? `导入失败：\n${errors.slice(0, 8).join('\n')}` : '导入失败：文件为空');
            return;
          }

          if (importMode === 'replace' && errors.length > 0) {
            setMessage('');
            setError(`覆盖导入已取消：发现 ${errors.length} 条格式问题。\n${errors.slice(0, 8).join('\n')}`);
            return;
          }

          onImport(validCourses, importMode);
          setError('');
          setMessage(
            errors.length > 0
              ? `成功导入 ${validCourses.length} 条，跳过 ${errors.length} 条（追加模式）`
              : `成功导入 ${validCourses.length} 条`
          );
        } else {
          setError('文件格式错误：必须是课程数组');
        }
      } catch (err) {
        setError('无法解析 JSON 文件');
      }
    };
    reader.readAsText(file);
  };

  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsProcessing(true);
    setError('');
    setMessage('');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        setError('导入失败：Excel 文件中没有工作表');
        return;
      }

      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];
      if (rows.length < 2) {
        setError('导入失败：Excel 内容为空或只有表头');
        return;
      }

      const headerRow = rows[0] ?? [];
      const headerCells = headerRow.map((cell) => normalizeHeader(cell));

      const aliases: Record<string, string[]> = {
        name: ['课程名', '课程名称', '课程', 'name'],
        credits: ['学分', 'credits', 'credit'],
        score: ['成绩', '分数', 'score'],
        semester: ['学期', 'semester', 'term'],
        type: ['属性', '类型', 'type'],
        isCore: ['是否核心', '核心', 'iscored', 'iscore', 'core'],
        isActive: ['是否计入', '计入', 'isactive', 'active'],
      };

      const columnIndexByKey: Partial<Record<keyof typeof aliases, number>> = {};
      (Object.keys(aliases) as (keyof typeof aliases)[]).forEach((key) => {
        const normalizedAliases = aliases[key].map((a) => normalizeHeader(a));
        const idx = headerCells.findIndex((h) => normalizedAliases.includes(h));
        if (idx >= 0) columnIndexByKey[key] = idx;
      });

      const requiredKeys: (keyof typeof aliases)[] = ['name', 'credits', 'score'];
      const missing = requiredKeys.filter((k) => columnIndexByKey[k] === undefined);
      if (missing.length > 0) {
        const missingLabels = missing
          .map((k) => ({ name: '课程名', credits: '学分', score: '成绩' }[k]))
          .filter(Boolean)
          .join('、');
        setError(`导入失败：缺少必要列：${missingLabels}`);
        return;
      }

      const errors: string[] = [];
      const validCourses: Course[] = [];

      for (let r = 1; r < rows.length; r += 1) {
        const row = rows[r] ?? [];
        const isEmptyRow = row.every((cell) => String(cell ?? '').trim() === '');
        if (isEmptyRow) continue;

        const excelRowNumber = r + 1;
        const nameValue = row[columnIndexByKey.name as number];
        const creditsValue = row[columnIndexByKey.credits as number];
        const scoreValue = row[columnIndexByKey.score as number];

        const name = String(nameValue ?? '').trim();
        const credits = parseNumber(creditsValue);
        const score = parseNumber(scoreValue);

        const rowErrors: string[] = [];
        if (!name) rowErrors.push('课程名为空');
        if (credits === null) rowErrors.push('学分不是数字');
        if (credits !== null && credits <= 0) rowErrors.push('学分需大于 0');
        if (score === null) rowErrors.push('成绩不是数字');
        if (score !== null && (score < 0 || score > 100)) rowErrors.push('成绩需在 0-100 之间');

        let semester = '未知学期';
        if (columnIndexByKey.semester !== undefined) {
          const semesterValue = row[columnIndexByKey.semester];
          const s = String(semesterValue ?? '').trim();
          if (s) semester = s;
        }

        let type: Course['type'] = '必修';
        if (columnIndexByKey.type !== undefined) {
          const typeValue = row[columnIndexByKey.type];
          const parsedType = parseCourseType(typeValue);
          if (parsedType) type = parsedType;
          else if (String(typeValue ?? '').trim()) rowErrors.push('属性无法识别（必修/选修/任选）');
        }

        let isCore = false;
        if (columnIndexByKey.isCore !== undefined) {
          const coreValue = row[columnIndexByKey.isCore];
          const parsedCore = parseBoolean(coreValue);
          if (parsedCore !== null) isCore = parsedCore;
          else if (String(coreValue ?? '').trim()) rowErrors.push('是否核心无法识别（是/否）');
        }

        let isActive = true;
        if (columnIndexByKey.isActive !== undefined) {
          const activeValue = row[columnIndexByKey.isActive];
          const parsedActive = parseBoolean(activeValue);
          if (parsedActive !== null) isActive = parsedActive;
          else if (String(activeValue ?? '').trim()) rowErrors.push('是否计入无法识别（是/否）');
        }

        if (rowErrors.length > 0) {
          errors.push(`第 ${excelRowNumber} 行：${rowErrors.join('；')}`);
          continue;
        }

        validCourses.push({
          id: '',
          name,
          credits: credits as number,
          score: score as number,
          gpa: 0,
          isActive,
          semester,
          type,
          isCore,
        });
      }

      if (validCourses.length === 0) {
        setError(errors.length > 0 ? `导入失败：\n${errors.slice(0, 8).join('\n')}` : '导入失败：没有可导入的有效数据');
        return;
      }

      if (importMode === 'replace' && errors.length > 0) {
        setError(`覆盖导入已取消：发现 ${errors.length} 行格式问题。\n${errors.slice(0, 8).join('\n')}`);
        return;
      }

      onImport(validCourses, importMode);
      setMessage(
        errors.length > 0
          ? `成功导入 ${validCourses.length} 行，跳过 ${errors.length} 行（追加模式）`
          : `成功导入 ${validCourses.length} 行`
      );
    } catch (err) {
      setError('导入失败：无法解析 Excel 文件（请确认是 .xlsx 且表头正确）');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-primary/10 bg-background/50">
          <h3 className="text-lg font-bold text-main">数据管理</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted/10 rounded-full transition-colors">
            <X size={20} className="text-muted" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {message && (
            <div className="p-3 bg-emerald-500/10 text-emerald-700 rounded-xl text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-500/10 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <AlertTriangle size={16} />
                <span className="whitespace-pre-line">{error}</span>
            </div>
          )}

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-muted uppercase tracking-wider">导入模式</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                disabled={isProcessing}
                className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                  importMode === 'replace'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-background text-main border-primary/20 hover:bg-muted/10'
                }`}
              >
                覆盖
              </button>
              <button
                type="button"
                onClick={() => setImportMode('merge')}
                disabled={isProcessing}
                className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                  importMode === 'merge'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-background text-main border-primary/20 hover:bg-muted/10'
                }`}
              >
                追加
              </button>
            </div>
            <div className="text-xs text-muted">
              覆盖模式若发现格式问题将直接取消导入，避免数据丢失；追加模式会跳过有问题的行。
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleExportJson}
              disabled={isProcessing}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-2xl transition-all group"
            >
              <div className="p-3 bg-surface rounded-full text-primary shadow-sm group-hover:scale-110 transition-transform">
                <FileJson size={24} />
              </div>
              <span className="font-bold text-main">导出 JSON</span>
            </button>

            <button
              onClick={() => jsonFileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-2xl transition-all group"
            >
              <div className="p-3 bg-surface rounded-full text-primary shadow-sm group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <span className="font-bold text-main">导入 JSON</span>
              <input
                type="file"
                ref={jsonFileInputRef}
                onChange={handleJsonFileChange}
                accept=".json"
                className="hidden"
              />
            </button>

            <button
              onClick={handleExportExcel}
              disabled={isProcessing}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-2xl transition-all group"
            >
              <div className="p-3 bg-surface rounded-full text-primary shadow-sm group-hover:scale-110 transition-transform">
                <FileSpreadsheet size={24} />
              </div>
              <span className="font-bold text-main">导出 Excel</span>
            </button>

            <button
              onClick={() => excelFileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-2xl transition-all group"
            >
              <div className="p-3 bg-surface rounded-full text-primary shadow-sm group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <span className="font-bold text-main">{isProcessing ? '正在导入...' : '导入 Excel'}</span>
              <input
                type="file"
                ref={excelFileInputRef}
                onChange={handleExcelFileChange}
                accept=".xlsx"
                className="hidden"
              />
            </button>
          </div>

          {/* OCR Scanner Section */}
          <div className="pt-4 border-t border-primary/10">
            <h4 className="font-bold text-main mb-3 flex items-center gap-2">
              <Scan size={18} className="text-blue-500" />
              OCR 成绩导入
            </h4>
            <OcrScanner 
              onCoursesParsed={(courses) => {
                onImport(courses, importMode);
                setMessage(`通过OCR成功导入 ${courses.length} 门课程`);
              }} 
            />
          </div>

          <div className="text-center text-xs text-muted">
            支持 .json（完整备份）、.xlsx（表格）和 OCR（截图）导入导出
          </div>
        </div>
      </div>
    </div>
  );
};
