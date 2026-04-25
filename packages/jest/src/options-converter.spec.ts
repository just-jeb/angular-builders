import { OptionsConverter } from './options-converter';

describe('Convert options to Jest CLI arguments', () => {
  const optionsConverter = new OptionsConverter();

  it('Should convert options with value TRUE to no value argument', () => {
    const argv = optionsConverter.convertToCliArgs({ trueOption: true } as any);
    expect(argv).toContain('--trueOption');
  });

  it('Should convert options with string value argument-name=argument-value form', () => {
    const argv = optionsConverter.convertToCliArgs({ stringOption: 'somestring' } as any);
    expect(argv).toContain('--stringOption=somestring');
  });

  it('Should handle different arguments types provided in single object', () => {
    const argv = optionsConverter.convertToCliArgs({
      stringOption: 'some string',
      booleanOption: true,
      numericalOption: 10,
    } as any);
    expect(argv).toEqual(['--stringOption=some string', '--booleanOption', '--numericalOption=10']);
  });

  it('Should convert array options into multiple arguments', () => {
    const argv = optionsConverter.convertToCliArgs({ arrayOption: ['1', '2'] } as any);
    expect(argv).toEqual(['--arrayOption', '1', '--arrayOption', '2']);
  });

  it('Should convert additionalProperties into a separate arg entry', () => {
    const argv = optionsConverter.convertToCliArgs({ '--': ['non-flag-1', 'non-flag-2'] } as any);
    expect(argv).toEqual(['non-flag-1 non-flag-2']);
  });

  // --- findRelatedTests regression tests ---
  // Jest treats --findRelatedTests as a boolean flag; source files are positional
  // args (yargs `_`). Emitting --findRelatedTests file1 --findRelatedTests file2
  // causes Jest to see no source files and run ALL tests instead of filtering.
  describe('findRelatedTests', () => {
    it('should emit --findRelatedTests once and files as trailing positionals (array input)', () => {
      const argv = optionsConverter.convertToCliArgs({
        findRelatedTests: ['src/foo.spec.ts', 'src/bar.spec.ts'],
      } as any);
      // Expected: ['--findRelatedTests', 'src/foo.spec.ts', 'src/bar.spec.ts']
      expect(argv).toEqual(['--findRelatedTests', 'src/foo.spec.ts', 'src/bar.spec.ts']);
    });

    it('should handle comma-separated paths in a single array element (Angular CLI inline style)', () => {
      // Angular CLI delivers --find-related-tests=a.ts,b.ts as ['a.ts,b.ts'] (single element)
      const argv = optionsConverter.convertToCliArgs({
        findRelatedTests: ['src/foo.spec.ts,src/bar.spec.ts'],
      } as any);
      expect(argv).toEqual(['--findRelatedTests', 'src/foo.spec.ts', 'src/bar.spec.ts']);
    });

    it('should handle a single file path', () => {
      const argv = optionsConverter.convertToCliArgs({
        findRelatedTests: ['src/foo.spec.ts'],
      } as any);
      expect(argv).toEqual(['--findRelatedTests', 'src/foo.spec.ts']);
    });
  });
});
