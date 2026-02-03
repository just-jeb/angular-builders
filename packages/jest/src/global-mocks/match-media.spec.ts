/**
 * Tests for the matchMedia mock with resetMocks behavior
 *
 * This test verifies the fix for issue #1983:
 * https://github.com/just-jeb/angular-builders/issues/1983
 *
 * When using resetMocks: true, jest.fn().mockImplementation() gets cleared
 * before each test, causing matchMedia to return undefined. The fix uses
 * a regular function instead, which survives resetMocks.
 *
 * @jest-environment jsdom
 */

// Import the matchMedia mock setup
import './match-media';

describe('matchMedia mock survives jest.resetAllMocks()', () => {
  beforeEach(() => {
    // Simulate what Jest's resetMocks: true does before each test
    jest.resetAllMocks();
  });

  it('should return a valid MediaQueryList object', () => {
    const mql = window.matchMedia('(min-width: 768px)');

    expect(mql).toBeDefined();
    expect(mql.matches).toBe(false);
    expect(mql.media).toBe('(min-width: 768px)');
    expect(typeof mql.addEventListener).toBe('function');
    expect(typeof mql.removeEventListener).toBe('function');
  });

  it('should still return valid object after resetAllMocks runs', () => {
    // This test runs after jest.resetAllMocks() clears all mocks
    // Before the fix, matchMedia() would return undefined here
    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    expect(mql).toBeDefined();
    expect(mql.matches).toBe(false);
    expect(mql.media).toBe('(prefers-color-scheme: dark)');
  });

  it('should work in third consecutive test', () => {
    const mql = window.matchMedia('screen');

    expect(mql).toBeDefined();
    expect(mql.matches).toBe(false);
  });

  it('should have callable mock methods on returned object', () => {
    const mql = window.matchMedia('test');
    const callback = jest.fn();

    // The inner methods should still be jest mocks
    mql.addEventListener('change', callback);
    expect(mql.addEventListener).toHaveBeenCalledWith('change', callback);
  });
});
