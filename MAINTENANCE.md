# Intent Layer Maintenance

This document describes how to keep the Intent Layer (`AGENTS.md` files) in sync with code changes.

## Pre-Commit Update

Before committing changes that affect a semantic boundary, update the relevant AGENTS.md file(s):

1. **Identify affected nodes.** If your change touches files in `packages/custom-esbuild/src/`, the affected node is `packages/custom-esbuild/AGENTS.md`. If the change affects cross-package behavior (e.g., `merge-schemes.ts`), update the root `AGENTS.md` and any referencing package nodes.

2. **Update only what changed.** Focus on:
   - New or modified invariants
   - New entry points or changed contracts
   - New pitfalls discovered during development
   - Dependency changes that affect downstream consumers

3. **Do not restate code.** Intent Nodes capture what is NOT obvious from reading the code. If a change is self-explanatory from the diff, no AGENTS.md update is needed.

## When to Add a New Node

Create a new AGENTS.md when:

- A new package is added to `packages/`
- A new example app is added to `examples/`
- A new directory is created that represents a semantic boundary (see root AGENTS.md for boundary types)

## When to Remove a Node

Remove an AGENTS.md when:

- The directory it covers is deleted
- The boundary it represents is merged into another

## Agent Feedback Integration

If an AI agent reports confusion or makes mistakes in a specific area:

1. Identify the relevant AGENTS.md node
2. Add the confusion point to the Pitfalls table
3. If the agent followed an anti-pattern, add it to the Patterns section

## SME Interview Refresh

To enrich Intent Nodes with tribal knowledge, re-run the Intent Layer generator to create fresh SME interview templates. SMEs fill in answers and set `status: complete`, then re-run the generator to merge answers into AGENTS.md nodes.

## File Inventory

| File                   | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `AGENTS.md` (root)     | Repository overview, navigation table, cross-cutting concerns     |
| `CLAUDE.md` (each dir) | Bridge file that references the local AGENTS.md                   |
| `packages/AGENTS.md`   | Architectural layer overview for all builder packages             |
| `packages/*/AGENTS.md` | Per-package builder context                                       |
| `examples/AGENTS.md`   | Test fixtures boundary -- signals agents away from this directory |
| `scripts/AGENTS.md`    | CI and build infrastructure scripts                               |
