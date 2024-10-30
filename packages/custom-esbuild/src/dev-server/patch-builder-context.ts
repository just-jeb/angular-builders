import { BuilderContext, Target } from '@angular-devkit/architect';

const executorToBuilderMap = new Map<string, string>([
  ['@angular-builders/custom-esbuild', '@angular/build:application'],
  ['@angular-builders/custom-esbuild:application', '@angular/build:application'],
]);

function cleanBuildTargetOptions(options: any) {
  delete options.plugins;
  delete options.indexHtmlTransformer;
  return options;
}

export function patchBuilderContext(context: BuilderContext, buildTarget: Target): void {
  const originalGetBuilderNameForTarget = context.getBuilderNameForTarget;

  // We have to patch `getBuilderNameForTarget` because Angular CLI checks
  // whether the runnable target is `@angular-devkit/build-angular:application`
  // and then defines the server to run. If the `builderName` (returned by
  // `context.getBuilderNameForTarget`) is not an `@angular-devkit/build-angular:application`,
  // then it will use the Webpack server for the `dev-server target`. By patching
  // the return value, Angular will use the Vite server for the `dev-server` target.
  context.getBuilderNameForTarget = async target => {
    const builderName = await originalGetBuilderNameForTarget(target);

    if (executorToBuilderMap.has(builderName)) {
      return executorToBuilderMap.get(builderName)!;
    }

    return builderName;
  };

  const originalGetTargetOptions = context.getTargetOptions;
  context.getTargetOptions = async target => {
    const options = await originalGetTargetOptions(target);

    if (
      target.project === buildTarget.project &&
      target.target === buildTarget.target &&
      target.configuration === buildTarget.configuration
    ) {
      cleanBuildTargetOptions(options);
    }

    return options;
  };
}
