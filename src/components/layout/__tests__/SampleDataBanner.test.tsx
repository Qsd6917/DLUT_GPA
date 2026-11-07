import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { SampleDataBanner } from '../SampleDataBanner';

describe('SampleDataBanner', () => {
  test('renders nothing when not in sample state', () => {
    const { container } = render(
      <SampleDataBanner visible={false} language="zh" onDismiss={() => {}} />
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('states plainly that the data is not the user’s own grades', () => {
    render(
      <SampleDataBanner visible={true} language="zh" onDismiss={() => {}} />
    );

    const banner = screen.getByRole('status');
    expect(banner).toBeInTheDocument();
    // 关键断言：必须明确说明「不是你的成绩」，否则用户会误认
    expect(banner).toHaveTextContent('内置示例数据');
    expect(banner).toHaveTextContent('不是你的成绩');
  });

  test('renders the English copy when language is en', () => {
    render(
      <SampleDataBanner visible={true} language="en" onDismiss={() => {}} />
    );

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('built-in sample data');
    expect(banner).toHaveTextContent('not your own grades');
  });

  test('calls onDismiss when the acknowledge button is clicked', () => {
    const onDismiss = vi.fn();
    render(
      <SampleDataBanner visible={true} language="zh" onDismiss={onDismiss} />
    );

    fireEvent.click(screen.getByRole('button', { name: '知道了' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('uses an English button label in English mode', () => {
    const onDismiss = vi.fn();
    render(
      <SampleDataBanner visible={true} language="en" onDismiss={onDismiss} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
