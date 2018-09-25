import {OptionsConverter} from "./options-converter";

describe("Convert options to Jest CLI arguments", () => {
  it("Should convert options with value TRUE to no value argument", () => {
    const argv = OptionsConverter.convertToCliArgs({trueOption: true});
    expect(argv).toContain("--trueOption");
  });

  it("Should convert options with string value argument-name=argument-value form", () => {
    const argv = OptionsConverter.convertToCliArgs({stringOption: 'somestring'});
    expect(argv).toContain("--stringOption=somestring");
  });

  it("Should handle string options with whitespaces", () => {
    const argv = OptionsConverter.convertToCliArgs({stringOption: 'some string'});
    expect(argv).toContain('--stringOption="some string"');
  });

  it("Should properly handle string options with whitespaces that are enclosed with quotes", () => {
    const argv = OptionsConverter.convertToCliArgs({stringOption: '"some string"'});
    expect(argv).toContain('--stringOption="some string"');
  });

  it("Should handle different arguments types provided in single object", () => {
    const argv = OptionsConverter.convertToCliArgs({stringOption: 'some string', booleanOption: true});
    expect(argv).toEqual(['--stringOption="some string"', "--booleanOption"]);
  });
});