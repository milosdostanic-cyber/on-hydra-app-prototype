---
name: hydra-module-builder
description: >-
  Builds new Hydra application modules from PRDs by first studying the existing
  repository's real screens, workflows, layouts, components, tokens, routes,
  states, and current implementation conventions. Use when the user provides a
  PRD, feature specification, or module brief and asks to analyze, plan, add, or
  implement a module that must feel native to the existing product.
---

# Hydra Module Builder

## Purpose

Turn a new-module PRD into a scoped Hydra implementation that looks and behaves
like an established part of the application.

Do this in two stages:

1. Understand the existing application through targeted inspection of real
   screens and workflows.
2. Map the PRD to those patterns, plan the smallest coherent implementation,
   implement when authorized, and validate product fit.

Do not treat the repository as a bag of isolated components. Study how page
chrome, content regions, controls, state, navigation, and feedback are composed
into complete user journeys.

## Authority and companion guidance

Follow, in order:

1. `AGENTS.md` and always-applied workspace rules.
2. `Documentation/hydra-app-capabilities.md` for adopted routes and module intent.
3. The supplied PRD or feature specification.
4. `@hydra-prd-ux-playbook` for PRD/new-screen sequencing.
5. `@prd-ux-implementation-planner` for gap analysis and file-scoped planning.
6. `@hydra-ux-audit` as the mandatory implementation quality gate.

If a Figma URL or screenshot is supplied, also load `@hydra-design-to-code` and
the required Official Figma skills. Do not use Figma Console unless explicitly
requested.

## Invocation modes

- **Analyze or plan only:** inspect and emit the analysis and implementation
  plan, then stop without editing application files.
- **Build or implement:** perform the same analysis and plan first. If the user
  explicitly asked to build/implement and no critical question remains, proceed
  incrementally within the plan.
- **Review existing work:** compare the PRD, current diff, adopted product map,
  and closest patterns; report or fix only as requested.

A PRD by itself is not authorization to edit code. Words such as “build,”
“implement,” “add,” “go ahead,” or equivalent explicit language authorize
implementation after analysis.

## Workflow

```text
Hydra Module Builder:
- [ ] 1. Classify request and read canonical product context
- [ ] 2. Locate relevant architecture and candidate reference modules
- [ ] 3. Study complete screens and workflows
- [ ] 4. Build a current-pattern map and reject legacy drift
- [ ] 5. Decompose the PRD into goals, screens, states, and interactions
- [ ] 6. Map requirements to references, components, and implementation gaps
- [ ] 7. Ask only critical questions
- [ ] 8. Emit the PRD analysis and short file-scoped plan
- [ ] 9. If authorized and unblocked, implement in small slices
- [ ] 10. Validate with @hydra-ux-audit and technical checks
```

## Stage 1 — Understand the existing application

### 1. Establish scope before searching

Read first:

- the supplied PRD/specification
- `Documentation/hydra-app-capabilities.md`
- `src/App.tsx` or the route owner relevant to the requested module
- the applicable shell/workspace layout
- `src/ui/antd.ts`
- the nearest module-level PRD or adopted plan, when one exists

Extract search anchors: entity names, user jobs, route terms, screen types,
actions, and state terms. Use these anchors for targeted searches. Do not scan
the entire repository by default.

### 2. Locate architecture and candidate references

Identify:

- route registration and nested route conventions
- module folder boundaries and page/component/data organization
- global versus project-scoped module behavior
- shell, sidebar, top bar, workspace layout, breadcrumbs, and page headers
- state ownership: local state, context, hooks, route state, storage, or API
- existing tests and mock/demo-data conventions

Choose 2–3 candidate reference modules based on the new module's primary job,
navigation model, and information density—not just similar names.

Examples of semantic matches:

- list/manage workspace → existing project or BOM workspace
- search/results/detail → catalog/search flow
- guided multi-step task → established upload/review flow
- CRUD configuration → existing form plus modal/drawer flow

### 3. Study complete screen composition

