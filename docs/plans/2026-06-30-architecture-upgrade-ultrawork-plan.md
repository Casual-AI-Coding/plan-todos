# Architecture Upgrade Ultrawork Plan

**Date:** 2026-06-30
**Mode:** Inline ultrawork execution on the current branch
**Operator:** Sisyphus

## 方案

The repository has already completed part of the earlier DDD migration: domain folders exist, shared entity query policies exist, and plan/todo/circulation/milestone queries already depend on reusable domain hooks. The remaining architectural risk is no longer a single missing layer; it is uneven boundary quality across frontend API adapters, duplicated domain literals, oversized UI/backend modules, and stale documentation that still describes pre-migration gaps.

This plan supersedes the stale assumptions in `docs/plans/2026-04-27-ddd-architecture-upgrade-plan.md` without deleting that historical document. The upgrade proceeds through small verified slices instead of a broad rewrite.

## Architecture Principles

1. **DDD boundary first:** external systems such as Tauri commands must be parsed into typed application errors before domain or UI code handles them.
2. **One concept, one name:** status unions and shared domain primitives should flow from `src/domain/shared/domainTypes.ts`, not be re-declared in feature modules.
3. **Behavior-preserving refactor:** no UI redesign, backend schema change, or API contract change in the first slice.
4. **TDD before production edits:** every behavior change starts with a failing Vitest assertion and then the minimal implementation.
5. **Frequent atomic commits:** documentation, tests, and implementation are committed as separable checkpoints after verification.

## Current Findings

### Completed DDD Work

- `src/domain/shared/entityQueries.ts` centralizes TanStack Query CRUD/reorder hooks.
- `src/domain/shared/entityQueryKeys.ts`, `entityQueryCache.ts`, `entityReorder.ts`, and `entityErrors.ts` provide reusable policies.
- Feature query modules already consume the shared entity hook factory.

### Remaining Risks

- `src/lib/api/utils.ts` is imported by many API adapters but still throws bare `Error` instances, which makes boundary failures harder to classify.
- Plan and todo feature types duplicate status unions already defined by `src/domain/shared/domainTypes.ts`.
- Several UI and backend files exceed the 250 pure-LOC review ceiling, including `SettingsSyncView.tsx`, `CirculationsView.tsx`, `ThemeSelector.tsx`, `src-tauri/src/db.rs`, and notification commands. These require separate behavior-locked slices.
- `src-tauri/src/commands/batch.rs` accepts an `archived` todo status while the frontend shared todo status union does not. This is a later cross-boundary validation slice, not part of the first API-error slice.

## First Implementation Slice

### Goal

Introduce typed Tauri boundary errors while preserving all current messages and caller behavior.

### Files

- Modify: `src/lib/api/utils.test.ts`
- Modify: `src/lib/api/utils.ts`

### Scenario Contract

1. **Unavailable Tauri boundary:** `ensureTauri("Operation")` still throws the existing English or Chinese message when outside Tauri, but the thrown value is a `TauriUnavailableError` exposing `operation`.
2. **Operation failure boundary:** `withTauriError("Operation", fn)` still prefixes the existing message, but wraps the thrown value in `TauriOperationError` exposing `operation` and `cause`.
3. **Non-Error causes:** string, null, and undefined failures keep the existing message text so current adapters and tests do not regress.
4. **Happy path:** successful Tauri operations still return the original result unchanged.

## Plan

### Task 1: Documentation Checkpoint

- Add this active plan under `docs/plans/`.
- Verify it follows the repository docs taxonomy.
- Commit as `docs: add architecture upgrade ultrawork plan` after git-master style detection.

### Task 2: RED Test

- Extend `src/lib/api/utils.test.ts` to import `TauriUnavailableError` and `TauriOperationError`.
- Add assertions for typed class identity, `operation`, and `cause`.
- Run `npm run test -- src/lib/api/utils.test.ts`.
- Expected RED: imports or class assertions fail because the typed errors do not exist yet.

### Task 3: GREEN Implementation

- Add `TauriUnavailableError` and `TauriOperationError` to `src/lib/api/utils.ts`.
- Replace bare boundary `Error` throws with the typed errors.
- Preserve current message strings exactly.
- Run the focused Vitest file until green.

### Task 4: Focused Verification

- Run LSP diagnostics on `src/lib/api/utils.ts` and `src/lib/api/utils.test.ts`.
- Run `npm run test -- src/lib/api/utils.test.ts`.
- Run `npm run typecheck`.
- Run `npm run lint` if typecheck passes.

### Task 5: Atomic Commit

- Commit implementation and tests together because they are one TDD unit.
- Use semantic English commit style with the required Sisyphus body and co-author trailer.

## Review Plan

After the first slice, review for:

- No changed public messages.
- No `any`, `@ts-ignore`, `@ts-expect-error`, non-null assertion, or speculative fallback.
- Typed errors remain at the Tauri adapter boundary and do not leak extra branching into callers.
- Focused tests fail without the implementation and pass with it.

## Later Slices

1. Converge duplicated plan/todo status types on `src/domain/shared/domainTypes.ts`.
2. Lock and align Rust/frontend todo status validation, especially the `archived` mismatch.
3. Split oversized UI view modules by view state, data orchestration, and presentational components.
4. Split oversized Rust command/database modules by command boundary and persistence concern.
5. Refresh or archive stale architecture docs once the active slices replace their assumptions.
