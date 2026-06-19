---
name: hydra-ux-audit
description: >-
  Universal Hydra quality gate for any UI task — implement, review, fix, or improve.
  Always enforces adopted patterns, components, consistent control sizes (especially
  buttons), tokens, and figmaTypography; keeps flows effortless (user finds their way
  without guessing) while meeting PRD and real functionality. Use on every screen/flow
  change: "build this", "fix this", "review", "improve UX", "check my work", or after
  any implementation before closing the task.
---

# Hydra UX Audit & Quality Gate

**Default behavior:** Apply this skill to **every UI-related task** in this repo — whether the user says "audit", "build", "fix", "improve", or hands you files/screenshots/Figma links.

This skill is the **single quality gate** that orchestrates all Hydra rules and companion skills so output is:

- aligned with **adopted repo patterns** (not invented layouts)
- built from **existing components** and `src/ui/antd.ts`
- styled with **tokens only** — no stray hex, px, or ad-hoc font styles
- typed with **figmaTypography** / theme typography roles
- **effortless for the user** — obvious path, minimal decisions, no guessing
- **PRD-complete** — required product behavior is still there (often via guided defaults, not raw complexity)
- **functionally correct** — everything wired; navigation and data behave as promised

It **does not replace** workspace rules — it **enforces** them in one workflow.

---

## North star — effortless wayfinding × PRD × functionality

**The human using the app must always know where they are, what to do next, and what will happen — without stopping to figure it out.**

That is the default UX bar. It does **not** mean cutting PRD scope or shipping broken features. All three must hold:

| Pillar | Question | Fail when |
|--------|----------|-----------|
| **Effortless** | Can a non-technical user proceed **without help or guesswork**? | Multiple equally loud actions; unclear next step; jargon; “what now?” moment |
| **PRD** | Does the screen/flow still deliver **required product behavior** from the PRD / `AGENTS.md`? | Smart mapping removed; review step skipped; SKU goal dropped; warnings misread as blockers |
| **Functional** | Do controls, routes, and data **actually work** as the UI promises? | Dead buttons; wrong back target; counts lie; state lost on navigation |

**Triad rule (use on every audit and implement):**

1. **Simplify the path, not the requirement.** If the PRD needs a review step, keep it — make it *guided* (one primary CTA, plain copy, clear progress), not a spreadsheet.
2. **One obvious next step.** Secondary paths (advanced mapping, table view, cancel) stay visible but subordinate.
3. **Defaults do the work.** Auto-mapping, pre-selected sensible options, summary-before-detail — user confirms rather than constructs.
4. **Never trade PRD for “pretty”.** Never trade “simple UI” for broken handlers. If two pillars conflict, fix with copy, order, and progressive disclosure — then flag in report.

**5-second test:** Glance at the screen — can you name the **one** thing the user should do next? If not → P1 minimum.

---

## When to run

| User intent | What to do |
|-------------|------------|
| Review / audit / check | Phase 1 → Report → Fix only if asked |
| Build / implement / add screen | Discover patterns → Build → **Self-audit (Phase 1)** → Fix before closing |
| Fix bug / improve UX | Read target → Audit → Fix in scope → Re-audit |
| Figma / screenshot → code | `@hydra-design-to-code` + **this skill** before marking done |
| Any task ending in UI changes | **Never close without Phase 1 self-audit** on touched files |

**Infer scope from the task** — user does not need to name a "mode". Use labels below only in the report.

| Report label | Inferred when |
|--------------|---------------|
| `screen` | One page or component group |
| `flow` | Multi-step journey or cross-route check |
| `diff` | PR, git diff, or "my changes" |
| `figma-parity` | Figma URL or screenshot comparison |
| `implement` | New or changed UI written in this session |

---

## Authority order

When this skill conflicts with a rule file, **the rule file wins**:

1. `AGENTS.md`
2. `.cursor/rules/ux-guardrails.mdc`
3. `.cursor/rules/hydra-ui-tokens.mdc`
4. `.cursor/rules/product-ux-rules.mdc`
5. `.cursor/rules/hydra-ux-composition.mdc`
6. `.cursor/rules/scope-guardrails.mdc`
7. `.cursor/rules/token-discipline.mdc`
8. Module PRD (`docs/prd/bom-prd.md` for BOM)
9. `Documentation/hydra-app-capabilities.md`