For each candidate, inspect the page and the components it actually imports.
Trace at least one representative user path from route entry to completion.

Record:

- page shell and content-width behavior
- header, breadcrumb, title, description, and action hierarchy
- section order and grouping
- `Space`, `Flex`, `Card`, grid, table, tabs, or split-view composition
- filters, search, sorting, selection, pagination, and row actions
- forms, validation, submit/cancel behavior, and dirty-state handling
- modal versus drawer decisions and footer behavior
- loading, initial empty, filtered no-results, error, success, disabled,
  read-only, missing-data, and permission states
- responsive collapse, wrapping, overflow, and mobile behavior
- component sizes, density, and action placement
- data/state flow and navigation preservation
- accessibility behavior already established nearby

Inspect isolated shared components only after seeing how real screens use them.

### 4. Build a practical pattern map

Create an internal evidence map:

| UX purpose | Current reference | Composition | Reusable component/token | Behavior to preserve |
|---|---|---|---|---|
| Page shell | `path` | layout regions | existing layout | navigation/content rules |
| Header/actions | `path` | title + actions | existing header/antd | CTA hierarchy |
| Data browse | `path` | filters + table + pagination | existing pieces | query/empty states |
| Data entry | `path` | form + feedback | Form/Input/etc. | validation/submit |
| Focused task | `path` | modal/drawer | existing pattern | open/close/footer |

Cover only patterns relevant to the PRD. Keep this map in working context unless
the user asks for a durable audit document.

### 5. Decide what is current

Prefer a pattern when several of these are true:

- it is reachable from an adopted route in the capabilities map
- it is used by multiple active screens or the closest production-like flow
- it uses `src/ui/antd.ts`, current shared components, semantic tokens, and
  established typography
- it follows current shell, breadcrumbs, state, and control-size conventions
- it has working handlers, complete states, and current tests or active usage
- it agrees with newer PRDs, approved plans, and explicit product decisions

Treat a pattern as legacy or inconsistent when evidence shows it is orphaned,
stub-only, superseded, duplicated by a shared implementation, unreachable,
deprecated, based on raw visual values, built from manual substitutes for Ant
Design, or inconsistent with current routes and rules.

File age or most recent commit alone does not prove correctness. If evidence is
mixed, state the conflict and choose the semantically strongest active pattern.

## Stage 2 — Apply the PRD

### 1. Understand product intent

Summarize:

- target user and business outcome
- entry point and completion outcome
- happy path
- required screens and transitions
- required data and actions
- roles and permission boundaries
- important failure and recovery paths
- explicit out-of-scope items

Separate PRD facts from inferred implementation details.

### 2. Create a screen and state inventory

For every required surface, identify:

- route or owning parent surface
- screen purpose and one primary action
- entry and exit transitions
- default, loading, empty, no-results, error, success, disabled, read-only,
  missing-data, and permission states that apply
- responsive behavior inherited from the closest reference
- whether it should be a page, tab, card region, modal, or drawer

Do not create a route when an established nested surface or focused overlay is
the better product match.

### 3. Map requirements to existing patterns

For each requirement, record:

| Requirement | Closest screen/module | Reused component/pattern | New local work | Decision or risk |
|---|---|---|---|---|

Also decide:

- module folder and naming structure
- route placement and route parameters
- shell/sidebar integration, if explicitly required
- breadcrumbs and page-header composition
- table/filter/pagination conventions
- card, form, tabs, modal, and drawer conventions
- state/data ownership and persistence
- responsive and accessibility behavior

Reuse hierarchy:

1. Existing feature component with the same purpose and behavior.
2. Existing shared component with a compatible public API.
3. Existing Ant Design component from `src/ui/antd.ts`.
4. Local feature composition using existing components and tokens.
5. New local feature component only when it removes meaningful duplication or
   owns distinct behavior.

Never force reuse when semantics or behavior are wrong. Do not copy and rename a
near-duplicate. A shared-component extension requires explicit approval; propose
a backward-compatible prop and list affected consumers before editing.

