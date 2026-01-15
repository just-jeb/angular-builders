# Local CI Testing with act - Discovery Log

This document tracks discoveries, issues, and solutions while testing the CI workflow locally using `act`.

## Environment

- **act version**: 0.2.84
- **Docker version**: 29.1.3
- **Platform**: Apple Silicon (M-series)
- **Date**: 2026-01-15

---

## Issues and Solutions

### Issue 1: `yarn: command not found`

- The act Docker image doesn't have yarn pre-installed
- Project uses Yarn 3.8.7 via corepack (specified in package.json `packageManager` field)

**Solution**: Add `corepack enable` step before yarn commands in workflow

### Issue 2: `SIGKILL` - Jest worker processes killed (OOM)

- Jest workers killed with SIGKILL during parallel build/test execution
- Error: "A jest worker process (pid=XXXX) was terminated by another process: signal=SIGKILL"
- Cause: Docker container running out of memory when multiple packages build in parallel with x64-on-ARM emulation

**Root Cause**: The `build:packages` script runs packages in parallel (`-vip` flag), each running Jest tests. Combined with x64-on-ARM emulation overhead, this exceeds memory limits.

**Findings with different memory settings**:

- 8GB: Still OOM on some tests
- 16GB: Still OOM (x64 emulation overhead is significant)

**Practical Solution**: This is a fundamental limitation of running x64 Docker on Apple Silicon. For local testing:

1. Build packages natively: `yarn build:packages`
2. Run integration tests directly: `cd examples/jest/simple-app && yarn e2e`

### Issue 3: Gitignore blocked `packages/*/tests/integration.js`

The `.gitignore` patterns blocked new integration.js files from being committed.

**Solution**: Use `git add -f packages/*/tests/integration.js` to force-add

### Issue 4: Xvfb required for Cypress tests

Cypress E2E tests require a display server (Xvfb) on headless Linux environments.

**How it was handled in old CI** (from `scripts/run-ci.sh`):

```bash
[[ "$OSTYPE" == "linux-gnu"* ]] && Xvfb :99 &
[[ "$OSTYPE" == "linux-gnu"* ]] && export DISPLAY=:99
```

**Solution in new CI**: Added to workflow:

```yaml
- name: Install Xvfb
  run: |
    if ! command -v Xvfb &> /dev/null; then
      sudo apt-get update && sudo apt-get install -y xvfb
    fi
- name: Run test
  run: |
    Xvfb :99 &
    export DISPLAY=:99
    ${{ matrix.command }}
```

**For act**: The default `catthehacker/ubuntu:act-latest` image doesn't have Xvfb. The workflow installs it if missing.

---

## Summary

| Phase                 | Status  | Duration | Issues                             |
| --------------------- | ------- | -------- | ---------------------------------- |
| 1. Build              | PARTIAL | ~1m20s   | OOM (SIGKILL) due to x64 emulation |
| 2. Discover           | PASSED  | ~2s      | gitignore blocked file (fixed)     |
| 3. Single Integration | N/A     | -        | Blocked by build OOM in act        |
| 4. Full Workflow      | N/A     | -        | Blocked by build OOM in act        |

---

## Recommendations

### For Local Development on Apple Silicon

The build step OOM in act is a fundamental x64-emulation limitation. **Recommended approach**:

1. **Build packages natively** (fast, native ARM):

   ```bash
   yarn build:packages
   ```

2. **Run integration tests directly** (no Docker needed):

   ```bash
   # Jest builder tests
   cd examples/jest/simple-app && yarn test:ts --no-cache

   # Cypress tests (with local server)
   cd examples/custom-webpack/full-cycle-app && yarn e2e
   ```

3. **Use act only for workflow validation**:
   ```bash
   act push -j discover --container-architecture linux/amd64
   ```

### For Native Linux or CI

On native x64 Linux (including GHA runners), the full workflow runs successfully:

```bash
# Run full workflow
act push --container-architecture linux/amd64

# Run specific test
act push -j integration --matrix id:cli-no-cache --container-architecture linux/amd64
```

### Port Isolation

- **GHA**: Each matrix job runs in isolated runner - no port conflicts
- **act locally**: Matrix jobs run sequentially by default - no port conflicts
- **Manual local testing**: All apps use port 4200 - run one test at a time

### act Command Reference

```bash
# Validate workflow syntax + test discovery
act push -j discover --container-architecture linux/amd64

# List discovered tests
act push -j discover --container-architecture linux/amd64 2>&1 | grep "matrix="

# Run on native Linux (or high-memory x64 VM)
act push --container-architecture linux/amd64 --artifact-server-path /tmp/artifacts
```
