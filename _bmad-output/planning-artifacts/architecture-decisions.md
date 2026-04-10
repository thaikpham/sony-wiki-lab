# Architecture Decisions

Date: 2026-04-10
Scope: current repository architecture after wiki and color-lab vertical slices

## Decisions

1. `apps/web` remains the single runtime source of truth.
2. BMAD project knowledge for this repo lives in `docs/`, while `_bmad-output/` stores planning and implementation artifacts.
3. Public read access must go through typed query helpers, not ad hoc Supabase calls inside pages or UI components.
4. Admin mutations remain route-based and service-role-backed until a stronger auth/role model is introduced.
5. `Wiki` and `Color Lab` share the same admin password verification pattern for now.
6. Color Lab public runtime may use seeded fallback only when real records are absent, and must surface a degraded banner when live fetch fails.
7. Color Lab preview photos are stored in Supabase Storage and belong to exactly one recipe in the new runtime model.
8. Top-navigation-only is the default shell pattern for the application.

## Boundary

- `app/`
  - route composition
  - metadata
  - API request handling
- `components/layout/`
  - navigation, search, theme, auth shell
- `components/wiki/`
  - listing, compare, detail support, admin workspace
- `components/color-lab/`
  - recipe library, preview workflow, admin workspace
- `lib/wiki/`
  - wiki contracts, queries, mappers, admin helpers
- `lib/color-lab/`
  - color-lab contracts, helpers, queries, mappers
- `lib/supabase/`
  - public/browser/server/admin clients
- `types/`
  - shared domain contracts

## Domain Model

### Wiki

- `WikiCategory`
- `WikiSpecEntry`
- `WikiSpecGroup`
- `WikiProductListItem`
- `WikiProductDetail`
- `WikiAdminProduct`

### Search

- `SearchResultItem`
- `SearchResponse`

### Color Lab

- `ColorLabRecipe`
- `ColorLabRecipeSettings`
- `ColorLabLoadState`
- `ColorLabPhoto`

## Mapping Policy

- Wiki `specs` JSON is normalized into grouped specs in the mapper layer.
- Existing grouped spec payloads are preserved when they already match the target structure.
- Color Lab JSON fields for `color` and `settings` are normalized with safe defaults.
- Color Lab storage metadata is normalized into public `url` fields in the mapper layer.
- Pages and UI components consume normalized domain objects only.

## Operational Notes

- Theme tokens are authoritative in `apps/web/app/globals.css`.
- Admin auth uses a signed cookie session after password verification.
- CI does not yet replace the need for local `lint` and `typecheck` verification.
