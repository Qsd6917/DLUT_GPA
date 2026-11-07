import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LanguageProvider, useTranslation } from '../LanguageContext';
import { renderWithProviders } from '../../test/renderWithProviders';

const CORE_KEYS = [
  'app_title',
  'total_gpa',
  'compulsory_gpa',
  'avg_score',
] as const;

// 对应源码 zh 词典第 42-53 行（OCR 与成绩展示文案）。
const OCR_KEYS = [
  'ocr_upload_prompt',
  'ocr_supported_formats',
  'upload_image',
  'ocr_scanning',
  'ocr_no_courses_found',
  'ocr_error_occurred',
  'ocr_instruction_line1',
  'ocr_instruction_line2',
  'credits',
  'current_score',
  'show_radar',
  'hide_radar',
] as const;

// 对应源码 zh 词典第 60-65 行（课程分类与雷达图空态文案）。
const CATEGORY_KEYS = [
  'category_math',
  'category_english',
  'category_major',
  'category_general',
  'category_sports',
  'category_other',
  'scores',
  'no_data_for_radar',
  'no_data',
] as const;

const ZH_CORE = 'DLUT-GPA|总 GPA|必修 GPA|加权平均分';
const EN_CORE = 'DLUT-GPA|Total GPA|Compulsory GPA|Weighted Avg';

const ZH_OCR = [
  '点击上传教务系统截图',
  '支持 JPG、PNG、WEBP 格式',
  '上传图片',
  '正在扫描',
  '未在图片中找到课程信息，请检查截图是否包含成绩单',
  'OCR 识别过程中发生错误，请稍后重试',
  '1. 截取包含课程信息的教务系统页面',
  '2. 确保截图包含课程名称、学分和成绩',
  '学分',
  '当前分数',
  '显示雷达图',
  '隐藏雷达图',
].join('|');

const EN_OCR = [
  'Click to upload academic record screenshot',
  'Supports JPG, PNG, WEBP formats',
  'Upload Image',
  'Scanning',
  'No course information found in the image, please check if the screenshot contains transcript',
  'An error occurred during OCR recognition, please try again later',
  '1. Screenshot the academic record page from academic system',
  '2. Ensure the screenshot includes course name, credits, and grades',
  'Credits',
  'Current Score',
  'Show Radar',
  'Hide Radar',
].join('|');

const ZH_CATEGORY =
  '数学类|英语类|专业核心|通识教育|体育类|其他|分数|暂无数据绘制雷达图|暂无数据';
const EN_CATEGORY =
  'Math|English|Major Core|General Ed|Sports|Other|Scores|No data to draw radar chart|No Data';

const CopyProbe = ({
  label,
  keys,
}: {
  label: string;
  keys: readonly string[];
}) => {
  const { t } = useTranslation();
  return (
    <output aria-label={label}>{keys.map(key => t(key)).join('|')}</output>
  );
};

const LanguageProbe = () => {
  const { language, setLanguage } = useTranslation();
  return (
    <div>
      <output aria-label="current language">{language}</output>
      <button type="button" onClick={() => setLanguage('en')}>
        use english
      </button>
      <button type="button" onClick={() => setLanguage('zh')}>
        use chinese
      </button>
      <CopyProbe label="core copy" keys={CORE_KEYS} />
      <CopyProbe label="ocr copy" keys={OCR_KEYS} />
      <CopyProbe label="category copy" keys={CATEGORY_KEYS} />
    </div>
  );
};

const ArgumentProbe = () => {
  const { t } = useTranslation();
  return (
    <output aria-label="argument copy">
      {[
        t('based_on_credits', 3),
        t('course_score_line', '数学', 90),
        t('app_title', 'ignored'),
        t('missing_key_for_test'),
      ].join('|')}
    </output>
  );
};

const readCopy = (label: string) =>
  screen.getByLabelText(label).textContent ?? '';

const renderProbe = (ui: React.ReactElement) =>
  render(<LanguageProvider>{ui}</LanguageProvider>);

describe('LanguageProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to Chinese and switches to English and back', () => {
    renderProbe(<LanguageProbe />);

    expect(readCopy('current language')).toBe('zh');
    expect(readCopy('core copy')).toBe(ZH_CORE);
    expect(readCopy('ocr copy')).toBe(ZH_OCR);
    expect(readCopy('category copy')).toBe(ZH_CATEGORY);

    fireEvent.click(screen.getByRole('button', { name: 'use english' }));

    expect(readCopy('current language')).toBe('en');
    expect(readCopy('core copy')).toBe(EN_CORE);
    expect(readCopy('ocr copy')).toBe(EN_OCR);
    expect(readCopy('category copy')).toBe(EN_CATEGORY);

    fireEvent.click(screen.getByRole('button', { name: 'use chinese' }));

    expect(readCopy('current language')).toBe('zh');
    expect(readCopy('core copy')).toBe(ZH_CORE);
  });

  test('substitutes positional arguments and keeps unknown keys intact', () => {
    renderProbe(<ArgumentProbe />);

    expect(readCopy('argument copy')).toBe(
      '基于 3 学分|数学：90 分|DLUT-GPA|missing_key_for_test'
    );
  });

  test('substitutes positional arguments in English copy too', async () => {
    renderWithProviders(<ArgumentProbe />, { initialLanguage: 'en' });

    await waitFor(() =>
      expect(readCopy('argument copy')).toBe(
        'Based on 3 credits|数学: 90 points|DLUT-GPA|missing_key_for_test'
      )
    );
  });

  test('honours the initialLanguage override from renderWithProviders', async () => {
    renderWithProviders(<LanguageProbe />, { initialLanguage: 'en' });

    await waitFor(() => expect(readCopy('current language')).toBe('en'));
    expect(readCopy('core copy')).toBe(EN_CORE);
    expect(readCopy('ocr copy')).toBe(EN_OCR);
  });

  test('falls back to Chinese when the stored language value is invalid', () => {
    localStorage.setItem('dlut_gpa_language', 'fr');

    renderProbe(<LanguageProbe />);

    expect(readCopy('current language')).toBe('zh');
  });

  test('starts from Chinese even when storage holds a stale English value', () => {
    // 源码里 LanguageProvider 只把 language 放在 React state，没有任何
    // localStorage 读写；新挂载一律回退到中文默认值。若将来补上持久化，
    // 本用例需改为断言 'en'。
    localStorage.setItem('dlut_gpa_language', 'en');

    renderProbe(<LanguageProbe />);

    expect(readCopy('current language')).toBe('zh');
    expect(readCopy('core copy')).toBe(ZH_CORE);
  });

  test('throws when the hook is used outside a provider', () => {
    const Orphan = () => {
      useTranslation();
      return null;
    };

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      expect(() => render(<Orphan />)).toThrow(
        'useTranslation must be used within a LanguageProvider'
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
