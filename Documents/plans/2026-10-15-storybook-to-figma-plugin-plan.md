# Plan: Storybook → Figma plugin (clean-room "story.to.design" equivalent)

## Meta
- **Date:** 2026-10-15
- **Request type:** `ds-parity` (closest fit — code → Figma sync tooling; sync direction confirmed: **code is the source of truth, Figma is generated**)
- **User request summary:** Build our own tool that takes Hydra's coded components (Ant Design + Hydra theme), renders them from Storybook, and generates full Figma components — all props as variants, states, styles, tokens as variables — like story.to.design. Transport: **CLI writes JSON → user loads JSON in a Figma plugin**.
- **Status:** draft — planning only; implementation not started
- **Plan file:** `Documents/plans/2026-10-15-storybook-to-figma-plugin-plan.md`

## Reusability requirement (added 2026-10-15)

The CLI and the Figma plugin must work for **any project that has a Storybook and an empty Figma file**. Hydra is the first test project, not a dependency.

- **No Hydra code in `tools/s2f`.** No imports from `src/`, no Hydra token names, no antd-only assumptions in core logic. Framework-specific behavior lives in optional **presets** (e.g. `preset-antd`: strip `--ant-` prefix, portal selectors, nested-component selectors).
- **Input = any Storybook URL** (local `http://localhost:6006` or deployed, e.g. Chromatic/static host). Storybook 7+ (`index.json`); CSF2/CSF3 with `argTypes`.
- **Per-project config** `s2f.config.(ts|json)` in the *consuming* project: Storybook URL, story include/exclude, matrix caps, theme global name + values, viewports, token prefix/naming, nested-component selector map, preset list. Every field optional; zero-config must work.
- **Plugin assumes an empty Figma file by default.** It creates pages, the variable collection, styles, components and variant sets from scratch. Matching existing variables/styles/components is an optional mode, never required.
- **Nothing project-specific in `model.json`'s shape.** Project identity is metadata only (`meta.project`, `meta.storybookUrl`).
- **Packaging:** `tools/s2f` is self-contained (own `package.json`) so it can move to its own repo / npm package later (`npx s2f capture --url …`). The plugin is distributed once (org/private or Community) and reused by every project.
- **Hydra-only files stay in Hydra:** `.storybook/**`, `src/stories/**`, and Hydra's `s2f.config.ts`.

## Clean-room rule (read first)

We reverse-engineered story.to.design's agent (v1.28.63) to understand the **architecture**. That analysis lives only in the session scratchpad and **must not be opened, copied, or paraphrased** during implementation. Their code is copyrighted and their terms may forbid reuse.

Allowed inputs for implementers:
- This plan (architecture-level description only).
- Public docs: Figma Plugin API, Storybook docs (`index.json`, `iframe.html` URL args/globals), Playwright docs, Chrome DevTools Protocol docs, CSS specs.
- Public story.to.design **user docs** (feature list only, not code).

Architecture facts we may reuse (ideas, not code):
1. A headless browser renders each story variant from Storybook's `iframe.html`.
2. An in-page script reads DOM geometry + computed styles into a JSON tree.
3. Node-side code converts that tree to a Figma-shaped model, including auto-layout inferred from CSS flex/grid + child geometry.
4. Each node gets a content hash so updates can be diffed.
5. A Figma plugin turns the model into components, variant sets, variables and styles.

## Orchestration for planning (this run)

### Explicit skills and rules used
| Name | Type | Path | Why selected |
|------|------|------|--------------|
| `@plan-orchestrator` | rule | `.cursor/rules/plan-orchestrator.mdc` | Repo contract: plan before implementation |
| `@ds-parity-auditor` | rule | `.cursor/rules/ds-parity-auditor.mdc` | Tool's purpose is code ↔ Figma design-system parity |
| `@figma-repo-parity` | rule | `.cursor/rules/figma-repo-parity.mdc` | Token naming and theme mapping between `src/theme/*` and Figma variables |
| `reverse-engineer-anything` (REA) | skill | `~/.claude/skills/reverse-engineer-anything` | Architecture discovery of the reference product (done; not reused as code) |

