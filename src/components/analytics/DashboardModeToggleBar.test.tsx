import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardModeToggleBar } from './DashboardModeToggleBar';

vi.mock('../../contexts/LanguageContext', () => ({
  useTranslation: () => ({
    language: 'en',
    t: (key: string) => key,
  }),
}));

describe('DashboardModeToggleBar accessibility', () => {
  it('implements roving tab semantics and keyboard navigation', () => {
    const onChange = vi.fn();
    render(<DashboardModeToggleBar activeView="overview" onChange={onChange} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');
    expect(tabs[0]).toHaveAttribute('aria-controls', 'analysis-panel-overview');
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('experiment');
    fireEvent.keyDown(tabs[0], { key: 'End' });
    expect(onChange).toHaveBeenCalledWith('advisor');
  });

  it('uses the localized translation key for the tablist label', () => {
    render(<DashboardModeToggleBar activeView="overview" onChange={vi.fn()} />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'analysis_views');
    expect(screen.getByText('analysis_overview_sublabel')).toBeInTheDocument();
    expect(screen.getByText('analysis_experiment_sublabel')).toBeInTheDocument();
  });

  it('keeps tabs in a single horizontal scroller on mobile and four columns on desktop', () => {
    render(<DashboardModeToggleBar activeView="overview" onChange={vi.fn()} />);
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveClass('flex', 'min-w-max', 'overflow-x-auto');
    const tabs = screen.getAllByRole('tab');
    tabs.forEach(tab => expect(tab).toHaveClass('min-w-[11rem]'));
    expect(tablist).toHaveClass('md:grid', 'xl:grid-cols-4');
  });
});
