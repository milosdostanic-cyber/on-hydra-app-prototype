---
name: figma-console-mcp
description: >-
  Routes all Figma work through Figma Console MCP (TJ Pitre / Desktop Bridge) via server
  user-figma-console. Use when the user mentions Figma, design-to-code, screen sync,
  implement from Figma, Figma URL, node-id, design changes, variables, or screenshots —
  and whenever any other skill or rule would call the official Figma MCP. Supersedes
  figma-implement-design, figma-use, and plugin-figma-figma tools for this project.
  When syncing Figma → repo, implementation must match Figma end-to-end (layout, element
  positions, elements, spacing, tokens, typography, control sizes, CTA placement)
  without inventing UI or changing flow/backend. Must read Figma instance size variants
  and auto-layout metrics from _deep export. Final parity loop: compare screenshot to
  repo, fix mismatches, re-verify until identical (max 3 passes) or escalate.
---

# Figma Console MCP (TJ Pitre) — mandatory routing

## Authority

For **any** Figma read/write task in this project:

- **USE:** MCP server **`user-figma-console`** (Figma Console MCP by TJ Pitre, Desktop Bridge plugin).
- **NEVER USE:** Official Figma MCP (`plugin-figma-figma`) or its tools.

If both servers are enabled, **ignore** official Figma MCP entirely for this task.

## Forbidden tools (official MCP)

Do **not** call:

- `get_design_context`
- `get_metadata`
- `get_screenshot`
- `get_code_connect_map`
- `use_figma`
- `generate_figma_design`
- `create_new_file`
- `generate_diagram`
- `get_figjam`
- Any other tool on server `plugin-figma-figma`

Do **not** load or follow skills that require those tools (`figma-implement-design`, `figma-use`, `figma-generate-design`, `figma-generate-library`, `figma-create-new-file`, `figma-generate-diagram`) unless the user explicitly overrides Console routing for that message.

## How to invoke Console tools

1. Read the tool schema under `mcps/user-figma-console/tools/<tool>.json` before calling.
2. Call via **`CallMcpTool`** with:
   - `server`: **`user-figma-console`**
   - `toolName`: e.g. `figma_get_component_for_development`
   - `arguments`: per schema

## Prerequisites (user)

Before first tool call each session:

1. Figma Desktop open with target file.
2. **Desktop Bridge** plugin running in that file.
3. Run **`figma_get_status`** with `probe: true`. If not connected → stop and tell user to open Bridge plugin; do not fall back to official MCP.

## Node ID format

- Console tools expect **`695:313`** (colon), not `695-313`.
- Convert from Figma URLs: `node-id=695-313` → `695:313`.
- Node IDs are session-specific. Re-resolve via `figma_navigate` + `figma_get_selection` or user-provided URL; do not reuse stale IDs from old chats without verification.

## Official → Console tool map

| Task | Console tool | Notes |
|------|----------------|-------|
| Design context for implementation | `figma_get_component_for_development` | Pass `fileUrl`, `nodeId`, `codebasePath: "<repo>/src"` |
| Deep / nested UI (tables, forms) | `figma_get_component_for_development_deep` | `depth` up to 20 |
| Screenshot / visual reference | `figma_take_screenshot` or `figma_capture_screenshot` | After reads or writes |
| Open / switch file | `figma_navigate` | Requires Bridge on target file |
| List connected files | `figma_list_open_files` | |
| Current selection | `figma_get_selection` | When user works from desktop selection |
| Recent Figma edits (delta) | `figma_get_design_changes` | Polling / incremental sync |
| File structure | `figma_get_file_data` | |
| Variables / tokens | `figma_get_variables`, `figma_browse_tokens` | |
| Text styles | `figma_get_text_styles` | |
| Find components | `figma_search_components` | Start of session if hunting nodes |
| Component metadata only | `figma_get_component` | Lighter than dev export |
| DS audit / parity | `figma_audit_design_system`, `figma_check_design_parity` | Not for screen-only deltas |
| Write / edit in Figma | `figma_execute` | Then `figma_take_screenshot` to verify |

