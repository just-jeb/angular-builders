const { execSync } = require('child_process');
const package = require(`${process.cwd()}/package.json`);
const version = Number.parseInt(process.argv.slice(2));

const checkNodeVersion = () => {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  const minorVersion = parseInt(nodeVersion.slice(1).split('.')[1]);
  
  console.log(`Current Node.js version: ${nodeVersion}`);
  
  // Check if Node.js version meets Angular CLI 20+ requirements
  if (version >= 20) {
    const meetRequirements = 
      (majorVersion === 20 && minorVersion >= 19) ||
      (majorVersion === 22 && minorVersion >= 12) ||
      majorVersion >= 24;
      
    if (!meetRequirements) {
      console.warn(`⚠️  Warning: Angular CLI ${version} requires Node.js ^20.19.0 || ^22.12.0 || >=24.0.0`);
      console.warn(`   Current version: ${nodeVersion}`);
      console.warn(`   Attempting to continue, but update may fail...`);
    }
  }
};

const runNgUpdate = () => {
  console.log(`Updating Angular version for ${package.name}`);
  checkNodeVersion();
  
  try {
    // Try using npx with specific CLI version first for better compatibility
    const command = `npx @angular/cli@${version} update @angular/core@${version} @angular/cli@${version} --create-commits --verbose`;
    console.log(`Running: ${command}`);
    
    execSync(command, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    console.log(`✅ Successfully updated ${package.name} to Angular ${version}`);
  } catch (error) {
    console.log(`❌ Failed to update ${package.name} to Angular ${version}`);
    console.log(`Error: ${error.message}`);
    
    // If the specific version fails, try fallback approach
    if (error.message.includes('incompatible')) {
      console.log('🔄 Trying fallback approach...');
      try {
        execSync(`yarn add -D @angular/cli@^${version}.0.0`, {
          cwd: process.cwd(),
          stdio: 'inherit',
        });
        execSync(`yarn ng update @angular/core@${version} --create-commits --verbose`, {
          cwd: process.cwd(),
          stdio: 'inherit',
        });
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
  // execSync(`git commit -am 'chore(deps): update ${package.name} to Angular ${version}'`);
  // console.log('Successfully committed the changes');
};

const updateNonAngularApp = () => {
  console.log(`Updating non Angular app ${package.name}`);
  checkNodeVersion();
  
  try {
    execSync(`yarn add -D @angular/cli@^${version}.0.0`, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    console.log(`✅ Successfully updated ${package.name} to Angular CLI ${version}`);
    console.log('Committing the changes');
    execSync(`git commit -am 'chore(deps): update ${package.name} to Angular CLI ${version}'`);
    console.log('Successfully committed the changes');
  } catch (error) {
    console.log(`❌ Failed to update ${package.name}: ${error.message}`);
    throw error;
  }
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
