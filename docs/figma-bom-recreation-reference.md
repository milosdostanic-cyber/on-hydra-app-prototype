# Figma BOM Recreation — Cached Reference

Read this before any BOM screen recreation run. Anchors that do not change: file keys,
node → route table, component map, token values. Node IDs re-verify per session;
component/variable keys are stable once cached below.

**MCP: always `user-figma-console`. Never `plugin-figma-figma`.**

---

## 1. File targets

| Name | File key | URL |
|------|----------|-----|
| BOM spec (target for all BOM screens) | `Ht3Up5MlRAKjK7eCuAy05L` | [BOM-SPEC — ASC-Connected v2](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2) |
| Hydra DS library | `3ghYBXR6XVUEaeBo3D5E4q` | [Hydra Ant Design — DS](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Hydra-Ant-Design---DS) |

**Page in BOM spec file:** `🚧 BOM Re-Skin`

**Sections:**

| Section | Node ID | Purpose |
|---------|---------|---------|
| BOM Import Flow (canonical, left → right) | `5233:58434` | 10 import-flow screens, newest |
| BOM Flow V3 Milos (full inventory) | `5022:23065` | All screens incl. matching/workspace/export |

---

## 2. Shell reuse strategy

The shell (`AppShellSidebar` + `AppTopBar` + breadcrumb strip) is identical on every BOM screen.
Duplicate an existing BOM frame instead of building from scratch.

**Shell template to duplicate:** `5233:26479` — **BOM Projects Hub** (first frame in canonical board).

Per-run variation after duplicate:
1. Swap page **body** (content below breadcrumb).
2. Set **breadcrumb text** to match the repo route (see `buildAppBreadcrumbItems.tsx`).
3. Set **screen name** per naming convention (see section 5).

Shell components (do not recreate — reuse from duplicate):

| Layer | Source component | Notes |
|-------|-----------------|-------|
| Sidebar | `AppShellSidebar` instance | Dark `Menu`, BOM item active |
| Top bar | `AppTopBar` instance | "BOM" module title + project switcher |
| Breadcrumb strip | `Header` breadcrumb layer | Text only — swap per screen |

---

## 3. Route → screen name → Figma node

Full table for the import flow (canonical board `5233:58434`):

| # | Frame name | Node ID | Repo file | Route |
|---|-----------|---------|-----------|-------|
| 01 | BOM Projects Hub | `5233:26479` | `BomSiteProjectsPage.tsx` | `/bom/site/:constructionProjectId` |
| 02 | BOM Projects Hub · Bulk Selection | `5233:25838` | same | Hub branch |
| 03 | BOM Projects Hub · Delete Confirmation | `5233:25152` | same | Hub branch |
| 04 | Upload Destination Modal | `5233:24431` | same | Modal on hub |
| 05 | Smart Mapping Summary | `5233:23928` | `BomMappingSummaryPage.tsx` | `/bom/projects/:id/mapping-summary` |
| 06 | Advanced Field Mapping | `5233:22752` | `BomFieldMappingPage.tsx` | `/bom/projects/:id/field-mapping` |
| 07 | Advanced Field Mapping (layout dup) | `5233:23340` | same as 06 | Dedupe when syncing |
| 08 | Parsing Review · List | `5233:21874` | `BomParsingReviewPage.tsx` | `/bom/projects/:id/parsing-review` |
| 09 | Parsing Review · Row Detail (high conf.) | `5233:20836` | same | Expanded row state |
| 10 | Parsing Review · Row Detail (needs attn.) | `5233:19782` | same | Expanded row state |

Legacy section `5022:23065` nodes (matching/workspace/export — not yet on canonical board):

| Frame | Node ID | Repo file |
|-------|---------|-----------|
| Matching Results | `5026:21396` | `BomMatchingPage.tsx` |
| Matching Results — Confirmed | `5026:21993` | `BomMatchingPage.tsx` |
| Workspace / Main | `5080:17098` | `BomWorkspacePage.tsx` |
| Export / Routes & Preview | `5022:23736` | `BomExportPage.tsx` |
| Replacement Picker | `5026:90934` | `BomNarrowPage.tsx` / `BomRecommendPage.tsx` |

**Node IDs are stable within a file but must be confirmed per session** via
`figma_navigate` + `figma_get_selection` or from the URL `node-id` param (convert `-` → `:`).

---

