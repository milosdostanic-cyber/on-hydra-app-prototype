---
name: hydra-ant-design-screen-recreator
description: Recreate or rebuild a supplied reference screen in Figma with visual parity using only the published Hydra Ant Design - DS library. Use when a user provides a screenshot, mock, existing Figma frame, or application screen as visual context and requires a Hydra-only Figma result with linked component instances, Auto Layout, published text styles, exact variable bindings for color and spacing, no raw design values, no detached components, and no assets or tokens from any other design system.
---

# Hydra Ant Design Screen Recreator

Build Figma screens from visual references while keeping Hydra Ant Design - DS as the only design-system authority. Treat the reference as context, never as a reusable asset source.

## Load prerequisites

1. Read [`references/hydra-ds-contract.md`](references/hydra-ds-contract.md) completely.
2. Load `figma-use` before every `use_figma` call.
3. Load `figma-generate-design` for every full screen, modal, drawer, panel, or composed view.
4. Attach `hydra-ux-audit` for the final quality gate.
5. Follow `plan-orchestrator` before the first write. Keep writes within the approved target Figma node.
6. Use Official Figma MCP only. Never use Figma Console unless the user explicitly replaces this requirement.

The source contract in this skill is stricter than generic Figma fallbacks. When instructions conflict, preserve the user's Hydra-only constraint: do not create a local fallback, import a raw SVG, use Code Connect as a visual source, or take values from the repo.

## Required runtime inputs

Obtain both before writing:

- A reference screen: screenshot, exact Figma node, or visible application route.
- An existing target Figma design file and target frame/node.

If the target is missing, ask for it. Create a new Figma file only when the user explicitly requests one and after loading `figma-create-new-file`.

## Hard source boundary

Use the reference only to understand:

- outer dimensions and responsive state;
- region order and hierarchy;
- copy and visible content;
- alignment and proportions;
- component semantics and visible states;
- imagery placement as context.

Never copy, clone, import, inspect for reuse, or sample from the reference:

- components or component keys;
- variables, styles, effects, or token values;
- icons, vectors, SVGs, illustrations, or image fills;
- detached layers or local components;
- colors, fonts, spacing, radii, shadows, or strokes.

If the reference is a Figma node, use its screenshot and geometry/structure only. Do not treat its design context, variable definitions, Code Connect mappings, or library subscriptions as sources.

## Required workflow

### 1. Inspect without writing

1. Capture the reference at its natural size.
2. Decompose it into named regions and list every required component, text role, icon, color role, spacing role, radius, and effect.
3. Inspect the target metadata and screenshot.
4. Confirm the target node and allowed write boundary.
5. Do not mutate either the reference or Hydra DS.

### 2. Lock the Hydra library

1. Call `get_libraries` for the target file.
2. Locate the exact library name and key from the contract.
3. Restrict every `search_design_system` call with `includeLibraryKeys` containing only the Hydra library key.
4. Reject every result whose library key is missing or differs.
5. Never search or page through unrelated libraries for a substitute.

### 3. Build a live asset map

Search the Hydra library at runtime for every item required by the screen. Do not use cached component, variable, or style values as authority.

Record before writing:

| Need | Required evidence |
|------|-------------------|
| Component or icon | Hydra library key, component key, exact variant, exposed property keys |
| Color | Hydra variable key, semantic name, compatible scope |
| Spacing or radius | Hydra variable key, semantic name, compatible scope |
| Typography | Hydra published text-style key and intended role |
| Effect | Hydra published effect-style key |

Inspect imported component property definitions before setting labels, booleans, variants, or instance swaps. Use exact property keys, including generated suffixes.

### 4. Run the pre-write gate

Do not write until every required row has an exact Hydra source.

If any component, icon, variable, text style, or effect is missing:

1. Stop before canvas mutation.
2. Name the missing item and the reference region that needs it.
3. List the Hydra searches already attempted.
4. Ask the user to add/approve DS coverage or change the reference requirement.

Never approximate with another design system, a generic Ant Design library, a local component, a raw primitive, a raw SVG, a closest color, or an unbound value.

