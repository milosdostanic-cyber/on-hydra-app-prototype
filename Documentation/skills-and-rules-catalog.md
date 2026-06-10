# Skills & rules catalog (Hydra prototype)

This document lists every rule and skill the agent uses in this repo. Each entry includes: **file name**, a **plain-language explanation for non-technical readers** (2 paragraphs), and **how to run it**.

In Cursor chat, attach skills and rules with **`@`** + name (e.g. `@hydra-ux-audit`).

---

# RULES

Rules live in `.cursor/rules/*.mdc`. Some are always on; others are attached only when needed.

---

## token-discipline.mdc

**Location:** `.cursor/rules/token-discipline.mdc`

The agent does not read the whole project at once — only files directly related to your task. That keeps work faster and reduces the chance of changing the wrong things.

It plans first (what to change and where), then writes code — unless you explicitly ask for a plan only. It does not paste the full PRD into chat and does not edit files outside the approved plan.

**How to run:** Always active automatically. Manual: `@token-discipline`

---

## scope-guardrails.mdc

**Location:** `.cursor/rules/scope-guardrails.mdc`

Stops a small change on one screen from spreading across the whole project. The agent must know exactly which files it may touch before writing code.

It avoids broad refactors, unnecessary renames, and changes to shared components unless required — and then prefers a safe addition (e.g. a new prop) over breaking existing behavior.

**How to run:** Always active automatically. Manual: `@scope-guardrails`

---

## product-ux-rules.mdc

**Location:** `.cursor/rules/product-ux-rules.mdc`

Rules for screens used by everyday, non-technical people. Priority goes to clear steps, one main action per screen, and plain language without jargon.

Every screen should answer: what happened, what needs review, what the next step is, and what happens after that. Warnings must say whether they block work or are informational only.

**How to run:** Always active automatically. Manual: `@product-ux-rules`

---

## ux-guardrails.mdc

**Location:** `.cursor/rules/ux-guardrails.mdc`

Protects the design system — the agent may prototype screens but must not break shared components, tokens, or established patterns. It uses existing Ant Design and Hydra components as-is.

It does not introduce random colors and spacing, create new “core” components, or change tokens. When unsure, it offers 2–3 options and waits for your decision instead of guessing.

**How to run:** Always active automatically. Manual: `@ux-guardrails`

---

## hydra-ui-tokens.mdc

**Location:** `.cursor/rules/hydra-ui-tokens.mdc`

Defines where color, spacing, radius, and typography may come from in code — Hydra theme files, not hand-typed values on the screen.

The agent must not put `#hex`, `rgb`, or arbitrary `px` in TSX for visual design. Typography comes from `figmaTypography.ts` and Ant Design theme tokens.

**How to run:** Always active automatically. Manual: `@hydra-ui-tokens`

---

## hydra-ux-composition.mdc

**Location:** `.cursor/rules/hydra-ux-composition.mdc`

Lets the agent compose nicer layouts from existing pieces (Card, Flex, Space, Tag, etc.) — still within token rules.

It may add subtle emphasis using existing primitive colors from theme modules, without new random colors. The goal is clearer hierarchy and readability, not decoration for its own sake.

**How to run:** Always active automatically. Manual: `@hydra-ux-composition`

---

## figma-repo-parity.mdc

**Location:** `.cursor/rules/figma-repo-parity.mdc`

When the visual system changes (colors, fonts, theme), Figma and the repository must stay aligned — unless you explicitly say “code only” or “Figma only.”

The agent knows which Figma variable maps to which code file (`primaryPrimitiveBlue.ts`, `antdTheme.ts`, etc.) and runs a build after theme edits. Intentional gaps are documented.

**How to run:** Always active automatically. For theme/token work: `@figma-repo-parity`

---

## hydra-design-to-code.mdc

**Location:** `.cursor/rules/hydra-design-to-code.mdc`

Workflow when you have a design (Figma link, screenshot, or mock) and want implementation in Hydra React code following project conventions.

The agent first finds existing patterns in `src/ui/antd.ts` and the shell layout, maps text to typography, colors to semantic tokens, and spacing to theme tokens — and stops to ask if something is missing from the system.

**How to run:** Not always active. Attach with design work: `@hydra-design-to-code`

---

## ds-parity-auditor.mdc

**Location:** `.cursor/rules/ds-parity-auditor.mdc`

For a full design-system review: Figma ↔ components ↔ repo tokens. It changes nothing immediately — it audits and reports first.

It compares token collections, components, states, and variants. It asks which sync direction you want (Figma → code or the reverse). Not for a small single-screen tweak.

**How to run:** DS audit/sync only: `@ds-parity-auditor`

