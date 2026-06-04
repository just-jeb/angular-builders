# Runbook: Angular Major Version Upgrade

> How to move all `@angular-builders/*` packages and example apps to a new Angular major. Runs ~twice a year. Designed to be executed by an agent following these steps — the scripts handle the mechanical bumps; the agent handles the judgment (resolving internal-API breakage, fixing example apps, migration coverage).

## When to run

A new Angular major reaches **RC** (start prework so PRs are ready when GA lands) or **GA**. Builder major versions track the Angular major 1:1.

## Roles

- **Mechanical (scripts):** `scripts/update-package.js` (bumps builder Angular dep ranges) and `scripts/update-example.js` (runs `ng update` per example). Invoked via `yarn update:packages <N>` / `yarn update:examples <N>`, or the `update.yml` workflow dispatch.
- **Judgment (agent):** resolve internal-API moves and schema changes that break builders, fix example apps, ensure migration coverage, handle RC→GA.

## Preconditions

- Clean root install: `yarn install` (a stale `node_modules` breaks Husky hooks — e.g. `yarn commitlint` not resolving — and builds).
- Node satisfies the target Angular's requirement (Angular 20+: `^20.19 || ^22.12 || >=24`).

## Procedure

### 1. Branch

Create a long-lived integration branch off master:

```bash
git checkout master && git checkout -b release/v<N>
```

All v`<N>`-bound feature branches and held breaking PRs (`breaking-change` label) **base on / rebase onto** this branch. When GA lands and the branch is green, it merges to master.

### 2. Bump builder Angular ranges

```bash
yarn update:packages <N>      # e.g. 22
```

`update-package.js` sets stable deps (`@angular/build`, `@angular-devkit/build-angular`, `@angular-devkit/core`, `@angular/compiler[-cli]`) to `^<N>.0.0` and `@angular-devkit/architect` to `>=0.<N>00.0 < 0.<N+1>00.0`.

> **RC caveat (current tooling gap):** the script takes an integer major and writes `^<N>.0.0`, which by semver **excludes** prereleases like `<N>.0.0-rc.2`. For RC prework you must either (a) temporarily pin the explicit RC versions, or (b) extend `update-package.js`/`update-example.js` to accept an explicit version/tag (recommended — makes RC prework first-class and agent-runnable). `@angular/cli@next` resolves to the current RC; `@angular/cli@<N>` resolves to the latest **stable** `<N>` (nonexistent during RC).

### 3. Update example apps

```bash
yarn update:examples <N>
```

Runs `npx @angular/cli@<N> update @angular/core@<N> @angular/cli@<N> --create-commits` in each `examples/*` app (~7: `custom-esbuild` ×2, `custom-webpack` ×3, `jest` ×2). For RC, target `@next`/explicit RC per the caveat above. Review each app's generated commit.

### 4. Install + build + validate

```bash
yarn install
yarn build:packages:all
yarn test:local                 # integration matrix against examples/*
```

**This is the judgment core.** Expect breakage in the **packages layer** — internal Angular API moves (renamed/moved packages or exports) and builder-option schema changes are the most common (see `packages/AGENTS.md`). Fix per-package, rebuild, re-run until green.

### 5. Migration coverage (the breaking-change loop)

For the major, **enumerate every `breaking-change`-labeled PR** targeting it (`gh pr list --label breaking-change`). For **each** breaking change, confirm BOTH exist:

1. a migration step (auto-transform or logged advisory) in the builder's `migrations.json` (see the builder-schematics design + `@angular-builders/common/schematics`), and
2. a `MIGRATION.MD` entry for the major, annotated ✅ automated by `ng update` vs ⚠️ manual.

This is an **invariant**: a breaking change must not land in a major without both. CHANGELOGs are auto-generated from commits (orthogonal).

#### RC-validated: multi-major `ng update` window (v22)

Validated against `@angular/cli@22.0.0-rc.2` on `2026-06-03` via the `ng-update-jest-v21-smoke` e2e
(`scripts/e2e-jest-migration.js`):

- `ng update @angular-builders/jest --migrate-only --from=20.0.0 --to=22.0.0` runs **all** migrations
  whose version falls in the `(from, to]` window in one step — observed `migration-v21` (the heavy
  config transform) **and** the `migration-v22` advisory both firing. So a user on an old major who
  jumps straight to 22 gets the spanned migrations; they are not skipped.
- Supported flow for older users: upgrade the Angular framework to 22, then run
  `ng update @angular-builders/jest` once (or `--migrate-only --from=<old>` to run only the builder's
  migrations). The post-migration config builds and tests green under v22 — proven by the e2e, which
  runs `ng build` + `ng test` on the migrated app.
- E2E coverage of the migration output itself lives in `packages/jest/tests/integration.js`
  (`ng-update-jest-v21-smoke`); the ng-add paths are the `ng-add-*` entries there and in the
  `custom-esbuild`/`custom-webpack` integration files.

### 6. Stack feature work

Develop/rebase v`<N>`-bound features (e.g. schematics) and held breaking PRs on `release/v<N>`.

### 7. RC → GA

When the major reaches GA: bump ranges from RC to final (`update:packages <N>` now resolves stable), re-run install + matrix, finalize `MIGRATION.MD`, merge `release/v<N>` → master, then **graduate-publish** (CI dispatch `release_type: graduate`).

## Known breakage hotspots

- **Internal API moves** in `@angular/build` / `@angular-devkit/*` — imports the builders rely on get renamed/relocated (~every major). Felt in `packages/*/src`.
- **Schema/option changes** in Angular's base builder schemas — affects `custom-esbuild`/`custom-webpack` schema merging (`merge-schemes.ts`) and option pass-through.
- **Jest/test toolchain majors** (jest-preset-angular, Jest) — historically large (see jest `@21` migration).

## References

- Scripts: `scripts/update-package.js`, `scripts/update-example.js`, `scripts/AGENTS.md`
- Workflow: `.github/workflows/update.yml` (manual dispatch, input = version)
- Migration design: `docs/superpowers/specs/2026-06-01-builder-schematics-design.md`
- Per-major user guide: `MIGRATION.MD`
- Breakage context: `packages/AGENTS.md`, root `AGENTS.md` → "Angular Major Version Upgrade Process"