## Mandatory workflows

### A — Read design → implement in repo (design-to-code)

**Goal:** End-to-end visual parity with Figma. The repo screen must look and read like the Figma frame — same element positions included — not a reinterpretation.

1. `figma_get_status` (`probe: true`)
2. `figma_navigate` with `fileUrl` if needed
3. For **changed screens only** (user list or `figma_get_design_changes`):
   - `figma_get_component_for_development` per `nodeId` (+ `codebasePath`)
   - Use `_deep` variant when tree is complex
   - `figma_get_text_styles` when typography differs from repo
   - `figma_get_variables` / `figma_browse_tokens` when colors or spacing differ from repo
4. **Mandatory fidelity rules** (see **Figma → repo fidelity** below) — apply before writing any code
5. Pair with repo rules: **`hydra-design-to-code`**, **`hydra-ui-tokens`**, **`use-existing-components`**, **`ux-guardrails`**
6. Plan first with **`prd-ux-implementation-planner`** when scope spans multiple screens — plan covers **visual delta only**; do not redesign flow
7. **Required final parity loop** (see **Final parity verification** below) — do not close until Figma and repo match or escalation is required

## Figma → repo fidelity (mandatory)

When this skill drives **Figma → repository** work, treat Figma as the **layout and visual source of truth**. Implement **exactly** what Figma shows.

### Do's (required — all dimensions)

| # | Dimension | Do |
|---|-----------|-----|
| 1 | **Workflow** | Run `figma_get_status` → `figma_get_component_for_development_deep` (+ screenshot) **before** editing repo. Record metrics from export; implement deltas only. |
| 2 | **Copy** | Extract every `TEXT` node; paste strings **verbatim** (capitalization, punctuation, no dynamic interpolation). |
| 3 | **Typography** | Map each text node to `hydraTypography.ts` role (`Title/Heading *`, `Large/*`, `Base/*`, `Small/*`) via `figma_get_text_styles` + `_deep` `fontSize` / `lineHeight` / `fontWeight`. Apply with `hydraTextStyleToReactCss`. |
| 4 | **Spacing** | Mirror `itemSpacing`, `paddingTop/Bottom/Left/Right` from `_deep` using `theme.useToken()` (`marginLG`=24, `marginMD`=20, `marginSM`=12, `marginXS`=8, `padding`=16, `paddingMD`=20). Nest `Space`/`Flex` `gap` to match Figma frame tree — do not flatten with one parent gap. |
| 5 | **Position** | Same element order, alignment (`primaryAxisAlignItems`, `counterAxisAlignItems`), and sibling grouping as Figma. CTAs stay in the **same horizontal row** as title when Figma uses `SPACE_BETWEEN`. |
| 6 | **Control size** | Read `componentProperties.size` on Button / Input / Select instances; set `size="large"` etc. to match rendered height. |
| 7 | **Tokens** | Colors, radii, borders, surfaces from Figma variables → repo semantic tokens / `src/theme/*` mirrors — not ad-hoc hex in JSX. |
| 8 | **Components** | Map Figma instances to existing `src/ui/antd.ts` exports; compose with `Flex`/`Space`/`Card` locally — no new shared components. |
| 9 | **Verification** | Mandatory final loop: Figma screenshot vs repo screen; fix and re-check until **identical** (max 3 passes). Run `npm run build` after code changes. |

### Don'ts (forbidden — causes drift)

| # | Don't |
|---|--------|
| 1 | **Don't invent copy** — no extra headlines, helper lines, dynamic project names, second paragraphs, or footer counts absent from Figma. |
| 2 | **Don't rephrase** — no UX “improvements” to labels, CTAs, or placeholders. |
| 3 | **Don't invent layout** — no new sections, reordered blocks, centered floats, or wrapping CTAs to a new row unless Figma wraps. |
| 4 | **Don't shift positions** — buttons, filters, icons, and titles stay on the same side and row as Figma. |
| 5 | **Don't improvise spacing** — no single parent `gap` when Figma nests frames with different `itemSpacing` (e.g. 24 between sections, 20 inside container, 12 inside card). |
| 6 | **Don't guess typography** — no `Typography` defaults, wrong role (e.g. `Base/Normal` for `Large/Strong` 16/24/600), or `Title level` without `hydraTypography` role. |
| 7 | **Don't use raw px/hex** in screens for design intent — tokens / allowed mirror modules only. |
| 8 | **Don't swap components** — e.g. `Select` for `Radio`, table for card list, unless Figma shows it. |
| 9 | **Don't change flow/backend** — no routes, navigation order, data models, or step logic unless explicitly scoped. |
| 10 | **Don't close as “close enough”** — partial parity is failure; escalate after 3 passes. |

