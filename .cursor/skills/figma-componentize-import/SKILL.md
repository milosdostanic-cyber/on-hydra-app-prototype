---
name: figma-componentize-import
description: >
  Componentizes a flat Figma screen that was imported from the repo via a plugin — replaces
  flat layers in place with real design-system instances, reusing instances already in the file
  or importing from the attached DS library by name, then sets props, labels, and icons to match
  the screen 1:1. Use when the user asks to componentize an imported screen, fix a screen pasted
  from repo, replace flat layers with DS components, reuse instances we already have in the file,
  set props to match the screen, swap labels and icons, or tokenize a plugin import. Requires
  the official Figma MCP (plugin-figma-figma), not Figma Console MCP.
---

# Figma — Componentize Imported Screen

This skill takes a **flat imported screen** (frames + text from a repo plugin, no real DS
instances) and **componentizes it in place**: flat sub-trees become design-system instances with
correct props, labels, and icons so the result matches the imported screen **1:1**.

**MCP:** Official Figma MCP (`plugin-figma-figma`) — aligns with default routing in **`figma-mcp-routing.mdc`**.

**Prerequisites:** Load **`figma-use`** before every `use_figma` call. Pass
`skillNames: "figma-componentize-import,figma-use"` on each `use_figma` invocation.

---

## Six non-negotiable rules

### Rule 0: Official Figma MCP only

Use server **`plugin-figma-figma`** — never `user-figma-console` while this skill is active.

| Task | Tool |
|------|------|
| Structure / tree | `get_metadata` |
| Reference code + layer hints | `get_design_context` |
| Parity target screenshot | `get_screenshot` |
| Attached DS library search | `search_design_system` |
| Token bindings on file | `get_variable_defs` |
| All writes | `use_figma` |
| Variant prop names (optional) | `get_context_for_code_connect` |

Do **not** call `generate_figma_design` or other browser-capture tools.

### Rule 1: Reuse first, then attached DS library by name

Per flat element, resolve in this order:

1. **`reuse-in-file`** — clone a representative instance already in the file (`instance.clone()`).
2. **`ds-library-by-name`** — `search_design_system(query=<name>)` on the **attached DS
   library**, confirm relevance, then `importComponentByKeyAsync` + `createInstance()`.
3. **`compose-primitive`** — build from frames/text only when no DS match exists (see
   `../prototype-to-figma/figma-patterns.md` Section 4).
4. **`leave-flat`** — keep the flat node and flag in the summary (last resort).

Always finish with **1:1 label and icon** matching against the imported screen.

### Rule 2: Never create new master components; never detach

- Do **not** call `figma.createComponent()` or `figma.createComponentSet()`.
- Do **not** call `detachInstance()` unless the user explicitly approves after you document
  that no DS variant or `INSTANCE_SWAP` can achieve the layout.

### Rule 3: Edit only inside the target frame

The user-provided `node-id` (imported screen frame) is the **only** write boundary. You may
**read** the rest of the file to build the in-file instance registry. Do not mutate other
frames, pages, or the published DS library file.

### Rule 4: In-place mutation with baseline screenshot

Replace flat sub-trees with instances and **delete** the original flat nodes. Before any write,
capture **`get_screenshot`** of the target frame — that is the parity target for Phase 5.
(User opted out of a backup frame; the screenshot is the only "before" record.)

### Rule 5: Dual source of truth

| What | Source |
|------|--------|
| Component type, variant, size, state, disabled, etc. | **Repo screen source** (primary) |
| Position, layout, visible label text, icon identity | **Imported Figma screen** (1:1) |
| DS component key / instance to reuse | In-file registry, then attached DS library |

---

## Required inputs

| Input | Required | Notes |
|-------|----------|-------|
| **Figma URL** with `node-id` | Yes | Target imported screen frame. Normalize `72-293` → `72:293`. |
| **Repo screen path** | Yes | e.g. `src/bom/pages/BomWorkspacePage.tsx` |
| **Attached DS library** | Implicit | Must be enabled on the Figma file. `search_design_system` searches it. |

If `node-id` is missing, stop and ask. Do not guess a frame.

---

## The workflow