## 4. Repo → Figma component map

Search the DS library once per session: `figma_search_components` with `libraryFileKey: "3ghYBXR6XVUEaeBo3D5E4q"`.
Paste resolved keys in the **Cached key** column on first run.

| Repo (`src/ui/antd.ts`) | Figma DS name | Cached key |
|-------------------------|---------------|------------|
| `Button` | Button | *(resolve once → paste)* |
| `Input` | Input | *(resolve once → paste)* |
| `Select` | Select | *(resolve once → paste)* |
| `Table` | Table | *(resolve once → paste)* |
| `Card` | Card | *(resolve once → paste)* |
| `Tag` | Tag | *(resolve once → paste)* |
| `Alert` | Alert | *(resolve once → paste)* |
| `Steps` | Steps | *(resolve once → paste)* |
| `Modal` | Modal | *(resolve once → paste)* |
| `Drawer` | Drawer | *(resolve once → paste)* |
| `Tabs` | Tabs | *(resolve once → paste)* |
| `Pagination` | Pagination | *(resolve once → paste)* |
| `Progress` | Progress | *(resolve once → paste)* |
| `Empty` | Empty | *(resolve once → paste)* |
| `Checkbox` | Checkbox | *(resolve once → paste)* |
| `AppSearchInput` | Input (search variant) | *(resolve once → paste)* |

Instantiate via `figma_instantiate_component`; set variant props via `figma_set_instance_properties`.
Never call `figma.createComponent()` or `figma.createComponentSet()`.

**BOM-specific local components** (already exist in the BOM spec file — search by name, do not recreate):

| Component name | Used in |
|----------------|---------|
| `BomUploadProgressBar` / `BomUploadFlowStepChrome` | Upload flow steps |
| `input-status` | Parsing row status indicators |
| `BomProjectStatusTag` | Project list status column |
| `PageBackButton` | All upload-flow step pages |

---

## 5. Screen naming convention

Pattern: `BOM / <Flow> / <Screen>` — match the existing BOM screens in the file exactly.

Examples already in the file:
- `01 - BOM Flow / Landing / Project List`
- `02 - BOM Flow / Ingestion / Field Mapping`
- `03 - BOM Flow / Ingestion / Parsing Review / …`
- `12 - BOM Flow / Matching Results`
- `07 - BOM Flow / Workspace / Main | …`

Derive the `<Screen>` segment from the repo route provided in the prompt. Never use
`Frame 123`, `Screen`, `Copy`, or `Untitled`.

---

## 6. Token cheat-sheet

### Spacing (antd token → Figma variable path)

| antd token | Value | Figma variable |
|-----------|-------|----------------|
| `marginXS` | 8px | `Spacing/marginXS` |
| `marginSM` | 12px | `Spacing/marginSM` |
| `padding` | 16px | `Spacing/padding` |
| `marginMD` | 20px | `Spacing/marginMD` |
| `paddingMD` | 20px | `Spacing/paddingMD` |
| `marginLG` | 24px | `Spacing/marginLG` |
| `paddingLG` | 24px | `Spacing/paddingLG` |
| `paddingSM` | 12px | `Spacing/paddingSM` |
| `paddingXS` | 8px | `Spacing/paddingXS` |

Shell metrics (from `src/theme/hydraAlias.ts`):

| Name | Value |
|------|-------|
| `siderWidth` | 200px |
| `siderCollapsedWidth` | 80px |
| `headerHeight` | 48px (approx — read from file) |

### Text color tokens (use exact path for variable binding)

| Token path | Use |
|------------|-----|
| `Color/Neutral/Text/colorText` | Primary body text |
| `Color/Neutral/Text/colorTextLabel` | Field labels |
| `Color/Neutral/Text/colorTextDescription` | Secondary / description text |
| `Color/Neutral/Text/colorTextPlaceholder` | Placeholder text |
| `Color/Neutral/Text/colorTextDisabled` | Disabled states |

Import variable: `figma_import_library_variable` with the collection path above.

### Cached variable keys (fill on first run)

| Token path | Cached key |
|------------|------------|
| `Color/Neutral/Text/colorText` | *(resolve once → paste)* |
| `Color/Neutral/Text/colorTextLabel` | *(resolve once → paste)* |
| `Color/Neutral/Text/colorTextDescription` | *(resolve once → paste)* |
| `Spacing/marginLG` | *(resolve once → paste)* |
| `Spacing/padding` | *(resolve once → paste)* |

