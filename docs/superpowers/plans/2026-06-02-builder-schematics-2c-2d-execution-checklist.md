# Builder Schematics — Stream 2c/2d Execution Checklist

> Companion to Plans 00–03 (+ the proposed Plan 04 e2e). Captures the cross-cutting work that isn't inside a single per-builder plan. **All gated on `release/v22` being green** (PR #2264 merged), since execution builds/tests against Angular 22.

## 2c — Execution + holds

- [ ] Execute **Plan 00** (common/schematics core) first — it locks the API the builder plans import.
- [ ] Execute **Plans 01–03** (jest, custom-esbuild, custom-webpack). 02/03 can parallelize; **01 (jest) is the long pole**.
- [ ] Execute **Plan 04** (integration e2e) — see Testing below.
- [ ] Rebase the v22-held breaking PRs onto `release/v22`: **#2191** (jest isolatedModules default) and **#2212** (jest per-project coverage). **#2260 is NOT a v22 hold** — Karma isn't removed in v22 (spec §12); it's held for the future major where Angular removes Karma.
- [ ] Confirm each held breaking change is covered by **both** a migration step AND a `MIGRATION.MD` entry (process invariant, spec §11). Current set is the jest `@22` advisory covering **#2191 + #2212**. (custom-webpack has no v22 migration — see spec §12.)
- [ ] Re-enumerate `breaking-change`-labeled open PRs at the v22 cut — any added later MUST also carry a migration step + `MIGRATION.MD` entry.
- [ ] Close/supersede **#2240** and **#2241** once the consolidated schematics work is up, with a comment pointing at the replacement.

## 2d — MIGRATION.MD pairing

- [ ] Pair every `MIGRATION.MD` breaking-change entry with a migration outcome (✅ auto-transform or ⚠️ logged advisory). Annotate each item.
- [ ] **Document the upgrade flow for old-version users (v17–v20):** upgrade the Angular *framework* stepwise to 22, then run `ng update @angular-builders/jest` **once** (single old→22 builder update) so the migration window `(old, 22]` spans 21 and the heavy `migration-v21` actually fires. A stepwise builder update *through* 21 skips it (v21 shipped no `migrations.json`). See Plan 01 Task 6 note.
- [ ] Migration `logger.warn` advisories point users back to the relevant `MIGRATION.MD` section.

## RC-gated validations (verify on `22.0.0-rc.2` during execution)

- [ ] **Multi-major `ng update`:** confirm the CLI permits a third-party package's old→22 jump and runs the spanned migrations (framework blocks multi-major; packages with a `migrations.json` generally allow it). If refused, document the `ng update @angular-builders/jest@22 --migrate-only --from=<old>` fallback.
- [ ] **Generator calibration:** the `application` schematic's v22 defaults (test-target presence, zone.js polyfill, project root) drive the unit-test expectations in Plans 00–03 — calibrate against real generator output (flagged in each plan).

## Testing strategy (resolves "do we need e2e?")

The per-builder plans cover the **unit** layer well (SchematicTestHarness + SchematicTestRunner/UnitTestTree — asserts transforms, idempotency, zone/zoneless branches). Two e2e gaps remain:

- [ ] **`ng add` e2e (spec §8 — currently MISSING from all plans → Plan 04):** wire into the existing integration matrix (`packages/*/tests/integration.js` against `examples/*`). For each "real" builder: run `ng add @angular-builders/<builder>` on a fixture app, then `ng build` / `ng test`, assert green. Catches what unit tests can't — schema validity, real builder wiring, install behavior, real CLI invocation. Cases per the 2026-06-02 amendments (spec §12): jest **Karma→Jest AND Vitest→Jest**; custom-esbuild build/serve rewrite **+ the webpack-build guard advisory** (assert it does NOT silently swap a webpack build target); custom-webpack build/serve rewrite + `webpack.config.js` scaffold.
- [ ] **`ng update` post-migration smoke (jest `@21` heavy migration):** a full real-`ng update` e2e is high-cost/flaky and **not recommended** (would need an old Angular toolchain + network + cross-major simulation). Instead: seed a fixture in the *old config shape* (no old Angular toolchain needed — migrations only rewrite config), run the migration schematic, then materialize the tree and `ng build`/`ng test` **under v22** to prove the migrated config is actually valid/runnable — catches "syntactically-correct-but-semantically-broken" output that pure tree assertions miss. Add as a task in Plan 01 or Plan 04.

### Plan 04 design constraints (two e2e gotchas — bake into the plan)

- [ ] **Karma is NOT removed in v22 (spec §12) — generate the Karma fixture normally.** Use `ng new --test-runner karma` to scaffold the Karma→Jest e2e fixture; Karma is still a supported `ng new` option on v22. `ng add @angular-builders/jest` detects + removes Karma, then `ng test` validates via Jest. The **Vitest→Jest** path uses a default (Vitest) v22 app. The clean-add and custom-esbuild paths use a normal v22-shaped fixture. *(Corrected 2026-06-02 — the earlier "Karma removed, use a checked-in fixture" note was based on a false premise.)*
- [ ] **`ng add` against an unpublished (local-only) v22 build.** The package isn't on npm during CI. Mirror how the existing matrix consumes local workspace builds. Preferred: **`npm pack` the built package → `ng add ./<tarball>`** in the fixture (exercises real resolve → install → run-collection incl. save-to-devDeps). Lighter alt: invoke the collection via the real CLI against the already workspace-linked package. Full-fidelity alt (publish/fetch): local **verdaccio** — likely overkill. Validate the chosen approach against the v22 RC.
