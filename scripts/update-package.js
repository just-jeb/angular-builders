const { writeFileSync, readFileSync } = require('fs');
const path = require('path');
const package = require(`${process.cwd()}/package.json`);

// Accepts either an integer major (e.g. `22`) or an explicit version string
// (e.g. `22.0.0-rc.2`). The explicit form is required for RC/prerelease prework
// because a bare `^22.0.0` range excludes prereleases like `22.0.0-rc.2` by semver.
const rawArg = process.argv.slice(2)[0];

const parseTarget = arg => {
  if (arg === undefined || arg === '') {
    throw new Error(
      'No version argument provided. Pass a major (e.g. 22) or explicit version (e.g. 22.0.0-rc.2).'
    );
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
  '@schematics/angular': true,
  '@angular-devkit/schematics': true,
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

// The root package.json pins `@angular-devkit/architect` and `@angular-devkit/core`
// via `resolutions` (added in PR #2307). The builders declare a wide architect range
// (`>=0.{major}00.0 < 0.{major+1}00.0`); without these pins, that range re-resolves to
// an older architect than the one `@angular/build` pins for a given patch train,
// duplicating architect and producing two `BuilderContext`/`Logger` type identities
// that break the `custom-esbuild` tsc build. The pins must track the *exact* Angular
// version, so they only apply when an explicit version (with minor/patch) is given.
//
// `@angular-devkit/core` uses the plain Angular version (e.g. `22.1.0`). `architect`
// uses the `0.{major}{minor padded to 2}.{patch}` scheme (`22.1.0` -> `0.2201.0`,
// `22.0.3` -> `0.2200.3`), carrying any prerelease tag (`22.0.0-rc.2` -> `0.2200.0-rc.2`).
const architectVersion = version => {
  const [base, ...preParts] = version.split('-');
  const pre = preParts.length ? `-${preParts.join('-')}` : '';
  const [maj, min = '0', patch = '0'] = base.split('.');
  return `0.${maj}${String(min).padStart(2, '0')}.${patch}${pre}`;
};

const updateRootResolutions = () => {
  if (!explicit) {
    console.log(
      'No explicit version (with minor/patch) given; leaving root resolutions untouched. ' +
        'Pass a full version (e.g. 22.1.0) to keep @angular-devkit pins in sync.'
    );
    return;
  }

  const rootPackagePath = path.join(__dirname, '..', 'package.json');
  const rootPackage = JSON.parse(readFileSync(rootPackagePath, 'utf8'));
  if (!rootPackage.resolutions) return;

  const pins = {
    '@angular-devkit/core': explicit,
    '@angular-devkit/architect': architectVersion(explicit),
  };

  let changed = false;
  for (const [name, version] of Object.entries(pins)) {
    if (name in rootPackage.resolutions && rootPackage.resolutions[name] !== version) {
      console.log(
        `Updating root resolution ${name}: ${rootPackage.resolutions[name]} -> ${version}`
      );
      rootPackage.resolutions[name] = version;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2) + '\n');
    console.log('Successfully updated root resolutions');
  }
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
  updateRootResolutions();
};

updatePackage();
