// Use a regular function instead of jest.fn().mockImplementation() to survive
// Jest's resetMocks option, which removes mock implementations before each test.
// See: https://github.com/just-jeb/angular-builders/issues/1983
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});
