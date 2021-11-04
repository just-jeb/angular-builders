const { execSync } = require('child_process');
const package = require(`${process.cwd()}/package.json`);
const version = Number.parseInt(process.argv.slice(2));

const updateAngularVersion = () => {
  execSync(`npx @angular/cli@${version} update @angular/core@${version} @angular/cli@${version}`);
  execSync(`git commit -am 'chore(deps): update ${package.name} to Angular ${version}'`);
};

updateAngularVersion();
