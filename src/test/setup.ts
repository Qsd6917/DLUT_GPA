import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (global as any).vi.fn().mockImplementation((query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: (global as any).vi.fn(), // Deprecated
    removeListener: (global as any).vi.fn(), // Deprecated
    addEventListener: (global as any).vi.fn(),
    removeEventListener: (global as any).vi.fn(),
    dispatchEvent: (global as any).vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserver {
  observe = (global as any).vi.fn();
  unobserve = (global as any).vi.fn();
  disconnect = (global as any).vi.fn();
}

(global as any).ResizeObserver = ResizeObserver;

// Mock canvas context
HTMLCanvasElement.prototype.getContext = (global as any).vi.fn();
