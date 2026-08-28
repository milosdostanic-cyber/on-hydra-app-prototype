# Plan: SPEC Review and edit Figma parity

## Meta
- **Date:** 2026-08-28
- **Request type:** figma-delta
- **User request summary:** Port the Figma section **05 — Review and edit** into the SPEC prototype, matching screen structure, components, and tokens. Start with the first screen (recommendation list).
- **Status:** Phase 1 implemented in the planning chat (list screen). Phases 2–3 not started.
- **Plan file:** `Documents/plans/2026-08-28-spec-review-edit-figma-parity-plan.md`

## Orchestration for planning (this run)

### Explicit skills and rules used
| Name | Type | Path | Why selected |
|------|------|------|--------------|
| `@figma-design-to-code` | skill | Figma plugin `figma-design-to-code` | Mandatory before `get_design_context` |
| `@hydra-design-to-code` | rule | `.cursor/rules/hydra-design-to-code.mdc` | Map Figma nodes to `src/ui/antd.ts` + tokens |
| `@prd-ux-implementation-planner` | skill | `.cursor/skills/prd-ux-implementation-planner/SKILL.md` | Scope, gap table, phased files |
| `@hydra-ux-audit` | skill | `.cursor/skills/hydra-ux-audit/SKILL.md` | Quality gate for every UI phase |
| `@figma-mcp-routing` | rule | `.cursor/rules/figma-mcp-routing.mdc` | Official MCP first; Desktop used after Official access failure |

### Implicit rules (always active)
| Invoke | Path | Why relevant to this task |
|--------|------|---------------------------|
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Read only SPEC review/edit files |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | Do not change Analyze, shell, or theme |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | One primary CTA; clear next step |
| `@ux-guardrails` | `.cursor/rules/ux-guardrails.mdc` | Reuse Ant Design; no new shared components |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | No stray hex/px in screen code |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Compose Card/Flex/Tag/Tabs |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Token review only; no theme edits this work |

### Not used (and why)
| Name | Why skipped |
|------|-------------|
| `@figma-console-mcp` | User did not opt into Console MCP |
| `@ds-parity-auditor` | No theme/primitive sync requested |
| `@figma-generate-design` | Direction is Figma → code, not code → Figma |
| BOM PRD | Not a BOM flow |

## Implementation invocation (use in a new chat after approval)

### Baseline — attach every UI implementation phase
```
@scope-guardrails
@token-discipline
@ux-guardrails
@hydra-ui-tokens-and-components
```

### Default attach set for this request type
```
@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline
```

### Implicit rules during implementation
| Invoke | Path | Applies when |
|--------|------|--------------|
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | All visual styling |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Only if a token gap requires theme work (stop and ask) |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | Copy, CTA, states |

### Optional add-ons
| Invoke | Path | When to add |
|--------|------|-------------|
| `@hydra-ux-audit` | `.cursor/skills/hydra-ux-audit/SKILL.md` | Always on UI phases (already in default set) |

## Scope summary

