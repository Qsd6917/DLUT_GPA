import '@testing-library/jest-dom';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(String(key)) ?? null; }
  key(index: number) { return Array.from(this.data.keys())[index] ?? null; }
  removeItem(key: string) { this.data.delete(String(key)); }
  setItem(key: string, value: string) { this.data.set(String(key), String(value)); }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
});
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: globalThis.localStorage,
});

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

Object.defineProperties(HTMLElement.prototype, {
  clientWidth: {
    configurable: true,
    get() {
      return 800;
    },
  },
  clientHeight: {
    configurable: true,
    get() {
      return 400;
    },
  },
  offsetWidth: {
    configurable: true,
    get() {
      return 800;
    },
  },
  offsetHeight: {
    configurable: true,
    get() {
      return 400;
    },
  },
});

HTMLElement.prototype.getBoundingClientRect = function () {
  return {
    x: 0,
    y: 0,
    width: 800,
    height: 400,
    top: 0,
    right: 800,
    bottom: 400,
    left: 0,
    toJSON: () => {},
  };
};

// Mock canvas context
HTMLCanvasElement.prototype.getContext = (global as any).vi.fn();
