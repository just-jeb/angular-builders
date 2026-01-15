# Local CI Testing with act - Discovery Log

This document tracks discoveries, issues, and solutions while testing the CI workflow locally using `act`.

## Environment

- **act version**: 0.2.84
- **Docker version**: 29.1.3
- **Platform**: Apple Silicon (M-series)
- **Date**: 2026-01-15

---

## Phase 1: Build Job

**Command**: `act push -j build --container-architecture linux/amd64`

### Status: IN PROGRESS

### Discoveries

1. act requires initial config - created `~/Library/Application Support/act/actrc` with medium image
2. Node 20.19.0 downloads and installs successfully
3. Cache action works (cache miss expected on first run)

### Issues Found

**Issue 1**: `yarn: command not found`

- The act Docker image doesn't have yarn pre-installed
- Project uses Yarn 3.8.7 via corepack (specified in package.json `packageManager` field)
- Need to enable corepack before running yarn

### Solutions Applied

**Solution 1**: Add `corepack enable` step before yarn commands in workflow

**Issue 2**: `SIGKILL` - Jest worker processes killed (OOM)

- Jest workers being killed with SIGKILL during parallel test execution
- Error: "A jest worker process (pid=XXXX) was terminated by another process: signal=SIGKILL"
- Cause: Docker container running out of memory when multiple packages build in parallel
- Each package runs Jest tests during `postbuild`

**Solution 2**: OOM in act due to parallel builds + x64 emulation on ARM

**Findings**:

- 8GB: Still OOM on some tests
- 12GB: Full image too large to pull
- 16GB: Still OOM (x64 emulation overhead)

**Root Cause**: The `build:packages` script runs packages in parallel (`-vip` flag),
each running Jest tests. Combined with x64-on-ARM emulation overhead, this exceeds memory limits.

**Decision**: This is an act-specific limitation, not a workflow issue. Real GHA runners
have native x64 and more resources. We will:

1. Test discover job separately (no heavy compilation)
2. Verify workflow syntax is correct
3. Accept that full local testing may require native Linux or more resources

---

## Phase 2: Build + Discover

**Command**: `act push -j discover --container-architecture linux/amd64`

### Status: COMPLETED (discover only)

### Discoveries

1. Discover job runs fast (~2 seconds)
2. Matrix JSON properly formatted with 41 tests:
   - bazel: 1 test
   - custom-esbuild: 13 tests
   - custom-webpack: 13 tests
   - jest: 15 tests

### Issues Found

**Issue 3**: `packages/custom-webpack/tests/integration.js` was blocked by gitignore

The `.gitignore` has patterns that blocked the file from being committed normally.

### Solutions Applied

**Solution 3**: Use `git add -f` to force-add the file to git tracking

---

## Phase 3: Single Integration Test

**Command**: `act push -j build -j discover -j integration --matrix id:karma-builder-sanity-app --container-architecture linux/amd64`

### Status: PENDING

### Discoveries

(To be filled)

### Issues Found

(None yet)

### Solutions Applied

(None yet)

---

## Phase 4: Full Workflow + Port Isolation

**Command**: `act push --container-architecture linux/amd64`

### Status: PENDING

### Port Isolation Testing

Key question: Do parallel integration jobs conflict on ports when running locally via `act`?

**Options if port conflicts occur**:

1. `--container-options "--network=host"` - Uses host network (may still conflict)
2. Sequential execution with `--job` flags
3. Rely on Cypress automatic port discovery
4. Use `--container-options "--network=bridge"` with separate networks per job

### Discoveries

(To be filled)

### Issues Found

(None yet)

### Solutions Applied

(None yet)

---

## Summary

| Phase                 | Status  | Duration | Issues |
| --------------------- | ------- | -------- | ------ |
| 1. Build              | PENDING | -        | -      |
| 2. Discover           | PENDING | -        | -      |
| 3. Single Integration | PENDING | -        | -      |
| 4. Full Workflow      | PENDING | -        | -      |

---

## Final Recommendations

(To be filled after all phases complete)
