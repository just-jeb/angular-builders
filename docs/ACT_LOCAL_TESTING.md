# Local CI Testing

This document describes approaches for testing CI locally and related discoveries.

## Quick Start - Local Test Runner

The recommended way to run integration tests locally is the native test runner:

```bash
# Run all integration tests in parallel
yarn test:local

# Run tests for a specific package
yarn test:local --package custom-webpack

# Run specific tests by ID
yarn test:local --id browser-builder-basic --id esm-package-default

# Limit concurrency (useful for memory-constrained systems)
yarn test:local --concurrency 4

# Verbose output
yarn test:local --verbose
```

### Features

- **Parallel execution**: All tests run simultaneously by default
- **Port isolation**: Uses `port: 0` in all Angular apps for automatic port assignment
- **Same test definitions**: Uses the same `packages/*/tests/integration.js` files as CI
- **Native performance**: No Docker overhead, runs directly on your machine

### Example Output

```
Discovering tests...

Found 13 test(s) to run

Running all tests in parallel

------------------------------------------------------------

PASS [10.5s] karma-builder-sanity-app: Karma builder executes unit tests
PASS [18.5s] karma-builder-sanity-app-esm: Karma builder works in ESM package
PASS [26.5s] browser-builder-basic: Browser + dev-server work with no custom config
...

------------------------------------------------------------

Results: 13 passed, 0 failed (30.9s total)

All tests passed!
```

---

## How Port Isolation Works

All example apps have `port: 0` configured in their `angular.json` serve options:

```json
{
  "serve": {
    "options": {
      "port": 0
    }
  }
}
```

This tells Angular CLI to automatically select an available port. The Cypress schematic (`@cypress/schematic:cypress`) receives the actual port via `devServerTarget` and passes it to Cypress, overriding any hardcoded `baseUrl`.

**Result**: Multiple e2e tests can run in parallel without port conflicts.

---

## Alternative: act for Full Workflow Testing

`act` can run the full GitHub Actions workflow locally using Docker.

### Prerequisites

```bash
brew install act
```

### Known Issues on Apple Silicon

The `act` tool runs x64 Docker containers on ARM Macs via emulation. This causes:

1. **OOM during build**: Parallel Jest execution exceeds memory limits
2. **Slow performance**: x64 emulation adds significant overhead

### Practical act Usage

```bash
# Test workflow discovery (lightweight, works well)
act push -j discover --container-architecture linux/amd64

# List discovered tests
act push -j discover --container-architecture linux/amd64 2>&1 | grep "matrix="

# On native x64 Linux (or high-memory VM), full workflow works:
act push --container-architecture linux/amd64 --artifact-server-path /tmp/artifacts
```

### When to Use act vs Local Runner

| Scenario                      | Recommended Approach           |
| ----------------------------- | ------------------------------ |
| Run integration tests locally | `yarn test:local`              |
| Test workflow YAML syntax     | `act push -j discover`         |
| Validate matrix discovery     | `act push -j discover`         |
| Debug CI-specific issues      | Push to branch, check GHA logs |
| Full workflow on native x64   | `act push`                     |

---

## CI Architecture Reference

See [CI_ARCHITECTURE.md](CI_ARCHITECTURE.md) for the full CI architecture documentation.

### GitHub Actions Summary

| Job         | Duration      | Description                        |
| ----------- | ------------- | ---------------------------------- |
| build       | ~3m           | Build packages + run unit tests    |
| discover    | ~3s           | Discover 41 integration tests      |
| integration | ~2-3m         | Run all tests in parallel (matrix) |
| publish     | (conditional) | Only on master/dispatch            |

**Total CI time**: ~6-7 minutes

---

## Development Workflow

### Build + Test All

```bash
# Build packages
yarn build:packages

# Run all integration tests
yarn test:local
```

### Test Single Package

```bash
# Build changed package
yarn workspace @angular-builders/custom-webpack run build

# Run its tests
yarn test:local --package custom-webpack
```

### Test Single Test

```bash
yarn test:local --id browser-builder-basic --verbose
```

---

## Troubleshooting

### "Port already in use" errors

All apps should have `port: 0` in angular.json. If not:

```bash
# Quick fix - specify port at runtime
cd examples/custom-webpack/sanity-app
yarn ng e2e --port 0
```

### Cypress "Xvfb not found" (Linux only)

```bash
sudo apt-get install xvfb
Xvfb :99 &
export DISPLAY=:99
```

### act OOM on Apple Silicon

Use the native local runner instead:

```bash
yarn test:local
```
