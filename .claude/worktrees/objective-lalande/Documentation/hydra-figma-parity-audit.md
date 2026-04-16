# Figma ↔ repository parity audit

**Source of truth:** Figma **Colors** / **Customize Theme** in the linked community file; repo primitives (`primaryPrimitiveBlue.ts`, etc.) **mirror** Figma.

**Date (last full pass):** 2026-04-03  
**Figma file:** [Ant Design — DS](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Ant-Design---DS) (`3ghYBXR6XVUEaeBo3D5E4q`)  
**Method:** Official Figma MCP `use_figma` — resolved **Colors** variables in modes `5:0` (Light) and `5:4` (Dark); **Customize Theme** Mode 1 alias resolution for `Color/Primary/*` and `Color/Sidebar/*`.

## Summary (2026-04-03)

| Area | Status | Notes |
|------|--------|--------|
| **Primary `primary-1` … `primary-10` (Light)** | Pass | Repo aligned to Figma; `primary-1` = `#B8EAFF` |
| **Primary full ramp (Dark)** | Pass | Matches repo / `generate` model |
| **Volcano `volcano-1` … `volcano-10` (Light + Dark)** | Pass | Matches [`primaryPrimitiveOrange.ts`](../src/theme/primaryPrimitiveOrange.ts) |
| **`Color/Sidebar/*` aliases** | Pass | Resolve to same hex as repo `sidebarSemanticsLight` (via `Primary/*` + `Neutral/gray-12`) |
| **`Color/Primary/*` (Customize Theme)** | Pass | Aliases match documented `Primary/*` mapping |
| **Button `COMPONENT_SET`** | Pass | Node `35:13238` named `Button`, type `COMPONENT_SET` |
| **Typography (Cairo)** | Pass (code) | [`index.html`](../index.html), [`figmaTypography.ts`](../src/theme/figmaTypography.ts), [`antdTheme.ts`](../src/theme/antdTheme.ts) — re-audit when Figma text styles change |
| **`controlOutline` (orange Button)** | Intentional gap | Code-only `rgba(240,90,35,0.12)` in [`antdTheme.ts`](../src/theme/antdTheme.ts); optional Figma variable later |

## Reconciliation applied (2026-04-03)

Repo previously used `#CFE2E6` for `Primary/primary-1` (Light) while Figma had `#B8EAFF`. **Figma was chosen as authoritative**; [`primaryPrimitiveBlue.ts`](../src/theme/primaryPrimitiveBlue.ts) and docs were updated so `colorPrimaryBg`, `sidebarSemanticsLight.colorSidebarItemSelectedBg`, and related semantics match Figma.

## Re-run

When Figma **Colors** primitives change, update TS + docs, run `npm run build`, and add a dated row or section here.

## Related

- [figma-repo-parity.mdc](../.cursor/rules/figma-repo-parity.mdc)
- [hydra-primary-figma-mapping.md](./hydra-primary-figma-mapping.md)
- [hydra-sidebar-figma-mapping.md](./hydra-sidebar-figma-mapping.md)
