Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {};
  },
});
