---
type: sme-interview
repository: angular-builders
area: scripts
created: 2026-02-16
status: complete
last_merged: 2026-02-16
---

# SME Interview: Scripts (Build Infrastructure)

## Respondent

- **Name:** Jeb (maintainer)
- **Role:** Project maintainer
- **Date:** 2026-02-16

## Boundaries

### What is the primary responsibility of the scripts directory? Are there scripts that should be moved elsewhere?

> CI test discovery, local test running, and Angular version update utilities. No scripts that need to be moved — they serve their purpose here.

## Critical Invariants

### What must be true about the integration test definition format for CI to work correctly?

> Uncertain — would need to check the discover-tests.js logic.

### Are there constraints on the Turbo summary format that `discover-tests.js` depends on?

> Uncertain — would need to check the script implementation.

## Patterns

### What's the canonical way to add a new integration test?

> No specific documented process — check existing test definitions for patterns.

### What's the process for updating Angular version ranges across all packages?

> No rigidly defined process. Ideally it should be fully automated. `update-package.js` and `update-examples.js` were created toward this goal.

## Tribal Knowledge

### What CI issues have occurred with the test discovery/execution pipeline?

> Uncertain — would need to check CI history.

### Why was the affected-package filtering based on Turbo summaries rather than git diff?

> Turbo understands the package dependency graph — git diff only sees file changes. Turbo can identify which packages are actually affected by a change, including transitive dependencies.

### What issues has the `update-package.js` version range logic caused during Angular version bumps?

> Uncertain — would need to check history.

## Additional Notes

> N/A
