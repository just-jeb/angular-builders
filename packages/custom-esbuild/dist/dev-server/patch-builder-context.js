"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchBuilderContext = patchBuilderContext;
const executorToBuilderMap = new Map([
    ['@angular-builders/custom-esbuild', '@angular/build:application'],
    ['@angular-builders/custom-esbuild:application', '@angular/build:application'],
]);
function cleanBuildTargetOptions(options) {
    delete options.plugins;
    delete options.indexHtmlTransformer;
    return options;
}
function patchBuilderContext(context, buildTarget) {
    const originalGetBuilderNameForTarget = context.getBuilderNameForTarget;
    // We have to patch `getBuilderNameForTarget` because Angular CLI checks
    // whether the runnable target is `@angular/build:application`
    // and then defines the server to run. If the `builderName` (returned by
    // `context.getBuilderNameForTarget`) is not an `@angular/build:application`,
    // then it will use the Webpack server for the `dev-server target`. By patching
    // the return value, Angular will use the Vite server for the `dev-server` target.
    context.getBuilderNameForTarget = async (target) => {
        const builderName = await originalGetBuilderNameForTarget(target);
        if (executorToBuilderMap.has(builderName)) {
            return executorToBuilderMap.get(builderName);
        }
        return builderName;
    };
    const originalGetTargetOptions = context.getTargetOptions;
    context.getTargetOptions = async (target) => {
        const options = await originalGetTargetOptions(target);
        if (target.project === buildTarget.project &&
            target.target === buildTarget.target &&
            target.configuration === buildTarget.configuration) {
            cleanBuildTargetOptions(options);
        }
        return options;
    };
}
//# sourceMappingURL=patch-builder-context.js.map