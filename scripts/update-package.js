const { execSync } = require('child_process');
const package = require(`${process.cwd()}/package.json`);
const version = Number.parseInt(process.argv.slice(2));

const isStable = {
  '@angular-devkit/build-angular': true,
  '@angular-devkit/core': true,
  '@angular-devkit/architect': false,
  '@angular/compiler': true,
  '@angular/compiler-cli': true,
};

const determineVersions = deps => {
  let newDeps = [];
  for (const [name, stable] of Object.entries(isStable)) {
    if (deps[name]) {
      let versionRange = stable ? `^${version}.0.0` : `'>=0.${version}00.0 < 0.${version + 1}00.0'`;
      console.log(`Found dependency ${name}, new version range is ${versionRange}`);
      newDeps.push(`${name}@${versionRange}`);
    }
  }

  return newDeps;
};

const runUpdate = (newDeps, dev) => {
  console.log(`Executing 'yarn add ${dev ? '-D' : ''}'`);
  const command = `yarn add ${dev ? '-D' : ''} ${newDeps.join(' ')}`;
  execSync(command);
};

const updatePackage = () => {
  console.log(`Updating package ${package.name}`);
  let updated = false;
  for (const deps of [package.dependencies, package.devDependencies]) {
    const newDeps = determineVersions(deps);
    if (newDeps.length > 0) {
      runUpdate(newDeps, deps === package.devDependencies);
      updated = true;
    }
  }
  if (updated) {
    console.log(`Successfully updated ${package.name}`);
  } else {
    console.log(`No dependencies to update`);
  }
};

updatePackage();