---

## Non-negotiables (every task)

These apply **while building** and **while reviewing**:

1. **Patterns first** — search the repo for similar screens/flows; reuse golden references before inventing.
2. **Components** — import UI from `src/ui/antd.ts`; use existing product/BOM/shell/catalog components as-is.
3. **Tokens** — `theme.useToken()`, `shellLayout`, `sidebarSemanticsLight`; never design-intent `#hex` / `rgb` / ad-hoc `px` in TSX.
4. **Typography** — antd `Typography` + theme sizes, or `figmaTypography.ts` roles via `figmaTextStyleToReactCss()`; no ad-hoc `fontSize` / `lineHeight` / `fontWeight` / `fontFamily` on screens.
5. **Effortless wayfinding** — user always sees where they are, what to do next, what happens after; no guesswork, no decision paralysis.
6. **PRD-honest** — required behavior from PRD / `AGENTS.md` is present; complexity is guided, not dumped on the default path.
7. **Functional** — every control does something logical; navigation matches capabilities map; state is consistent.
8. **Consistent sizes** — buttons and adjacent controls use the **same antd `size` within each action group**; match sibling screens and golden references — never mix `large` / default / `small` in one toolbar or footer without reason.
9. **Scope** — only requested files/flow; no shared component or token edits without explicit approval.
10. **No generic DS** — never `ui-ux-pro-max`, Tailwind palettes, or shadcn in this repo.

---

## Companion skills & rules

| Situation | Also attach |
|-----------|-------------|
| Always (implicit) | `ux-guardrails`, `hydra-ui-tokens`, `product-ux-rules` |
| Building / reviewing UI | `@hydra-ui-tokens-and-components` |
| Figma URL or visual target | `@figma-use` + `@hydra-design-to-code` (Official MCP per `@figma-mcp-routing`) |
| New feature (plan first) | `@plan-orchestrator` or `@prd-ux-implementation-planner` |
| DS-wide token drift | `@ds-parity-auditor` (not this skill) |
| BOM | `@docs/prd/bom-prd.md` |
| New screen / PRD | `@hydra-prd-ux-playbook` + `Documentation/hydra-app-capabilities.md` |

**Never:** `ui-ux-pro-max`. **Console MCP** (`@figma-console-mcp`) only when the user explicitly requests it.

---

## Workflow

### Phase 0 — Understand & discover (mandatory)

1. Restate the **user task** in one sentence.
2. Identify **module**: BOM | Catalog | Shell | Project workspace | Other.
3. List **target files/routes** — read only what matters (`@token-discipline`).
4. **Search repo** for similar screens, flows, and components (grep + semantic search) — same as `hydra-prd-ux-playbook` step 2.
5. Read **2–3 golden references** in that module (tables below).
6. Load docs:
   - Always: `Documentation/hydra-app-capabilities.md`
   - BOM: `docs/prd/bom-prd.md`
   - User PRD / plan path if provided
7. If implementing: pick reuse vs local composition **before** writing code.
8. **Triad prep:** List PRD must-haves for this task (from module PRD / plan). List what the user should experience as the **simple happy path**. These two lists guide audit — do not drop PRD items to reduce UI complexity.

### Phase 1 — Quality check (mandatory)

Run **every applicable layer**. Layers 1–7 always run for user-facing UI. Layer 8 when Figma provided. Layer 9 always runs last.

---

#### Layer 1 — Effortless wayfinding, PRD alignment & product UX

Target: **non-technical human** who moves forward **without pausing to think** — while the product still does what the PRD requires.

**North star question:** *“If I were tired and not technical, would I know exactly what to do next — and would the product still do its job?”*

Every user-facing screen must answer (visible without hunting):

- **What happened?**
- **What should I review?** (only if review is needed — say how much: “3 rows need attention”)
- **What is the next action?** (one obvious primary)
- **What happens after I act?** (one short line under CTA or in description)

