import {stringify} from "./json-stringifier";

describe('Test JSON stringification', () => {
  it('Should handle cyclic structures', () => {
    let circularReference = {otherData: 2, myself: {}};
    circularReference.myself = circularReference;
    const circularStringified = `{\n  otherData: 2,\n  myself: [Circular]\n}`;

    const res = stringify(circularReference);
    expect(res).toEqual(circularStringified)
  })
});