---

## plan-orchestrator.mdc

**Location:** `.cursor/rules/plan-orchestrator.mdc`

Single entry point for planning: the agent writes a plan in English under `Documents/plans/` (BOM: `Documents/Bom/`) but **never writes code** in that step.

It classifies the task (Figma delta, PRD, BOM, screenshot, UI change, DS parity), pulls in the right skills/rules, and documents phases, allowed files, and copy-paste prompts for later implementation.

**How to run:**
```
@plan-orchestrator

[Task description + Figma URL / PRD / screenshot]
Plan only. No implementation.
```

---

## figma-console-mcp.mdc

**Location:** `.cursor/rules/figma-console-mcp.mdc`

**Rule** that tells the agent to use **Figma Console MCP** (TJ Pitre, Desktop Bridge) for all Figma work in this project — **not** the official Cursor Figma plugin MCP.

When reading or editing Figma, the agent calls server `user-figma-console`. You need Figma Desktop, the file open, and the Desktop Bridge plugin running. If disconnected, the agent asks you to connect — it does not silently fall back to the official MCP.

**How to run:** Always active automatically for Figma tasks in this repo. For Figma work, also attach: `@figma-console-mcp` (the skill below adds the detailed workflow)

---

## figma-layout-change-comments.mdc

**Location:** `.cursor/rules/figma-layout-change-comments.mdc`

After Figma edits, the agent can leave **canvas comments** (what changed and why) — in English, only on relevant nodes.

It uses Figma Console MCP only (`figma_post_comment`, `figma_get_comments`). It does not comment empty screens or buttons that were not part of that edit session.

**How to run:** When you want Figma changes documented/annotated: `@figma-layout-change-comments` (+ `@figma-console-mcp`)

---

## figma-repo-to-screen-parity.mdc

**Location:** `.cursor/rules/figma-repo-to-screen-parity.mdc`

Reverse of design-to-code: you have a **finished screen in code** and want the **Figma frame** to match 1:1. It edits only what you have selected in Figma.

The agent reads the repo implementation, uses DS components in Figma, and does not touch anything outside your selection. If nothing is selected, it stops and asks you to select a frame.

**How to run:** Repo link + Figma selection: `@figma-repo-to-screen-parity` + `@figma-console-mcp`

---

## hydra-prd-ux-playbook.mdc

**Location:** `.cursor/rules/hydra-prd-ux-playbook.mdc`

Entry point for PRDs, specs, or new pages/flows. It reads the **product map** (`Documentation/hydra-app-capabilities.md`) first so it does not invent routes or modules that already exist differently.

Then it compares the PRD to code (diff or existing implementation), asks for confirmation when unclear, and updates the map when new behavior is adopted.

**How to run:** `@hydra-prd-ux-playbook` + PRD path or feature description

---

## import-module-from-zip.mdc

**Location:** `.cursor/rules/import-module-from-zip.mdc`

Safe way to bring a module from a ZIP (pages, flow, layout) into this repo: **UX from the ZIP stays**, but **components and tokens come from the target repo**.

The agent does not touch existing modules, sidebar, backend, or global layout. It does not copy token/component files from the ZIP — it maps to what already exists in Hydra and asks when unsure.

**How to run:** `@import-module-from-zip` + path to ZIP or folder + “integrate into repo”

---

# SKILLS

Skills are folders with `SKILL.md`. Register in Cursor: **Settings → Skills** (paths below).

---

## figma-console-mcp

**Location:** `.cursor/skills/figma-console-mcp/SKILL.md`

**Skill** that explicitly routes all Figma work through **Figma Console MCP** (`user-figma-console`) instead of the official Figma MCP (`plugin-figma-figma`). This is the required path for this Hydra project.

The agent uses Console tools (e.g. `figma_get_component_for_development`, `figma_navigate`, `figma_capture_screenshot`, batch variable updates). For Figma ↔ code sync it expects 1:1 visual parity and does not use forbidden official tools (`use_figma`, `get_design_context`, etc.) unless you explicitly request the official MCP.

**Prerequisite:** Figma Desktop open + **Desktop Bridge** plugin in that file.

**How to run:** `@figma-console-mcp` — required for any Figma task in this repo. Example:
```
@figma-console-mcp
@hydra-design-to-code

Implement the screen from this Figma URL: [link]
```

---

## prd-ux-implementation-planner

**Location:** `.cursor/skills/prd-ux-implementation-planner/SKILL.md`

Builds an **implementation plan before code** — from a PRD or changed Figma screens. It compares requirements, current code, existing user flow, and components.

Output is phased: what to change, where, why, which files are allowed, and acceptance criteria — without touching unrelated parts of the app.