| Check | Pass |
|-------|------|
| **Where am I?** | Title + step/progress (e.g. `BomUploadFlowStepChrome`) or breadcrumbs; user never lost mid-flow |
| **What now?** | Single primary CTA; label = verb + outcome (“Continue to review”, not “Next”) |
| **No guesswork** | No unexplained disabled primary; no two actions that look equally important |
| Language | Plain words; no backend/column jargon on **default** path |
| Primary CTA | Exactly **one** clear primary per context |
| Secondary actions | Visually subordinate; labeled as optional (“Review mapping”, “Table view”) |
| Destructive | Not styled as primary unless intended |
| Warnings | Blocking vs informational stated clearly; yellow ≠ “you cannot continue” unless true |
| Cognitive load | Scannable hierarchy; default path ≠ spreadsheet |
| Progressive disclosure | PRD-required depth available, not forced upfront (summary → detail → advanced) |
| Help text | *Why* act, not *how the system works* |
| Empty / first-use | One sentence + one button toward the happy path |
| **PRD on default path** | Each PRD must-have reachable without hunting settings/expert mode |
| **Happy path length** | Minimum clicks from entry to PRD outcome; extra paths are opt-in |

**Effortless patterns (prefer when implementing):**

- **Summary before detail** — mapping summary before column editor; stats strip before full table.
- **Guided over bulk** — “Guided review” as primary; full table as secondary.
- **Confirm, don’t construct** — system proposes match/mapping; user accepts or chooses.
- **Status at a glance** — tags/strips answer “am I done?” without reading every row.
- **Consistent chrome** — same back + stepper position every step so muscle memory works.

**PRD vs simplicity (when they tension):**

| Situation | Do | Don’t |
|-----------|-----|--------|
| PRD needs review step | One guided screen + clear “X items need you” | Full editable grid as default |
| PRD needs SKU selection | Wizard/picker with one primary “Use this part” | Hide SKU behind expert jargon |
| PRD needs advanced mapping | Secondary “Review mapping” link | Show all columns on landing |
| Prototype stub | 🟡 label in report; still guide user (no dead end) | Silent no-op primary button |

**BOM** (`AGENTS.md` + `bom-prd.md`): upload → smart mapping **summary** → guided review → match → SKU; "Choose" not "Refine"; warnings ≠ blockers; automation first, confirmation second; no Content File Manager.

**Triad check (score Pass/Fail in report):**

- Effortless: 5-second test passes
- PRD: list each relevant must-have → met on default or clearly linked path?
- Functional: (cross-ref Layer 2) happy path actually completable click-by-click

**Improvements (P2):** shorter headings, outcome-based CTA labels, empty-state copy, group related secondaries — without dropping PRD behavior.

---

#### Layer 2 — Functionality & logic

Target: **nothing broken or nonsensical**.

| Check | What to verify |
|-------|----------------|
| Handlers | Buttons, links, row clicks, menu items call real logic or navigate |
| Navigation | `navigate()` / `Link` targets exist in router; back goes somewhere sensible |
| Route params | `:id` used consistently; missing id handled |
| State flow | `location.state`, context, hooks — data survives back/forward where siblings do |
| Conditional UI | Show/hide matches data (e.g. no "Continue" when nothing to continue) |
| Forms | Submit validates; cancel discards; success closes or advances |
| Tables | Sort/filter/pagination wired; selection matches bulk actions |
| Modals | Open/close; primary action matches label; destroy on close if needed |
| Mock/prototype gaps | Stub called out in report — 🔴 dead control vs 🟡 intentional stub |
| Cross-screen consistency | Same entity named same way; counts match summary strips |
| Side effects | Delete/remove updates list; create adds to list; upload appears in pending region |

For multi-step flows, trace the path **click by click**. Cross-check `Documents/Bom/app-userflow-audit.md` for BOM known dead spots.

Flag **illogical** combinations: e.g. primary "Import" disabled with no explanation; warning styled as error; step 3 reachable before step 2 complete without user intent.

