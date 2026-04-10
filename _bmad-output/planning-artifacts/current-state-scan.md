# Current State Scan

Date: 2026-04-10
Scope: `sony-wiki` repository, primary runtime `apps/web`

## Repository Classification

- Repository type: monorepo
- Active deployable part: `apps/web`
- Project type: web application
- Primary language: TypeScript
- Architecture pattern: single Next.js runtime with vertical feature slices

## Runtime Truth

- `apps/web` is the only implementation target in this repository.
- `docs/` now serves as the BMAD-style project knowledge layer.
- `_bmad-output/` holds repository-specific planning and implementation artifacts.
- `../sony-wiki-ref/sony-wiki-dev` remains reference-only for migration context.

## Verified Runtime Surface

### Pages

- `/`
- `/wiki`
- `/wiki/[slug]`
- `/color-lab`

### API Routes

- `/api/search`
- `/api/wiki/admin/verify`
- `/api/wiki/admin/catalog`
- `/api/wiki/categories`
- `/api/wiki/categories/[id]`
- `/api/wiki/products`
- `/api/wiki/products/[id]`
- `/api/color-lab/admin/catalog`
- `/api/color-lab/recipes`
- `/api/color-lab/recipes/[id]`
- `/api/color-lab/photos`
- `/api/color-lab/photos/[id]`

## Local Verification Snapshot

Verified on 2026-04-10:

- `npm run test`: pass
- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm run build`: pass

## Functional State

### Shared Shell

- The landing page is no longer a blank placeholder.
- Top navigation is the default shell pattern.
- Global search returns wiki products and categories.
- Theme state persists through `localStorage`, `html[color-scheme]`, and `.dark`.
- Auth remains a UI shell only; there is no production auth flow yet.

### Wiki Vertical

- Public listing and detail flows are backed by typed Supabase query helpers.
- Search, category filters, and compare queue are routed through explicit query-state parsing.
- Compare queue is URL-driven and capped at four products.
- Admin CRUD is available in the new runtime through typed routes and inline admin workspace UI.

### Color Lab Vertical

- Public runtime renders recipes, recipe-bound preview photos, and recipe settings from typed contracts.
- URL query state now supports `q`, `cameraLine`, and `profile`.
- Runtime distinguishes `live`, `seeded-fallback`, and `degraded` states instead of silently dropping to seed data.
- Preview photos resolve from Supabase Storage public URLs.
- Admin catalog and CRUD routes exist for recipes and preview photos, with upload/delete storage flow.

## Architecture Snapshot

- `app/`: route composition, metadata, global CSS, request handling
- `components/layout/`: shell and cross-cutting interactions
- `components/wiki/`: wiki listing, compare, detail helpers, admin UI
- `components/color-lab/`: color-lab runtime and admin UI
- `lib/wiki/`: contracts, queries, mappers, search params, admin helpers
- `lib/color-lab/`: contracts, helpers, mock data, queries, mappers
- `lib/supabase/`: public, browser, server, and admin clients
- `types/`: shared contracts

## Remaining Gaps

- No browser automation or end-to-end verification coverage yet.
- Admin security still depends on a shared password flow rather than full auth/role modeling.
- Wiki media/detail behavior can be richer.
- Color Lab still needs browser automation coverage and stronger auth than shared-password admin.
- CI currently covers `build` and `npm test`, but not separate `lint` or `typecheck` gates.

## Legacy Mapping Snapshot

- Legacy wiki product and specs concepts are now represented through typed domain models and mapper normalization.
- Legacy compare behavior is preserved in simplified form through URL state and compare modal UI.
- Legacy Color Lab concepts are represented through typed recipe/photo contracts, lightbox, transfer guide card, and preset palette inside the newer admin/runtime boundary.
