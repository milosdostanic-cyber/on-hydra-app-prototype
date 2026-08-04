# Plan: Content Download Center (screenshot parity)

## Meta
- **Date:** 2026-07-13
- **Request type:** `ui-screenshot`
- **User request summary:** Rebuild Content (`/projects/:id/content`) Download Center to match provided screenshot (parts table, category empty state, footer CTA).
- **Status:** approved for implementation in same session (user asked to build)
- **Plan file:** `Documents/plans/2026-07-13-content-download-center-screenshot-plan.md`

## Orchestration for planning (this run)

### Explicit skills and rules used
| Name | Type | Path | Why selected |
|------|------|------|--------------|
| `@prd-ux-implementation-planner` | skill | `.cursor/skills/prd-ux-implementation-planner/SKILL.md` | Scope + phased plan |
| `@hydra-design-to-code` | rule | `.cursor/rules/hydra-design-to-code.mdc` | Screenshot → tokens/components |
| `@hydra-ux-audit` | skill | `.cursor/skills/hydra-ux-audit/SKILL.md` | Quality gate after UI |

### Implicit rules (always active)
| Invoke | Path | Why relevant |
|--------|------|--------------|
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Targeted reads |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | Content download only |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | Clear CTA / non-technical copy |
| `@ux-guardrails` | `.cursor/rules/ux-guardrails.mdc` | Reuse Ant Design |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | No raw hex/px |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Card + table composition |

### Not used (and why)
| Name | Why skipped |
|------|-------------|
| Figma MCP | Screenshot only — no Figma URL |
| BOM PRD | Not BOM feature |

## Implementation invocation

```
@hydra-design-to-code
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@hydra-ux-audit
```

## Scope summary

- Route stays `/projects/:projectId/content` (`ContentModule`).
- Nav label stays **Content**; page title **Download Center**.
- Replace list-based queue UI with screenshot layout: header stats, parts `Table`, category empty table, summary footer + primary **Download All Files**.
- Extend queue item metadata so rows can show part name / figure / file badge.

## Current flow audit

1. Part Search → Send to Download Center → session queue (`revitDownloadQueue`).
2. Open Content → `ContentModule` shows List queue + optional history.
3. Gap: UI does not match screenshot (no table columns, no category section, no footer bar).

## Requirements / gap table

| Requirement | Current | Gap | UX risk | Area |
|-------------|---------|-----|---------|------|
| Back to Part Search | Back to home | Wrong target | Medium | Header |
| Title Download Center | Yes | — | — | Header |
| Parts/groups summary + Clear all | Clear + Download in card extra | Layout mismatch | Low | Header |
| Parts table (name, type, figure, SKU, delete) | Flat List of fileName | Missing columns / badges | High | Table |
| Category table empty | Missing | Need empty section | Low | Table |
| Footer total + Download All Files | Small card buttons | Need footer bar + primary CTA | High | Footer |
| Part display name / figure | Only sku/fileName in queue | Need metadata on enqueue | Medium | Queue store |

## Proposed UX flow

1. User opens Content → sees queued parts in table.
2. Remove row or Clear all Items.
3. Primary: Download All Files (clears queue after stub download + toast).
4. Empty queue → Empty + link to Part Search.
5. Categories/groups: empty for now (no group queue in prototype).

## Implementation plan by phase

### Phase 1 — Queue metadata
- **Goal:** Persist `displayName`, `figureNumber`, optional `thumbnailUrl` on queue items.
- **Files:** `src/search/revitDownloadQueue.ts`, `usePartActionFlows.tsx`, `useVariantActionFlows.tsx`
- **Acceptance:** New queue adds carry display fields; old session items degrade gracefully (fall back to fileName/sku).

### Phase 2 — Download Center UI
- **Goal:** Screenshot-aligned Content page.
- **Files:** `src/shell/content/DownloadCenterPage.tsx` (new), `ProjectModuleStubs.tsx` (re-export / thin wrapper), optionally keep history below.
- **Must not change:** Sidebar, routes, BOM/Submittal, theme tokens.

### Phase 3 — UX audit
- Tokens, CTA hierarchy, empty states, `tsc`.

## File change plan

| File | Action | Reason |
|------|--------|--------|
| `src/search/revitDownloadQueue.ts` | Modify | Metadata on items |
| `src/search/usePartActionFlows.tsx` | Modify | Pass displayName/figureNumber |
| `src/search/useVariantActionFlows.tsx` | Modify | Pass variation name on drawings |
| `src/shell/content/DownloadCenterPage.tsx` | Create | Screenshot UI |
| `src/shell/ProjectModuleStubs.tsx` | Modify | Delegate ContentModule |

## Guardrails
- **Allowed:** Files above only.
- **Forbidden:** Theme/token edits, shared core components, new routes, sidebar IA.
- **Assumptions:** Groups/categories remain empty until product defines group queue; history optional secondary below main card.
- **Open questions:** None blocking — “1” before summary treated as parts count emphasis if needed; primary copy uses `{n} Individual Parts / Variations • {g} Groups`.

## Acceptance checklist
- [ ] Content route shows Download Center matching screenshot structure
- [ ] Table columns + RFA/file tag + Variation/Part type
- [ ] Clear all + per-row delete
- [ ] Footer total + Download All Files primary
- [ ] Category empty state
- [ ] Back → Part Search
- [ ] No raw hex/px; antd barrel only
- [ ] `npx tsc --noEmit` clean