**How to run:**
```
@prd-ux-implementation-planner

[PRD path or description + Figma delta if any]
Plan only, no code.
```

---

## hydra-ux-audit

**Location:** `.cursor/skills/hydra-ux-audit/SKILL.md`

**Universal quality gate** for UI: build, review, fix, or improve a screen. It checks whether the flow is clear for users, PRD requirements work, components/tokens/typography are correct, and buttons/controls are consistent.

After implementation the agent self-checks and fixes critical issues before closing the task. It can produce a report with priorities (P0/P1/P2).

**How to run:**
```
@hydra-ux-audit

[Description: file, flow, Figma link, or “my changes”]
```
Review only, no edits: add `Audit only`

---

## hydra-ui-tokens-and-components

**Location:** `Documentation/hydra-ai-pack/skills/hydra-ui-tokens-and-components/SKILL.md`

Skill form of the UI rules — quick to attach during implementation or screen review. Enforces import from `src/ui/antd.ts`, styling via `theme.useToken()`, and typography from `figmaTypography.ts`.

It forbids new core components and token changes without approval. Same intent as `hydra-ui-tokens` + `ux-guardrails` (if they differ, rules win).

**How to run:** `@hydra-ui-tokens-and-components` with UI implementation or review

---

## caveman

**Location:** `.agents/skills/caveman/SKILL.md`

Shortens agent replies (~75% less chat “noise”) — short, direct sentences, but **without losing technical accuracy**. Code and terms stay intact.

Use when you want faster, cheaper chat messages — not shorter commit messages or PR descriptions.

**How to run:** `@caveman` or in your message: `caveman mode`, `talk like caveman`, `less tokens`, `/caveman lite|full|ultra`

---

## caveman-compress

**Location:** `.agents/skills/caveman-compress/SKILL.md`

Shrinks **memory files** (e.g. `CLAUDE.md`, todo lists, preferences) by compressing them into “caveman” format — fewer tokens on load, same technical content.

The original is overwritten; backup is saved as `<file>.original.md`.

**How to run:** `@caveman-compress` or `/caveman-compress <file-path>`

---

# RELATED DOCUMENTS (not skills/rules, but agents use them)

---

## AGENTS.md

**Location:** `AGENTS.md` (repo root)

Short agent contract for this repo: plan before code, small diffs, UX for non-technical users. For BOM it adds specific rules (source of truth `docs/prd/bom-prd.md`, flow upload → map → review → SKU, “Choose” not “Refine”).

**How to run:** Automatic in repo context. For BOM add: `@docs/prd/bom-prd.md`

---

## hydra-tokens-and-components.md

**Location:** `Documentation/hydra-ai-pack/rules/hydra-tokens-and-components.md`

Printable checklist version of UI constraints — same purpose as the `hydra-ui-tokens-and-components` skill, without registering in Settings → Skills.

**How to run:** `@Documentation/hydra-ai-pack/rules/hydra-tokens-and-components.md`

---

# Do not use for Figma in this project

| Avoid | Use instead |
|-------|-------------|
| Official Figma MCP (`plugin-figma-figma`) | `@figma-console-mcp` + rule `figma-console-mcp.mdc` |
| Skills: `figma-use`, `figma-implement-design`, `figma-generate-design` | `@figma-console-mcp` + `@hydra-design-to-code` |

**Console prerequisite:** Figma Desktop + Desktop Bridge plugin in the active file.

---

# Example full prompts

**Plan (recommended):**
```
@plan-orchestrator

[Description + Figma URL / PRD]
Plan only. No implementation.
```

**Implement from plan:**
```
Implement Phase 1 from: Documents/plans/2026-06-10-example-plan.md

@figma-console-mcp
@hydra-design-to-code
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
```

**UX audit:**
```
@hydra-ux-audit
@hydra-ui-tokens-and-components

Target: src/bom/pages/BomMatchingPage.tsx
Audit and fix P0/P1.
```

---

# Folder layout

| Folder | Contents |
|--------|----------|
| `.cursor/rules/` | All rules (`.mdc`) |
| `.cursor/skills/` | Project skills (`figma-console-mcp`, `hydra-ux-audit`, `prd-ux-implementation-planner`) |
| `.agents/skills/` | External skills (`caveman`, `caveman-compress`) |
| `Documentation/hydra-ai-pack/` | Portable checklist and skill copy |
| `Documents/plans/` | Plans from `@plan-orchestrator` |
| `Documents/Bom/` | BOM plans and userflow docs |

---

*Update this file when you add a new rule or skill. Technical reference: [`Documentation/agent-rules-and-skills.md`](./agent-rules-and-skills.md).*
