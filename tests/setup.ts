import '@testing-library/jest-dom'

// Ant Design components (e.g. Segmented) use ResizeObserver internally.
// jsdom does not implement it, so we provide a no-op stub.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
