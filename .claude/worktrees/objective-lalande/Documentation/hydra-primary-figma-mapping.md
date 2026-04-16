# Hydra primary palette — Figma ↔ Ant Design (1:1)

Font (Cairo): see **[hydra-typography.md](./hydra-typography.md)**.

**Orange solid Button primary** uses **`Volcano/volcano-1` … `volcano-10`** in **Colors** and **`Color/ButtonPrimary/*`** in **Customize Theme** (aliases to Volcano) — see **[hydra-button-primary-orange.md](./hydra-button-primary-orange.md)**.

## Authority

**Figma** linked **Colors** collection (Light `5:0` / Dark `5:4`) defines primitive hex; the repo mirrors it in TypeScript for the app.

## Implementation (code)

| Layer | File |
|-------|------|
| Blue primitives (Light + Dark) + semantics | [`src/theme/primaryPrimitiveBlue.ts`](../src/theme/primaryPrimitiveBlue.ts) |
| Orange primitives (Light + Dark) | [`src/theme/primaryPrimitiveOrange.ts`](../src/theme/primaryPrimitiveOrange.ts) |
| Light theme | [`src/theme/antdTheme.ts`](../src/theme/antdTheme.ts) → `hydraAntdTheme` |
| Dark theme | `hydraAntdThemeDark` + [`brandColors.ts`](../src/theme/brandColors.ts) `brandColorsDark` / `applyHydraBrandCssVars` |
| Ghost primary CSS vars | [`src/main.tsx`](../src/main.tsx) + [`src/index.css`](../src/index.css) |

**Community reference (duplicate before editing):**  
[Ant Design — Version 5.9.4 (Community)](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Ant-Design---Version-5.9.4--Community-?node-id=5-8688&view=variables)

## Figma **Colors** — `Primary/primary-1` … `primary-10`

- **Light** (`5:0`): **Figma file** values (linked community **Colors** collection); repo stays in lockstep.
- **Dark** (`5:4`): antd-style dark ramp from seed `#0073A5` via `@ant-design/colors` `generate(..., { theme: 'dark', backgroundColor: '#141414' })` (same approach as preset `blueDark`).

### Light (`5:0`)

| Token | Hex |
|-------|-----|
| `Primary/primary-1` | `#B8EAFF` |
| `Primary/primary-2` | `#8BCCD9` |
| `Primary/primary-3` | `#62B7CC` |
| `Primary/primary-4` | `#00B9F0` |
| `Primary/primary-5` | `#1D8BB3` |
| `Primary/primary-6` | `#0073A5` |
| `Primary/primary-7` | `#004173` |
| `Primary/primary-8` | `#00365F` |
| `Primary/primary-9` | `#002A4A` |
| `Primary/primary-10` | `#001D35` |

### Dark (`5:4`)

| Token | Hex |
|-------|-----|
| `Primary/primary-1` | `#111A1E` |
| `Primary/primary-2` | `#0F242F` |
| `Primary/primary-3` | `#0E3140` |
| `Primary/primary-4` | `#0B3F55` |
| `Primary/primary-5` | `#075272` |
| `Primary/primary-6` | `#03658F` |
| `Primary/primary-7` | `#1C7FA3` |
| `Primary/primary-8` | `#3B9AB6` |
| `Primary/primary-9` | `#60B2C6` |
| `Primary/primary-10` | `#89C8D5` |

## Customize Theme → `Color/Primary/*` (aliases → `Primary/*`)

Same alias mapping in **Mode 1** for both appearances; resolved color follows the **Colors** mode (Light/Dark) selected in Figma.

| Figma path | Alias target |
|------------|----------------|
| `Color/Primary/colorPrimaryBG` | `Primary/primary-1` |
| `Color/Primary/colorPrimaryBGHover` | `Primary/primary-2` |
| `Color/Primary/colorPrimaryBorder` | `Primary/primary-3` |
| `Color/Primary/colorPrimaryBorderHover` | `Primary/primary-4` |
| `Color/Primary/colorPrimaryHover` | `Primary/primary-5` |
| `Color/Primary/colorPrimary` | `Primary/primary-6` |
| `Color/Primary/colorPrimaryActive` | `Primary/primary-7` |
| `Color/Primary/colorPrimaryTextHover` | `Primary/primary-4` |
| `Color/Primary/colorPrimaryText` | `Primary/primary-6` |
| `Color/Primary/colorPrimaryTextActive` | `Primary/primary-7` |
| `Color/Primary/colorLinkHover` | `Primary/primary-4` |
| `Color/Primary/colorLinkActive` | `Primary/primary-7` |

## Ant Design `theme.token` (global blue primary)

Use **`hydraAntdTheme`** (light) or **`hydraAntdThemeDark`** (dark). Below: **light** hex (from `bluePrimarySemantics`).

| `theme.token` key | Light hex |
|-------------------|-----------|
| `colorPrimary` | `#0073A5` |
| `colorPrimaryBg` | `#B8EAFF` |
| `colorPrimaryBgHover` | `#8BCCD9` |
| `colorPrimaryBorder` | `#62B7CC` |
| `colorPrimaryBorderHover` | `#00B9F0` |
| `colorPrimaryHover` | `#1D8BB3` |
| `colorPrimaryActive` | `#004173` |
| `colorPrimaryText` | `#0073A5` |
| `colorPrimaryTextHover` | `#00B9F0` |
| `colorPrimaryTextActive` | `#004173` |
| `colorLink` | `#0073A5` |
| `colorLinkHover` | `#00B9F0` |
| `colorLinkActive` | `#004173` |

Dark values = `bluePrimarySemanticsDark` in code (same semantic keys, dark ramp).

## Regenerating dark ramps

Dark blues/oranges are frozen from `@ant-design/colors` `generate` (see comments in `primaryPrimitiveBlue.ts` / `primaryPrimitiveOrange.ts`). To refresh after changing seeds:

```bash
node --input-type=module -e "import g from '@ant-design/colors/es/generate.js'; console.log(g('#0073A5',{theme:'dark',backgroundColor:'#141414'})); console.log(g('#F05A23',{theme:'dark',backgroundColor:'#141414'}));"
```

## Sync workflow

1. Edit primitive TS files, then **Figma → Colors** (`5:0` / `5:4`).
2. **Customize Theme**: `Color/Primary/*` → `Primary/*`; `Color/ButtonPrimary/*` → **`Volcano/volcano-*`** (no ButtonOrange group).

## Parity audits

Periodic Figma ↔ repo checks: **[hydra-figma-parity-audit.md](./hydra-figma-parity-audit.md)**.
