import { BuilderContext, BuilderOutput, createBuilder } from "@angular-devkit/architect/src/index";
import { experimental, normalize, Path, schema } from "@angular-devkit/core";
import { NodeJsSyncHost } from "@angular-devkit/core/node";
import { run } from 'jest-cli';
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CustomConfigResolver } from "./custom-config.resolver";
import { DefaultConfigResolver } from "./default-config.resolver";
import { JestConfigurationBuilder } from "./jest-configuration-builder";
import { OptionsConverter } from "./options-converter";
import { JestBuilderSchema } from "./schema";



export async function getRoots(context: BuilderContext):
    Promise<{ workspaceRoot: Path, root: Path, sourceRoot: Path }> {
    const host = new NodeJsSyncHost();
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);
    const workspace = await experimental.workspace.Workspace.fromPath(
        host,
        normalize(context.workspaceRoot),
        registry,
    );
    const projectName = context.target ? context.target.project : workspace.getDefaultProjectName();

    if (!projectName) {
        throw new Error('Must either have a target from the context or a default project.');
    }

    // const projectRoot = resolve(
    //     workspace.root,
    //     normalize(workspace.getProject(projectName).root),
    // );
    const { root, sourceRoot } = workspace.getProject(projectName);
    return {
        root: normalize(root),
        sourceRoot: normalize(sourceRoot),
        workspaceRoot: workspace.root
    };
}

export function runJest(
    options: JestBuilderSchema,
    context: BuilderContext,
): Observable<BuilderOutput> {
    //TODO: run with service worker (augmentAppWithServiceWorker)
    async function buildArgv(): Promise<string[]> {
        const optionsConverter = new OptionsConverter();

        const { workspaceRoot, root, sourceRoot } = await getRoots(context);

        const configuration = new JestConfigurationBuilder(new DefaultConfigResolver(),
            new CustomConfigResolver(context.logger.createChild('Jest runner')))
            .buildConfiguration(root, sourceRoot, workspaceRoot);
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

    const argv = buildArgv();

    return from(runJestCLI()).pipe(
        map(() => ({ success: true }))
    );
}

export default createBuilder<JestBuilderSchema>(runJest);