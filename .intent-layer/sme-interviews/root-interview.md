---
type: sme-interview
repository: angular-builders
area: .
created: 2026-02-16
status: complete
last_merged: 2026-02-16
---

# SME Interview: Repository Root (Cross-Cutting)

## Respondent

- **Name:** Jeb (maintainer)
- **Role:** Project maintainer
- **Date:** 2026-02-16

## Boundaries

### What is the overall mission of this repository? How does it fit into the Angular ecosystem?

> Provide custom builder extensions that let users customize Angular CLI's build pipeline (webpack, esbuild, jest, etc.). It extends Angular CLI rather than replacing it.

## Critical Invariants

### What is the relationship between builder versions and Angular CLI versions? Has this ever been violated?

> Builder major version matches Angular CLI major version (e.g., builder v19.x for Angular 19). This is a strict lock.

### What must NEVER be changed about the `merge-schemes.ts` mechanism? Are there known fragilities?

> The output format must remain compatible, and the merged schema must ALWAYS be based on the original Angular schema of the corresponding builder. Exception: the Jest builder is based on Jest's own schema, not Angular's.

## Patterns

### What's the canonical process for a new Angular major version release?

> Not fully automated yet. It partially originates from Renovate PRs, but each Angular major update also requires running `ng update` for apps in `examples/`. Currently a manual process. There are scripts and a GitHub Action to make it easier, with the goal of full automation.

### What's the release process (beta vs. graduate)? When is each used?

> Beta versions are published automatically from CI upon merge to master. Graduation (stable release) is a manually triggered GitHub Action that also runs in CI, but the trigger is manual.

## Tribal Knowledge

### What are the biggest maintenance burdens of this repository?

> Two main burdens: (1) Keeping up with Angular CLI internal API changes that break builders — a major effort every ~6 months. (2) User support — triaging issues, answering questions, managing community expectations — an ongoing effort.

### What are the most common types of issues filed by users?

> Version compatibility issues after Angular upgrades and peer dependency mismatches.

### Are there any undocumented agreements or conventions with the Angular CLI team?

> Informal agreement: the Angular CLI team does not support custom configs. They provide an interface to extend the build pipeline, and any issues arising from custom configurations are not their responsibility. This is why many issues get filed in this repo instead.

### What lessons have been learned from maintaining backward compatibility across Angular versions?

> Timing of breaking changes is critical — even if a major dependency update (e.g., Jest 30) is available, it cannot be shipped as a minor version of the builder. Early RC testing helps with early releases but isn't a deal-breaker.

### What is the long-term vision for this project? Is `custom-webpack` expected to be deprecated in favor of `custom-esbuild`?

> Follows Angular. Whatever Angular CLI supports, builders will support. When Angular drops webpack support, this repo will follow suit.

## Additional Notes

> N/A