### Do (required) — detail

| Area | Rule |
|------|------|
| **Layout** | Reproduce the **same structure and order** of regions, groups, and rows/columns as in the Figma tree. Mirror nesting (header → toolbar → content → footer) from the dev export. |
| **Position** | Every element must sit in the **same relative position** as in Figma — same alignment (left/center/right), same row/column placement, same vertical and horizontal order within each group. Use Figma auto-layout direction, alignment, and justify from the dev export (`figma_get_component_for_development` / `_deep`). Do not float, center, or reflow items differently than the frame. |
| **Elements** | Use the **same UI elements** Figma specifies (Button, Input, Select, Table, Card, Tag, Alert, etc.). Map Figma components to matching **`src/ui/antd.ts`** exports — do not substitute a different control type. |
| **Spacing** | Match Figma **gaps, padding, and margins** via the closest **`theme.useToken()`** spacing keys (`padding*`, `margin*`, `size*`) or `shellLayout`. If Figma uses a value with no token, use the **exact Figma value** only through allowed theme/figma mirror modules — never approximate with a “close enough” guess in JSX. |
| **Tokens** | Colors, radii, borders, and surfaces must trace to **Figma variables / semantic tokens** (`figma_get_variables`, `figma_browse_tokens`) and repo mirrors (`src/theme/*`). Prefer the **same semantic** Figma binds, not a different palette choice. |
| **Typography** | For every text node that **differs** from current repo styling, apply the **matching Figma text style** from `figma_get_text_styles` → `hydraTypography.ts` (`hydraTextStyleToReactCss` or named role objects). Fix weight, size, line height, and role — do not leave repo defaults where Figma differs. **Never** reuse `Small/*` for labels that Figma renders as `Base/*` or `Large/*` (e.g. `Input` `size=large` chips use **Large/Normal** or **Large/Strong**, not Small). |
| **Control sizing** | Read **`componentProperties`** on Figma `Button`, `Input`, `Select`, and other antd instances in `_deep` export. Match **`size`** variant (`large` / `middle` / `small`) on the repo component (`size="large"` etc.). Match rendered **height** to `controlHeight` / `controlHeightLG` tokens — do not shrink CTAs because a shared header helper defaults smaller. |
| **CTA / action placement** | CTAs must sit in the **same parent auto-layout frame** as Figma (e.g. title column + button group as **siblings** in one `space-between` horizontal row). Use Figma `primaryAxisAlignItems`, `counterAxisAlignItems`, and `itemSpacing` from that frame. Do **not** nest actions inside a title helper if Figma keeps them as a sibling group; use `wrap="nowrap"` when Figma does not wrap. |
| **Composition** | Combine existing atoms per Figma grouping (e.g. `Flex` + `Space` + `Card`) but **do not rearrange** content for “better UX” unless the user explicitly asks. |
| **Scope** | Change **only** the screen(s) / component(s) tied to the listed `nodeId`(s). Visual implementation only. |

### Do not (forbidden)

- **Do not invent layout** — no new columns, reordering sections, collapsing groups, or “simplified” arrangements not in Figma.
- **Do not shift positions** — no moving buttons, labels, icons, or fields to different sides, rows, or alignments than Figma shows (e.g. action on the right must stay right; toolbar items keep Figma order).
- **Do not invent elements** — no extra buttons, labels, badges, dividers, or helper text absent from the frame.
- **Do not improvise spacing** — no arbitrary `gap`, `padding`, or `margin` values that diverge from Figma because they “look fine.”
- **Do not swap components** — e.g. do not replace a `Select` with `Radio.Group` or a table with a card list unless Figma shows that pattern.
- **Do not touch flow or backend** — no route changes, navigation order, step logic, API calls, data models, mock data shape, or state-machine changes unless the user **explicitly** scopes that work separately.
- **Do not “improve” copy, CTAs, or step order** beyond what Figma shows.

