const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const package = require(`${process.cwd()}/package.json`);

// Accepts either an integer major (e.g. `22`), an explicit version
// (e.g. `22.0.0-rc.2`), or a dist-tag (e.g. `next`). The explicit/tag form is
// required for RC prework: `@angular/cli@22` resolves to the latest *stable* 22
// (nonexistent during RC), whereas `next`/`22.0.0-rc.2` resolve to the RC.
const rawArg = process.argv.slice(2)[0];

const parseTarget = arg => {
  if (arg === undefined || arg === '') {
    throw new Error(
      'No version argument provided. Pass a major (e.g. 22), an explicit version (e.g. 22.0.0-rc.2), or a dist-tag (e.g. next).'
    );
  }
  const major = Number.parseInt(arg, 10);
  // `spec` is what we hand to npm/ng (`@angular/cli@<spec>`).
  return { spec: String(arg), major: Number.isNaN(major) ? null : major };
};

const { spec, major } = parseTarget(rawArg);

const checkNodeVersion = () => {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  const minorVersion = parseInt(nodeVersion.slice(1).split('.')[1]);

  console.log(`Current Node.js version: ${nodeVersion}`);

  // Check if Node.js version meets Angular CLI 20+ requirements
  if (major !== null && major >= 20) {
    const meetRequirements =
      (majorVersion === 20 && minorVersion >= 19) ||
      (majorVersion === 22 && minorVersion >= 12) ||
      majorVersion >= 24;

    if (!meetRequirements) {
      console.warn(
        `⚠️  Warning: Angular CLI ${spec} requires Node.js ^20.19.0 || ^22.12.0 || >=24.0.0`
      );
      console.warn(`   Current version: ${nodeVersion}`);
      console.warn(`   Attempting to continue, but update may fail...`);
    }
  }
};

// For prereleases, `ng update` requires --next to accept the RC migration target.
const ngUpdateFlags = () => {
  const needsNext = spec === 'next' || spec.includes('-');
  return needsNext ? ' --next' : '';
};

// angular-eslint ships its own `ng update` migration (`@angular-eslint/schematics`) and
// tracks the Angular major 1:1. `ng update @angular/core @angular/cli` does NOT touch it,
// so without this each major strands angular-eslint on the previous version — which drags a
// duplicate previous-major `@angular-devkit/*` subtree into `yarn.lock`. Update it in the
// same pass when the app depends on it. Skipped for prereleases/tags: angular-eslint RCs
// lag Angular's, so target it only once the major is stable.
const extraUpdateTargets = () => {
  const deps = { ...package.dependencies, ...package.devDependencies };
  const usesAngularEslint =
    'angular-eslint' in deps ||
    '@angular-eslint/schematics' in deps ||
    '@angular-eslint/builder' in deps;
  if (!usesAngularEslint) return '';
  if (major === null || spec.includes('-') || spec === 'next') return '';
  return ` @angular-eslint/schematics@${major}`;
};

const runNgUpdate = () => {
  console.log(`Updating Angular version for ${package.name} to ${spec}`);
  checkNodeVersion();

  try {
    // Try using npx with specific CLI version first for better compatibility
    const command = `npx @angular/cli@${spec} update @angular/core@${spec} @angular/cli@${spec}${extraUpdateTargets()}${ngUpdateFlags()} --create-commits --verbose`;
    console.log(`Running: ${command}`);

    execSync(command, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    console.log(`✅ Successfully updated ${package.name} to Angular ${spec}`);
  } catch (error) {
    console.log(`❌ Failed to update ${package.name} to Angular ${spec}`);
    console.log(`Error: ${error.message}`);

    // If the specific version fails, try fallback approach
    if (error.message.includes('incompatible')) {
      console.log('🔄 Trying fallback approach...');
      try {
        execSync(`yarn add -D @angular/cli@${spec}`, {
          cwd: process.cwd(),
          stdio: 'inherit',
        });
        execSync(
          `yarn ng update @angular/core@${spec}${extraUpdateTargets()}${ngUpdateFlags()} --create-commits --verbose`,
          {
            cwd: process.cwd(),
            stdio: 'inherit',
          }
        );
        console.log(`✅ Successfully updated ${package.name} using fallback method`);
      } catch (fallbackError) {
        console.log(`❌ Fallback also failed: ${fallbackError.message}`);
        throw fallbackError;
      }
    } else {
      throw error;
    }
  }

  // console.log('Committing the changes');
  // execSync(`git commit -am 'chore(deps): update ${package.name} to Angular ${spec}'`);
  // console.log('Successfully committed the changes');
};

const updateNonAngularApp = () => {
  console.log(`Updating non Angular app ${package.name} to ${spec}`);
  checkNodeVersion();

  try {
    execSync(`yarn add -D @angular/cli@${spec}`, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    console.log(`✅ Successfully updated ${package.name} to Angular CLI ${spec}`);
    console.log('Committing the changes');
    execSync(`git commit -am 'chore(deps): update ${package.name} to Angular CLI ${spec}'`);
    console.log('Successfully committed the changes');
  } catch (error) {
    console.log(`❌ Failed to update ${package.name}: ${error.message}`);
    throw error;
  }
};

// `ng update` only rewrites the workspace's own package.json. ng-packagr library
// sub-projects (projects/*/package.json) carry their own Angular peerDependencies,
// which ng update never touches — so a major bump strands them on the previous major
// while the host app moves forward. Renovate later catches the gap and files a
// straggler PR (this is what #2308 was). Propagate the host's freshly-resolved
// @angular/* versions into any library sub-project so the whole example moves majors
// atomically. Copies the host's exact spec verbatim, so caret/exact/prerelease ranges
// are preserved as-is.
const updateLibrarySubProjects = () => {
  const projectsDir = path.join(process.cwd(), 'projects');
  if (!fs.existsSync(projectsDir)) return;

  const host = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  const hostDeps = { ...host.dependencies, ...host.devDependencies };
  // @angular/* ship in lockstep on one version train, so @angular/core's resolved
  // spec is the right value for every @angular/* entry in the sub-project.
  const targetSpec = hostDeps['@angular/core'];
  if (!targetSpec) {
    console.warn('⚠️  No @angular/core in host package.json; skipping sub-project update.');
    return;
  }

  for (const entry of fs.readdirSync(projectsDir)) {
    const pkgPath = path.join(projectsDir, entry, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    let changed = false;
    for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
      const deps = pkg[depType];
      if (!deps) continue;
      for (const name of Object.keys(deps)) {
        if (name.startsWith('@angular/') && deps[name] !== targetSpec) {
          console.log(`  ${entry}/${depType}: ${name} ${deps[name]} -> ${targetSpec}`);
          deps[name] = targetSpec;
          changed = true;
        }
      }
    }
    if (changed) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`✅ Updated sub-project ${path.relative(process.cwd(), pkgPath)}`);
    }
  }
};

const updateExample = () => {
  console.log('Current working directory:', process.cwd());
  if (package.name === 'bazel-example') {
    updateNonAngularApp();
  } else {
    runNgUpdate();
    updateLibrarySubProjects();
  }
};

updateExample();