### Phase 0 — Resolve inputs and capabilities

1. Extract `fileKey` and `nodeId` from the Figma URL.
2. Resolve the repo path to a concrete screen file; note imports from `src/ui/antd.ts` and layout
   helpers (`shellLayout`, `theme.useToken()`).
3. Call `get_metadata` on `nodeId` to confirm the frame exists and inspect tools work.
4. Confirm `use_figma` is available. If write is unavailable, stop with a read-only gap report
   (mapping table + manual build guide) — do not mutate the file.

---

### Phase 1 — Baseline + truth

**Before any write:**

1. **`get_screenshot`** on `nodeId` — save as the **parity target** (visual 1:1 reference).
2. **`get_metadata`** on `nodeId` — inventory flat sub-trees (frames, text, vectors) that are
   not `INSTANCE` nodes. Note hierarchy, names, bounding boxes, auto-layout parents.
3. **`get_design_context`** on `nodeId` — supplementary hints from the plugin import.
4. **Read the repo screen** — build a component inventory:

   | Code usage | Props (variant, size, type, disabled, …) | Label text | Icon (antd icon name) |
   |------------|------------------------------------------|------------|------------------------|

   Map antd exports to expected Figma DS names (e.g. `Button` → `Button`, `Tag` → `Tag`,
   `Alert` → `Alert` / `Notification`).

5. **`get_variable_defs`** on the file or frame when you need token bindings for fills/radius.

---

### Phase 2 — Discovery (two sources)

#### 2a — In-file instance registry

One `use_figma` call (read-only scan). See `instance-reuse-patterns.md` §1.

Return a table:

| mainComponent.key | componentSetName | sampleInstanceId | exposedPropertyNames |
|-------------------|------------------|------------------|----------------------|

Group by `mainComponent.key`; keep one representative per key. Prefer instances on the same page
or in a components page over instances inside the target frame (which may be flat).

#### 2b — Attached DS library by name

For each component name in the Phase 1 repo inventory:

1. `search_design_system(fileKey, query="<Name>", includeComponents=true)`.
2. Try alternates: `Alert`/`Notification`, `Dropdown`/`Select`, `Tag`/`Chip`, `Input`/`Text field`.
3. **Judge relevance** before adopting:

   | Signal | Relevant? |
   |--------|-----------|
   | Name matches repo export (e.g. `Button`) | Yes |
   | Code Connect / `get_context_for_code_connect` maps to same component | Yes |
   | Visual role matches screenshot (CTA, input, tag, table cell) | Yes |
   | Homonym only (e.g. "Card" icon vs Card container) | No — skip |
   | No repo usage and not visible on screen | No — skip |

4. Record: `query`, `matchedComponentName`, `componentKey`, `relevance: yes|no|ambiguous`.

If ambiguous, list in Phase 5 open questions — do not import blindly.

Optional: `get_libraries` to confirm the DS library is attached.

---

### Phase 3 — Mapping table

For **each flat element** (or logical group — e.g. one button frame, not every rectangle inside
it), produce one row:

| flatNodeId | flatNodeName | repoComponent | bucket | dsKey / sampleInstanceId | propsFromRepo | labelFromScreen | iconFromScreen | notes |
|------------|--------------|---------------|--------|--------------------------|---------------|-----------------|----------------|-------|

**Buckets:** `reuse-in-file` | `ds-library-by-name` | `compose-primitive` | `leave-flat`

**Grouping heuristics:**

- A frame named like a button + label text inside → one `Button` row.
- Icon vector or small frame beside label → attach `iconFromScreen` to parent row.
- Table: map header row + body separately; prefer one `Table` instance if the flat tree is a
  full table region.
- Do not map decorative wrappers that DS components subsume (e.g. button padding frame).

Any row with `leave-flat` or `compose-primitive` must have a `notes` explanation.

Present the mapping table to yourself before Phase 4; for screens with **> 15 rows**, show a
summary count by bucket and proceed unless the user asked to confirm scope.

---

### Phase 4 — Replace in place + 1:1 labels and icons

Break into multiple `use_figma` calls — e.g. by region (header, toolbar, table, footer) or
~10 mappings per call.

