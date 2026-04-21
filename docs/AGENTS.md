# docs/AGENTS.md - Documentation Layout Guide

## Purpose

This file defines the canonical taxonomy for all documentation under `docs/`. Use it to decide where new docs belong and where older docs should migrate when they are superseded.

## Taxonomy

```
docs/
├── standards/     # Long-term standards and conceptual reference material
├── guides/       # How-to, packaging, and usage documentation
├── plans/        # Flat process/implementation plan documents only
├── specs/        # Living design/spec documents that continue to evolve
└── archived/     # Historical/completed/old plan documents
```

## Category Definitions

### `docs/standards/`

Long-lived standards, architecture overviews, and conceptual explanations that guide the project over time.

**Content:** architectural decisions, core concepts, persistent technical standards.

**Example files:** `core-concepts.md`

### `docs/guides/`

How-to documentation, packaging instructions, and usage guides.

**Content:** setup guides, packaging instructions, feature tutorials.

**Example files:** `packaging-guide.md`

### `docs/plans/`

Process and implementation plan documents only. These are flat (no nested project subdirectories). Plans should be periodically archived when they become obsolete.

**Content:** implementation plans, process docs, task breakdowns.

**Constraints:** No nested project namespaces (e.g., no `docs/plans/superpowers/`).

### `docs/specs/`

Living design/spec documents that continue to evolve with feature work. These are design documents that may be updated throughout a feature's lifecycle.

**Content:** feature designs, API designs, component designs, architecture specs.

**Note:** Specs may evolve; when a spec becomes superseded, archive it to `docs/archived/`.

### `docs/archived/`

Historical, completed, or obsolete documents. Preserves context without cluttering active areas.

**Content:** old iteration plans, superseded designs, versioned historical records.

## Migration Rules

1. **Plan lifecycle:** When a plan becomes obsolete, move it to `docs/archived/` instead of deleting it.
2. **Spec lifecycle:** When a spec is superseded by a new version or design, archive it to `docs/archived/`.
3. **Flattening:** Do not create nested project subdirectories under `plans/` or `specs/`. All active docs live at the category root.
4. **No duplication:** Move files rather than copy; old paths should not remain.
5. **Historical grouping:** When archiving related docs, keep them together so the archive stays understandable.

## Constraints

- No `docs/plans/superpowers/` or similar nested project namespaces.
- No `docs/specs/superpowers/` or similar nested project namespaces.
- Additional top-level categories beyond the five defined here are allowed if needed for project-specific organization.

## Quick Reference

| Category     | Purpose                        | Example Files                              |
| ------------ | ------------------------------ | ------------------------------------------ |
| standards/   | Long-term reference            | `core-concepts.md`                         |
| guides/      | How-to and usage               | `packaging-guide.md`                       |
| plans/       | Process/implementation plans    | `2026-03-22-plan.md`                      |
| specs/       | Living design documents        | `api-design.md`, `component-design.md`    |
| archived/    | Historical records             | `0.5.x/`, `iteration-plan.md`             |