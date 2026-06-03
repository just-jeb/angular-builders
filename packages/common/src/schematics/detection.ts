import { Tree } from '@angular-devkit/schematics';
import { workspaces } from '@angular-devkit/core';

export type TestBuilderKind = 'karma' | 'jest' | 'vitest' | 'other' | 'none';

export function getProjectsToTarget(
  workspace: workspaces.WorkspaceDefinition,
  optionProject?: string,
): string[] {
  const names = [...workspace.projects.keys()];
  if (optionProject) {
    if (!workspace.projects.has(optionProject)) {
      throw new Error(`Project "${optionProject}" does not exist in the workspace.`);
    }
    return [optionProject];
  }
  if (names.length <= 1) return names;
  const defaultProject = workspace.extensions['defaultProject'];
  if (typeof defaultProject === 'string' && workspace.projects.has(defaultProject)) {
    return [defaultProject];
  }
  return names;
}

export function detectTestBuilder(
  workspace: workspaces.WorkspaceDefinition,
  projectName: string,
): TestBuilderKind {
  const project = workspace.projects.get(projectName);
  const builder = project?.targets.get('test')?.builder;
  if (!builder) return 'none';
  if (builder.endsWith(':karma')) return 'karma';
  if (builder === '@angular-builders/jest:run') return 'jest';
  if (builder.endsWith(':unit-test')) return 'vitest';
  return 'other';
}

export function isZoneless(
  tree: Tree,
  workspace: workspaces.WorkspaceDefinition,
  projectName: string,
): boolean {
  const project = workspace.projects.get(projectName);
  const buildOptions = project?.targets.get('build')?.options ?? {};
  const polyfills = buildOptions['polyfills'];
  const polyfillList = Array.isArray(polyfills)
    ? (polyfills as string[])
    : typeof polyfills === 'string'
      ? [polyfills]
      : [];
  const hasZone = polyfillList.some((p) => p === 'zone.js' || p.includes('zone.js'));
  if (hasZone) return false;

  // Fallback: look for provideZonelessChangeDetection in any bootstrap source.
  const root = project?.root ?? '';
  const mainCandidates = ['src/main.ts', 'src/app/app.config.ts'].map((p) =>
    root ? `${root}/${p}` : p,
  );
  for (const candidate of mainCandidates) {
    if (tree.exists(candidate)) {
      const content = tree.readText(candidate);
      if (content.includes('provideZonelessChangeDetection')) return true;
    }
  }
  return !hasZone; // no zone.js polyfill ⇒ treat as zoneless
}