**Effortless + functional:** Trace the **PRD happy path** click-by-click. At each step ask: “Would I know what to click?” If yes but click fails → P0 functional. If click works but user would hesitate → P1 UX.

---

#### Layer 3 — Pattern parity

Target: **looks and behaves like sibling screens in this repo**.

Compare to golden references. **Reuse before reinvent.**

**BOM — upload / import**

| Pattern | Golden file | Rule |
|---------|-------------|------|
| Step chrome | `src/bom/components/BomUploadFlowStepChrome.tsx` | **First child** in page `Space`; Back then progress bar |
| Back → stepper gap | `token.marginLG` | Same on every upload step |
| Progress bar | `src/bom/components/BomUploadProgressBar.tsx` | Via chrome only |
| Page header | `src/bom/layout/BomPageHeader.tsx` | Title + actions; actions = `size="large"` buttons |
| Pagination | `src/bom/components/BomTablePaginationBar.tsx` | Not ad-hoc |
| Tags | `src/bom/components/BomTags.tsx` | Not raw colored `Tag` |
| Import strip | `src/bom/components/BomImportProgressStrip.tsx` | Workspace uploads |
| Pending uploads | `src/bom/components/BomPendingUploadsRegion.tsx` | Collapsible region |
| Project modals | `BomCreateProjectModal`, `BomEditProjectModal` | Standard footer CTAs |

**BOM — workspace / matching**

| Pattern | Golden file |
|---------|-------------|
| Workspace | `src/bom/pages/BomWorkspacePage.tsx` |
| Matching | `src/bom/pages/BomMatchingPage.tsx`, `src/bom/bomMatchingColumns.tsx` |
| Parsing review | `src/bom/pages/BomParsingReviewPage.tsx` |
| Mapping summary | `src/bom/pages/BomMappingSummaryPage.tsx` |
| Advanced mapping | `src/bom/pages/BomFieldMappingPage.tsx` |

**Shell**

| Pattern | Golden file |
|---------|-------------|
| App chrome | `src/shell/AppShell.tsx`, `AppShellSidebar.tsx` |
| Top bar | `src/shell/AppTopBar.tsx` |
| Breadcrumbs | `src/shell/buildAppBreadcrumbItems.tsx` |
| Project layout | `src/shell/ProjectWorkspaceLayout.tsx` |
| Project switcher | `src/shell/ConstructionProjectSwitcherModal.tsx` |

**Catalog**

| Pattern | Golden file |
|---------|-------------|
| Home | `src/shell/CatalogHome.tsx` |
| Featured parts | `src/catalog/FeaturedParts.tsx` |
| Browse tables | `src/shell/content/catalogBrowseTableStyles.ts` |
| Part nav | `src/catalog/catalogPartNavigation.ts` |

**Shared UI**

| Pattern | Golden file |
|---------|-------------|
| Barrel | `src/ui/antd.ts` |
| Tags | `src/ui/HydraTag.tsx` |
| Typography registry | `src/theme/figmaTypography.ts` |
| Theme | `src/theme/antdTheme.ts` (read-only during screen work) |

---

#### Layer 4 — Tokens, spacing & typography

Target: **zero design literals in screen code**.

On touched `.tsx` files (exclude `src/theme/*` mirrors):

```bash
rg '#[0-9a-fA-F]{3,8}\b' <paths>
rg 'fontSize:|lineHeight:|fontWeight:|fontFamily:' <paths>
rg 'rgba?\(' <paths>
```

| Area | Source |
|------|--------|
| Colors | `token.colorText`, `colorPrimary`, `colorBgContainer`, `colorBorder`, etc. |
| Spacing | `token.padding*`, `token.margin*`, `shellLayout` |
| Radius / motion | `token.borderRadius*`, theme motion tokens |
| Sidebar/menu | `sidebarSemanticsLight`, Menu theme tokens |
| Text roles | `figmaTypography.ts` → `figmaBaseNormal`, `figmaTitleHeading*`, `figmaSmallNormal`, etc. |
| Allowed literals | Only in `src/theme/*` mirror files per `hydra-ui-tokens.mdc` |
| Exceptions | `transparent`, `none`, layout `100%` / `100vh` |

