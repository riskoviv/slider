window.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback;

  observe = jest.fn();

  unobserve = jest.fn();

  disconnect = jest.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
};
