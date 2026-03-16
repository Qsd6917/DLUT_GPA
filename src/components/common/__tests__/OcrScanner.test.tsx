import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { OcrScanner } from '../OcrScanner';
import { LanguageProvider } from '../../../contexts/LanguageContext';

const { recognize } = vi.hoisted(() => ({
  recognize: vi.fn(),
}));

vi.mock('tesseract.js', () => ({
  recognize,
}));

const renderWithLanguage = (ui: React.ReactElement) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('OcrScanner', () => {
  beforeEach(() => {
    recognize.mockReset();
  });

  test('parses course names that contain digits', async () => {
    recognize.mockResolvedValue({
      data: {
        text: '工科数学分析基础1 5 93',
      },
    });

    const onCoursesParsed = vi.fn();
    const file = new File(['image'], 'transcript.png', { type: 'image/png' });

    const { container } = renderWithLanguage(<OcrScanner onCoursesParsed={onCoursesParsed} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onCoursesParsed).toHaveBeenCalledWith([
        expect.objectContaining({
          name: '工科数学分析基础1',
          credits: 5,
          score: 93,
        }),
      ]);
    });

    expect(screen.queryByText('未在图片中找到课程信息，请检查截图是否包含成绩单')).not.toBeInTheDocument();
  });
});