### Implicit rules (always active)
| Invoke | Path | Why relevant to this task |
|--------|------|---------------------------|
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | Tool must not change app behavior |
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Stories must use real Hydra tokens so Figma variables are correct |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | Token source for variable naming |
| `@product-ux-rules` / `@ux-guardrails` | `.cursor/rules/*.mdc` | Plugin UI is used by designers (non-technical) |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Stories reflect real composition |

### Not used (and why)
| Name | Why skipped |
|------|-------------|
| `prototype-to-figma` skill | Different goal: builds *screens* from source via MCP and forbids `createComponent`. This tool *creates* components from rendered output. Rules of that skill do not apply to this tool. |
| `@figma-use` / Figma MCP | Plugin is a standalone Figma plugin using the Plugin API directly, not MCP-driven. Optional later for automated verification. |
| `@figma-console-mcp` | Not requested. |
| `@hydra-ux-audit` | Only for the plugin UI phase (Phase 3+), attached there. |

## Implementation invocation (use in a new chat after approval)

### Baseline — attach every UI implementation phase
```
@scope-guardrails
@token-discipline
@ux-guardrails
@hydra-ui-tokens-and-components
```

### Default attach set for this request type
```
@ds-parity-auditor
@figma-repo-parity
@scope-guardrails
```

### Implicit rules during implementation
| Invoke | Path | Applies when |
|--------|------|--------------|
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Writing stories / theme decorators |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Variable/style naming (Phase 6) |
| `@hydra-ux-audit` | `.cursor/skills/hydra-ux-audit` | Plugin UI (Phases 3, 8) |

### Optional add-ons
| Invoke | Path | When to add |
|--------|------|-------------|
| `@figma-use` | `.cursor/skills/figma-use` | If we automate Figma-side verification via MCP |

## Scope summary

Three deliverables:

1. **Hydra Storybook** — Storybook 8 (Vite builder) inside this repo, with a decorator that applies the Hydra Ant Design theme (`src/theme/antdTheme.ts`, `HydraThemeContext`). Pilot components first, then expand.
2. **`s2f` capture CLI** (`tools/s2f/capture`) — Node + Playwright (already a devDependency). Reads Storybook, builds the variant matrix, renders each variant, serializes it, writes `out/<storybook>/model.json` + PNG previews.
3. **`s2f` Figma plugin** (`tools/s2f/figma-plugin`) — designer-facing plugin. Load JSON → creates/updates variables, styles, components, component sets and instances. Includes update review and a Dev Mode code panel.

A shared **JSON schema** (`tools/s2f/schema`) is the contract between 2 and 3.

## Current flow audit

- No Storybook in the repo. No `*.stories.*` files.
- Stack: Vite + React + `antd` 5 + `@ant-design/icons`; Playwright already installed (`playwright`, `@playwright/test`).
- Theme: `src/theme/antdTheme.ts`, `hydraAlias.ts`, `brandColors.ts`, `brandTypography.ts`, button palettes, applied through `ConfigProvider` in `src/context/HydraThemeContext.tsx`.
- **Antd does not emit CSS variables today** (no `cssVar` in theme config). Tokens are CSS-in-JS hashed values. To get Figma variables we enable `cssVar` **only inside Storybook's decorator**, never in the app.
- Existing Figma plans: `2026-10-15-figma-local-components-naming-plan.md`. Component naming in the generated file should follow it.

## Requirements / gap table

