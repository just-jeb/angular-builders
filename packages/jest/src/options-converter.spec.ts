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

  describe('findRelatedTests', () => {
    it('Should emit a single file as a positional after the flag', () => {
      const argv = optionsConverter.convertToCliArgs({ findRelatedTests: ['file1.ts'] } as any);
      expect(argv).toEqual(['--findRelatedTests', 'file1.ts']);
    });

    it('Should split comma-separated values into multiple positionals', () => {
      const argv = optionsConverter.convertToCliArgs({
        findRelatedTests: ['file1.ts,file2.ts'],
      } as any);
      expect(argv).toEqual(['--findRelatedTests', 'file1.ts', 'file2.ts']);
    });

    it('Should handle an array of separate flag occurrences', () => {
      const argv = optionsConverter.convertToCliArgs({
        findRelatedTests: ['file1.ts', 'file2.ts'],
      } as any);
      expect(argv).toEqual(['--findRelatedTests', 'file1.ts', 'file2.ts']);
    });

    it('Should accept a single string value (with or without commas)', () => {
      expect(
        optionsConverter.convertToCliArgs({ findRelatedTests: 'file1.ts,file2.ts' } as any)
      ).toEqual(['--findRelatedTests', 'file1.ts', 'file2.ts']);
      expect(optionsConverter.convertToCliArgs({ findRelatedTests: 'file1.ts' } as any)).toEqual([
        '--findRelatedTests',
        'file1.ts',
      ]);
    });

    it('Should place positional file args after other flags', () => {
      const argv = optionsConverter.convertToCliArgs({
        findRelatedTests: ['a.ts,b.ts'],
        noCache: true,
      } as any);
      expect(argv).toEqual(['--findRelatedTests', '--noCache', 'a.ts', 'b.ts']);
    });

    it('Should drop empty path tokens from doubled commas', () => {
      const argv = optionsConverter.convertToCliArgs({
        findRelatedTests: ['a.ts,,b.ts'],
      } as any);
      expect(argv).toEqual(['--findRelatedTests', 'a.ts', 'b.ts']);
    });
  });
});
