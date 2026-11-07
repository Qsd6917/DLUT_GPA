import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { StorageBlockedBanner } from '../StorageBlockedBanner';

describe('StorageBlockedBanner', () => {
  test('renders nothing when storage works', () => {
    const { container } = render(
      <StorageBlockedBanner visible={false} language="zh" />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('warns that changes will be lost and tells the user to export a backup', () => {
    render(<StorageBlockedBanner visible={true} language="zh" />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    // 必须让用户知道「会丢」，并给出可操作的补救
    expect(alert).toHaveTextContent('不会被保存');
    expect(alert).toHaveTextContent('导出 JSON 备份');
  });

  test('renders the English copy when language is en', () => {
    render(<StorageBlockedBanner visible={true} language="en" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('will be lost');
    expect(alert).toHaveTextContent('Export a JSON backup');
  });
});