**Per mapping row:**

1. **Obtain instance**
   - `reuse-in-file`: `const inst = await figma.getNodeByIdAsync(sampleId); inst = inst.clone();`
   - `ds-library-by-name`: `importComponentByKeyAsync(key)` → `createInstance()`
2. **`setProperties`** — variant, size, state, type, disabled, etc. from repo. Use exact prop
   names from `get_context_for_code_connect` or the registry's `exposedPropertyNames`.
3. **Label 1:1** — text from the flat screen (see `instance-reuse-patterns.md` §3).
4. **Icon 1:1** — match flat icon to DS icon (see `instance-reuse-patterns.md` §4).
5. **Position** — match flat node `x`, `y`, width/height or auto-layout slot (§2).
6. **Insert** — same parent, same index; respect auto-layout (`layoutPositioning`).
7. **Remove** flat node(s) replaced by this instance.
8. **Bind variables** where `get_variable_defs` provides a match for fills/radius (optional
   but preferred over raw hex).

**Completeness:** Every visible interactive/control element from Phase 1 inventory must end as
an instance, primitive, or explicit `leave-flat` with reason.

---

### Phase 5 — Verify and report

1. **`get_screenshot`** on the mutated frame.
2. Compare to Phase 1 baseline — layout, labels, icons, variant visuals. Fix with follow-up
   `use_figma` calls; **max 3 iterations**.
3. Present summary:

   - Figma URL + deep link to `nodeId`
   - Repo file used
   - Counts: `reuse-in-file` | `ds-library-by-name` | `compose-primitive` | `leave-flat`
   - DS library components imported (name + key)
   - Labels/icons updated (count)
   - Variables bound (if any)
   - **Gaps:** `leave-flat` rows, ambiguous relevance, missing DS variants
   - Parity: pass / partial (list deltas) after 3 passes

---

## Search strategy (attached DS library)

Try in order for each repo component name:

1. Exact name: `search_design_system(query="Button")`
2. Ant Design synonyms: `Primary Button`, `Input`, `Select`, `Table`, `Tag`, `Alert`, `Modal`
3. Category: `search_design_system(query="navigation")`, `query="feedback"`
4. Code Connect: `get_code_connect_map` / `get_context_for_code_connect` for canonical names

Restrict to attached libraries via `includeLibraryKeys` when a prior search returned library keys.

**Icons:** `search_design_system(query="<IconName>")` or `query="icon"` + filter by ant design
icon naming (e.g. `SearchOutlined` → `Search` / `search`).

---

## Repo ↔ Figma name hints (Hydra / Ant Design)

| Code (`src/ui/antd.ts`) | DS search query |
|-------------------------|-----------------|
| `Button` | `Button` |
| `Input`, `Input.Search` | `Input`, `Search` |
| `Select` | `Select` |
| `Table` | `Table` |
| `Tag` | `Tag` |
| `Alert` | `Alert`, `Notification` |
| `Card` | `Card` |
| `Menu` | `Menu` |
| `Typography.Text` | `Text` |
| `Radio`, `Checkbox` | `Radio`, `Checkbox` |
| Icons from `@ant-design/icons` | icon name without `Outlined` suffix |

---

## Stop and ask

- Missing Figma URL or `node-id`
- Missing repo screen path
- Target node is not a frame or is already fully instanced (confirm intent)
- No attached DS library / empty `search_design_system` results
- Relevance ambiguous for a high-impact pattern (nav, table, primary CTA)
- Fix requires detach, new master components, or edits outside the target frame

---

## Related

- `instance-reuse-patterns.md` — Plugin API patterns for this skill
- `../prototype-to-figma/figma-patterns.md` — fonts, primitives, variable binding, annotations
- `.cursor/rules/figma-repo-to-screen-parity.mdc` — repo parity concepts (Console MCP there;
  this skill uses official MCP instead)

---

## Inspect-only fallback

When `use_figma` is unavailable, output:

1. Phase 1 inventory + screenshot reference
2. Full Phase 3 mapping table
3. Phase 2b DS search results with relevance judgements
4. Manual checklist for designers to apply swaps in Figma

Do not claim the screen was componentized.
