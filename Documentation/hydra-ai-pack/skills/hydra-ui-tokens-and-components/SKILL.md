---
name: hydra-ui-tokens-and-components
description: >-
  Enforce Hydra design tokens and existing Ant Design / product components for this repo.
  Use when implementing or reviewing UI, screens, layouts, forms, tables, theme usage,
  spacing, colors, typography, or when the user says tokens, design system, antd, Hydra,
  figmaTypography, shellLayout, or "use existing components". Prevents new core components,
  token changes, and raw hex/px typography. Points agents to src/ui/antd and theme.useToken().
license: Proprietary
metadata:
  project: on-hydra-app-prototype
  version: "1.0.0"
---

# Hydra UI — tokens + existing components

## When to apply

Any task that adds or changes **React UI** in this repository: pages, layouts, prototypes, Ant Design composition, or visual polish.

## Do this

1. **Import UI** from **`src/ui/antd.ts`** (project barrel).
2. **Styling:** `theme.useToken()`, **`shellLayout`** (`src/theme/hydraAlias`), semantic theme fields — not inline brand hex or arbitrary px for design intent.
3. **Typography:** antd `Typography` + `theme.token` sizes; **`src/theme/figmaTypography.ts`** for font roles — no ad-hoc `fontSize` / `lineHeight` / `fontWeight` / `fontFamily` on screens for design intent.
4. **Reuse** existing patterns and Ant Design components **as-is**; **do not** edit shared/core components or theme token maps unless the user explicitly approves a system-wide change.
5. **One primary CTA** per context; consider loading / empty / error / disabled states.
6. **Stay in scope** — only the screen or flow the user asked for.

## Do not do this

- New **core** shared components, or edits to shared/core component APIs/styles/behavior.
- **New or changed design tokens** without explicit approval and Figma parity where required.
- **`#hex`**, **`rgb`/`rgba`**, or stray **`px`** for spacing, radius, or type (see `.cursor/rules/hydra-ui-tokens.mdc`).
- Inventing a **new global pattern** when an existing Hydra pattern already fits.

## Allowed escape hatch

**Local screen-level composition:** combine existing antd + approved pieces into a one-off layout **only** if no pattern fits, tokens stay unchanged, shared components stay untouched, and the change stays local.

## Longer reference (markdown pack)

For a printable checklist, also load:

`Documentation/hydra-ai-pack/rules/hydra-tokens-and-components.md`

## Authority order

1. `.cursor/rules/hydra-ui-tokens.mdc`
2. `.cursor/rules/ux-guardrails.mdc`
3. `.cursor/rules/hydra-ux-composition.mdc`
4. `.cursor/rules/figma-repo-parity.mdc` (if touching theme/primitives)
5. `AGENTS.md`

If this skill conflicts with those, follow the files above.
