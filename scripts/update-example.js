const { execSync } = require('child_process');
const package = require(`${process.cwd()}/package.json`);
const version = Number.parseInt(process.argv.slice(2));

const updateAngularVersion = () => {
  console.log(`Updating Angular version for ${package.name}`);
  execSync(`ng update @angular/core@${version} @angular/cli@${version}`);
  console.log(`Successfully updated ${package.name} to Angular ${version}`);
  console.log('Committing the changes');
  execSync(`git commit -am 'chore(deps): update ${package.name} to Angular ${version}'`);
  console.log('Successfully committed the changes');
};

updateAngularVersion();
