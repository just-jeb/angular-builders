// Test file with top-level await
// This reproduces issue #1918: Jest builder fails with top-level await

const asyncOperation = async () => {
  return Promise.resolve('data');
};

// Top-level await - should work in ESM + Jest with experimentalVmModules
const result = await asyncOperation();

describe('Top-level await support', () => {
  it('should support top-level await at module level', () => {
    expect(result).toBe('data');
  });

  it('should allow await in async functions', async () => {
    const value = await asyncOperation();
    expect(value).toBe('data');
  });
});