| Requirement | Current | Gap | UX risk | Area |
|---|---|---|---|---|
| Components rendered in isolation with all props | None | Add Storybook + stories with full `argTypes` | Low | Storybook |
| Every prop combination → Figma variant | None | Variant matrix from `argTypes` (boolean, enum, select/radio); text args use defaults; per-story override API | Combinatorial explosion | CLI |
| Pixel-faithful layers (not images) | None | In-page DOM serializer: boxes, text runs, borders, radius, shadows, gradients, opacity, transforms, clipping, SVG, images, pseudo-elements | Fidelity gaps | CLI |
| Auto-layout | None | Infer from computed flex/grid + child geometry; fall back to absolute | Wrong layouts | CLI |
| States (hover, focus, active, disabled, tap) | None | Force pseudo-states via CDP `CSS.forcePseudoState` + real Playwright interaction fallback; wait for transitions | Flaky timing | CLI |
| Themes (light/dark, brands) | Theme context exists | Storybook `globals.theme` → variable modes | Low | Storybook + plugin |
| Tokens → Figma variables | Tokens in TS only | `cssVar` in Storybook; collect custom properties declared outside the component; alias chains → variable aliases | Naming drift vs Figma | CLI + plugin |
| Text/color styles | None | Create/match paint + text styles | Duplicates | Plugin |
| Nested components → instances | None | Selector→component mapping (e.g. `.ant-btn` → Button) and matching by variant key | Wrong swaps | CLI + plugin |
| Fonts | Brand typography | Font resolution report; missing-font warning before build | Missing fonts block text | Plugin |
| Update sync | None | Stable keys (storyId + args hash) + node content hashes; review screen with before/after PNG | Lost designer overrides | Plugin |
| Dev Mode code + links | None | Codegen plugin (JSX from args) + dev resource link to story | Low | Plugin |
| Non-technical users | — | Plugin UI: plain language, progress, clear errors, no JSON jargon | High if ignored | Plugin |

## Proposed UX flow

**Developer (once per change):**
`npm run storybook` → `npm run s2f:capture` → produces `tools/s2f/out/hydra/model.json` (+ PNGs, + `capture-report.md`).

**Designer (in Figma):**
1. Open plugin → **"Load components file"** (drag & drop `model.json`).
2. Summary screen: "42 components, 1,180 variants, 96 tokens, 2 themes. Fonts: all available ✓".
3. Choose components (checkbox list grouped by Storybook folder) → **"Create in Figma"**.
4. Progress per component; result page lists anything skipped with a reason in plain language.
5. Next time: loading a newer file shows **"12 components changed"** → **"Review changes"** (side-by-side images, *changed only* toggle) → **"Update selected"**.

## Architecture

```
Storybook (localhost:6006)
   │  index.json  ─────────────► story list + argTypes (via preview API in page)
   ▼
s2f capture CLI (Node + Playwright, Chromium)
   ├─ matrix.ts        argTypes → variants (+ pseudo states, themes, viewports)
   ├─ render.ts        iframe.html?id=…&args=…&globals=…  (one page per story, args switched in place later as optimization)
   ├─ states.ts        CDP CSS.forcePseudoState / hover / focus / mouse.down
   ├─ inpage/serialize.ts   (bundled with esbuild, injected) DOM → raw tree
   ├─ convert/         raw tree → Figma-shaped model (layout inference, text, paints, effects)
   ├─ tokens.ts        CSS custom properties → token graph (+ modes per theme)
   └─ write.ts         model.json + PNG previews + capture report
   ▼
model.json  (schema v1, tools/s2f/schema)
   ▼
Figma plugin (TypeScript, esbuild; ui.html + code.ts)
   ├─ variables.ts   collection "Hydra" + modes, aliases
   ├─ styles.ts      paint/text styles
   ├─ build.ts       model node → Frame/Text/Vector/Rectangle/Image
   ├─ components.ts  variants → Component, combineAsVariants, component properties
   ├─ instances.ts   nested component swap
   ├─ update.ts      diff by keys/hashes, review UI
   └─ codegen.ts     Dev Mode snippet + dev resources
```

