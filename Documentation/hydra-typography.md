# Hydra typography — Cairo only

## React / antd

- **Google Font:** [Cairo](https://fonts.google.com/specimen/Cairo) loaded in [`index.html`](../index.html) (variable weight `200..1000`) — **delivery only**; sizes/line heights are not taken from the URL.
- **Figma → code tokens:** [`src/theme/figmaTypography.ts`](../src/theme/figmaTypography.ts) — family stack, **Base/Normal** (`fontSize`, `lineHeight`, `fontWeight`). Update when Figma text styles change.
- **Re-export:** [`src/theme/brandTypography.ts`](../src/theme/brandTypography.ts) forwards `figmaTypography` exports for compatibility.
- **Theme:** [`src/theme/antdTheme.ts`](../src/theme/antdTheme.ts) sets `fontFamily`, `fontFamilyCode`, and `fontSize` from `figmaTypography`.
- **Base document:** [`src/index.css`](../src/index.css) uses `font-family: var(--hydra-font-family)`; [`applyHydraBrandCssVars`](../src/theme/brandColors.ts) sets that variable from `figmaTypography`.

## Figma (Ant Design community kit)

Local **text styles** were remapped from **SF Pro Text** to **Cairo**:

| Was (SF Pro Text) | Now (Cairo) |
|-------------------|-------------|
| Regular | Regular |
| Semibold | SemiBold |
| Regular Italic | Regular (Cairo static styles in Figma have no Italic in the default set) |

All **25** local text styles in the file (e.g. `Title/Heading 1`, `Base/Normal`, `Small/Italic`, …) use Cairo after sync.

**Note:** Prefer repeating this on a **duplicated** team copy of the [community file](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Ant-Design---Version-5.9.4--Community-). Re-run via Figma MCP `use_figma` if you restore from community original.

### MCP script reference

```js
function mapFont(fn) {
  if (fn.family !== 'SF Pro Text') return null;
  if (fn.style === 'Semibold') return { family: 'Cairo', style: 'SemiBold' };
  if (fn.style === 'Regular') return { family: 'Cairo', style: 'Regular' };
  if (fn.style === 'Regular Italic') return { family: 'Cairo', style: 'Regular' };
  return null;
}
// For each local text style: loadFontAsync(mapped); style.fontName = mapped;
```
