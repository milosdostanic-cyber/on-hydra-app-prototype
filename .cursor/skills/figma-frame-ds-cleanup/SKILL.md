---
name: figma-frame-ds-cleanup
description: >-
  Rebuilds and cleans up a Figma frame so it uses the shared Design System properly while
  preserving the visual result 1:1 — replaces flat layers with correct DS component instances
  (props, variants, states, labels, icons), maps every value to existing tokens, links text to
  existing text styles, and fixes Auto Layout. Use when the user provides a Figma link and asks
  to clean up, tokenize, componentize, DS-ify, or make handoff-ready a frame while keeping it
  visually identical. Requires the official Figma MCP (plugin-figma-figma), not Figma Console MCP.
---

# Figma — Frame Design-System Cleanup (visual 1:1)

**MCP:** Official Figma MCP (`plugin-figma-figma`) per **`.cursor/rules/figma-mcp-routing.mdc`** — never `user-figma-console` unless the user explicitly opts in.

**Prerequisite:** Load **`figma-use`** before every `use_figma` call. Pass `skillNames: "figma-frame-ds-cleanup,figma-use"` on each `use_figma` invocation.

**Read for tokens/text styles:** `get_variable_defs`, `search_design_system`. Do not hardcode; map to the repo mirrors when in doubt (`.cursor/rules/hydra-ui-tokens.mdc`, `figma-repo-parity.mdc`).

**Load the mapping FIRST:** Before deciding anything about components, colors, typography, spacing, radius, icons, or layout, load and apply **[`design-system-mapping.md`](./design-system-mapping.md)** (in this skill folder). It is the primary lookup map — real component keys, token↔hex tables, text styles, spacing/radius/icon maps. This `SKILL.md` is the **validation layer and final checklist**, not the only source of decisions. Only reason from scratch when something is genuinely missing from the mapping, and document that gap.

**Exact component catalog:** Use **[`hydra-component-map.md`](./hydra-component-map.md)** as the compact family index and **[`hydra-component-map.json`](./hydra-component-map.json)** for the complete generated Figma inventory (component-set and standalone keys, node IDs, property definitions, default variants, descriptions, documentation links, and reconciliation counts). The generated catalog is authoritative for exact import metadata; `design-system-mapping.md` remains authoritative for semantic usage guidance.

---

You are a Figma automation/design-system specialist.

Your task is to take the provided Figma link, inspect the target frame, and rebuild/clean up that frame so it uses the shared Design System properly while preserving the visual result 1:1.

## Mapping-first workflow

1. Inspect the provided Figma frame (`get_metadata`, `get_design_context`, `get_screenshot`).
2. Load and apply **`design-system-mapping.md`**.
3. Match **every** element against the mapping first (component, color, type, spacing, radius, icon, layout).
4. Replace mapped elements with the correct DS component instances (confirm exact variant string + property key at runtime).
5. Replace raw hex with the mapped color tokens.
6. Reconnect text layers to the mapped text styles.
7. Replace raw spacing / padding / radius with the mapped tokens.
8. Apply Auto Layout cleanup **only after** token/component mapping is done.
9. Use this `SKILL.md` as the **final validation checklist** (see "Final validation").
10. Report only what is missing, unclear, or could not be mapped.

## Decision order (do not skip ahead)

1. Existing shared DS component mapping
2. Existing token mapping (color)
3. Existing typography style mapping
4. Existing spacing / radius mapping
5. Ant Design fallback component pattern (local component, tokens only)
6. Clean Auto Layout reconstruction
7. Final validation against the original frame

Never jump straight to custom rebuilding before checking 1–5 in the mapping file.

## Main goal

Analyze the selected frame and replace everything that should be an instance of an existing component with the correct component instance from the shared Design System.

The final frame must look visually identical to the original, but technically it must be clean, tokenized, component-based, and ready for handoff.

## What you need to do

1. Inspect the provided Figma frame carefully.
2. Identify every element that appears to match an existing shared Design System component.
3. Replace those elements with the correct component instances from the shared DS.
4. For every component instance, set the correct:

   * props
   * variants
   * labels
   * states
   * sizes
   * icons
   * hierarchy
   * content
   * interaction-related properties, where applicable

Do not only match visually. Match the semantic purpose of the component.

For example:

