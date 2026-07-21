# Task — Recreate a repo screen 1:1 in Figma

**Read [`docs/figma-bom-recreation-reference.md`](./figma-bom-recreation-reference.md) first.**
It holds all stable facts (file keys, node table, component map, tokens, annotation snippet).
This file is the per-run runner only.

**MCP: `user-figma-console` only. Never `plugin-figma-figma`.**

---

## Inputs (from the prompt)

| Item | Source |
|------|--------|
| Local repo page | Provided in the prompt |
| Target Figma location | Provided in the prompt |

---

## Non-negotiables

- Pixel-perfect 1:1 match to the repo screen.
- Screen root = one plain `Frame`. Everything inside = auto-layout frames or DS instances only.
- No new Figma components. No new variables. No raw hex or spacing values.
- Name the screen per the BOM convention (reference § 5). No `Frame 123`, `Copy`, `Untitled`.
- Text colors: only the 5 neutral tokens from reference § 6.
- DS instances only — no detached copies of shared components.

---

## Workflow

### 1. Connect

```
figma_get_status (probe: true)
figma_navigate → Ht3Up5MlRAKjK7eCuAy05L
```

If not connected: stop and ask user to open Figma Desktop + Desktop Bridge plugin.

### 2. Read the repo page

Open the local file provided in the prompt. Extract:
- UI regions and hierarchy.
- antd/Hydra components used (map via reference § 4).
- Spacing, typography, token usage from `theme.useToken()` and `src/theme/*` imports.
- Mock data structure (states visible in the file: default / empty / loading).

### 3. Duplicate shell template + place in target location

```
figma_execute → duplicate node 5233:26479 (BOM Projects Hub shell template)
→ rename to correct screen name (reference § 5)
→ move into target section / position provided in the prompt
```

### 4. Build page body

Inside the duplicated frame, replace only the content area (below breadcrumb):

- Use DS instances from reference § 4 (`figma_instantiate_component` → `figma_set_instance_properties`).
- Bind spacing variables via `figma_import_library_variable` (reference § 6).
- All structure = auto-layout frames (no groups, no plain frames, no absolute positioning).
- For elements with no DS match: build from `figma.createFrame()` + `figma.createText()` primitives only.

### 5. Set breadcrumb

Update the breadcrumb text layer to match the repo route. Derive from `buildAppBreadcrumbItems.tsx` logic for the given route.

### 6. Annotate

Run the annotation snippet from reference § 7 via `figma_execute`:
- One frame-level Interaction annotation (current state + primary action).
- CTA annotations (state-advancing actions only).
- DS Drift annotation on every primitive element.

### 7. Parity loop (max 3 passes)

```
figma_capture_screenshot → compare to repo page (dev build or source code)
→ list each mismatch → fix → repeat
```

Pass = all layout, spacing, tokens, typography, copy, and components match.
After 3 passes without full parity: document remaining gaps and stop.

### 8. Audit

Run every item in the checklist (reference § 9). Fix any failure immediately, then re-run audit.

---

## Output

- Completed screen in Figma, named correctly, inside the target location.
- Short summary:
  - DS instances used (names + variants).
  - Primitives built (DS gaps).
  - Parity loop result (pass / documented gaps).
  - Any approved exceptions.