---

## 7. Annotation snippet (run via `figma_execute`)

Set up once per session, then call `annotate(node, text, cat)` on each relevant node.

```javascript
// ── Set up annotation categories (once per session) ──────────────────────
let interactionCat = null, dsDriftCat = null;
try {
  const existing = await figma.annotations.getAnnotationCategoriesAsync();
  interactionCat = existing.find(c => c.label === 'Interaction')
    ?? await figma.annotations.addAnnotationCategoryAsync({ label: 'Interaction', color: 'blue' });
  dsDriftCat = existing.find(c => c.label === 'DS Drift')
    ?? await figma.annotations.addAnnotationCategoryAsync({ label: 'DS Drift', color: 'orange' });
} catch(e) {}

// ── Annotate helper ───────────────────────────────────────────────────────
async function annotate(node, text, cat) {
  try {
    const entry = cat ? { labelMarkdown: text, categoryId: cat.id } : { label: text };
    node.annotations = [...(node.annotations || []), entry];
  } catch(e) {
    node.name += ` [${text.substring(0, 60)}]`;
  }
}

// ── Usage ─────────────────────────────────────────────────────────────────
// Frame-level (current state + primary action):
await annotate(frame, '**Parsing Review — List** → select row to expand detail', interactionCat);

// CTA:
await annotate(continueBtn, '**Continue →** navigates to matching/review', interactionCat);

// DS gap (no matching DS component):
await annotate(primitiveNode, '**DS Drift:** no DS match for `BomParsingRowCard`. Built from primitives.', dsDriftCat);
```

**Annotation rules:**
- 2–4 Interaction annotations per frame max.
- Annotate: frame itself (state + primary action), state-advancing CTAs, non-obvious tap targets, grouped controls (once for the group).
- Do not annotate: close/cancel, nav bar items, decorative elements.
- DS Drift annotation on every primitive or mismatched DS component.

---

## 8. Auto-layout rules (non-negotiable)

- Screen root: one plain `Frame` (canvas bounds only).
- Everything inside: auto-layout frames OR component instances (which have auto-layout internally).
- No groups, no plain non-auto-layout frames, no absolute positioning inside the screen.
- Sizing: `fill container` for items that span the width; `hug contents` for self-sizing blocks.
- Call `resize()` before setting `primaryAxisSizingMode` / `counterAxisSizingMode` (Plugin API gotcha).

---

## 9. Condensed audit checklist

Before closing any run, verify each item. Fix immediately if any fails.

- [ ] Screen named per convention (section 5). No `Frame 123` / `Copy` / `Untitled`.
- [ ] Screen root is the only plain frame; all interior uses auto-layout frames or instances.
- [ ] No groups, non-auto-layout frames, or absolute-positioned layers inside.
- [ ] Sidebar, top bar, breadcrumb are reused instances from shell template (not redrawn).
- [ ] Breadcrumb text updated to match the repo route.
- [ ] All shared elements (buttons, inputs, table, cards) are DS instances, not detached copies.
- [ ] Spacing uses variable bindings (section 6), not raw values.
- [ ] Text colors use only the 5 neutral text tokens (section 6).
- [ ] Typography, radii, borders, surfaces use existing variables.
- [ ] No new components created (`figma.createComponent` never called).
- [ ] No new variables created.
- [ ] Handoff annotations present: frame-level + CTAs + DS Drift (section 7).
- [ ] `figma_capture_screenshot` taken; compared to repo page; parity confirmed or deviations documented.

---

## 10. Cache-on-first-run workflow

On the first real run (Figma Desktop + Console Bridge connected):

1. `figma_get_status` with `probe: true` — confirm connected.
2. `figma_navigate` to `Ht3Up5MlRAKjK7eCuAy05L`.
3. `figma_search_components` with `libraryFileKey: "3ghYBXR6XVUEaeBo3D5E4q"` for each component in section 4 — paste resolved keys into the **Cached key** column.
4. `figma_get_variables` or `figma_browse_tokens` — find variable keys for the paths in section 6 token table — paste into **Cached key** column.
5. Verify shell template node `5233:26479` still exists (`figma_get_component` or `figma_get_file_data`). Update if the node moved.

After this, subsequent runs skip steps 3–4 and use the cached keys directly.
