---
type: sme-interview
repository: angular-builders
area: packages/bazel
created: 2026-02-16
status: complete
last_merged: null
---

# SME Interview: Bazel Builder

## Respondent

- **Name:** Jeb (maintainer)
- **Role:** Project maintainer
- **Date:** 2026-02-16

## Boundaries

### What is the primary responsibility of `@angular-builders/bazel`? What does it NOT do?

> Bridge between Angular CLI and Bazel — allows running Bazel commands via `ng build`/`ng serve`/`ng test`. It does not provide Bazel rules or BUILD file generation.

### What is the expected user base for this builder? Is it widely used or niche?

> Mostly experimental/proof-of-concept. It was created by the Angular team as a bridge between Angular CLI and Bazel, and they looked for a good place for it to live. Not widely used in production.

## Critical Invariants

### Are there any constraints on how Bazel commands or target labels should be validated?

> Uncertain — would need to check the code.

### What are the implications of the signal forwarding (SIGINT/SIGTERM) to spawned processes?

> Uncertain — would need to check the implementation details.

## Patterns

### What's the canonical `angular.json` configuration for using this builder?

> No answer provided — check package README/docs.

## Tribal Knowledge

### What do users commonly get wrong when setting up Bazel with Angular CLI?

> Uncertain — not enough usage data to identify patterns.

### Has the ibazel watch mode caused any known issues?

> Uncertain — haven't specifically tracked ibazel issues.

## Additional Notes

> This package was contributed by the Angular team, not organically developed by the angular-builders maintainer. It has a very small user base.
