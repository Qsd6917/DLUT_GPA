import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import * as XLSX from 'xlsx';
import { DataManagementModal } from '../DataManagementModal';
import { Course } from '../../../types';
import { LanguageProvider } from '../../../contexts/LanguageContext';

describe('DataManagementModal', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  const renderModal = (
    onImport: (courses: Course[], mode: 'replace' | 'merge') => void
  ) =>
    render(
      <LanguageProvider>
        <DataManagementModal
          isOpen={true}
          onClose={() => {}}
          courses={[]}
          onImport={onImport}
        />
      </LanguageProvider>
    );

  const importJson = (container: HTMLElement, payload: unknown) => {
    const inputs = container.querySelectorAll('input[type="file"]');
    const jsonInput = inputs[0] as HTMLInputElement;
    const file = new File([JSON.stringify(payload)], 'courses.json', {
      type: 'application/json',
    });
    fireEvent.change(jsonInput, { target: { files: [file] } });
  };

  test('renders as dialog with visible close button and 2x2 action grid shell', () => {
    const { container } = render(
      <LanguageProvider>
        <DataManagementModal
          isOpen={true}
          onClose={() => {}}
          courses={[]}
          onImport={() => {}}
        />
      </LanguageProvider>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '关闭数据管理' })
    ).toBeInTheDocument();

    const actionGrid = Array.from(container.querySelectorAll('div')).find(
      element => element.className.includes('grid grid-cols-2 gap-3')
    );
    expect(actionGrid).toBeTruthy();
  });

  test('imports zero-credit rows from exported excel files', async () => {
    const onImport = vi.fn();
    const courses: Course[] = [];
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ['课程名', '学分', '成绩', '学期', '属性', '是否核心', '是否计入'],
      ['数学建模专题实践1', 0, 97, '1-2', '任选', '否', '是'],
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, '课程');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new File([new Uint8Array(buffer)], 'courses.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const { container } = render(
      <LanguageProvider>
        <DataManagementModal
          isOpen={true}
          onClose={() => {}}
          courses={courses}
          onImport={onImport}
        />
      </LanguageProvider>
    );

    const inputs = container.querySelectorAll('input[type="file"]');
    const excelInput = inputs[1] as HTMLInputElement;
    fireEvent.change(excelInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            name: '数学建模专题实践1',
            credits: 0,
            score: 97,
          }),
        ],
        'replace'
      );
    });

    expect(screen.queryByText(/导入失败/u)).not.toBeInTheDocument();
  });

  test('coerces string credits from JSON into numbers before importing', async () => {
    const onImport = vi.fn();
    const { container } = renderModal(onImport);

    importJson(container, [{ name: '课', credits: '3', score: '90' }]);

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledTimes(1);
    });

    const [importedCourses] = onImport.mock.calls[0];
    const imported = importedCourses[0] as Course;

    // 白屏根因：字符串学分进入 calculateStats 的 reduce 会变成 "032"，
    // 随后 App 对 totalCredits 调用 toFixed 抛 TypeError。
    expect(imported.credits).toBe(3);
    expect(typeof imported.credits).toBe('number');
    expect(imported.score).toBe(90);
    expect(typeof imported.score).toBe('number');
    expect(Number.isFinite(imported.credits)).toBe(true);
  });

  test('rejects out-of-range credits and scores from JSON without importing', async () => {
    const onImport = vi.fn();
    const { container } = renderModal(onImport);

    importJson(container, [{ name: '课', credits: -2, score: 200 }]);

    await waitFor(() => {
      expect(screen.getByText(/学分不能小于 0/u)).toBeInTheDocument();
    });

    expect(screen.getByText(/成绩需在 0-100 之间/u)).toBeInTheDocument();
    expect(onImport).not.toHaveBeenCalled();
  });

  test('marks zero-score JSON courses as inactive', async () => {
    const onImport = vi.fn();
    const { container } = renderModal(onImport);

    importJson(container, [{ name: '课', credits: 3, score: 0 }]);

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledTimes(1);
    });

    const [importedCourses] = onImport.mock.calls[0];
    expect(importedCourses[0]).toEqual(
      expect.objectContaining({
        name: '课',
        credits: 3,
        score: 0,
        isActive: false,
      })
    );
  });

  test('stringifies numeric semesters from JSON', async () => {
    const onImport = vi.fn();
    const { container } = renderModal(onImport);

    importJson(container, [
      { name: '课', credits: 3, score: 90, semester: 2024 },
    ]);

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledTimes(1);
    });

    const [importedCourses] = onImport.mock.calls[0];
    expect(importedCourses[0].semester).toBe('2024');
    expect(typeof importedCourses[0].semester).toBe('string');
  });

  test('falls back to 必修 for unknown JSON course types', async () => {
    const onImport = vi.fn();
    const { container } = renderModal(onImport);

    importJson(container, [
      { name: '课', credits: 3, score: 90, type: '乱写' },
    ]);

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledTimes(1);
    });

    const [importedCourses] = onImport.mock.calls[0];
    expect(importedCourses[0].type).toBe('必修');
  });

  test('keeps the existing body scroll lock when the modal closes', () => {
    document.body.style.overflow = 'hidden';

    const { rerender } = render(
      <LanguageProvider>
        <DataManagementModal
          isOpen={true}
          onClose={() => {}}
          courses={[]}
          onImport={() => {}}
        />
      </LanguageProvider>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <LanguageProvider>
        <DataManagementModal
          isOpen={false}
          onClose={() => {}}
          courses={[]}
          onImport={() => {}}
        />
      </LanguageProvider>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  // P0 回归：OCR 结果此前直接 onImport(courses, importMode)，而 importMode 默认 'replace'，
  // 用户只是试一下 OCR、识别出 1 门课就会把整份成绩单覆盖清空，且无确认、无撤销。
  // 现在必须先落到预览区，由用户点「追加」才写入，且强制 merge。
  //
  // 局限说明：OcrScanner 内部的 tesseract 识别过程无法在单测里真实触发，
  // 因此这里只能验证「打开弹窗、未做 OCR 时不会导入任何东西」以及「手动导入模式不受影响」。
  // 预览区 → 追加 的完整链路依赖 OcrScanner 的 onCoursesParsed 回调，
  // 属于集成行为，需要真实图片与 tesseract 才能覆盖，本文件不假装覆盖了它。
  describe('OCR 导入需要显式确认', () => {
    test('does not import anything before an OCR preview is confirmed', () => {
      const onImport = vi.fn();
      const { container } = renderModal(onImport);

      expect(onImport).not.toHaveBeenCalled();
      expect(
        container.querySelector('[aria-label="OCR 识别结果预览"]')
      ).toBeNull();
    });

    test('keeps the manual import mode toggle independent from OCR', () => {
      const onImport = vi.fn();
      renderModal(onImport);

      // 手动导入仍可切换覆盖/追加，这是既有能力，不应被 OCR 修复影响
      expect(screen.getByText('覆盖')).toBeInTheDocument();
      expect(screen.getByText('追加')).toBeInTheDocument();
      expect(onImport).not.toHaveBeenCalled();
    });
  });
});
