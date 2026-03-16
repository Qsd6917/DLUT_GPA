import { beforeEach, describe, expect, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

const ThemeProbe = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <span>{theme}</span>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
    </>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  test('defaults to dark when no saved theme exists', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('toggles between dark and light only', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByText('light')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('light')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
