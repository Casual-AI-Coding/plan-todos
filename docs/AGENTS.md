# docs/AGENTS.md - Documentation Layout Guide

## Purpose

This directory contains the repository's long-lived documentation. Use this guide to decide where new docs belong and where older docs should move when they are superseded.

## Canonical Layout

- `docs/` — long-term standards, explanations, and reference material
- `docs/archived/` — historical records, superseded plans, and versioned past work
- `docs/plans/` — current designs, solution writeups, and active planning docs
- `docs/specs/` — executable specs and implementation-ready specifications

## Placement Rules

### `docs/`

Put stable, long-lived material here when it is meant to guide the project over time.

Examples:

- architecture overviews
- conceptual explanations
- packaging or release guidance
- repo-wide reference notes

### `docs/plans/`

Use for active design docs and solution proposals that are still relevant to current work.

Examples:

- feature designs
- component designs
- API designs
- implementation plans that are still current

### `docs/specs/`

Use for executable specs that are expected to drive implementation directly.

Examples:

- release-ready specs
- roadmap/spec documents
- implementation-scoped design specs

### `docs/archived/`

Use for material that is no longer current but should remain available for historical context.

Examples:

- superseded designs
- completed iteration notes
- old versioned plans
- archived research or task breakdowns

## Migration Rules

1. When a plan becomes obsolete, move it to `docs/archived/` instead of deleting it.
2. Keep the original version naming when it helps preserve history.
3. Prefer moving related historical files together so the archive stays understandable.
4. Avoid adding new documents to `docs/archived/`; archive should only grow from completed history.

## Current Repository Conventions

- Root-level long-term references such as `core-concepts.md` and `packaging-guide.md` live directly under `docs/`.
- Active design materials live under `docs/plans/`.
- Superpowers plans belong under `docs/plans/superpowers/`.
- Superpowers specs belong under `docs/specs/`.
- Versioned legacy material belongs under `docs/archived/`.
