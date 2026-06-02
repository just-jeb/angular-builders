const { writeFileSync } = require('fs');
const package = require(`${process.cwd()}/package.json`);

// Accepts either an integer major (e.g. `22`) or an explicit version string
// (e.g. `22.0.0-rc.2`). The explicit form is required for RC/prerelease prework
// because a bare `^22.0.0` range excludes prereleases like `22.0.0-rc.2` by semver.
const rawArg = process.argv.slice(2)[0];

const parseTarget = arg => {
  if (arg === undefined || arg === '') {
    throw new Error('No version argument provided. Pass a major (e.g. 22) or explicit version (e.g. 22.0.0-rc.2).');
  }
  const major = Number.parseInt(arg, 10);
  if (Number.isNaN(major)) {
    throw new Error(`Invalid version argument "${arg}".`);
  }
  // An explicit version string carries a minor/patch and/or a prerelease tag.
  const explicit = /\d+\.\d+/.test(arg) || arg.includes('-') ? arg : null;
  return { major, explicit, isPrerelease: arg.includes('-') };
};

const { major, explicit, isPrerelease } = parseTarget(rawArg);

const isStable = {
  '@angular-devkit/build-angular': true,
  '@angular-devkit/core': true,
  '@angular-devkit/architect': false,
  '@angular/compiler': true,
  '@angular/compiler-cli': true,
  '@angular/build': true,
  '@angular/core': true,
  '@angular/platform-browser-dynamic': true,
};

const stableRange = () => (explicit ? `^${explicit}` : `^${major}.0.0`);

// @angular-devkit/architect uses the 0.{major}00.0 scheme. For prereleases we
// must carry the prerelease tag onto the lower bound, otherwise the range
// excludes the prerelease (e.g. >=0.2200.0-rc.2 < 0.2300.0).
const architectRange = () => {
  if (explicit && isPrerelease) {
    const pre = explicit.slice(explicit.indexOf('-')); // e.g. "-rc.2"
    return `>=0.${major}00.0${pre} < 0.${major + 1}00.0`;
  }
  return `>=0.${major}00.0 < 0.${major + 1}00.0`;
};

const determineVersions = deps => {
  let newDeps = [];
  for (const [name, stable] of Object.entries(isStable)) {
    if (deps[name]) {
      let versionRange = stable ? stableRange() : architectRange();
      console.log(`Found dependency ${name}, new version range is ${versionRange}`);
      newDeps.push({ name, versionRange });
    }
  }

  return newDeps;
};

const runUpdate = (newDeps, deps) => {
  for (newDep of newDeps) {
    deps[newDep.name] = newDep.versionRange;
  }
};

const updatePackage = () => {
  console.log(`Updating package ${package.name} to Angular ${explicit || major}`);
  let updated = false;
  for (const deps of [package.dependencies, package.devDependencies, package.peerDependencies]) {
    if (!deps) continue;
    const newDeps = determineVersions(deps);
    if (newDeps.length > 0) {
      runUpdate(newDeps, deps);
      updated = true;
    }
  }
  writeFileSync(`${process.cwd()}/package.json`, JSON.stringify(package, null, 2));
  if (updated) {
    console.log(`Successfully updated ${package.name}`);
  } else {
    console.log(`No dependencies to update`);
  }
};

updatePackage();
