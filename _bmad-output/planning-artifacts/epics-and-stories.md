# Epics And Stories

Date: 2026-04-10

## Epic 1: Runtime Foundation

### Story 1.1
As a maintainer, I want the repository to use a TypeScript-first toolchain so runtime configuration matches the application language.

Acceptance criteria:
- repo-authored tooling files are TypeScript-authored
- shared domain contracts are explicit
- root workflows can run `test`, `typecheck`, `lint`, and `build`

Status:
- Completed

### Story 1.2
As a maintainer, I want a stable top-level shell so new vertical slices can plug into a consistent app frame.

Acceptance criteria:
- app shell uses a single layout pattern
- theme switching is hydration-safe
- global search is available from the shell

Status:
- Completed

## Epic 2: Wiki Runtime

### Story 2.1
As an internal user, I want `/wiki` to render real catalog data with explicit route state.

Acceptance criteria:
- listing is Supabase-backed
- category filter preserves URL state
- search params are parsed through a typed helper

Status:
- Completed

### Story 2.2
As an internal user, I want to compare multiple products without leaving the wiki runtime.

Acceptance criteria:
- compare selection is stored in the URL
- compare queue is capped at four items
- compare modal renders normalized grouped specs

Status:
- Completed

### Story 2.3
As an internal admin, I want to manage categories and products from the new runtime.

Acceptance criteria:
- admin verification works through a dedicated route
- categories support create, update, delete
- products support create, update, delete, publish state
- runtime refreshes after successful mutations

Status:
- Completed

### Story 2.4
As a maintainer, I want the wiki detail experience to feel less transitional.

Acceptance criteria:
- richer media behavior for detail pages
- clearer related-content or cross-linking strategy
- smoke coverage for detail and compare flows

Status:
- Pending

## Epic 3: Color Lab Runtime

### Story 3.1
As an internal user, I want `/color-lab` to show a real runtime rather than a placeholder page.

Acceptance criteria:
- recipes and photos are rendered through typed contracts
- runtime can read from Supabase
- runtime falls back safely to mock data

Status:
- Completed

### Story 3.2
As an internal admin, I want to manage recipes and preview photos in the new runtime.

Acceptance criteria:
- admin catalog route exists
- recipes support create, update, delete
- photos support create, update, delete
- runtime refreshes after mutations

Status:
- Completed

### Story 3.3
As a maintainer, I want Color Lab media and compatibility workflows to be production-ready.

Acceptance criteria:
- storage strategy is defined
- compatibility relationships are documented
- browser coverage exists for the admin workflow

Status:
- Pending

## Epic 4: Quality And Hardening

### Story 4.1
As a maintainer, I want repo documentation to match the actual runtime and BMAD boundaries.

Acceptance criteria:
- root docs reflect current routes and architecture
- `docs/` acts as project knowledge
- `_bmad-output/` reflects the current runtime state

Status:
- Completed

### Story 4.2
As a maintainer, I want automation coverage for shell and admin critical paths.

Acceptance criteria:
- browser smoke tests cover navigation and search
- browser smoke tests cover wiki admin happy path
- browser smoke tests cover color-lab admin happy path

Status:
- Pending

### Story 4.3
As a maintainer, I want CI and local gates to tell the same story.

Acceptance criteria:
- CI runs the same meaningful gates used locally
- build, test, lint, and typecheck expectations are documented

Status:
- Pending
