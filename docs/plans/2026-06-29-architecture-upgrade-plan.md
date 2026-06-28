# Architecture Upgrade Plan

## Goal

Upgrade the current front-end/domain architecture with a safe, test-first slice that improves cohesion, removes avoidable coupling, and creates a repeatable DDD-oriented pattern for later entity modules.

## Current Baseline

- The codebase already has a partial domain layer under `src/domain/*` and compatibility shims under `src/lib/services/*`.
- `src/domain/shared/entityQueries.ts` centralizes too many responsibilities: React Query hook creation, query key construction, cache invalidation, cache patching, optimistic reorder, fallback entity lookup, and error construction.
- The shared query factory is near the 250 pure-LOC warning threshold and contains type assertions around update payloads and reorder payloads.
- Tests exist for the factory, but they only verify query key shape. They do not lock the pure cache/reorder semantics before refactoring.

## Architecture Decision

Use an incremental DDD upgrade rather than a whole-repository rewrite.

The first slice extracts shared query behavior into focused modules:

- `entityQueryKeys.ts` owns query key construction.
- `entityQueryCache.ts` owns cache invalidation and list patching policies.
- `entityReorder.ts` owns reorder input and optimistic sorting semantics.
- `entityErrors.ts` owns typed domain errors for shared entity lookup and hook configuration failures.
- `entityQueries.ts` remains the React Query adapter that wires those policies into hooks.

This keeps domain policy reusable and independently testable while leaving the external hook API stable for `todoQueries`, `planQueries`, `targetQueries`, `milestoneQueries`, and circulation equivalents.

## SOLID/DDD Mapping

- SRP: split cache, keys, reorder, and errors from the hook factory.
- OCP: new entities can provide adapters/config without changing internal factory logic.
- DIP: shared query behavior depends on small function contracts, not concrete entity modules.
- Domain language: shared entity concerns become named concepts instead of anonymous inline closures.
- Compatibility: existing feature query modules keep their public exports unchanged.

## Implementation Plan

1. Add characterization tests for shared entity query key/cache/reorder behavior.
2. Run the new tests before production edits and confirm the current code does not yet expose the desired test seams.
3. Extract typed shared modules from `entityQueries.ts` without changing consumer APIs.
4. Remove unsafe type assertions from the hook factory by introducing typed update/reorder helper contracts.
5. Run focused tests after each extraction, then run typecheck/lint/build gates.
6. Commit in atomic checkpoints: plan, tests, implementation, verification fixes if needed.

## Verification Plan

- Focused tests: `npm run test -- src/domain/shared/__tests__/entityQueries.test.ts`
- Domain tests: `npm run test -- src/domain/shared/__tests__/entityQueries.test.ts src/domain/todo/__tests__/todoQueries.test.ts src/domain/plan/__tests__/planQueries.test.ts`
- Type safety: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`

## Out Of Scope

- No global UI redesign.
- No migration from npm/ESLint/Prettier to alternate tooling.
- No Rust/Tauri backend restructuring in this slice.
- No deletion of existing compatibility shims until all imports are migrated in a later slice.