### JSON schema v1 (contract — sketch)
- `meta`: tool version, storybook URL, capture time, Storybook hash.
- `tokens[]`: `{ name: "color/brand/500", cssVar: "--hydra-color-brand-500", type, valuesByMode: { light, dark }, aliasOf? }`.
- `styles`: paint + text style candidates with token refs.
- `fonts[]`: family/style pairs actually rendered.
- `components[]`: `{ key, name, storyPath, props: [{ name, type, options, default }], variants: [{ key, props, state, theme, viewport, root: Node, previewPng, hash }] }`.
- `Node`: `{ type: FRAME|TEXT|VECTOR|RECTANGLE|IMAGE|INSTANCE, name, x, y, w, h, layout?, fills[], strokes[], effects[], radius, opacity, clip, text?, svg?, imageRef?, tokenRefs{}, componentRef?, hash, children[] }`.

## Implementation plan by phase

### Phase 1 — Storybook for Hydra (pilot set)
- **Goal:** Storybook running with the Hydra theme and 6 pilot components with complete `argTypes`: Button, Input, Select, Checkbox, Switch, Tag.
- **Files:** `package.json` (devDeps + `storybook` script only), `.storybook/main.ts`, `.storybook/preview.tsx` (ConfigProvider with Hydra theme, `cssVar: true`, `globals.theme` light/dark toolbar), `src/stories/pilot/*.stories.tsx`.
- **UI changes:** None in the app.
- **Data/state:** None.
- **Acceptance criteria:** `npm run storybook` works; each story's Controls cover every variant prop; `iframe.html?id=…&args=…` renders the same as the Controls panel; CSS variables visible in DevTools on `:root`/theme wrapper.
- **Must not change:** `src/` app code, `vite.config`, app theme behavior, Content File Manager, BOM.

#### Phase 1 — invoke for implementation
```
@scope-guardrails
@token-discipline
@hydra-ui-tokens-and-components
@figma-repo-parity
```

**Copy-paste prompt:**
```
Implement Phase 1 only from this plan: Documents/plans/2026-10-15-storybook-to-figma-plugin-plan.md

@scope-guardrails
@token-discipline
@hydra-ui-tokens-and-components
@figma-repo-parity

Allowed files:
- package.json (devDependencies + "storybook"/"build-storybook" scripts only)
- .storybook/**
- src/stories/pilot/**

Forbidden:
- Any other file under src/
- vite.config.*, tsconfig changes beyond what Storybook strictly requires (document it)
- Enabling antd cssVar outside .storybook/preview.tsx
```

### Phase 2 — Schema + capture CLI (visual fidelity, absolute layout)
- **Goal:** `s2f:capture` produces `model.json` for the pilot set with faithful visuals, absolute positioning only.
- **Files:** `tools/s2f/package.json`, `tools/s2f/schema/**`, `tools/s2f/capture/**`, root `package.json` script `s2f:capture`.
- **Details:** discover stories via `index.json`; read `argTypes` from the preview in-page; variant matrix with caps (`maxVariantsPerComponent`, default 256) and per-story override `parameters.s2f = { axes, exclude, name }`; serializer covers boxes, borders (uniform → stroke, mixed → per-side), radius, box-shadow → drop/inner shadow, linear/radial gradients, opacity, overflow → clip, text (per-run styles, line-height, letter-spacing, decoration, transform), `::before/::after`, inline SVG → svg string, `<img>`/background images → bytes (deduped by hash), z-order; PNG preview per variant; node `hash` = SHA-256 of node props without children.
- **Acceptance criteria:** pilot components capture without errors; `capture-report.md` lists counts and warnings; schema validates (zod).
- **Must not change:** app code.

#### Phase 2 — invoke for implementation
```
@scope-guardrails
@ds-parity-auditor
```

**Copy-paste prompt:**
```
Implement Phase 2 only from this plan: Documents/plans/2026-10-15-storybook-to-figma-plugin-plan.md
Clean-room: do not open or use anything from the reverse-engineering scratchpad. Use public docs only.

@scope-guardrails
@ds-parity-auditor

Allowed files:
- tools/s2f/** (generic, self-contained package; no Hydra imports or token names)
- s2f.config.ts (Hydra's own config at repo root)
- package.json (add "s2f:capture" script only)

Forbidden:
- src/**, .storybook/** (except reading)
- Hydra/antd-specific logic in tools/s2f core (put it in tools/s2f/presets/antd)
```