Figma file: [SPEC — ASC Connected](https://www.figma.com/design/gqnufh14Vhz2pXgvtXVTrC/SPEC---ASC-Connected) (`gqnufh14Vhz2pXgvtXVTrC`).

**Section:** [05 — Review and edit](https://www.figma.com/design/gqnufh14Vhz2pXgvtXVTrC/SPEC---ASC-Connected?node-id=8091-17227) (`8091:17227`)

| Screen | Node | Repo target |
|--------|------|-------------|
| Recommendation list (start here) | `8066:124202` | `SpecEditPage` list state |
| Recommendation detail | `8066:127371` | `SpecEditPage` detail rail |
| Locked by another user | `8079:136937` | Existing lock Alert on `SpecEditPage` |

Shared chrome (sidebar, top bar, breadcrumb) already comes from Hydra shell. Do not rebuild it.

**Closest existing pattern:** `SpecEditPage` three-region workspace (`SpecWorkspaceRegions` + `SpecSectionNavigator` + document + `SpecRecommendationsListPanel`). Analyze already has the Figma rec card (`SpecRecommendationCard`) and All / To review / Resolved tabs — reuse those, do not invent a fourth pattern.

## Current flow audit

`SpecEditPage` already implements Review and edit:

1. User opens a SPEC in the editor.
2. Left rail lists sections; center is a formatted document; right rail is recommendations.
3. Clicking a recommendation currently **opens detail immediately** (`recommendationDetailOpen` defaults to `true`).
4. Header shows the **document title**, not Figma’s “SPEC documents” + catalog subtitle.
5. Export is a default large button, not the orange primary from Figma.
6. TOC rows show section number first and a red circular count — Figma shows title first and a Volcano colorful Tag.
7. Recommendation list has no All / To review / Resolved tabs; cards use title + tags stack, not action tag + status tag + location line.

Behavior to preserve: edit, undo/redo, save status, accept/deny/later, re-analysis gate, editor lock, deep links.

## Requirements / gap table
| Requirement | Current | Gap | UX risk | Area |
|-------------|---------|-----|---------|------|
| Page title “SPEC documents” + catalog description | Document title, no description | Copy and heading-4 / heading-5 roles | User loses the Figma page identity | Header |
| Primary large Export | Default `Button` | Missing `type="primary"` | CTA hierarchy | Header |
| Default view = recommendation **list** | Detail opens on load | First paint is the wrong screen | User never sees the list | List/detail |
| TOC_card: title, then “Section {n}”, Volcano count | Number first, red badge | Structure and component | Scanning sections | TOC |
| Recommendations ({n}) + Tabs All / To review / Resolved | “Recommendations” + “X of Y reviewed”, no tabs | Missing filter | Cannot focus unreviewed items | Right rail |
| rec_card: action Tag + status Tag + title + “Section \| Page” | Title + reason + mixed tags | Card anatomy | Harder to scan action vs severity | List card |
| Recommendation detail rail | Existing `SpecRecommendationDetailPanel` | Visual/token pass vs `8066:127371` | Detail drift after list lands | Phase 2 |
| Locked-by-another-user chrome | Warning Alert + read-only | Confirm Figma copy/placement (`8079:136937`) | Lock may feel unlike Figma | Phase 3 |

## Component and token inventory (Figma → repo)

No new tokens. No new shared/core components. No `src/theme/*` edits.

| Figma | Repo | Token / style |
|-------|------|----------------|
| Button primary large (Export) | `Button type="primary" size="large"` from `src/ui/antd.ts` | ButtonPrimary / volcano via theme |
| Title/Heading 4 | `BomPageHeader` `titleVariant="heading4"` | `hydraTitleHeading4` 20/28/600 |
| Title/Heading 5 description | `descriptionVariant="large-strong"` (same 16/24/600 metrics as Heading 5) | `hydraLargeStrong` + `colorTextDescription` |
| Tabs | `Tabs` from barrel (same as `SpecAnalyzePage`) | `tabBarGutter={token.paddingXL}` |
| Tag default (action) | `HydraTag` | `colorFillQuaternary` / `colorBorder` / `colorText` |
| Tag status warning (Medium) | `HydraTag tone="warning"` | `colorWarning*` |
| Tag status success (Low) | `HydraTag tone="success"` | `colorSuccess*` |
| Tag status error (High) | `HydraTag tone="error"` | `colorError*` |
| Tag status processing (Resolved) | `HydraTag tone="processing"` | `colorPrimary*` info/processing chip |
| Tag colorful Volcano (TOC count) | `HydraColorfulTag preset="volcano" bordered` | Volcano ramp already in `HydraTag` |
| Base/Normal | `hydraBaseNormal` via `hydraTextStyleToReactCss` | 14/22/400 |
| Small/Strong | `hydraSmallStrong` | 12/20/600, `colorTextDescription` |
| Selected TOC left edge | `token.colorPrimaryActive`, `token.lineWidthBold` | Existing primary active |
| Surfaces / radii / gaps | `colorBgContainer`, `colorFillQuaternary`, `colorBorderSecondary`, `borderRadius`, `paddingSM`, `paddingXS`, `marginXS` | `theme.useToken()` |
| Three columns | `SpecWorkspaceRegions` | `shellLayout.siderWidth` |
| Format toolbar | `SpecDocumentFormatToolbar` (already matches Figma) | Keep |
| Document viewer | `SpecDocumentViewer` | Keep |
| Icons | `@ant-design/icons` already used in toolbar | Do not add another icon pack |

**Golden reuse:** `SpecHomePage` header copy; `SpecAnalyzePage` Recommendations title + Tabs; `SpecRecommendationCard` anatomy.

## Proposed UX flow

1. Land on **list**: TOC + document + Recommendations (n) with All selected.
2. Filter All / To review / Resolved without leaving the editor.
3. Click a card → open **detail** (Phase 2 screen) while keeping document highlight.
4. Accept / deny / later / edit proposal in detail; return to list.
5. If another user holds the lock → read-only document and decisions (Phase 3).
6. Export remains the single primary page CTA; disabled with tooltip when re-analysis is required.

## Implementation plan by phase

### Phase 1 — Recommendation list screen (`8066:124202`)
- **Goal:** First paint and list anatomy match Figma: header, TOC cards, recommendation tabs and rec_cards. Detail stays available on card click but is not the default.
- **Files:**
  - `src/spec/pages/SpecEditPage.tsx`
  - `src/spec/components/SpecSectionNavigator.tsx`
  - `src/spec/components/SpecRecommendationsListPanel.tsx`
  - `src/spec/components/SpecRecommendationListCard.tsx`
- **UI changes:** Header copy + primary Export; TOC_card layout + Volcano count; list title `Recommendations (n)`; Tabs; rec_card layout; default `detailOpen` false.
- **Data/state:** Filter list by decision. To review = `not-reviewed` \| `later`. Resolved = `accepted` \| `denied`. Page line from `sourceCitation.page`.
- **Acceptance criteria:**
  - Opening Review and edit shows the list, not detail.
  - Header matches Home: “SPEC documents” + catalog sentence + primary Export.
  - TOC title above “Section {number}”; count uses `HydraColorfulTag` volcano.
  - Right rail has All / To review / Resolved; cards show action + Medium/Low/High or Resolved + section/page.
  - No new tokens, no shared/core edits, no raw hex/px.
- **Must not change:** Shell, theme, `HydraTag` implementation, Analyze page, document editor behavior, decision APIs.

#### Phase 1 — invoke for implementation
```
@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline
```

**Copy-paste prompt:**
```
Implement Phase 1 only from this plan: Documents/plans/2026-08-28-spec-review-edit-figma-parity-plan.md

@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline

Allowed files:
- src/spec/pages/SpecEditPage.tsx
- src/spec/components/SpecSectionNavigator.tsx
- src/spec/components/SpecRecommendationsListPanel.tsx
- src/spec/components/SpecRecommendationListCard.tsx

Forbidden:
- src/theme/*
- src/ui/HydraTag.tsx
- src/ui/antd.ts
- src/shell/*
- src/spec/pages/SpecAnalyzePage.tsx
- src/bom/**

Figma: https://www.figma.com/design/gqnufh14Vhz2pXgvtXVTrC/SPEC---ASC-Connected?node-id=8066-124202
```

### Phase 2 — Recommendation detail (`8066:127371`)
- **Goal:** Detail rail matches Figma (pager, current vs proposed, rationale, Accept / Deny / Later).
- **Files:** `SpecRecommendationDetailPanel.tsx`, `SpecRecommendationsListPanel.tsx` (detail chrome only), possibly `SpecProposalCard.tsx`.
- **UI changes:** Header “Recommendation n of n”, close, compare regions, CTAs.
- **Data/state:** Existing decision handlers.
- **Acceptance criteria:** Detail opened from a list card matches Figma structure; back/close returns to list.
- **Must not change:** List anatomy from Phase 1; theme; shell.

#### Phase 2 — invoke for implementation
```
@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline
```

**Copy-paste prompt:**
```
Implement Phase 2 only from this plan: Documents/plans/2026-08-28-spec-review-edit-figma-parity-plan.md

@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline

Figma: https://www.figma.com/design/gqnufh14Vhz2pXgvtXVTrC/SPEC---ASC-Connected?node-id=8066-127371
```

### Phase 3 — Locked by another user (`8079:136937`)
- **Goal:** Lock state matches Figma copy and layout; document and decisions stay read-only.
- **Files:** `SpecEditPage.tsx` (lock Alert only); no new lock system.
- **Acceptance criteria:** Lock screenshot parity; Refresh still works; Export/decisions remain correctly disabled.
- **Must not change:** Lock timeout logic unless Figma copy requires it.

#### Phase 3 — invoke for implementation
```
@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline
```

**Copy-paste prompt:**
```
Implement Phase 3 only from this plan: Documents/plans/2026-08-28-spec-review-edit-figma-parity-plan.md

@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline

Figma: https://www.figma.com/design/gqnufh14Vhz2pXgvtXVTrC/SPEC---ASC-Connected?node-id=8079-136937
```

## File change plan
| File | Action | Reason |
|------|--------|--------|
| `src/spec/pages/SpecEditPage.tsx` | Update | Header copy, primary Export, default list |
| `src/spec/components/SpecSectionNavigator.tsx` | Update | TOC_card structure and Volcano count |
| `src/spec/components/SpecRecommendationsListPanel.tsx` | Update | Title count + Tabs + filter |
| `src/spec/components/SpecRecommendationListCard.tsx` | Update | rec_card anatomy |
| `SpecRecommendationDetailPanel.tsx` | Phase 2 | Detail rail |
| `SpecEditPage.tsx` lock Alert | Phase 3 | Locked screen copy |

## Guardrails
- **Allowed (after approval):** Local SPEC review/edit components listed above.
- **Forbidden:** New tokens; editing `HydraTag`, `antd.ts`, theme, shell, Analyze, BOM.
- **Assumptions:** Official Figma MCP lacks edit access to this file; Desktop MCP is the read path. Heading 5 description is implemented via existing `large-strong` (identical 16/24/600). “Resolved” tab means accepted or denied; “Later” stays in To review.
- **Open questions:** None for Phase 1. Phase 2 may need a product call if Figma detail CTAs differ from Accept / Deny / Later.

## Risks
- Header no longer shows the document title (Figma uses a generic page title; breadcrumb still has Project / SPEC).
- Reusing Analyze’s rec_card in the editor list must keep **priority** (Medium/Low) on the list screen, not Analyze’s “To review” chip.
- Click-to-detail is the bridge to Phase 2; if detail chrome is still old, list→detail will look mixed until Phase 2.

## Acceptance checklist
- [ ] Phase 1 list matches Figma `8066:124202` structure
- [ ] Existing Hydra components/tokens only
- [ ] Shared/core and theme unchanged
- [ ] `npx tsc --noEmit` and `npm run build` after Phase 1
- [ ] `@hydra-ux-audit` Phase 1 self-check
- [ ] Phase 2 and 3 not started until Phase 1 is approved as done

## Full implementation prompt (all approved phases)
```
Implement approved phase(s) from: Documents/plans/2026-08-28-spec-review-edit-figma-parity-plan.md

@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline

Follow allowed files and guardrails in the plan. Do not expand scope.
```