### Delta workflow (repo differs from Figma)

1. Fetch dev context + screenshot for the target `nodeId`.
2. From **`figma_get_component_for_development_deep`**, record per region:
   - **Auto-layout:** `layoutMode`, `itemSpacing`, `paddingLeft/Right/Top/Bottom`, `primaryAxisAlignItems`, `counterAxisAlignItems`
   - **Text roles:** map each label to `hydraTypography.ts` role (Title/Heading *, Base/*, Large/*, Small/*)
   - **Instances:** `componentProperties` → `size`, `type`, `state` on Button / Input / Select
3. List **concrete deltas**: layout, **element positions**, missing/extra elements, spacing, **button/control sizes**, token bindings, text styles.
4. Implement deltas **one-to-one** toward Figma — not toward an imagined better screen.
5. Run **Final parity verification** (below).

### Final parity verification (mandatory — do not skip)

Before marking Figma → repo work **complete**, prove the implementation is **identical** to Figma.

**Loop (repeat until identical or blocked):**

1. `figma_take_screenshot` on the target `nodeId`.
2. Compare Figma screenshot to the **implemented screen** (dev build or in-app view) across **all** fidelity dimensions:
   - layout structure and nesting
   - element types and count
   - **positions** and alignment (especially **CTA groups** vs title blocks — same row, same side as Figma)
   - spacing (gap, padding, margin) — cross-check against `_deep` `itemSpacing` / padding values
   - **control dimensions** — button height, input/select height, chip min-height vs Figma `size` variant
   - colors, borders, radii, surfaces (tokens)
   - typography (size, weight, line height, style role) — **field labels**, headers, titles, CTAs each checked
   - copy and visible labels (must match Figma)
3. **If anything differs** — list each mismatch explicitly → fix in repo → re-run **`npm run build`** if code changed → go back to step 1.
4. **If identical** — task may close.
5. **If still not identical after 3 fix passes** — stop. Report remaining diffs and escalate per **hydra-design-to-code** (missing component/token); do **not** close as “good enough.”

**Rules for the loop:**

- Treat “close enough” as **failure** — only **identical** passes.
- Each pass fixes **only** what the comparison found; do not introduce new layout or flow changes while fixing.
- Optional aid: `figma_check_design_parity` when available — still confirm with screenshot + visual compare.

### Escalation (still no guessing)

If Figma requires a control or token that does not exist in repo, follow **`hydra-design-to-code`** strict escalation — **stop and ask**. Do **not** fill the gap with a different layout or invented UI.

### B — Write / edit design in Figma

1. `figma_get_status` → `figma_navigate`
2. `figma_search_components` when reusing library pieces
3. `figma_execute` for creates/updates
4. **Required:** `figma_take_screenshot` → analyze → iterate (max 3) → final screenshot

### C — Token / DS work only

Use `figma_get_variables`, `figma_audit_design_system`, etc. Pair with **`figma-repo-parity`** / **`ds-parity-auditor`** when syncing tokens — still **Console only**, never official MCP.

## Multi-step BOM upload flow (back + progress chrome)

When implementing or syncing **BOM file upload** steps (field mapping → parsing review → matching), **every step screen** must use the same top chrome order and position:

1. **Back button** — same shell row as other BOM pages (`PageBackButton` pattern: default button, left icon). Step 1 → back to BOM hub; step 2 → back to field mapping; step 3 → back to parsing review. Preserve `location.state` on back navigation.
2. **Progress Bar** — Figma **`5102:15683`**, always **directly below** the back button (never above title-only content without back). **Gap back → stepper:** `token.marginLG` (24px) — owned inside `BomUploadFlowStepChrome`, not parent `Space` children.

Progress bar contents:

- **Filename** (from `location.state.uploadFileName`, fallback demo name)
- **3-step `Steps`** (`Map Columns` → `Review Parsed Rows` → `Match parts`) with `current` = `0 | 1 | 2`
- **Status tag** (step-specific copy, e.g. mapped-field count on step 1)

Reuse **`BomUploadFlowStepChrome`** (`back` + `BomUploadProgressBar`) in `src/bom/components/` as the **first child** in the page vertical `Space` — do not reorder, omit back, or duplicate inline progress UI per page. Carry upload state through `navigate(..., { state })` so filename and mapping persist across steps.

## Copy parity (strict)

When syncing a Figma frame to repo, **user-visible strings must match Figma exactly** — extract every `TEXT` node from `figma_get_component_for_development_deep` and align repo copy 1:1.

- **Do not** invent headlines, descriptions, helper lines, or dynamic copy (e.g. interpolating project name) unless the same string exists in Figma.
- **Do not** add extra paragraphs/lines under cards or section headers when Figma has only one description line.
- **Do not** rephrase, summarize, or “improve” microcopy during implementation.
- Button labels, placeholders, table headers, and section titles: **verbatim** from Figma (including capitalization, e.g. `New BOM Project` not `New BOM project`).

## Scope discipline

- Fetch context **only** for nodes the user listed or `figma_get_design_changes` returned.
- Do not pull entire file unless user asks.
- Do not scan whole repo; map nodes → routes/components from targeted search.

## Failure handling

| Situation | Action |
|-----------|--------|
| Console not connected | Stop. Instruct user: open file + Desktop Bridge. **Do not** switch to official MCP. |
| Tool missing on Console | Use closest Console alternative from map above. Ask user if none fits. |
| User explicitly says "official Figma MCP" | Only then may official MCP be used for that message. |

## Pairing skills (repo side)

| Phase | Skills / rules |
|-------|----------------|
| Plan | `prd-ux-implementation-planner`, `token-discipline`, `scope-guardrails` |
| Implement UI | `hydra-design-to-code`, `hydra-ui-tokens-and-components`, `product-ux-rules` |
| Guardrails | `ux-guardrails`, `AGENTS.md` |

## Example prompt (user)

```
@figma-console-mcp @prd-ux-implementation-planner

Figma Console ONLY. Changed frames:
- https://figma.com/design/…?node-id=12-34

Match Figma end-to-end: same layout, element positions, elements, spacing, tokens, typography.
No invented UI. No flow/backend changes.
At the end, verify identical to Figma; if not, fix and re-check until it matches.
Plan then implement approved slice. No official Figma MCP.
```

## Self-check before any Figma MCP call

- [ ] Server is `user-figma-console`
- [ ] Not calling any `plugin-figma-figma` tool
- [ ] `figma_get_status` OK (or user confirmed Bridge running)
- [ ] `nodeId` uses colon format
- [ ] Scope limited to requested / changed nodes

## Self-check before closing Figma → repo work

- [ ] **Final parity loop completed** — Figma screenshot and repo screen are **identical** on all dimensions (layout, positions, elements, spacing, tokens, typography, copy)
- [ ] If mismatches were found, they were **fixed and re-verified** (up to 3 passes) — not left as known drift
- [ ] Layout, element types, content order, and **positions** match Figma (no invented structure or shifted placement)
- [ ] Spacing and grouping match Figma via tokens / allowed mirrors (no improvised gaps)
- [ ] Colors, radii, and surfaces use Figma-aligned semantic tokens
- [ ] Every differing text style mapped to `hydraTypography` / Figma text styles (title, body, chip labels, table headers)
- [ ] Button / Input / Select **sizes** match Figma instance `size` variant (`large` etc.)
- [ ] CTA **position** matches Figma sibling frame (not dropped to a new row unless Figma wraps)
- [ ] No flow, routing, or backend changes unless explicitly in scope
- [ ] If still not identical after 3 passes: remaining diffs **reported** and user **asked** — task not closed as done
