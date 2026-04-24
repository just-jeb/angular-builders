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

  it('Should convert findRelatedTests into a boolean flag followed by positional file args', () => {
    const argv = optionsConverter.convertToCliArgs({
      findRelatedTests: ['src/app/foo.ts', 'src/app/bar.ts'],
    } as any);
    expect(argv).toEqual(['--findRelatedTests', 'src/app/foo.ts', 'src/app/bar.ts']);
  });

  it('Should correctly place findRelatedTests positional args after other flags', () => {
    const argv = optionsConverter.convertToCliArgs({
      watch: true,
      findRelatedTests: ['src/app/foo.ts'],
      coverage: false,
    } as any);
    expect(argv).toContain('--watch');
    expect(argv).toContain('--findRelatedTests');
    // Positional arg must come after --findRelatedTests flag, at the end
    const frtIdx = argv.indexOf('--findRelatedTests');
    const fileIdx = argv.indexOf('src/app/foo.ts');
    expect(fileIdx).toBeGreaterThan(frtIdx);
    expect(argv[argv.length - 1]).toBe('src/app/foo.ts');
  });
});
