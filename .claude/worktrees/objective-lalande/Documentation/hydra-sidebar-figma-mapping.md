# Hydra sidebar / Menu — Figma semantics

Reference navigation (colors only): [Menu ASC instance](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Ant-Design---DS?node-id=642-33816) (`642:33816`).

**Menu** component frame: [Menu](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Ant-Design---DS?node-id=168-7916) (`168:7916`) — `theme=dark` variants use `Color/Sidebar/*` on key fills.

**Ant Design — DS** library sections (Menu grids + parts): [Components](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Ant-Design---DS?node-id=240-18739) (`240:18739`), [Parts](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Ant-Design---DS?node-id=240-18541) (`240:18541`). Nested **`🧬 item 2`** and **`🧬 submenu`** instances in the Menu component matrix under those sections bind row/plate corners to **`Style/borderRadiusNone`** (not `Style/borderRadiusLG`), matching Hydra [`figmaMenuItemBorderRadius`](../src/theme/figmaMenuMetrics.ts) / antd `itemBorderRadius` + `subMenuItemBorderRadius` = `0`.

## Customize Theme → **Colors** primitives (aliases)

Collection **Customize Theme** (Mode `11:1`). Each `Color/Sidebar/*` variable is a **`VARIABLE_ALIAS`** to the **Colors** collection:

| Customize Theme path | Aliased primitive | Light (`5:0`) hex (repo) |
|----------------------|-------------------|---------------------------|
| `Color/Sidebar/colorSidebar` | `Primary/primary-7` | `#004173` |
| `Color/Sidebar/colorSidebarHeader` | `Neutral/gray-12` | `#141414` |
| `Color/Sidebar/colorSidebarItemSelectedBg` | `Primary/primary-1` | `#B8EAFF` |
| `Color/Sidebar/colorSidebarItemSelectedText` | `Primary/primary-8` | `#00365F` |
| `Color/Sidebar/colorSidebarSubmenuBg` | `Primary/primary-10` | `#001D35` |

**Source of truth:** Figma **Colors** (Light `5:0`); repo [`primaryPrimitiveBlue.ts`](../src/theme/primaryPrimitiveBlue.ts) mirrors resolved hex values.

Code mirror: [`src/theme/sidebarSemantics.ts`](../src/theme/sidebarSemantics.ts) (`sidebarSemanticsLight`).

## Reference vs Figma primitives (historical handoff)

Older static references sometimes differed slightly from ladder steps; **current** `primary-*` values match the linked Figma **Colors** file.

| Legacy reference hex | Role | Figma step (Light) |
|---------------------|------|---------------------|
| `#B8EAFF` | Selected row bg | `primary-1` (`#B8EAFF`) |
| `#004461` | Selected label | Closest to `primary-8` (`#00365F`) |
| `#000c17` | Submenu bg | Closest to `primary-10` (`#001D35`) |

## Colors **Dark** mode

When the **Colors** collection is set to **Dark** (`5:4`), alias targets resolve to **dark** `Primary/*` and **dark** `Neutral/gray-12` (inverted scale). The sidebar will **not** match the static reference screenshot unless you keep **Light** mode for **Colors** while inspecting Hydra nav. That is expected for token-linked semantics.

## `.menu__item` component set (`167:2908`)

[`.menu__item`](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Ant-Design---DS?node-id=167-2908) — navigation row variants:

| Variant | Fill / text binding |
|--------|----------------------|
| `theme=light`, `state=active` (and child-active rows) | `Color/Primary/colorPrimaryBG`, `Color/Primary/colorPrimaryText` (same primitive slots as sidebar selected; unchanged) |
| `theme=light`, `state=hover` / child-active hover | `Color/Neutral/Fill/colorFillSecondary` |
| `theme=dark`, `state=default` / child-active / child-active hover | Transparent root; label `Color/Neutral/Text/colorTextLabel` |
| `theme=dark`, `state=hover` | `Color/Neutral/Background/controlItemBgHover`; label/icons `Color/Neutral/Text/colorTextSolid` |
| `theme=dark`, `state=active` | `Color/Sidebar/colorSidebarItemSelectedBg`; label/icons `Color/Sidebar/colorSidebarItemSelectedText` |
| `theme=dark` / `light`, `state=disabled` | Transparent root; `Color/Neutral/Text/colorTextPlaceholder` |

Dark **active** no longer uses `Color/Primary/colorPrimary` + white text so it stays aligned with **Hydra** sidebar selected row semantics (`Color/Sidebar/*` → `Primary/primary-1` / `primary-8` in **Colors → Light**).

## App `Menu` layout (antd theme)

Hydra [`hydraAntdTheme`](../src/theme/antdTheme.ts) `components.Menu`:

| Role | Repo | Notes |
|------|------|--------|
| Item + submenu row radius | `figmaMenuItemBorderRadius` (`0`) | [`figmaMenuMetrics.ts`](../src/theme/figmaMenuMetrics.ts) — square rows like Figma `.menu__item` |
| Item outer margin | `figmaMenuItemMarginInline` / `figmaMenuItemMarginBlock` (`0`) | Flush stack in the sider |
| Item horizontal padding | `hydraLightAlias.padding` | Ant Design global **`padding`** (typically **16px**); keep in sync with Figma `size/padding/padding` on the nav row |

Deeper nested levels still get antd’s extra **`paddingInlineStart`** for hierarchy (submenu indent); that is separate from the 16px row inset.

## Menu component rebinding

Dark `Menu` variants bind surfaces to `Color/Sidebar/*` (which now resolve through primitives). See earlier automation under `168:7916`.

**Plugin API:** `figma.variables.setBoundVariableForPaint` uses the **Variable** object from `getVariableByIdAsync`.

## Application code

When wiring antd `Layout` / `Menu`, use `sidebarSemanticsLight` or read tokens from your theme layer; keep in sync with Figma alias table above.

Reference shell: [`src/shell/AppShell.tsx`](../src/shell/AppShell.tsx) (sidebar + top bar). Theme wiring: [`hydraAntdTheme`](../src/theme/antdTheme.ts) `components.Menu` + `components.Layout` use the same semantics as Figma `Color/Sidebar/*`. Neutral-on-dark menu chrome: [`figmaMenuDarkChrome`](../src/theme/figmaSemanticColors.ts) (alias `sidebarOnDarkChrome` in [`sidebarSemantics.ts`](../src/theme/sidebarSemantics.ts)). Resolved alias tokens + shell metrics: [`hydraAlias` / `shellLayout`](../src/theme/hydraAlias.ts). UI rule: [`.cursor/rules/hydra-ui-tokens.mdc`](../.cursor/rules/hydra-ui-tokens.mdc).

## Related

- [hydra-primary-figma-mapping.md](./hydra-primary-figma-mapping.md) — `Primary/*` Light/Dark ramps
- [.cursor/rules/figma-repo-parity.mdc](../.cursor/rules/figma-repo-parity.mdc)
