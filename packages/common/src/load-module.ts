/// <reference types="node" />
// The triple-slash reference above explicitly pulls in `@types/node` global typings
// (`require`, `process`, `__filename`, the `node:` import specifiers). This package's
// tsconfig does not set a `types` field, and `@types/node` is not auto-discovered for
// this program; the previous implementation only got node globals transitively via
// `typeof import('ts-node')`. Removing ts-node removed that side effect, so we declare
// the dependency on node types directly here.
import * as path from 'node:path';
import { createJiti } from 'jiti';
import { parseTsconfig } from 'get-tsconfig';
import type { logging } from '@angular-devkit/core';

type Jiti = ReturnType<typeof createJiti>;

// Cache one jiti instance per tsconfig. Repeated loads with the same tsconfig
// reuse the transform cache; different tsconfigs get isolated instances, so there
// is no process-global "first tsconfig wins" stickiness (the old ts-node limitation).
const jitiByTsConfig = new Map<string, Jiti>();

/**
 * Builds a jiti `alias` map from a tsconfig's `baseUrl` + `paths`, resolving
 * `extends` so aliases declared in a base config are honored.
 *
 * Why not jiti's built-in `tsconfigPaths: <path>` option? Internally jiti hands the
 * string to `get-tsconfig`'s `getTsconfig()`, which treats it as a *search location*
 * and only ever loads a file literally named `tsconfig.json` — it ignores any other
 * filename (e.g. `tsconfig.app.json`, which Angular build targets routinely use) and
 * walks up to the nearest `tsconfig.json`. That silently resolves aliases against the
 * wrong config and breaks per-target isolation. Parsing the exact file we were handed
 * with `get-tsconfig`'s `parseTsconfig()` (which honors the precise path and resolves
 * `extends`) and feeding jiti an explicit `alias` map keeps each jiti instance isolated.
 *
 * We use `get-tsconfig` rather than `require('typescript')` deliberately: `common` is a
 * *published* package and does not declare `typescript` as a runtime dependency, so
 * `require('typescript')` is unreliable under non-hoisted installs (pnpm / Yarn PnP) —
 * a strict resolver would fail and aliases would silently break. `get-tsconfig` is a
 * declared, zero-dependency dependency (the same parser jiti uses internally), so it
 * always resolves. A missing/invalid tsconfig degrades gracefully to an empty map
 * (jiti still loads the module — only `paths` aliases are unavailable).
 */
function tsConfigAliases(tsConfig: string): Record<string, string> {
  let compilerOptions: { baseUrl?: string; paths?: Record<string, string[]> } | undefined;
  try {
    compilerOptions = parseTsconfig(tsConfig).compilerOptions;
  } catch {
    return {};
  }

  const { baseUrl, paths } = compilerOptions ?? {};
  if (!paths) {
    return {};
  }

  // `get-tsconfig` returns `baseUrl` (and the `paths` targets) relative to the *directory
  // of the tsconfig file we passed* — even when they originate from an extended base
  // config, it rewrites them to be relative to that directory. So resolve baseUrl against
  // the tsconfig's dir, and each target against baseUrl. If baseUrl is absent, paths
  // resolve directly against the tsconfig's dir.
  const tsConfigDir = path.dirname(tsConfig);
  const base = baseUrl ? path.resolve(tsConfigDir, baseUrl) : tsConfigDir;

  const aliases: Record<string, string> = {};
  for (const [alias, targets] of Object.entries(paths)) {
    const target = targets?.[0];
    if (!target) {
      continue;
    }
    // Strip the trailing `/*` wildcard from both sides so jiti (prefix matching)
    // maps `@x/*` -> the resolved target directory; non-wildcard aliases map 1:1.
    const aliasKey = alias.replace(/\/\*$/, '');
    const targetPath = target.replace(/\/\*$/, '');
    aliases[aliasKey] = path.resolve(base, targetPath);
  }

  return aliases;
}

function getJiti(tsConfig: string): Jiti {
  let jiti = jitiByTsConfig.get(tsConfig);
  if (!jiti) {
    jiti = createJiti(__filename, {
      // Resolve TypeScript path aliases (baseUrl/paths) from the build target's
      // tsconfig. Replaces the previous explicit `tsconfig-paths` registration.
      // We parse the tsconfig ourselves (see `tsConfigAliases`) rather than using
      // jiti's `tsconfigPaths` option, which mishandles non-`tsconfig.json` filenames.
      alias: tsConfigAliases(tsConfig),
      // Merge module.exports + default export into a single value (Proxy-based),
      // replacing the previous `require(p).default || require(p)` unwrapping.
      interopDefault: true,
      // Persist the transform cache to disk between runs for faster reloads.
      fsCache: true,
    });
    jitiByTsConfig.set(tsConfig, jiti);
  }

  return jiti;
}

/**
 * Loads a user-provided module (webpack/esbuild config, plugin, or index-html
 * transformer) regardless of format: `.ts`, `.mts`, `.cts`, `.js`, `.mjs`, `.cjs`.
 *
 * All CJS/ESM/TS interop is delegated to jiti. TypeScript is transpiled
 * transpile-only — there is NO build-time type-checking (run `tsc --noEmit`
 * separately if you want it; see the package README). This replaces the previous
 * ts-node + tsconfig-paths + hand-rolled dynamic-import implementation.
 *
 * @param modulePath Absolute path to the module to load.
 * @param tsConfig Absolute path to the tsconfig used for path-alias resolution.
 * @param _logger Angular logger (retained for API compatibility; unused).
 */
export async function loadModule<T>(
  modulePath: string,
  tsConfig: string,
  _logger: logging.LoggerApi
): Promise<T> {
  const jiti = getJiti(tsConfig);
  const mod = await jiti.import<T | { default?: T }>(modulePath);

  // With interopDefault, `mod` already merges named + default exports. The explicit
  // `.default` access preserves parity with the previous unwrap for modules that
  // only set a default export, without over-unwrapping a nested `{ default: ... }`.
  return ((mod as { default?: T })?.default ?? mod) as T;
}
