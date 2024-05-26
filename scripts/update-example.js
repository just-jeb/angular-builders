const { execSync } = require('child_process');
const package = require(`${process.cwd()}/package.json`);
const version = Number.parseInt(process.argv.slice(2));

const runNgUpdate = () => {
  console.log(`Updating Angular version for ${package.name}`);
  try {
    execSync(
      `ng update @angular/core@${version} @angular/cli@${version} --create-commits --allow-dirty --verbose`,
      {
        cwd: process.cwd(),
        stdio: 'inherit',
      }
    );
    console.log(`Successfully updated ${package.name} to Angular ${version}`);
  } catch (error) {
    console.log(
      `Failed to update ${package.name} to Angular ${version}: ${error.message}\n${error.stack}`
    );
  }

  // console.log('Committing the changes');
  // execSync(`git commit -am 'chore(deps): update ${package.name} to Angular ${version}'`);
  // console.log('Successfully committed the changes');
};

const updateNonAngularApp = () => {
  console.log(`Updating non Angular app ${package.name}`);
  execSync(`yarn add -D @angular/cli@^${version}.0.0`, {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
  console.log(`Successfully updated ${package.name} to Angular CLI ${version}`);
  console.log('Committing the changes');
  execSync(`git commit -am 'chore(deps): update ${package.name} to Angular CLI ${version}'`);
  console.log('Successfully committed the changes');
};

const updateExample = () => {
  console.log('Current working directory:', process.cwd());
  if (package.name === 'bazel-example') {
    updateNonAngularApp();
  } else {
    runNgUpdate();
  }
};

updateExample();
