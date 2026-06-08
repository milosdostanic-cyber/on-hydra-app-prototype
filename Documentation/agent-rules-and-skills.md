# Agent rules & skills catalog (Hydra prototype)

For each entry: **name**, **location**, **purpose**, **what it does**, **how to invoke**.

In chat: `@` + name or file path.

---

# RULES

Rules live in `.cursor/rules/*.mdc`. Cursor loads them automatically when `alwaysApply: true`.

---

## Token discipline

- **Location:** `.cursor/rules/token-discipline.mdc`
- **Purpose:** Keeps context small and changes phased — agent does not scan the whole repo or code before a plan.
- **What it does:**
  - Reads only files directly related to the task.
  - Does not scan the entire repo unless necessary.
  - Searches by feature name, route, component, or path.
  - Summarizes large files instead of pasting them.
  - Does not copy the full PRD into chat.
  - Works in phases: plan first, then implementation.
  - Stops after the plan if the user did not ask for code.
  - During implementation, changes only files from the approved plan.
- **How to invoke:** Always active (`alwaysApply: true`). Also: `@token-discipline`

---

## Scope guardrails

- **Location:** `.cursor/rules/scope-guardrails.mdc`
- **Purpose:** Stops a single-feature change from spreading across the project.
- **What it does:**
  - Requires an exact file list before coding.
  - Forbids unrelated routes, components, styles, or data models.
  - Forbids broad refactors and renames without need.
  - Does not change shared components unless required; prefers a new prop over behavior changes.
  - Requires small, reviewable slices.
  - Requires a plan before writing code.
- **How to invoke:** Always active. Also: `@scope-guardrails`

---

## Product UX rules

- **Location:** `.cursor/rules/product-ux-rules.mdc`
- **Purpose:** Rules for screens used by non-technical humans.
- **What it does:**
  - Prioritizes clear step-by-step flows, not jargon.
  - One clear primary CTA; secondaries must not compete.
  - Progressive disclosure for advanced content.
  - Default UI must not feel like a spreadsheet.
  - Warnings must state whether they block or are informational.
  - Every screen answers: what happened, what to review, next action, what happens after.
  - Uses existing DS components; new patterns only when old ones cannot work.
- **How to invoke:** Always active. Also: `@product-ux-rules`

---

## UX guardrails

- **Location:** `.cursor/rules/ux-guardrails.mdc`
- **Purpose:** Protects the design system — safe screen prototyping without breaking shared foundations.
- **What it does:**
  - Uses Ant Design and existing product components as-is.
  - Does not create new core components.
  - Does not modify shared components (structure, style, states, tokens, behavior).
  - Does not create or modify design tokens.
  - Does not use raw hex/px unless explicitly instructed.
  - Reuses existing patterns; new layout only as local screen composition.
  - One primary CTA per context.
  - Covers states: loading, empty, error, success, disabled, read-only, no results, missing data.
  - Changes only the requested screen/flow; stops and asks if shared impact.
  - Does not guess; offers 2–3 options and waits.
- **How to invoke:** Always active. Also: `@ux-guardrails`

---

## Hydra UI tokens

- **Location:** `.cursor/rules/hydra-ui-tokens.mdc`
- **Purpose:** Where colors, spacing, and typography may live in code — no random literals in TSX.
- **What it does:**
  - Colors, spacing, radius, motion from `theme.useToken()`, `shellLayout`, `sidebarSemanticsLight`, or `src/theme/*` mirrors.
  - Forbids inline `#hex`, `rgb`, ad-hoc `px` for design intent.
  - Typography only from `figmaTypography.ts` + antd `Typography` / theme fonts.
  - Literals only in listed `figma-*` / `primaryPrimitive*` / `sidebarSemantics` files.
  - Exceptions: `transparent`, `none`, layout `100%` / `100vh`.
- **How to invoke:** Always active. Also: `@hydra-ui-tokens`

---

## Hydra UX composition

- **Location:** `.cursor/rules/hydra-ux-composition.mdc`
- **Purpose:** Allows better layout within tokens — Card, Flex, Space, Tag combinations.
- **What it does:**
  - Combines blocks from `src/ui/antd.ts`.
  - Allows local cards and panels from multiple antd components.
  - May use existing primitives from mirror modules for subtle accent — no new hex.
  - Does not relax raw literal bans from `hydra-ui-tokens`.
- **How to invoke:** Always active. Also: `@hydra-ux-composition`

---

## Figma repo parity

