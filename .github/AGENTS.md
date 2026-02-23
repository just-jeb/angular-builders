# CI & Workflows

> GitHub Actions workflows and PR/issue templates for the angular-builders monorepo.

## At a Glance

|                  |                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------- |
| **Type**         | Capability Domain                                                                        |
| **Owns**         | CI pipeline (`ci.yml`), auto-approve workflow, Angular update workflow, GitHub templates |
| **Does NOT own** | Build scripts (`../scripts/`), builder logic (`../packages/`)                            |
| **Users**        | CI pipeline, maintainers managing releases and PRs                                       |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Related: [`../scripts/AGENTS.md`](../scripts/AGENTS.md) -- scripts consumed by CI (test discovery, publish, version updates)

## Tribal Knowledge

**`ci-pass` gate job -- why it exists:** Branch protection needs a single stable status check name. The integration matrix generates ~41 dynamic job names that can't be individually required. `ci-pass` aggregates them into one check.

**`ci-pass` `if: always()` is load-bearing:** Without it, when integration is skipped (no tests discovered), GitHub skips `ci-pass` too. Branch protection then hangs forever waiting for a status that will never arrive.

**Puppeteer cache warming:** Chrome downloads lazily on first use, not during `yarn install`. The build job explicitly triggers the download so Chrome is included in the dependency cache for integration jobs that run Karma tests.

**`ci:full` label -- when to apply:** Apply when changes touch shared infra (root configs, `common`, `scripts/`) where Turbo's affected-package filter may miss downstream breakage. The `labeled` event type on `pull_request` is required for this to work on already-open PRs -- without it, adding the label after PR creation has no effect.
