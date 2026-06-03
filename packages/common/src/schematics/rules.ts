import { Rule, Tree } from '@angular-devkit/schematics';
import { updateWorkspace, addDependency, DependencyType, InstallBehavior } from '@schematics/angular/utility';
import { JSONFile } from '@schematics/angular/utility/json-file';

export function setBuilderForTarget(
  projectName: string,
  targetName: string,
  builderName: string,
  options?: Record<string, unknown>,
): Rule {
  return updateWorkspace((workspace) => {
    const project = workspace.projects.get(projectName);
    if (!project) throw new Error(`Project "${projectName}" not found.`);
    const target = project.targets.get(targetName);
    if (target) {
      target.builder = builderName;
      if (options) target.options = { ...(target.options ?? {}), ...options };
    } else {
      project.targets.add({ name: targetName, builder: builderName, options: options ?? {} });
    }
  });
}

export function addBuilderDevDependency(
  name: string,
  version: string,
  opts: { install?: boolean } = {},
): Rule {
  return addDependency(name, version, {
    type: DependencyType.Dev,
    install: opts.install === false ? InstallBehavior.None : InstallBehavior.Auto,
  });
}

export function removeDevDependencies(names: string[]): Rule {
  return (tree: Tree) => {
    if (!tree.exists('/package.json')) return tree;
    const json = new JSONFile(tree, '/package.json');
    for (const name of names) {
      if (json.get(['devDependencies', name]) !== undefined) {
        json.remove(['devDependencies', name]);
      }
    }
    return tree;
  };
}

export function removeFilesIfPresent(paths: string[]): Rule {
  return (tree: Tree) => {
    for (const p of paths) {
      if (tree.exists(p)) tree.delete(p);
    }
    return tree;
  };
}

export function editJsonFile(path: string, mutator: (json: JSONFile) => void): Rule {
  return (tree: Tree) => {
    if (!tree.exists(path)) return tree;
    const json = new JSONFile(tree, path);
    mutator(json);
    return tree;
  };
}
