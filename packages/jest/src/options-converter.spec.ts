import {OptionsConverter} from "./options-converter";

describe("Convert options to Jest CLI arguments", () => {

  const optionsConverter = new OptionsConverter();

  it("Should convert options with value TRUE to no value argument", () => {
    const argv = optionsConverter.convertToCliArgs({trueOption: true});
    expect(argv).toContain("--trueOption");
  });

  it("Should convert options with string value argument-name=argument-value form", () => {
    const argv = optionsConverter.convertToCliArgs({stringOption: 'somestring'});
    expect(argv).toContain("--stringOption=somestring");
  });

  it("Should handle different arguments types provided in single object", () => {
    const argv = optionsConverter.convertToCliArgs({stringOption: 'some string', booleanOption: true});
    expect(argv).toEqual(['--stringOption=some string', "--booleanOption"]);
  });

  it("Should convert array options into multiple arguments", () => {
    const argv = optionsConverter.convertToCliArgs({arrayOption: ['1', '2']});
    expect(argv).toEqual(['--arrayOption=1', "--arrayOption=2"])
  })
});