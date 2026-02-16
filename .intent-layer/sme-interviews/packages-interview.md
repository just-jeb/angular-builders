---
type: sme-interview
repository: angular-builders
area: packages
created: 2026-02-16
status: complete
last_merged: null
---

# SME Interview: Packages (Architectural Layer)

## Respondent

- **Name:** Jeb (maintainer)
- **Role:** Project maintainer
- **Date:** 2026-02-16

## Boundaries

### Are there plans to add new builder packages? What criteria determine whether something becomes a new package vs. a feature in an existing one?

> Demand-driven. New packages would be added if there's significant community demand.

## Critical Invariants

### What is the versioning strategy? Why independent versions instead of fixed/locked?

> Major versions are aligned to Angular (e.g., v19.x for Angular 19), but patches and minors are released independently per package since they have different change cadences.

### Are there constraints on which Angular pre-release versions the builders should support?

> Generally only stable Angular releases are officially supported. However, sometimes work begins against Angular RCs to have a PR ready and waiting, so that only a final version update is needed when the major release lands.

## Patterns

### What's the canonical process for creating a new builder package in this monorepo?

> No formal documented process, but there is believed to be a schematics package that can scaffold new builder packages.

### What's the process for upgrading all packages to a new Angular major version?

> Same as described in root interview (Renovate PR + manual `ng update` in examples), plus fixing whatever breaks in the packages themselves from Angular API changes. The packages layer is where Angular CLI API changes are felt most.

## Tribal Knowledge

### What are the most common breaking changes from Angular CLI that affect these builders?

> Internal API moves (Angular moving/renaming internal packages or exports) and schema changes to builder options.

### What's the relationship between this project and the Angular CLI team? Is there coordination on builder API changes?

> Same as root interview — informal agreement. Angular CLI team provides the interface to extend the build pipeline but doesn't support custom configurations. Issues arising from customization land here.

### What publishing issues have occurred in the past (npm, registry, authentication)?

> Multiple types: npm token/auth issues in CI, version conflicts and tag issues, and on two separate occasions a package was published without a `dist` folder (for different reasons each time).

## Additional Notes

> N/A
