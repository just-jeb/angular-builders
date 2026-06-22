export interface SemverParts {
  major: number;
  minor: number;
  patch: number;
}

export function parseVersion(version: string): SemverParts {
  const cleaned = version.trim().replace(/^[\^~>=v\s]+/, '');
  const [core] = cleaned.split('-');
  const [major = 0, minor = 0, patch = 0] = core.split('.').map(n => parseInt(n, 10) || 0);
  return { major, minor, patch };
}

export function isAtLeast(version: string, major: number): boolean {
  return parseVersion(version).major >= major;
}