### Phase 3 — Figma plugin MVP (build components + variants)
- **Goal:** Designer loads `model.json` and gets one component set per story with correct variant properties (`Size=Large, Disabled=true`).
- **Files:** `tools/s2f/figma-plugin/**` (`manifest.json`, `code.ts`, `ui.tsx`, build script).
- **Details:** load fonts first, report missing fonts before building; build nodes from model; `createComponent` per variant, `combineAsVariants`, grid arrangement with labels; store `setPluginData('s2f', {key, hash})` on every component and variant; page per Storybook folder.
- **Acceptance criteria:** pilot set imports in a fresh file; variant property names/values match Storybook args; visual check vs PNG preview within tolerance on ≥90% of variants.
- **Must not change:** capture CLI output format without a schema version bump.

#### Phase 3 — invoke for implementation
```
@scope-guardrails
@ux-guardrails
@product-ux-rules
@hydra-ux-audit
```

**Copy-paste prompt:**
```
Implement Phase 3 only from this plan: Documents/plans/2026-10-15-storybook-to-figma-plugin-plan.md
Clean-room: public Figma Plugin API docs only.

@scope-guardrails
@ux-guardrails
@product-ux-rules
@hydra-ux-audit

Allowed files:
- tools/s2f/figma-plugin/**
- tools/s2f/schema/** (read; additive changes only with version bump)

Forbidden:
- src/**, tools/s2f/capture/** (except fixes agreed in chat)
```

### Phase 4 — Auto-layout inference
- **Goal:** Generated frames use auto-layout wherever the DOM is flex/grid or geometrically regular.
- **Files:** `tools/s2f/capture/convert/layout/**`, plugin `build.ts` layout mapping.
- **Details:** map `display:flex` direction/gap/padding/justify/align/wrap → `layoutMode`, `itemSpacing`, paddings, `primaryAxisAlignItems`, `counterAxisAlignItems`, `layoutWrap`; `display:grid` → Figma grid layout where supported; sizing (hug/fill/fixed) from `width:auto`, `flex-grow`, `align-self:stretch`, percentage widths; text auto-resize; absolute children (`position:absolute/fixed`) → `layoutPositioning: ABSOLUTE`; geometric fallback for block layouts (stacked children with consistent gaps → vertical auto-layout); tolerance ±0.5px; on failure keep absolute and log.
- **Acceptance criteria:** pilot components resize correctly in Figma when text changes (button grows with label); no visual regression vs Phase 3 snapshots.

#### Phase 4 — invoke for implementation
```
@scope-guardrails
@ds-parity-auditor
```

**Copy-paste prompt:**
```
Implement Phase 4 only from this plan: Documents/plans/2026-10-15-storybook-to-figma-plugin-plan.md
Clean-room: CSS + Figma Plugin API docs only.

@scope-guardrails
@ds-parity-auditor

Allowed files:
- tools/s2f/capture/convert/**
- tools/s2f/figma-plugin/src/build*.ts
- tools/s2f/schema/** (additive, version bump)
```

### Phase 5 — States, themes, viewports
- **Goal:** `State=Hover|Focus|Active|Pressed` variants, theme modes, responsive breakpoints.
- **Details:** CDP `CSS.forcePseudoState` (primary, deterministic) with Playwright hover/focus/mouse.down fallback for JS-driven states; wait for the longest `transition-duration` (cap 1s); `globals.theme` values → captured per theme; viewport list configurable.
- **Acceptance criteria:** Button hover/focus/active match Storybook visually; dark theme variants render with dark tokens.

#### Phase 5 — invoke for implementation
```
@scope-guardrails
@token-discipline
```