Map each text block to the **closest Figma text style** — not arbitrary sizes.

---

#### Layer 5 — Components & imports

| Check | Rule |
|-------|------|
| Imports | `src/ui/antd.ts` barrel |
| Deep `antd/es/*` | Flag unless established elsewhere for same reason |
| New core components | **None** |
| Shared edits | **None** without user approval |
| Local composition | Allowed per `ux-guardrails` escape hatch only |
| Wrappers | `HydraTag`, `BomTags`, existing module components over re-styling |

---

#### Layer 6 — Component sizes & control consistency

Target: **controls look like they belong on the same screen** — especially **buttons**.

**Before choosing a size:** open the **golden reference** for that surface (same module, same job) and match its `size` prop. Do not guess.

**Hydra size map (antd `size` prop)**

| Context | Expected size | Golden examples |
|---------|---------------|-----------------|
| Page header actions | `large` | `BomPageHeader` `actions` — see `BomMatchingPage.tsx` |
| Page footer / step forward row | `large` | `BomParsingReviewPage.tsx`, `BomMappingSummaryPage.tsx` |
| Empty-state CTAs | `large` | `BomMatchingPage.tsx`, `ShellHomeContent.tsx` |
| Drawer footer actions | `large` | `BomChoosePartDrawer.tsx`, `BomParsingReviewRowDrawer.tsx` |
| Catalog / shell hero search & primary actions | `large` | `ProductCatalogContent.tsx`, `ShellHomeContent.tsx` |
| Upload-flow **Back** (navigational) | **default** (omit `size`) | `BomUploadFlowStepChrome.tsx` — icon + label only |
| Table row / inline actions | `small` | `bomMatchingColumns.tsx` (`type="link"` + `small`) |
| Dense table toolbar (filter, apply) | `small` | `BomAscProductsPage.tsx` |
| Modal footer | **match sibling modals** in same module — prefer `large` for flow-critical modals, default only when established pattern uses it | `BomChoosePartDrawer` = large; check `BomUploadDestinationModal` before changing |

**Theme alignment (no custom heights)**

- Control heights come from theme: `token.controlHeight`, `token.controlHeightSM`, `token.controlHeightLG` (menu rows align to `controlHeightLG` per `antdTheme.ts`).
- Do **not** set `height`, `minHeight`, or `lineHeight` on `Button` to fake a different size — use the correct `size` prop.
- Adjacent **Input** / **Select** / **Button** in one toolbar → same `size` so baselines align.
- `Space` / `Flex` gaps between buttons in a group: `token.marginXS` (see `BomMatchingPage` header actions).

**Hard rules (flag as P1)**

| Violation | Example |
|-----------|---------|
| Mixed sizes in one action group | `large` primary + default secondary in same `Flex` footer |
| Page-level CTA without `large` when siblings use `large` | Primary "Continue" default while "Cancel" is `large` |
| Table row `large` button next to `small` link actions | Breaks row density |
| Custom `style={{ height: … }}` on Button | Bypasses design system |
| Icon button different size than text buttons beside it | Same row must match |
| `type="link"` in page footer | Link style belongs in tables/lists, not main flow CTAs |

**Soft rules (P2 — fix when polishing)**

- Modal footer buttons all default while page uses `large` everywhere else — align to dominant module pattern.
- `Descriptions`, `Table`, `Tag` `size="small"` in detail panels — OK for density; don't mix with `large` buttons in the **same** compact card header.

**How to audit**

1. List every `Button` (and adjacent `Input`/`Select`) in the target file.
2. Group by UI region: header actions, footer, toolbar, table row, modal footer, chrome.
3. For each group: all `size` values must match the map above or the golden reference.
4. Compare to 1 sibling screen doing the same job — sizes must match unless UX intentionally differs (document why).

---

#### Layer 7 — States & interaction

For each interactive surface, verify applicable states exist and look intentional:

