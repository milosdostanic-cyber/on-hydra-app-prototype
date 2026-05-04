# Hydra — tokens + existing components (agent checklist)

**Sources:** `.cursor/rules/hydra-ui-tokens.mdc`, `.cursor/rules/ux-guardrails.mdc`, `.cursor/rules/hydra-ux-composition.mdc`, `AGENTS.md`.

## Imports and APIs (code)

- UI primitives: import from **`src/ui/antd.ts`** (project barrel), not ad-hoc antd paths unless the codebase already does elsewhere for a reason.
- **Colors / spacing / radii / motion:** `theme.useToken()` from antd, **`shellLayout`** from `src/theme/hydraAlias`, **`sidebarSemanticsLight`** when sidebar/menu chrome applies.
- **Typography:** `Typography` from antd + **`theme.token` font sizes**; role metrics from **`src/theme/figmaTypography.ts`**. Do **not** set `fontSize` / `lineHeight` / `fontWeight` / `fontFamily` ad hoc on screens for design intent.
- **Allowed literal color/size homes** (Figma mirrors only): `figmaTypography.ts`, `figmaSemanticColors.ts`, `primaryPrimitiveBlue.ts`, `primaryPrimitiveOrange.ts`, `buttonPrimaryPalette.ts`, `sidebarSemantics.ts`, `figmaMenuMetrics.ts` — do not invent new hex/ramp files without the Figma parity workflow.

## Banned in TSX/CSS for design intent

- Inline **`#hex`**, **`rgb`/`rgba`**, arbitrary **`px`** for spacing/radius/type (use tokens / `shellLayout` / theme).
- Raw typography tuning on screens (use tokens + `figmaTypography`).

## Narrow exceptions

- `transparent`, `none`, structural `100%` / `100vh` for layout mechanics.
- Do not edit `node_modules`.

## Components and scope (UX guardrails)

- Use **existing Ant Design** and **existing approved** product components **as-is**.
- **Never** create new **core** shared components; **never** modify shared/core component structure, styles, behavior, or tokens.
- **Never** create or modify **design tokens** in theme files unless explicitly approved as a system change.
- Prefer **existing screen patterns**; if none fit, **local screen-level composition** only (same session: unchanged tokens, unchanged shared components, local to one screen/flow).
- **One clear primary CTA** per context; secondaries must not compete; destructive must not look primary unless intended.
- Cover **states:** default, loading, empty, error, success, disabled, read-only, no results, missing data.
- **Scope:** only the requested screen/flow; if shared impact — stop and ask.

## Figma / theme parity

If work touches **primitives, semantic colors, typography registry, Ant Design theme, or brand CSS vars**, follow **`.cursor/rules/figma-repo-parity.mdc`** (repo + Figma stay aligned unless user says code-only).

## Related docs in repo

- `Documentation/hydra-typography.md`
- `Documentation/hydra-sidebar-figma-mapping.md`
- `Documentation/hydra-button-primary-orange.md` (if touching orange primary button)
