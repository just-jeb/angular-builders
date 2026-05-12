/**
 * Utilities for version comparison and detection.
 */

export interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
}

/**
 * Parses a semantic version string into components.
 */
export function parseVersion(versionString: string): VersionInfo {
  // Remove 'v' prefix if present
  const cleaned = versionString.replace(/^v/, '');
  
  // Match major.minor.patch[-prerelease]
  const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?/);
  if (!match) {
    throw new Error(`Invalid version string: ${versionString}`);
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
  };
}

/**
 * Formats a VersionInfo back to a string.
 */
export function formatVersion(info: VersionInfo): string {
  const base = `${info.major}.${info.minor}.${info.patch}`;
  return info.prerelease ? `${base}-${info.prerelease}` : base;
}

/**
 * Checks if a version is >= another version.
 */
export function isVersionGreaterOrEqual(
  version: VersionInfo,
  minimum: VersionInfo
): boolean {
  if (version.major !== minimum.major) {
    return version.major > minimum.major;
  }
  if (version.minor !== minimum.minor) {
    return version.minor > minimum.minor;
  }
  if (version.patch !== minimum.patch) {
    return version.patch > minimum.patch;
  }
  // If patch versions are equal, prerelease versions are less than release versions
  if (!version.prerelease && minimum.prerelease) {
    return true;
  }
  return false;
}

/**
 * Gets the major version for a workspace dependency (e.g., "17.0.0" -> 17).
 */
export function getMajorVersion(packageName: string, dependencyVersion: string): number {
  return parseVersion(dependencyVersion).major;
}