**Copy-paste prompt:**
```
Implement Phase 5 only from this plan: Documents/plans/2026-10-15-storybook-to-figma-plugin-plan.md

@scope-guardrails
@token-discipline

Allowed files:
- tools/s2f/**
- .storybook/preview.tsx (theme global only)
```

### Phase 6 — Tokens → Figma variables + styles
- **Goal:** Colors, radii, spacing, font sizes bound to Figma variables (collection "Hydra", modes Light/Dark); text and color styles created/matched.
- **Details:** collect custom properties declared outside the component root; `--a: var(--b)` → variable alias; naming per `@figma-repo-parity` (group separator → `/`); bind fills, strokes, radii, gaps, paddings, font sizes; match existing variables/styles in the file before creating; Variables tab in plugin showing create/update/unchanged.
- **Acceptance criteria:** changing a Light-mode variable in Figma recolors generated components; names match `src/theme` token names.

#### Phase 6 — invoke for implementation
```
@scope-guardrails
@token-discipline
@figma-repo-parity
@hydra-ui-tokens-and-components
```

**Copy-paste prompt:**
```
Implement Phase 6 only from this plan: Documents/plans/2026-10-15-storybook-to-figma-plugin-plan.md

@scope-guardrails
@token-discipline
@figma-repo-parity
@hydra-ui-tokens-and-components

Allowed files:
- tools/s2f/**
```

### Phase 7 — Nested components → instances
- **Goal:** A Select's inner Tag or a Card's Button becomes an instance of the generated component, not loose layers.
- **Details:** zero-config default = match a captured subtree to an already-captured story root by structure/class signature; projects refine it with a selector → component map in their own `s2f.config.ts`, and presets ship common maps (e.g. `preset-antd`: `.ant-btn` → `Button`); resolve the matching variant by reading classes/attributes; build order = dependencies first; instance overrides for text.
- **Acceptance criteria:** editing the Button main component updates nested Buttons everywhere.

#### Phase 7 — invoke for implementation
```
@scope-guardrails
@ds-parity-auditor
```

**Copy-paste prompt:**
```
Implement Phase 7 only from this plan: Documents/plans/2026-10-15-storybook-to-figma-plugin-plan.md

@scope-guardrails
@ds-parity-auditor

Allowed files:
- tools/s2f/**
```

### Phase 8 — Update sync + visual review
- **Goal:** Re-importing a newer `model.json` updates only changed variants and keeps instance overrides elsewhere in the file.
- **Details:** match by `key`; compare `hash`; replace children of the existing component in place (keeps component ID → instances survive); review screen with before/after PNG, *changed only* toggle, *Update selected / Update all*.
- **Acceptance criteria:** change a Button padding in code → recapture → plugin shows exactly Button variants as changed → update keeps instances in a test page.

#### Phase 8 — invoke for implementation
```
@scope-guardrails
@ux-guardrails
@product-ux-rules
@hydra-ux-audit
```

**Copy-paste prompt:**
```
Implement Phase 8 only from this plan: Documents/plans/2026-10-15-storybook-to-figma-plugin-plan.md

@scope-guardrails
@ux-guardrails
@product-ux-rules
@hydra-ux-audit

Allowed files:
- tools/s2f/figma-plugin/**
```

### Phase 9 — Dev Mode codegen + links, then roll out to all components
- **Goal:** Selecting an instance in Dev Mode shows JSX (`<Button size="large" disabled>Label</Button>`) and a link to the story; then write stories for the rest of Hydra's components.
- **Details:** manifest `capabilities: ["codegen"]`, `codegenLanguages`; dev resources via `node.setDevResourcesAsync` (or equivalent) pointing to Storybook URL.
- **Acceptance criteria:** codegen output matches the story args for any variant.

#### Phase 9 — invoke for implementation
```
@scope-guardrails
@hydra-ui-tokens-and-components
@token-discipline
```

