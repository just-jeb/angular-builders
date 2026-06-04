import { parseVersion, isAtLeast } from './version';

describe('parseVersion', () => {
  it('parses a plain semver', () => {
    expect(parseVersion('21.2.13')).toEqual({ major: 21, minor: 2, patch: 13 });
  });
  it('parses a prerelease, ignoring the tag', () => {
    expect(parseVersion('22.0.0-rc.2')).toEqual({ major: 22, minor: 0, patch: 0 });
  });
  it('strips a leading range operator', () => {
    expect(parseVersion('^20.1.0')).toEqual({ major: 20, minor: 1, patch: 0 });
  });
});

describe('isAtLeast', () => {
  it('is true at and above the major', () => {
    expect(isAtLeast('22.0.0-rc.2', 22)).toBe(true);
    expect(isAtLeast('23.1.0', 22)).toBe(true);
  });
  it('is false below the major', () => {
    expect(isAtLeast('21.2.13', 22)).toBe(false);
  });
});
