import * as path from 'path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { SchematicTestHarness } from './testing';
import { migrateToJitiLoader } from './migrate-jiti-loader';

const NG = path.join(
  path.dirname(require.resolve('@schematics/angular/package.json')),
  'collection.json'
);
const runner = () => new SchematicTestRunner('t', NG);

const PKG = '@angular-builders/custom-webpack';

async function seed(
  mutate: (pkg: Record<string, any>) => void,
  tsconfig?: Record<string, unknown>
): Promise<UnitTestTree> {
  const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
  const pkg = JSON.parse(tree.readText('/package.json'));
  pkg.scripts = pkg.scripts ?? {};
  pkg.devDependencies = pkg.devDependencies ?? {};
  mutate(pkg);
  tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));
  if (tsconfig) {
    tree.overwrite('/tsconfig.json', JSON.stringify(tsconfig, null, 2));
  }
  return tree;
}

async function migrate(tree: UnitTestTree): Promise<UnitTestTree> {
  return (await runner().callRule(migrateToJitiLoader(PKG), tree).toPromise()) as UnitTestTree;
}

describe('migrateToJitiLoader', () => {
  it('strips the ts-node/esm NODE_OPTIONS workaround from npm scripts', async () => {
    const tree = await seed(pkg => {
      pkg.scripts['build-ts'] =
        "TS_NODE_PROJECT=tsconfig.app.json NODE_OPTIONS='--loader ts-node/esm' ng build";
      pkg.scripts['build'] = 'ng build';
    });
    const out = await migrate(tree);
    const pkg = JSON.parse(out.readText('/package.json'));
    expect(pkg.scripts['build-ts']).toBe('ng build');
    expect(pkg.scripts['build']).toBe('ng build');
  });

  it('removes ts-node and tsconfig-paths from devDependencies', async () => {
    const tree = await seed(pkg => {
      pkg.devDependencies['ts-node'] = '10.9.2';
      pkg.devDependencies['tsconfig-paths'] = '4.2.0';
      pkg.devDependencies['typescript'] = '5.0.0';
    });
    const out = await migrate(tree);
    const pkg = JSON.parse(out.readText('/package.json'));
    expect(pkg.devDependencies['ts-node']).toBeUndefined();
    expect(pkg.devDependencies['tsconfig-paths']).toBeUndefined();
    expect(pkg.devDependencies['typescript']).toBe('5.0.0');
  });

  it('lifts a path-only `ts-node` tsconfig section into compilerOptions and removes the section', async () => {
    const tree = await seed(() => undefined, {
      compilerOptions: { strict: true, paths: { '@app/*': ['./src/app/*'] } },
      'ts-node': { compilerOptions: { paths: { '@cfg/*': ['./cfg/*'] } } },
    });
    const out = await migrate(tree);
    const cfg = JSON.parse(out.readText('/tsconfig.json'));
    expect(cfg.compilerOptions.paths['@cfg/*']).toEqual(['./cfg/*']);
    expect(cfg.compilerOptions.paths['@app/*']).toEqual(['./src/app/*']);
    expect(cfg['ts-node']).toBeUndefined();
  });

  it('keeps a `ts-node` section that has non-path overrides (cannot be applied safely)', async () => {
    const tree = await seed(() => undefined, {
      compilerOptions: { strict: true },
      'ts-node': { compilerOptions: { target: 'ES2022' } },
    });
    const out = await migrate(tree);
    const cfg = JSON.parse(out.readText('/tsconfig.json'));
    expect(cfg['ts-node']).toEqual({ compilerOptions: { target: 'ES2022' } });
  });

  it('does not add a path alias that already exists in compilerOptions', async () => {
    const tree = await seed(() => undefined, {
      compilerOptions: { paths: { '@cfg/*': ['./real/*'] } },
      'ts-node': { compilerOptions: { paths: { '@cfg/*': ['./override/*'] } } },
    });
    const out = await migrate(tree);
    const cfg = JSON.parse(out.readText('/tsconfig.json'));
    // The existing mapping wins; the ts-node override does not clobber it.
    expect(cfg.compilerOptions.paths['@cfg/*']).toEqual(['./real/*']);
  });
});