* A primary action must use the correct primary button variant.
* A secondary action must use the correct secondary button variant.
* Inputs, selects, checkboxes, tables, tabs, badges, alerts, tooltips, pagination, cards, modals, and navigation elements must use the correct DS component where available.
* Icons must use the correct icon component or icon prop, not raw SVGs unless no DS icon exists.

## Ant Design fallback rule

If something in the frame should clearly be a standard Ant Design component, but that component does not currently exist in the shared DS:

1. Check how that component is structured and behaves in Ant Design.
2. Create a local component next to the target frame based on the Ant Design component pattern.
3. Style it using our existing tokens only.
4. Use that newly created local component instance inside the cleaned frame.
5. Do not invent a custom pattern if Ant Design already has a matching component.

This applies to components such as alerts, empty states, tags, tables, drawers, modals, forms, date pickers, pagination, tabs, breadcrumbs, steps, and similar UI patterns.

## Token rules

Use only existing tokens.

Do not create new tokens.

Do not use raw values for:

* colors
* spacing
* padding
* margins
* border radius
* border colors
* typography
* font sizes
* font weights
* line heights
* shadows
* sizing values, where tokens exist

Every possible value must be mapped to an existing token.

If there is no exact token match, use the closest existing token and document that decision.

## Typography rules

All text layers must be linked to existing text styles.

Do not leave raw font settings.

Choose the correct text style based on:

* font size
* font weight
* line height
* hierarchy
* semantic usage
* visual role in the UI

Preserve the original text content exactly unless there is an obvious typo or label mismatch caused by component props.

## Layout rules

Use Auto Layout properly.

For elements that do not have a matching component instance:

* rebuild them as clean Auto Layout frames
* use proper padding tokens
* use spacing tokens
* use linked text styles
* use existing color tokens
* avoid unnecessary nested Auto Layout wrappers
* avoid raw dimensions unless they are structurally required
* preserve visual alignment and hierarchy

Remove unnecessary groups, empty frames, duplicated wrappers, and layout hacks.

Keep only the structure that is needed for clean responsive behavior and handoff.

## Visual matching requirement

The cleaned version must look 1:1 like the original frame.

After replacing components and rebuilding layers:

1. Compare the cleaned frame visually against the original.
2. Check spacing, alignment, typography, icon placement, component size, labels, states, and content.
3. Fix differences.
4. Repeat visual checking until the cleaned version matches the original as closely as possible.

Do not stop after the first pass.

## Important constraints

* Do not redesign the screen.
* Do not change the visual direction.
* Do not simplify the UI unless it is only removing unnecessary technical layer complexity.
* Do not invent new DS components if an existing shared DS component can be used.
* Do not invent new tokens.
* Do not leave raw values when a token or style exists.
* Do not detach instances unless absolutely necessary.
* Do not flatten icons or components.
* Do not change text content unless required by the correct component prop structure.
* Do not create a visually similar but technically incorrect version.

## Final validation (this skill = the checklist)

After applying the mapping, validate the cleaned frame against the original. Every box must be answered:

- [ ] All possible elements converted to DS instances (per the mapping's component keys).
- [ ] Component props / variants / sizes / states correct.
- [ ] Labels correct and content preserved.
- [ ] Icons correct (DS icon components, via component props, correct size).
- [ ] All colors tokenized (no raw hex where a token exists — see Color mapping).
- [ ] All text layers linked to existing text styles (see Typography mapping).
- [ ] Spacing / padding tokenized (see Spacing mapping).
- [ ] Radius / borders tokenized (see Radius mapping).
- [ ] No unnecessary groups, empty frames, duplicated wrappers.
- [ ] Cleaned frame visually matches the original 1:1 (screenshot compare, iterate).
- [ ] No remaining raw values.
- [ ] Missing DS components / icons captured as gaps for later.

## Final output

When finished, provide a short report with:

1. Components replaced with shared DS instances (name → key used).
2. Local Ant Design-based components created next to the frame (if any).
3. Raw hex values replaced with tokens.
4. Text layers reconnected to text styles.
5. Spacing / padding / radius values mapped to tokens.
6. Items that could not be mapped.
7. Missing DS components or icons (gaps for the DS to absorb).
8. Remaining risks / handoff recommendations.
9. Confirmation that this `SKILL.md` validation checklist was run at the end, and that the frame was visually checked against the original.