- **Location:** `.cursor/rules/figma-repo-parity.mdc`
- **Purpose:** Figma (Ant Design kit) and repo stay aligned when the visual system changes.
- **What it does:**
  - When tokens, brand colors, typography, theme, or component visuals change — updates both Figma and repo (unless user says code-only or Figma-only).
  - Maps Figma paths (`Color/Primary/...`) to files (`primaryPrimitiveBlue.ts`, `antdTheme.ts`, etc.).
  - Runs `npm run build` after theme edits.
  - Documents intentional gaps if Figma cannot mirror yet.
- **How to invoke:** Always active. Explicitly for theme/token work: `@figma-repo-parity`

---

## Hydra design-to-code

- **Location:** `.cursor/rules/hydra-design-to-code.mdc`
- **Purpose:** Workflow: design reference (Figma URL, screenshot, mock) → React code in Hydra conventions.
- **What it does:**
  - Decomposes design into regions (header, sidebar, form, table, modal…).
  - Before code, finds patterns in `src/ui/antd.ts` and `src/shell/`.
  - Maps text to `figmaTypography.ts` or theme typography.
  - Maps colors to semantic tokens (`colorText`, `colorBgContainer`, …).
  - Maps spacing to `token.padding*`, `shellLayout`, etc.
  - Stops and asks if barrel or semantic token is missing.
  - Runs build if theme/TS files were touched.
- **How to invoke:** Not always active — attach with design: `@hydra-design-to-code`

---

## DS parity auditor

- **Location:** `.cursor/rules/ds-parity-auditor.mdc`
- **Purpose:** Audit and sync the full design system: Figma DS ↔ component library ↔ repo tokens.
- **What it does:**
  - Always starts with audit — changes nothing immediately.
  - Compares token collections, semantics, alias chains, components, states, variants.
  - Reports location, severity, and options for each mismatch.
  - Asks sync direction: Figma → repo or repo → Figma — does not decide alone.
  - Does not silently overwrite tokens or components.
  - Ant Design is the structural baseline.
  - Not for a single product screen update — too broad.
- **How to invoke:** Only for DS audit/sync: `@ds-parity-auditor`

---

## Plan orchestrator

- **Location:** `.cursor/rules/plan-orchestrator.mdc`
- **Purpose:** Single entry point — orchestrates skills/rules and writes **only** an English MD plan in `Documents/`. **Never implements code.**
- **What it does:**
  - Classifies request: `figma-delta`, `prd-feature`, `bom-feature`, `ui-screenshot`, `ui-change`, `ds-parity`.
  - Orchestrates the matching skills/rules for planning.
  - Documents what was used and why (explicit, implicit, skipped).
  - Produces scope audit, gap table, phases, guardrails, acceptance checklist.
  - Writes plan: `Documents/plans/YYYY-MM-DD-<slug>-plan.md` (BOM: `Documents/Bom/…`).
  - **Embeds implementation invocation** — per-phase `@` skills and rules and copy-paste prompts for a later chat.
  - Figma types use only `figma-console-mcp` — not official MCP.
  - **Only allowed file writes:** plans under `Documents/`. Does not touch `src/`, theme, or config.
- **How to invoke:** `@plan-orchestrator` + task description + `Plan only. No implementation.`

---

# SKILLS

Skills are folders with `SKILL.md`. Cursor loads them when attached or registered in Settings → Skills.

---

## figma-console-mcp

- **Location:** `.cursor/skills/figma-console-mcp/SKILL.md`
- **Purpose:** **Only** allowed Figma MCP for this project — TJ Pitre Figma Console (`user-figma-console`), not official Figma MCP.
- **What it does:**
  - All Figma read/write via `user-figma-console` (Desktop Bridge plugin).
  - Forbids `get_design_context`, `use_figma`, `generate_figma_design`, and other official tools.
  - Maps tasks to Console tools: `figma_get_component_for_development`, `figma_navigate`, `figma_get_design_changes`, `figma_take_screenshot`, etc.
  - Before first call: `figma_get_status` (probe) — if disconnected, stops; does not fall back to official MCP.
  - `node-id` format: `695:313` (colon), not hyphen.
  - Limits scope to user-listed nodes or `figma_get_design_changes` output.
- **How to invoke:** `@figma-console-mcp` — required for any Figma work in this repo

---

## prd-ux-implementation-planner

- **Location:** `.cursor/skills/prd-ux-implementation-planner/SKILL.md`
- **Purpose:** Implementation plan before code — from PRD or changed Figma screens.
- **What it does:**
  - Does not write code until the user approves.
  - Finds only relevant routes, pages, components, state/API files.
  - Describes current user flow screen by screen.
  - Builds requirement / current / gap / UX risk / area table.
  - Splits work into phases with allowed files and acceptance criteria.
- **How to invoke:** `@prd-ux-implementation-planner` + `plan only, no code` in prompt