### 5. Build the screen incrementally

1. Create or reuse the approved target wrapper first.
2. Make the screen wrapper and every manually composed structural container Auto Layout.
3. Build one major region per `use_figma` call.
4. Append children before setting `HUG` or `FILL` sizing.
5. Return all created and mutated node IDs from every call.
6. Validate each region before continuing.

Use Hydra instances for controls, icons, and reusable UI. Keep every instance linked; never detach, flatten, outline, or reconstruct it. Select size, state, type, danger, loading, label, and icon through component properties and variants. Never resize a control to fake a missing variant.

Manual nodes are limited to:

- the approved screen wrapper;
- Auto Layout section/row/column containers;
- free text needed for product-specific copy when no Hydra text component is appropriate.

Do not create manual UI primitives such as buttons, inputs, tags, icons, dividers, cards, alerts, navigation items, tables, or modal chrome.

### 6. Bind every design property

For manually composed nodes:

- Bind fills, strokes, and text paints to exact Hydra variables.
- Bind every padding edge, item spacing, and corner radius to an exact Hydra variable.
- Apply published Hydra text styles with `textStyleId`; do not set font family, size, weight, line height, or letter spacing directly.
- Apply published Hydra effect styles with `effectStyleId`.
- Use semantic variables over primitives when both exist.
- Preserve the target mode and use compatible variable scopes.

The only raw geometry exception is the reference-derived outer screen width/height and its page-level placement. Intrinsic dimensions owned by imported Hydra instances remain controlled by their variants. If an internal layout measurement has no exact Hydra variable, stop and report the gap.

### 7. Preserve Auto Layout integrity

Require:

- the root screen to use Auto Layout;
- every manually created frame containing related children to use Auto Layout;
- no structural groups;
- no manual child `x`/`y` positioning inside composed regions;
- intentional `HUG`, `FILL`, and fixed sizing after parenting;
- no clipped text, overlap, or zero-width wrapping text.

Allow absolute positioning only inside untouched Hydra component instances or when the reference explicitly requires an overlay already supplied as a Hydra component.

### 8. Validate and iterate

After every region and at completion:

1. Capture screenshots of the full target and each major region.
2. Compare against the reference at the same state and dimensions.
3. Fix only the target with small, section-specific changes.
4. Re-run failed checks before continuing.
5. After three unresolved visual iterations, identify whether the mismatch is a DS coverage conflict. Stop rather than claim parity or break the source contract.

## Mandatory final audit

Audit the target root while treating descendants inside untouched Hydra instances as governed by their masters.

### Provenance

- Every component and icon instance key appears in the runtime Hydra allowlist.
- No foreign component, local component, detached instance, vector, imported SVG, or reference asset exists outside Hydra instances.
- No Hydra DS definition or sibling/reference node changed.

### Tokens and styles

- Every free text node has a published Hydra `textStyleId` and Hydra-bound text color.
- Every manual fill, stroke, spacing, padding, radius, and supported effect is Hydra-bound.
- No raw hex/RGB paint, direct font property, raw spacing, raw radius, or ad-hoc effect remains.
- No new variable, text style, effect style, or component was created.

### Structure

- Root and all manual structural frames use Auto Layout.
- No structural group or manual positioning hack remains.
- Component instances remain linked and use valid property values.
- No clipped, overlapping, placeholder, or truncated content remains.

### Visual parity

- Outer dimensions and visible state match the reference.
- Region order, hierarchy, alignment, component variants, copy, and proportions match.
- `hydra-ux-audit` passes for wayfinding, component use, consistency, states, and Figma parity.

Do not say “100% match,” “pixel perfect,” or “done” unless every hard gate passes. If a gate fails, report the exact blocker and leave the target in the last valid Hydra-only state.

## Completion report

Return a concise report containing:

1. Target Figma file/node.
2. Hydra component families and exact keys used.
3. Hydra variable and style families used.
4. Auto Layout and provenance audit result.
5. Visual parity result and iterations performed.
6. Remaining DS gaps or blockers.

Never claim success based only on a screenshot; structural and binding audits are required.
