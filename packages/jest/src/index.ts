import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { normalize, Path, schema, json, workspaces } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';
import { run } from 'jest';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomConfigResolver } from './custom-config.resolver';
import { DefaultConfigResolver } from './default-config.resolver';
import { JestConfigurationBuilder } from './jest-configuration-builder';
import { OptionsConverter } from './options-converter';
import { SchemaObject as JestBuilderSchema } from './schema';

export async function getRoots(
  context: BuilderContext
): Promise<{ workspaceRoot: Path; projectRoot: Path }> {
  const registry = new schema.CoreSchemaRegistry();
  registry.addPostTransform(schema.transforms.addUndefinedDefaults);
  const { workspace } = await workspaces.readWorkspace(
    normalize(context.workspaceRoot),
    workspaces.createWorkspaceHost(new NodeJsSyncHost())
  );
  const projectName = context.target
    ? context.target.project
    : workspace.extensions['defaultProject'];

  if (typeof projectName !== 'string') {
    throw new Error('Must either have a target from the context or a default project.');
  }

  const { root } = workspace.projects.get(projectName);
  return {
    projectRoot: normalize(root),
    workspaceRoot: normalize(context.workspaceRoot),
  };
}

export function runJest(
  options: JestBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  //TODO: run with service worker (augmentAppWithServiceWorker)
  async function buildArgv(): Promise<string[]> {
    const optionsConverter = new OptionsConverter();

    const { workspaceRoot, projectRoot } = await getRoots(context);

    const configuration = new JestConfigurationBuilder(
      new DefaultConfigResolver(options),
      new CustomConfigResolver(context.logger.createChild('Jest runner'))
    ).buildConfiguration(projectRoot, workspaceRoot, options.configPath);
    delete options.configPath;
    const argv = optionsConverter.convertToCliArgs(options);

    argv.push('--config', JSON.stringify(configuration));
    return argv;
  }
  async function runJestCLI() {
    const argv = await buildArgv();
    //TODO: use runCLI to better determine the outcome
    return run(argv);
  }

  return from(runJestCLI()).pipe(map(() => ({ success: true })));
}

export default createBuilder<JestBuilderSchema & json.JsonObject>(runJest);
