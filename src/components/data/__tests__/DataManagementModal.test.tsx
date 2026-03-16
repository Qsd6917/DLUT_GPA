import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import * as XLSX from 'xlsx';
import { DataManagementModal } from '../DataManagementModal';
import { Course } from '../../../types';
import { LanguageProvider } from '../../../contexts/LanguageContext';

describe('DataManagementModal', () => {
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
    const file = new File(
      [new Uint8Array(buffer)],
      'courses.xlsx',
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    );

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
});
