import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider, useTranslation } from '../LanguageContext';

const CopyProbe = () => {
  const { t } = useTranslation();
  return <output>{[t('overview_current_gpa'), t('experiment_draft_removed'), t('experiment_restore_hint'), t('score_points'), t('analysis_data_label')].join('|')}</output>;
};

describe('experiment copy', () => {
  test('exposes localized copy for touched experiment and overview surfaces', () => {
    render(
      <LanguageProvider>
        <CopyProbe />
      </LanguageProvider>
    );

    expect(screen.getByText('当前 GPA|已从草稿删除|恢复后将按原课程顺序插回实验草稿。|分|学业数据分析')).toBeInTheDocument();
  });
});