**Copy-paste prompt:**
```
Implement Phase 9 only from this plan: Documents/plans/2026-10-15-storybook-to-figma-plugin-plan.md

@scope-guardrails
@hydra-ui-tokens-and-components
@token-discipline

Allowed files:
- tools/s2f/figma-plugin/**
- src/stories/** (new stories only)
```

## File change plan
| File | Action | Reason |
|---|---|---|
| `package.json` | Edit (devDeps, scripts) | Storybook + `s2f:capture` |
| `.storybook/**` | Create | Storybook config + Hydra theme decorator (`cssVar` here only) |
| `src/stories/**` | Create | Stories with full `argTypes` |
| `tools/s2f/schema/**` | Create | JSON contract (zod + TS types) |
| `tools/s2f/capture/**` | Create | Capture CLI |
| `tools/s2f/figma-plugin/**` | Create | Figma plugin |
| `s2f.config.ts` (repo root, Hydra's own) | Create | Hydra settings: URL, theme global, `preset-antd`, caps — consumed by the generic CLI |
| `tools/s2f/presets/**` | Create | Optional framework presets (antd first) |

## Guardrails
- **Allowed (after approval):** files in the table above, phase by phase.
- **Forbidden:** Hydra-specific code, token names or imports inside `tools/s2f` (use presets + config); app behavior changes; enabling antd `cssVar` in the app; touching Content File Manager or BOM; using any code, strings or structure from the reverse-engineered story.to.design files; running the downloaded story.to.design agent.
- **Assumptions:** Storybook 8 + Vite builder is compatible with the repo's Vite/React versions; designers use Figma desktop and can import a development plugin from `manifest.json`; Hydra's brand fonts are installed for the person running the import.
- **Open questions:**
  1. Which components after the pilot, and in what order?
  2. ~~Fresh file or existing library?~~ **Decided:** empty Figma file is the default for every project; merging into an existing library is an optional later mode.
  3. Private distribution only (development plugin / org plugin), or publish to Figma Community?
  4. Brands: is "theme" only light/dark, or also customer brands?

## Risks
- **Variant explosion** — 5 props × 4 values = 1,024 variants. Mitigation: caps, per-story `axes`/`exclude`, warn in report.
- **Fidelity gaps** — complex CSS (masks, filters, blend modes, `clip-path`) may not map. Mitigation: fall back to flattened vector/image for that node, log it.
- **Antd internals** — portals (dropdowns, tooltips) render outside the story root. Mitigation: capture portal containers with an explicit `portalSelector` per story.
- **Figma API limits** — variable modes per plan tier, plugin memory for very large imports. Mitigation: batch builds, per-component progress, resumable import.
- **Legal** — clean-room discipline; check story.to.design terms before any commercial use.

## Acceptance checklist
- [ ] Storybook runs with Hydra theme; pilot stories expose every variant prop.
- [ ] `npm run s2f:capture` produces a schema-valid `model.json`, PNG previews and a report.
- [ ] Plugin imports pilot set into a fresh Figma file as component sets with correct variant properties.
- [ ] Auto-layout: components resize with content.
- [ ] Hover/focus/active and light/dark variants present and visually correct.
- [ ] Fills/strokes/radii/spacing bound to Hydra variables with Light/Dark modes.
- [ ] Nested Antd components become instances.
- [ ] Re-import updates only changed variants; instances keep overrides.
- [ ] Dev Mode shows JSX for selected instance + link to story.
- [ ] No changes to app behavior; no reverse-engineered code used.
- [ ] Reusability: capture + import also work against a second, non-Hydra public Storybook (zero config) into an empty Figma file.

## Full implementation prompt (all approved phases)
```
Implement approved phase(s) from: Documents/plans/2026-10-15-storybook-to-figma-plugin-plan.md
Clean-room: public docs only; do not open the reverse-engineering scratchpad.

@scope-guardrails
@token-discipline
@ux-guardrails
@hydra-ui-tokens-and-components
@ds-parity-auditor
@figma-repo-parity

Follow allowed files and guardrails in the plan. Do not expand scope.
```
