# Hydra — Button Primary orange (`#F05A23`)

Rest state for **solid** primary buttons uses **`#F05A23`** in **light** UI. Primitives live only in Figma **Colors** as **`Volcano/volcano-1` … `volcano-10`**, with **Light** (`5:0`) vs **Dark** (`5:4`): light = hand-tuned Hydra ramp; dark = `@ant-design/colors` `generate('#F05A23', { theme: 'dark', backgroundColor: '#141414' })` (antd-style, same idea as `volcanoDark`). **Do not** use a separate **ButtonOrange** group — **`Color/ButtonPrimary/*`** aliases **`Volcano/volcano-*`**. Runtime: **`hydraAntdTheme`** + `buttonPrimaryPalette` (light), **`hydraAntdThemeDark`** + `buttonPrimaryPaletteDark` (dark). **Ghost** primary uses **`applyHydraBrandCssVars(..., 'light' | 'dark')`** — see [`index.css`](../src/index.css), [`main.tsx`](../src/main.tsx), [hydra-primary-figma-mapping.md](./hydra-primary-figma-mapping.md).

## Palette — light (`volcanoPrimitiveLight`)

| Role | Hex |
|------|-----|
| Rest (default / focus bg) | `#F05A23` |
| Hover | `#FC834E` |
| Active (pressed) | `#C93E14` |
| Light bg | `#FFF6F0` |
| Light bg hover | `#FFDFC9` |
| Border | `#FFC3A1` |
| Border hover | `#FFA578` |
| Text (outlined solid-primary) | `#F05A23` |
| Text hover | `#FC834E` |
| Text active | `#C93E14` |

## Palette — dark (`volcanoPrimitiveDark`)

| Step | Hex |
|------|-----|
| volcano-1 | `#291712` |
| volcano-2 | `#411F14` |
| volcano-3 | `#562919` |
| volcano-4 | `#77341B` |
| volcano-5 | `#A3421E` |
| volcano-6 | `#CF5021` |
| volcano-7 | `#E57848` |
| volcano-8 | `#F39E73` |
| volcano-9 | `#F8BE9D` |
| volcano-10 | `#FADBC5` |

## Repo ↔ Figma parity (Ant Design naming)

Single source in code: [`src/theme/primaryPrimitiveOrange.ts`](../src/theme/primaryPrimitiveOrange.ts) (`volcanoPrimitiveLight` / `volcanoPrimitiveDark`, `volcanoStep`), [`src/theme/buttonPrimaryPalette.ts`](../src/theme/buttonPrimaryPalette.ts), and [`src/theme/buttonPrimaryCustomizeTheme.ts`](../src/theme/buttonPrimaryCustomizeTheme.ts) (`getButtonPrimaryCustomizeThemeRows()` includes `volcanoPrimitivePath`).

| Figma variable (Customize Theme) | `theme.components.Button` (antd camelCase) |
|----------------------------------|-------------------------------------------|
| `Color/ButtonPrimary/colorPrimary` | `colorPrimary` |
| `Color/ButtonPrimary/colorPrimaryHover` | `colorPrimaryHover` |
| `Color/ButtonPrimary/colorPrimaryActive` | `colorPrimaryActive` |
| `Color/ButtonPrimary/colorPrimaryBG` | `colorPrimaryBg` |
| `Color/ButtonPrimary/colorPrimaryBGHover` | `colorPrimaryBgHover` |
| `Color/ButtonPrimary/colorPrimaryBorder` | `colorPrimaryBorder` |
| `Color/ButtonPrimary/colorPrimaryBorderHover` | `colorPrimaryBorderHover` |
| `Color/ButtonPrimary/colorPrimaryText` | `colorPrimaryText` |
| `Color/ButtonPrimary/colorPrimaryTextHover` | `colorPrimaryTextHover` |
| `Color/ButtonPrimary/colorPrimaryTextActive` | `colorPrimaryTextActive` |

### Figma **Colors** → **Customize Theme** (alias targets)

| Customize Theme path | Primitive |
|----------------------|-----------|
| `Color/ButtonPrimary/colorPrimaryBG` | `Volcano/volcano-1` |
| `Color/ButtonPrimary/colorPrimaryBGHover` | `Volcano/volcano-2` |
| `Color/ButtonPrimary/colorPrimaryBorder` | `Volcano/volcano-3` |
| `Color/ButtonPrimary/colorPrimaryBorderHover` | `Volcano/volcano-4` |
| `Color/ButtonPrimary/colorPrimaryHover` | `Volcano/volcano-5` |
| `Color/ButtonPrimary/colorPrimary` | `Volcano/volcano-6` |
| `Color/ButtonPrimary/colorPrimaryActive` | `Volcano/volcano-8` |
| `Color/ButtonPrimary/colorPrimaryText` | `Volcano/volcano-6` |
| `Color/ButtonPrimary/colorPrimaryTextHover` | `Volcano/volcano-5` |
| `Color/ButtonPrimary/colorPrimaryTextActive` | `Volcano/volcano-8` |

Figma uses **`BG`** in the path (community kit convention); antd tokens use **`Bg`**.

Applied in [`src/theme/antdTheme.ts`](../src/theme/antdTheme.ts). `controlOutline` on Button remains `rgba(240,90,35,0.12)` (focus ring); add a variable later if you want full Figma parity for outline.

## Figma

1. **Colors** → **`Volcano/volcano-1` … `volcano-10`**: set **Light** and **Dark** mode values per tables above (single source for preset **volcano** and solid primary Button).
2. **Customize Theme** → **`Color/ButtonPrimary/*`** — **aliases** to **`Volcano/volcano-*`** (same mapping as the table above). Remove any legacy **`ButtonOrange/*`** variables if they exist.
3. **Button** component set: non-ghost `type=primary` + `danger=false` variants bind to **`Color/ButtonPrimary/*`**.
4. **Ghost** `type=primary` variants use **`Color/Primary/*`** — see [hydra-primary-figma-mapping.md](./hydra-primary-figma-mapping.md).

## Regenerate palette in Node

```bash
node --input-type=module -e "\nimport { theme } from 'antd';\nconst { getDesignToken } = theme;\nconsole.log(JSON.stringify(\n  Object.fromEntries(\n    Object.keys(getDesignToken({ token: { colorPrimary: '#F05A23' } }))\n      .filter((k) => /^colorPrimary|^controlOutline$/i.test(k))\n      .map((k) => [k, getDesignToken({ token: { colorPrimary: '#F05A23' } })[k]]),\n  null,\n  2,\n));\n"
```

Then align [`buttonPrimaryPalette.ts`](../src/theme/buttonPrimaryPalette.ts) and Figma **Customize Theme** rows from [`getButtonPrimaryCustomizeThemeRows()`](../src/theme/buttonPrimaryCustomizeTheme.ts).