---

## hydra-ui-tokens-and-components

- **Location:** `Documentation/hydra-ai-pack/skills/hydra-ui-tokens-and-components/SKILL.md`
- **Purpose:** Skill form of UI rules — quick attach for implementation or screen review.
- **What it does:**
  - Imports from `src/ui/antd.ts`.
  - Styling via `theme.useToken()`, `shellLayout`, semantics only.
  - Typography from `figmaTypography.ts` — no ad-hoc font styles.
  - Forbids new core components and token changes without approval.
  - Local screen composition only when no pattern exists.
  - Same intent as `hydra-ui-tokens` + `ux-guardrails` rules (rules win if they differ).
- **How to invoke:** `@hydra-ui-tokens-and-components`

---

## caveman

- **Location:** `.agents/skills/caveman/SKILL.md`
- **Purpose:** Shorter agent replies — fewer chat tokens, same technical accuracy.
- **What it does:**
  - Strips articles, filler, pleasantries from replies.
  - Leaves code, errors, and technical terms intact.
  - Levels: `lite`, `full` (default), `ultra`, `wenyan-*`.
  - Does not change commit messages or PR descriptions.
- **How to invoke:** `@caveman` or `/caveman lite|full|ultra`

---

## caveman-compress

- **Location:** `.agents/skills/caveman-compress/SKILL.md`
- **Purpose:** Shrinks memory files (CLAUDE.md, todos, preferences) for smaller input.
- **What it does:**
  - Compresses prose to caveman format.
  - Preserves technical substance, code, URLs, structure.
  - Overwrites original; backup as `<file>.original.md`.
  - CLI scripts in `.agents/skills/caveman-compress/scripts/`.
- **How to invoke:** `@caveman-compress` or `/caveman-compress <filepath>`
- **Note:** Installed via `skills-lock.json` (source: `JuliusBrussee/caveman`).

---

# DOCUMENTS (not rules/skills, but agents use them)

---

## AGENTS.md

- **Location:** `AGENTS.md` (repo root)
- **Purpose:** Short agent contract for this repo + BOM-specific rules.
- **What it does:**
  - General: plan before code, small diff, do not touch unrelated areas, UX for non-technical users.
  - BOM: source of truth `docs/prd/bom-prd.md`; flow upload → map → review → SKU; do not touch Content File Manager; “Choose” not “Refine” when no suggestion.
- **How to invoke:** Automatic in repo context. For BOM add `@docs/prd/bom-prd.md`

---

## hydra-tokens-and-components (markdown checklist)

- **Location:** `Documentation/hydra-ai-pack/rules/hydra-tokens-and-components.md`
- **Purpose:** Printable checklist of UI constraints — `@` mention without skill registration.
- **What it does:** Same as `hydra-ui-tokens-and-components` skill in markdown list form.
- **How to invoke:** `@Documentation/hydra-ai-pack/rules/hydra-tokens-and-components.md`

---

# Do not use (Figma in this project)

| Avoid | Use instead |
|-------|-------------|
| Official Figma MCP (`plugin-figma-figma`) | `figma-console-mcp` skill |
| Skills: `figma-implement-design`, `figma-use`, `figma-generate-design` | `figma-console-mcp` + `hydra-design-to-code` |

**Console prerequisite:** Figma Desktop open + Desktop Bridge plugin in the file.

---

# Example prompts

**Orchestrated plan (recommended):**
```
@plan-orchestrator

[Task description + Figma URL / PRD path / screenshot]
Plan only. No implementation.
```

**Implement from plan (new chat — copy from plan file):**
```
Implement Phase 1 only from: Documents/plans/2026-06-08-example-plan.md

@figma-console-mcp
@hydra-design-to-code
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline

Allowed files: [from plan]
```

**DS / token audit:**
```
@ds-parity-auditor @figma-console-mcp @figma-repo-parity
```

---

# Folder layout

| Folder | Contents |
|--------|----------|
| `.cursor/rules/` | All rules (`.mdc`) |
| `.cursor/skills/` | Project skills (`figma-console-mcp`, `prd-ux-implementation-planner`) |
| `.agents/skills/` | External skills (`caveman`, `caveman-compress`) |
| `Documentation/hydra-ai-pack/` | Portable checklist and skill copy |
| `Documents/plans/` | Plans from `@plan-orchestrator` |
| `Documents/Bom/` | BOM plans and userflow docs |
| `AGENTS.md` | Root agent contract |

**Register skills in Cursor:** Settings → Skills → add paths under `.cursor/skills/` and optionally `Documentation/hydra-ai-pack/skills/hydra-ui-tokens-and-components`.

---

*Update this file when adding a new rule or skill.*