| State | When |
|-------|------|
| Loading | Async / delay |
| Empty | Lists, workspace, search |
| Error | Validation / failure |
| Success | Done / confirmed |
| Disabled | Unavailable with reason or context |
| Read-only | Review steps |
| No results | Filters |
| Missing data | Partial records |

Also: keyboard focus visible; clickable affordance consistent; `prefers-reduced-motion` respected where motion added.

---

#### Layer 8 — Figma / design parity (when design reference exists)

Via `@figma-use` + Official Figma MCP (default per `@figma-mcp-routing`), or `@figma-console-mcp` when user explicitly opted in:

1. `get_design_context` / `get_screenshot` (Official) or `figma_get_status` + `figma_get_component_for_development` (Console)
2. Compare: region order, copy, spacing rhythm, component families, chrome
3. Report deltas with node ID + code path

Without Figma: if user gave screenshot, compare regions and hierarchy — still use tokens, not eyedropped hex.

---

#### Layer 9 — Meta gate (always last)

Do not mark task complete if:

- Any P0 remains unfixed (when user asked for fix)
- Layers 1–5 skipped without reason
- Findings lack `path:line` evidence
- Output invents tokens, palettes, or shared components
- User-facing copy is still technical jargon on default path
- A button/link does nothing or goes nowhere
- **Mixed button sizes** in the same action group without documented reason
- **5-second test fails** — no obvious next action
- **PRD must-have** missing or only reachable through expert/hidden path
- **Effortless path broken** — user must read table/docs to know what to do

---

### Phase 2 — Report

**Full report** when user asked for audit/review, or when P0/P1 found during implement.

**Short summary** when implement-only and all layers pass — still list what was checked.

```markdown
# Hydra Quality Report — [target]

**Task:** [what user asked]  
**Scope:** [files / routes]  
**Verdict:** ✅ Ready | ⚠️ Fix before merge | ❌ Blockers  
**Summary:** [2–3 sentences]

## Scorecard

| Layer | Result |
|-------|--------|
| Effortless wayfinding | Pass / Fail |
| PRD alignment (default path) | Pass / Fail |
| Functionality & logic | Pass / Fail |
| Pattern parity | Pass / Fail |
| Tokens & typography | Pass / Fail |
| Components & imports | Pass / Fail |
| Sizes & control consistency | Pass / Fail |
| States | Pass / Fail |
| Figma parity | N/A / Pass / Fail |

## Findings

### [P0|P1|P2] Title

- **Layer:** …
- **Location:** `path:line`
- **Evidence:** …
- **Expected:** [golden pattern / rule]
- **User impact:** …
- **Fix:** [concrete direction]

## UX improvements (optional)

- [P2 items that increase clarity without new patterns]
```

**Priority:**

- **P0** — Broken logic, dead control, wrong navigation, **PRD must-have missing**, guardrail breach, misleading CTA, user stuck with no obvious next step
- **P1** — Guesswork required, competing CTAs, pattern drift, mixed control sizes, missing state, token violation, PRD item only on hidden path
- **P2** — Copy polish, minor hierarchy, non-blocking improvements

Usually **0–8** findings. Omit low-confidence items.

---

### Phase 3 — Fix

Run when user says fix / implement / improve / audit and fix — or when **you implemented UI in this session** (fix P0/P1 before closing).

1. Fix **P0 → P1 → P2** (P2 if scope allows).
2. Reuse golden patterns; import existing components.
3. Never edit shared components or `src/theme/*` without approval.
4. Stay in scope (`@scope-guardrails`).
5. `npm run build` if TS/theme files changed.
6. **Re-run failed layers**; update verdict.

**Closing statement must include:**

- Patterns reused (list) vs local composition (and why)
- Shared components: unchanged
- Tokens: unchanged
- Effortless / wayfinding improvements made
- PRD must-haves verified on default path
- Functionality fixes made
- Remaining P2 (if any)

---

## Anti-patterns (always flag)

