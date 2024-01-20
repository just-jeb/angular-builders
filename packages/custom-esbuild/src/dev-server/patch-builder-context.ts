import { BuilderContext, Target } from '@angular-devkit/architect';

const executorToBuilderMap = new Map<string, string>([
  ['@angular-builders/custom-esbuild', '@angular-devkit/build-angular:application'],
]);

function cleanBuildTargetOptions(options: any) {
  delete options.plugins;
  delete options.indexHtmlTransformer;
  return options;
}

export function patchBuilderContext(context: BuilderContext, buildTarget: Target): void {
  const originalGetBuilderNameForTarget = context.getBuilderNameForTarget;
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