### 4. Ask only critical questions

Stop before implementation only when the answer would materially change:

- route/navigation architecture
- user roles, permissions, or data visibility
- destructive or irreversible behavior
- source of truth, API contract, or persistence
- required workflow order or completion criteria
- shared/global component, token, shell, or cross-module behavior
- a direct PRD conflict with adopted product behavior

Infer minor details from the chosen current pattern: spacing, control sizes,
empty-state structure, standard validation timing, modal footer order,
pagination placement, and responsive wrapping.

When blocked, ask one focused set of questions, recommend the option most
consistent with existing behavior, and explain the impact.

## Required pre-implementation output

Before editing application code, provide:

```markdown
## Module analysis
1. Module goal
2. Required screens, workflows, and states
3. Closest existing module references
4. Components and patterns to reuse
5. New feature-specific implementation
6. Conflicts, missing requirements, and critical questions

## Implementation plan
- Module structure
- Routes and navigation
- Main screens
- Shared components reused
- Feature-specific components
- Data and state handling
- Required states and responsive behavior
- Files allowed to change
- Files explicitly excluded
- Risks and validation
```

Keep it concise and evidence-based. Cite real repository paths; do not invent
files that were not found. For a large module, save the plan under
`Documents/plans/` and split implementation into reviewable phases.

If the request is analysis/plan only, stop here. If implementation was
explicitly requested and no critical question remains, continue.

## Incremental implementation

1. Implement route/module scaffolding only within the planned architecture.
2. Build the happy path from the closest screen composition.
3. Reuse existing shared and Ant Design components before adding local ones.
4. Add required states and recovery behavior alongside each async surface.
5. Wire actions, navigation, validation, and data/state; no dead controls.
6. Add or update focused tests using existing test conventions.
7. Re-check the PRD after each slice; do not defer core requirements to polish.

Preserve existing architecture and behavior outside the module. Do not modify
shared/global systems, design tokens, or unrelated modules unless the PRD
explicitly requires it and the user approves the wider impact.

## Validation

Run `@hydra-ux-audit` on every changed user-facing flow. Verify:

- every PRD requirement is implemented or explicitly deferred
- the happy path works click by click
- routes, breadcrumbs, headers, and navigation match adopted conventions
- closest current patterns and existing components were reused appropriately
- layouts, spacing, typography, control sizes, and grouping use existing tokens
- loading, empty, no-results, error, success, disabled, read-only,
  missing-data, and permission states are covered where applicable
- responsive and keyboard behavior matches the chosen reference
- no unnecessary duplicate or new shared/core component was created
- no raw design values or new tokens were introduced
- existing modules and shared behavior remain intact

Then:

- run `npx tsc --noEmit`
- run relevant tests from the repository's existing scripts
- run `ReadLints` on changed files
- run `npm run build` after TypeScript or theme edits
- inspect the final diff for out-of-scope changes

Do not claim completion while a P0/P1 `@hydra-ux-audit` finding or technical
error remains.

## Closing report

Briefly state:

- PRD coverage and any explicit deferrals
- reference modules/screens reused
- shared and Ant Design components reused
- local components added and why each was necessary
- states and responsive behavior verified
- tests, typecheck, lint, and build results
- shared/core components and tokens unchanged, or the approved exception
- remaining risks or decisions

## Explicit non-goals

- Do not scan the whole repository when targeted discovery is sufficient.
- Do not invent routes, navigation, layouts, components, or tokens before
  checking current product patterns.
- Do not treat a visually similar but semantically wrong component as reusable.
- Do not copy legacy inconsistencies into a new module.
- Do not create a parallel design system or module-specific visual language.
- Do not edit shared/core components, global shell behavior, or tokens without
  explicit approval.
- Do not implement when the user asked only for analysis or a plan.
- Do not broaden into backend, infrastructure, or unrelated refactors unless
  explicitly included in the PRD and approved scope.