- Design literals in TSX (`#hex`, `rgb`, ad-hoc `fontSize`)
- Reinventing `BomUploadFlowStepChrome`, pagination, or tags
- Multiple competing `type="primary"` buttons
- Mixed `size` on buttons in same footer/toolbar (`large` + default + `small`)
- Custom `height` / `minHeight` on `Button` instead of `size` prop
- Page-level flow CTA without `size="large"` when module uses large elsewhere
- Technical labels on default user path (BOM mapping jargon)
- "Refine" with no match (BOM) — must be "Choose"
- Dead buttons, orphan routes, back to wrong step
- Data shown contradicts summary counts
- Editing `antdTheme.ts` during screen-only work
- New shared `BomCustom*` / `HydraCustom*` wrappers
- `ui-ux-pro-max`, Tailwind, shadcn
- Console MCP without explicit user opt-in
- PRD behavior removed to make UI “simpler”
- User must read full table / all columns to know next step
- Two or more primary-looking actions in one region
- Disabled primary with no explanation nearby
- Expert-only path for a PRD must-have (no secondary link on default screen)

---

## Surface checklists

### Any new or changed screen
- [ ] **5-second test:** obvious single next action
- [ ] **Triad:** effortless + PRD must-haves on default path + happy path works click-by-click
- [ ] Four product questions answered on the page
- [ ] One primary CTA (verb + outcome label)
- [ ] Golden pattern found and reused
- [ ] Imports from `src/ui/antd.ts`
- [ ] No design literals in TSX
- [ ] Typography from theme / `figmaTypography`
- [ ] Applicable states present
- [ ] Navigation matches capabilities map

### Wizard / flow
- [ ] Step chrome consistent (BOM: `BomUploadFlowStepChrome` first)
- [ ] Back target + state preservation
- [ ] Cannot skip required steps without intent
- [ ] Forward CTA label matches what happens next

### Table + actions
- [ ] Established pagination component
- [ ] Row actions labeled for humans (Choose / Accept / Review)
- [ ] Empty + no-results states
- [ ] Bulk actions subordinate to page primary

### Modal / drawer
- [ ] Footer: primary + secondary; destructive not primary
- [ ] Cancel safe; success closes or advances
- [ ] Footer buttons **same `size`**; flow-critical drawers use `large`

### Buttons & control sizes
- [ ] Every action group audited (header, footer, toolbar, table row, modal)
- [ ] Page / flow CTAs use `size="large"` per module golden reference
- [ ] Table inline actions use `small` / `link` — not `large`
- [ ] Upload-flow Back stays **default** size (`BomUploadFlowStepChrome`)
- [ ] No custom height on buttons; Input/Select beside buttons share `size`
- [ ] Gaps in button groups use `token.marginXS` (not arbitrary px)

---

## Example prompts

**Any task — attach and go:**
```
@hydra-ux-audit

[Describe task — file, flow, Figma link, or "my latest changes"]
```

**Implement with built-in quality gate:**
```
@hydra-ux-audit
@hydra-ui-tokens-and-components
@hydra-design-to-code

Implement [screen] from [Figma URL].
Follow patterns; self-audit before done.
```

**Review only:**
```
@hydra-ux-audit

Review src/bom/pages/BomMatchingPage.tsx — UX, logic, patterns, tokens.
Audit only.
```

**Fix after review:**
```
@hydra-ux-audit

Fix all P0/P1 from the report. Scope: [files].
```

---

## Handoff

| Need | Use |
|------|-----|
| Plan before large feature | `@plan-orchestrator` |
| DS token sync | `@ds-parity-auditor` |
| Figma edits | `@figma-use` (Official default); `@figma-console-mcp` only when user requests Console |
| PRD gap analysis | `@prd-ux-implementation-planner` |

---

## Agent self-check (before "done")

- [ ] Task restated; scope respected
- [ ] Similar patterns searched and reused
- [ ] User-friendly copy on default path
- [ ] All controls functional and logical
- [ ] Tokens + typography compliant
- [ ] Button/control sizes consistent within each action group
- [ ] States covered
- [ ] PRD must-haves checked off (not simplified away)
- [ ] 5-second test passes for target user
- [ ] Report or short pass summary delivered
- [ ] P0/P1 fixed when implementing
- [ ] `npm run build` if needed
