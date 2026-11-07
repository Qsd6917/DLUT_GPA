import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const getFileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

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

    const { container } = renderWithLanguage(
      <OcrScanner onCoursesParsed={onCoursesParsed} />
    );
    const input = getFileInput(container);

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

    expect(
      screen.queryByText('未在图片中找到课程信息，请检查截图是否包含成绩单')
    ).not.toBeInTheDocument();
  });

  test('上传区是可通过键盘聚焦的按钮', () => {
    const onCoursesParsed = vi.fn();

    renderWithLanguage(<OcrScanner onCoursesParsed={onCoursesParsed} />);

    const uploadButton = screen.getByRole('button', {
      name: /点击上传教务系统截图/,
    });

    expect(uploadButton).toBeInTheDocument();
    expect(uploadButton).toHaveAttribute('type', 'button');
    expect(uploadButton).toBeEnabled();
  });

  test('文件输入可通过标签定位，且不是 display:none 隐藏', () => {
    const onCoursesParsed = vi.fn();

    const { container } = renderWithLanguage(
      <OcrScanner onCoursesParsed={onCoursesParsed} />
    );

    const input = getFileInput(container);
    expect(input).toBeInTheDocument();
    expect(screen.getByLabelText('上传图片')).toBe(input);
    expect(input).not.toHaveClass('hidden');
    expect(input).toHaveClass('sr-only');
    expect(input).toBeEnabled();
  });

  test('点击上传区会打开文件选择器', async () => {
    const user = userEvent.setup();
    const onCoursesParsed = vi.fn();

    const { container } = renderWithLanguage(
      <OcrScanner onCoursesParsed={onCoursesParsed} />
    );

    const input = getFileInput(container);
    const clickSpy = vi.spyOn(input, 'click');

    await user.click(
      screen.getByRole('button', { name: /点击上传教务系统截图/ })
    );

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  test('键盘 Enter 可以触发文件选择器', async () => {
    const user = userEvent.setup();
    const onCoursesParsed = vi.fn();

    const { container } = renderWithLanguage(
      <OcrScanner onCoursesParsed={onCoursesParsed} />
    );

    const input = getFileInput(container);
    const clickSpy = vi.spyOn(input, 'click');

    const uploadButton = screen.getByRole('button', {
      name: /点击上传教务系统截图/,
    });
    uploadButton.focus();
    expect(uploadButton).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  test('键盘 Space 可以触发文件选择器', async () => {
    const user = userEvent.setup();
    const onCoursesParsed = vi.fn();

    const { container } = renderWithLanguage(
      <OcrScanner onCoursesParsed={onCoursesParsed} />
    );

    const input = getFileInput(container);
    const clickSpy = vi.spyOn(input, 'click');

    const uploadButton = screen.getByRole('button', {
      name: /点击上传教务系统截图/,
    });
    uploadButton.focus();

    await user.keyboard(' ');

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  test('OCR 进行中时上传区被真正禁用，无法再次触发', async () => {
    let resolveRecognize: (value: unknown) => void = () => {};
    recognize.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveRecognize = resolve;
        })
    );

    const onCoursesParsed = vi.fn();
    const file = new File(['image'], 'transcript.png', { type: 'image/png' });

    const { container } = renderWithLanguage(
      <OcrScanner onCoursesParsed={onCoursesParsed} />
    );
    const input = getFileInput(container);
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.change(input, { target: { files: [file] } });

    const scanningButton = await screen.findByRole('button', {
      name: /正在扫描/,
    });

    expect(scanningButton).toBeDisabled();
    expect(input).toBeDisabled();

    // 禁用后即便强行点击也不应再打开文件选择器
    fireEvent.click(scanningButton);
    expect(clickSpy).not.toHaveBeenCalled();

    resolveRecognize({ data: { text: '' } });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /点击上传教务系统截图/ })
      ).toBeEnabled();
    });
  });
});
