# Design System Mapping — Hydra Ant Design (Figma lookup map)

**Purpose.** This is the **lookup map** the `figma-frame-ds-cleanup` skill loads **before** making any decision about components, colors, typography, spacing, radius, icons, or layout. Match every element against this file **first**. Only fall back to reasoning when something is genuinely missing here — and when you do, document the gap.

**Language:** English.

**How to use this file (decision order):**

1. Existing shared DS component mapping (this file → "Component mapping")
2. Existing color token mapping (this file → "Color mapping")
3. Existing typography style mapping (this file → "Typography mapping")
4. Existing spacing / padding / radius mapping (this file → "Spacing" / "Radius")
5. Ant Design fallback component pattern (this file → "Ant Design fallback mapping")
6. Clean Auto Layout reconstruction (only after 1–5)
7. Final validation against the original frame (`SKILL.md` checklist)

Never jump to custom rebuilding before checking 1–5.

---

## Source of truth

- **Shared DS library:** `Hydra Ant Design - DS`
  `libraryKey`: `lk-0d30b3c585621778932fa331ee41bae63d4de909f26f80911a7a4b3db61a93641afadfdebd413c3fee615b87b1b49ed17cf9574625892ba8af7162787da919ed`
- **Repo mirrors (values authoritative for hex / px):** `src/theme/hydraTypography.ts`, `primaryPrimitiveBlue.ts`, `hydraSemanticColors.ts`, `hydraAlias.ts`, `antdTheme.ts`.
- **Tokens are Ant Design semantic tokens** (camelCase: `colorPrimary`, `paddingLG`, `borderRadiusLG`). Spacing/radius/neutral follow antd defaults; **primary blue** is Hydra-overridden (see Color mapping).

**Component keys below are `component_set` keys** unless marked `(component)`. To instantiate: `figma.importComponentSetByKeyAsync(key)` then pick the variant, or `figma.importComponentByKeyAsync(key)` for a single component. **Always confirm the exact variant string and property key at runtime** via `set.children.map(c => c.name)` and `set.componentPropertyDefinitions` — variant strings drift across kit updates.

---

## Component mapping

### Button

- **DS location:** `Hydra Ant Design - DS / Button`
- **Key:** `c389ed6245c78052b051047e62217ddcdcb85970`
- **Recognize when:** clickable action with a label and/or icon; filled / outlined / text / dashed / link styling; triggers an operation.
- **Use:**
  - Primary (solid) → main action on a surface (one per context).
  - Default/Secondary (outlined) → supporting action.
  - Text / Link → low-emphasis or inline action.
  - `danger` → destructive action.
- **Props to check:** `type` (primary/default/dashed/text/link), `size` (small/middle/large), `state` (default/hover/active/disabled), `danger`, `loading`, `icon left` / `icon right` (boolean + instance-swap), label text.
- **Icon behavior:** toggle the icon-slot boolean and swap the icon **instance** via the icon-swap property — never drop a raw icon on top of the button.
- **Common mistakes:** rebuilding a button from a rectangle + text; two solid primaries side by side; detaching the instance; raw icon layer inside.
- **Fallback:** none needed — this is the canonical button. Icon-only button → use Button with only an icon slot on (no dedicated "Icon Button" set exists in this DS).

### Input (text field)

- **DS location:** `Hydra Ant Design - DS / Input` — Key `20cab57ba22d929d21018839d4c5917b98e5b096`
- **Related sets:** `Input__Search Box` `0d6fb8c5f63b36527ab779b3f2dcf107567d933a`; `Input__Text Area` `466cd8e27d987ee0a5b7873dcc652ceca4638cd7`; `Input__Password` `c37d859dba6937e52f76bc348511dc42fda1ee56`; `Input__Label` `4fd56a0d5b887f1450795063e9ed6a6d79017faa`; `Input__Caption` `eee798ba8aaa9d1436c53e302775eabb221a0a30`; `Input__Pre Post Tab` `4624d868b67f3f897ef1b1a11fae4307c6895d91`; `InputNumber` `ebd53702697b7d34b02b1ebad8575a4df1504d9e`; `AutoComplete` `5dc52ed98cf9f8635cdf7654318f16488cbd9e59`.
- **Recognize when:** single-line text entry box with placeholder / value, optional left/right icon or affix.
- **Props to check:** `state` (default/hover/focus/disabled), `status` (default/error/warning), `size`, `show icon left` / `show icon right` (+ icon-swap), title/placeholder text.
- **Icon behavior:** use the built-in icon slots + swap; do not overlay a raw magnifier.
- **Common mistakes:** using `Input__Search Box` for a plain search field when the design is really a base `Input` with a left search icon (verify against the frame — base `Input` + `Search` icon is the usual match); rebuilding the box from a rectangle + text.
- **Fallback:** none — pick the closest `Input__*` set.

### Textarea

- **DS location:** `Input__Text Area` — Key `466cd8e27d987ee0a5b7873dcc652ceca4638cd7`
- **Recognize when:** multi-line text entry, resize handle, character counter.
- **Props to check:** `state`, `status`, `size`, `show count`, value/placeholder.
- **Fallback:** none.

### Select

- **DS location:** `Hydra Ant Design - DS / Select` — Key `9ad446582f5a367435bccd188c8ca1bec6c3867b`
- **Multiple-select item chip:** `select__multipleItem` `518534acf13e5ae6f9b6962cb2417e9c6dc9da33`
- **Recognize when:** field showing a chosen value + chevron; opens a list of options; single or multiple (tag chips).
- **Props to check:** `state`, `status`, `size`, `mode` (single/multiple), open/closed, placeholder vs value, suffix chevron icon.
- **Common mistakes:** confusing with `Input` (Select shows a chevron + is not free-typed unless AutoComplete); building the option list manually instead of using the DS dropdown surface.
- **Fallback:** none.

### Checkbox

- **DS location:** `Hydra Ant Design - DS / Checkbox` — Key `044b4c3a98c3d58a97cc9bbb00f7863b4567387e`
- **In-table variant:** `Table / Table Item / … Checkbox` `9e4873c6bf146bbab9b5a1ddf1cd2cc130c787bd`
- **Recognize when:** square control for multi-select / on-off with optional label.
- **Props to check:** `state`, `status` (checked/unchecked/indeterminate), `show title` (label boolean), label text.
- **Common mistakes:** using a Checkbox where only one option may be selected (that's Radio); drawing a raw square.
- **Fallback:** none.

### Radio

- **DS location:** `Hydra Ant Design - DS / Radio` — Key `49b016fdee75a9d7592804df5a0beafacf6d4e2b`
- **Groups:** `Radio Group__Basic` `cb2d788b6b2d7687c2088aa33f7aeaaf8a42fab7`; `Radio Group__Buttons` `87fee83c4af067d002d52291b90cf33a7a842e0c`
- **Recognize when:** circular control for single-choice within a group; optional label.
- **Variant names (confirmed):** `state=default, checked=false` / `state=default, checked=true` (+ hover/disabled). Label toggled by a `show title` boolean.
- **Props to check:** `state`, `checked`, `show title`, label text.
- **Common mistakes:** using Radio for multi-select; label centered instead of left (`primaryAxisAlignItems = 'MIN'`).
- **Fallback:** none.

### Switch

- **DS location:** `Hydra Ant Design - DS / Switch` — Key `e1474c41f787133d67d3ce28f5b734436dab7154`
- **Recognize when:** pill toggle for an immediate on/off state.
- **Props to check:** `state` (default/disabled), `checked` (on/off), `size` (default/small), optional inner text/icon.
- **Common mistakes:** using Switch for form submit-time selection (use Checkbox); using it as a segmented control (use Radio Group Buttons / Tabs).
- **Fallback:** none.

### Tag / Badge

- **DS location:** `Hydra Ant Design - DS / Tag` — Key `7e6f32596793be8af9d9531d75c424e41cea2b89`
- **Variants:** `Tag__Colorful` `9f805db028b5e2a4665e7959d414fa6b5810712e`; `Tag__Status` `5dc5e25d7c096af529f0eb8bed8a245385590a41`; `Tag__Icon` `0b53ec33d845e44d3ce9650105cb788320d85377`; `Tag__Checkable` `f42d2c0c6fd04df440b56ed8a1b295ae8c2396a4`
- **Recognize when:** small rounded label for a category, status, count, or removable chip.
- **Use:** `Tag__Status` for status dots/labels; `Tag__Colorful` for category color; `Tag__Icon` when a leading icon is needed; `Tag__Checkable` for filter chips.
- **Props to check:** color/preset, `closable`, icon boolean + swap, label text.
- **Common mistakes:** building a status pill from a rectangle; using a colored Tag as a Button.
- **Fallback:** none.

### Alert

- **DS location:** `Hydra Ant Design - DS / Alert` — Key `036854106d411f896babef8fc8fc1d0875375a6b`
- **Recognize when:** inline banner with status icon + message (info/success/warning/error), optionally with description and close.
- **Props to check:** `type` (info/success/warning/error), `show icon`, `closable`, `banner`, title / description text, action slot.
- **Common mistakes:** styling a `Card` to look like an alert; hard-coding the status color instead of using the `type` variant.
- **Fallback:** none.

### Tooltip

- **DS location:** `Hydra Ant Design - DS / Tooltip` — Key `deb6eda60c8085ee77e50ad450c6d6cb3b751a04`
- **Colorful:** `Tooltip__Colorful` `e925fd3a1694d94604d18251df25611981a95466`
- **Recognize when:** small dark popup tip with a pointer arrow.
- **Props to check:** placement (arrow direction), text.
- **Fallback:** none. (`Popover` `1e193c7742a17645be688d06d72d96b381d49041` for rich content popups.)

### Modal

- **DS location:** `Hydra Ant Design - DS / Modal` — Key `7421b9968a412b2a6e6273fab6bf8303a25e9253` `(component)`
- **Variants:** `Modal__Confirmation` `ff12f0bc9fe951ebe0a0e86589c855a386d6ab8d` `(component)`; `Modal__Information` `447f39482cd7fedd6ed5b5c92e25f837ef5eb9da`; `Modal__Overlay` `9cfd8b4767900feee8715bb07574360fd92a5478`
- **Recognize when:** centered dialog with title, body, footer actions, close (×), on a dimmed overlay.
- **Props to check:** title, body slot, footer buttons (map to `Button`), `closable`, width. Use `Modal__Confirmation` for confirm/destructive prompts, `Modal__Overlay` for the scrim.
- **Common mistakes:** rebuilding the header/footer manually; not mapping footer buttons to `Button`; hard-coding the 8px corner (use `borderRadiusLG`).
- **Fallback:** none.

### Drawer

- **DS location:** `Hydra Ant Design - DS / Drawer` — Key `253514fcbc013e93ac73f612701f34d45ab88bd9`
- **Recognize when:** panel sliding in from a screen edge with header + body + footer.
- **Props to check:** placement (left/right/top/bottom), title, `closable`, footer actions, size.
- **Fallback:** none.

### Table

- **DS location:** `Hydra Ant Design - DS / Table` — Key `87fe6b6c1a78f0e41740d70e9dccb324f9941bc3`
- **Building blocks:** `Table / Table cell` `e5780965c4d42aebf05fd5a321f4217ddfb1ca69`; `… Header Item` `71df4b80521b40966ae3b695d8dabefd381eaae8`; `… Row Control` `78c2e94cbb7e2bbc0bf0004faed275abb9cf8fdf`; `… Header Control` `2d479f5cc28d7204c5d12e415ca274b306ad82d7`; dropdown/collapse cell sets exist too.
- **Recognize when:** grid of rows/columns with a header row, cell alignment, optional row selection / sort / expand.
- **Props to check:** header cell (sort, filter, control), body cell (text/tag/action content), row selection (checkbox/radio control), size (default/middle/small), zebra/hover.
- **Common mistakes:** building rows as free frames of text instead of `Table cell` instances; faking selection with a raw checkbox.
- **Fallback:** none — compose from the Table item sets.

### Tabs

- **DS location:** `Hydra Ant Design - DS / Tabs` — Key `41a30c7019bcfc0c2ad01161bc374446d7af9402`
- **Recognize when:** horizontal (or vertical) row of switchable section headers with an active indicator.
- **Props to check:** `type` (line/card), `size`, active tab, icon boolean, per-tab label, position.
- **Common mistakes:** using a Radio Group / Segmented look where Tabs switch page sections; underline drawn manually.
- **Fallback:** none.

### Breadcrumb

- **DS location:** `Hydra Ant Design - DS / Breadcrumb` — Key `8adfc11018c00e66f364408440c5cc8bfcc75de7`
- **Recognize when:** path of links separated by `/` or `>` showing hierarchy location.
- **Props to check:** item count, separator, per-item label, last item = current (non-link).
- **Fallback:** none.

### Pagination

- **DS location:** `Hydra Ant Design - DS / Pagination` — Key `4a0d40c04e218b8b52585e5b5dea805789c33d39`
- **Recognize when:** numbered page controls with prev/next, optional page-size select and jumper.
- **Props to check:** current page, total, `size` (default/small), `show size changer`, `show quick jumper`.
- **Fallback:** none.

### Card

- **DS location:** **No general `Card` component_set in this DS.** `export_card` `0a5f7242eaa67bb2565a63a4e2724f89c7d2d734` is purpose-specific; `Popover` covers floating cards.
- **Recognize when:** a surface panel grouping content with a container background, border, radius, and padding.
- **Rule:** for generic content cards, **compose** a clean Auto Layout frame using tokens — `colorBgContainer` fill, `colorBorderSecondary` stroke, `borderRadiusLG` radius, `paddingLG`/`padding` inset — per `hydra-ux-composition.mdc`. This is an allowed local composition, not a new shared component.
- **Common mistakes:** inventing a new "Card" master; raw hex/px for the surface.
- **Fallback:** local composition with tokens (above) OR Ant Design `Card` pattern per fallback rules if a repeatable card is needed.

### Empty state

- **DS location:** `Hydra Ant Design - DS / Empty` — Key `5265f6cb86330e4c67421205db3e31079d9cbe8b`
- **Recognize when:** placeholder illustration/icon + message (+ optional CTA) when there's no data.
- **Props to check:** image/illustration, description text, optional action (map to `Button`).
- **Fallback:** none.

### Dropdown

- **DS location:** `Hydra Ant Design - DS / Dropdown` — Key `30d6fc1e788b8f082fe5952511e04f07febe0cc3`
- **List item:** `dropdown.list` `5b3b26fa8b3bb566d61433f540daa071e97841f7` `(component)`
- **Recognize when:** trigger (button/link/icon) that opens a floating list of actions.
- **Props to check:** trigger type, menu items (label + optional icon), dividers, danger item.
- **Common mistakes:** confusing with `Select` (Dropdown = actions, Select = value pick).
- **Fallback:** none.

### Menu / Navigation items

- **DS location:** `Hydra Ant Design - DS / Menu` — Key `512e42859f6216ebc666a99d2165cee10461a1fd`
- **Top nav:** `Menu__TopNavigation` `8407aca2637bc1fbc4191b4c64005efc203aaa9e`
- **Recognize when:** vertical/horizontal navigation list, items with icon + label, selected/active state, submenus.
- **Props to check:** orientation, item `state` (default/hover/selected/disabled), icon boolean + swap, label, submenu expand.
- **Note:** Hydra sidebar/dark Menu is governed by `sidebarSemantics.ts` + `figmaMenuMetrics.ts` (radius 0, margins 0). Keep those metrics.
- **Fallback:** none.

### Date Picker

- **DS location:** `Hydra Ant Design - DS / DatePicker` — Key `4d1bb40c6d68f437bfb03d375ab14fae7a577616`
- **Time:** `TimePicker` `1b0812ea7864a2819a03660874ed976885cd2e00`
- **Recognize when:** input with a calendar icon that opens a date/range calendar.
- **Props to check:** `state`, `status`, `size`, single/range, placeholder/value, suffix calendar icon.
- **Fallback:** none.

### Stepper / Steps

- **DS location:** `Hydra Ant Design - DS / Steps` — Key `cb87f7d7e6c4471b12f0f70b2d45a52e9004680f`
- **Progress variant:** `Progress__Steps` `46d57c905171963b83e263478e2eca8b384d3ce4`
- **Recognize when:** numbered/labeled sequence showing progress through a task (finish/process/wait).
- **Props to check:** direction, current step, per-step `status` (wait/process/finish/error), title/description, icon.
- **Fallback:** none.

### Avatar

- **DS location:** `Hydra Ant Design - DS / Avatar` — Key `c5a04db18b497869c5e58abe76d3f74fb0051087`
- **Recognize when:** circular/square user image, initials, or icon.
- **Props to check:** `shape` (circle/square), `size`, content (image/initials/icon).
- **Fallback:** none.

### Divider

- **DS location:** `Hydra Ant Design - DS / Divider__Horizontal` — Key `7f56618ee90512e43e09e01859025c8c44800214`
- **Recognize when:** thin separator line between content, optionally with centered/left/right label.
- **Variant names (confirmed):** `text={text|heading}, orientation={default|left|right}, dashed={false|true}`. Label toggled by `show title` boolean; full-width via `layoutSizingHorizontal = 'FILL'`.
- **Common mistakes:** using a 1px rectangle instead of the component.
- **Fallback:** none.

### Text / Typography

- **DS location:** `Hydra Ant Design - DS / Text` — Key `e27c9fd0bc1c3f7b367d8387dfb217edbe08e0fa`
- **Variant names (confirmed):** `type={default|secondary|success|warning|danger}, style={default|strong|…}, size={default|…}`.
- **Link:** `Hydra Ant Design - DS / Link` — Key `097e14a892c4e7b2d5cf3840c08c507efe1fd752`, variant `underlined={False|True}`, `✏️ title` text prop.
- **Recognize when:** any standalone text run / label / inline link.
- **Rule:** every text layer maps to a **Text style** (see Typography mapping) and, where it's a DS text/link element, to the `Text`/`Link` component; align labels left with `primaryAxisAlignItems = 'MIN'`.
- **Fallback:** if not a component context, a raw text node is acceptable **only if** it's bound to an existing text style.

### Form fields

- Compose from: `Input__Label` (label), the field control (`Input` / `Select` / `DatePicker` / etc.), and `Input__Caption` (helper/error text). Map required marker, label, control state (`status=error` etc.), and caption together. No standalone "Form field" master — this is the canonical composition.

### Status indicators

- Use `Tag__Status` `5dc5e25d7c096af529f0eb8bed8a245385590a41` for status labels/dots, or `Alert` for inline status banners. Color comes from the variant, never a raw hex.

### Icon Button

- **No dedicated Icon Button set** in this DS. Use `Button` (`c389ed6245c78052b051047e62217ddcdcb85970`) with only an icon slot enabled and no label. Confirm the icon-only variant renders square. If a future dedicated set appears, prefer it and note the gap.

---

## Ant Design fallback mapping

If a pattern exists in **Ant Design** but **not** in the shared DS, do **not** invent a custom UI. Create a **local component next to the target frame** based on the Ant Design pattern, styled **only** with existing tokens, then use an **instance** of that local component in the cleaned frame.

| Ant Design pattern | Exists in Hydra DS? | Action | Tokens to use | Place local component |
|---|---|---|---|---|
| Generic content `Card` | No general set | Local `Card` from AntD pattern (header/body/actions) | `colorBgContainer`, `colorBorderSecondary`, `borderRadiusLG`, `paddingLG`/`padding`, Text styles | On the same page, left of / beside the target frame, in a "Local Components" section |
| `Segmented` | Verify (not found) | Local `Segmented` OR use `Radio Group__Buttons` if it matches | `colorFillTertiary` track, `colorBgContainer` thumb, `borderRadiusSM`, Base/Normal | Same page section |
| `Descriptions` / key-value list | Verify | Local from AntD pattern | `colorTextSecondary` labels, `colorText` values, `paddingSM`, Base styles | Same page section |
| `Result` / status page | Verify | Local from AntD pattern (reuse `Empty` if close) | status color tokens, Heading/Base styles | Same page section |
| `Statistic` | Verify | Local from AntD pattern | `colorText`, `colorTextSecondary`, Heading styles | Same page section |
| `Timeline` | Verify | Local from AntD pattern | `colorPrimary` dots, `colorBorderSecondary` line | Same page section |

Before creating any local fallback, re-run `search_design_system` for that name (some sets are named `Foo__Bar`) — many patterns already exist. Only build local when the search confirms it's missing.

---

## Color mapping

Values mirror `src/theme/primaryPrimitiveBlue.ts` (Hydra-overridden **primary blue**) and Ant Design default light neutrals/status. **Never leave a raw hex if a token exists. Never create tokens.** If no exact match, use the closest token by **usage**, and document it.

### Primary (Hydra blue — light)

| Raw HEX | Token | Usage |
|---|---|---|
| `#0073A5` | `colorPrimary` | Primary action fill, active/selected states, primary icon |
| `#1D8BB3` | `colorPrimaryHover` | Primary hover |
| `#004173` | `colorPrimaryActive` | Primary pressed/active |
| `#B8EAFF` | `colorPrimaryBg` | Primary tint background (selected row, chip) |
| `#8BCCD9` | `colorPrimaryBgHover` | Primary tint background hover |
| `#62B7CC` | `colorPrimaryBorder` | Primary border |
| `#00B9F0` | `colorPrimaryBorderHover` / `colorLinkHover` | Primary border hover / link hover |
| `#0073A5` | `colorLink` | Inline link text |
| `#004173` | `colorLinkActive` | Link active |

### Neutral text / border / surface / fill (AntD default light)

| Raw HEX / RGBA | Token | Usage |
|---|---|---|
| `#000000E0` / `rgba(0,0,0,0.88)` | `colorText` | Primary body/title text |
| `#000000A6` / `rgba(0,0,0,0.65)` | `colorTextSecondary` | Secondary text |
| `#00000073` / `rgba(0,0,0,0.45)` | `colorTextTertiary` / `colorTextDescription` | Tertiary text, captions, placeholders-adjacent |
| `#00000040` / `rgba(0,0,0,0.25)` | `colorTextQuaternary` | Disabled text, placeholder |
| `#D9D9D9` | `colorBorder` | Default control border |
| `#F0F0F0` | `colorBorderSecondary` | Subtle divider / row border / card border |
| `#FFFFFF` | `colorBgContainer` | Component/container surface |
| `#FFFFFF` | `colorBgElevated` | Popover/modal/dropdown surface |
| `#F0F2F8` | `colorBgLayout` | Page/layout chrome (Hydra `Neutral/gray-3`) |
| `rgba(0,0,0,0.15)` | `colorFill` | Strong fill (skeleton, track) |
| `rgba(0,0,0,0.06)` | `colorFillSecondary` | Secondary fill |
| `rgba(0,0,0,0.04)` | `colorFillTertiary` | Hover fill, subtle track |
| `rgba(0,0,0,0.02)` | `colorFillQuaternary` | Faintest fill (zebra, info card bg) |
| `#141414` | (sidebar) `Neutral/gray-12` via `sidebarSemantics` | Dark sidebar chrome only |

### Status (AntD default — verify against Figma before hard commit)

| Raw HEX | Token | Usage |
|---|---|---|
| `#52C41A` | `colorSuccess` | Success text/icon/border |
| `#FAAD14` | `colorWarning` | Warning |
| `#FF4D4F` | `colorError` | Error / danger |
| `#0073A5` | `colorInfo` | Info (= primary in Hydra) |

Each status also has `…Bg` / `…Border` variants — use them for Alert/Tag surfaces rather than opacity hacks.

---

## Typography mapping

Values mirror `src/theme/hydraTypography.ts`. Font family: **Cairo** (`400` = Regular, `600` = SemiBold). Map by **semantic role first**, then size/weight. **Every text layer must link to an existing text style.** Do not create text styles.

| Size | Weight | Line height | Usage | Text style (design path) |
|---|---|---|---|---|
| 12 | 400 | 20 | Caption, helper, metadata | `Small/Normal` |
| 12 | 600 | 20 | Small labels, table headers | `Small/Strong` |
| 14 | 400 | 22 | Body, form values, default text | `Base/Normal` |
| 14 | 600 | 22 | Emphasis body, input labels, list titles | `Base/Strong` |
| 16 | 400 | 24 | Large body | `Large/Normal` |
| 16 | 600 | 24 | Section title, `H5` | `Large/Strong` or `Title/Heading 5` |
| 20 | 400 | 28 | Extra-large body | `Extra Large/Normal` |
| 20 | 600 | 28 | Card / modal title | `Title/Heading 4` (or `Extra Large/Strong`) |
| 24 | 600 | 32 | Page title | `Title/Heading 3` |
| 30 | 600 | 38 | Large page title | `Title/Heading 2` |
| 38 | 600 | 46 | Hero title | `Title/Heading 1` |

**Decorated variants** (each size also has): `…/Underline`, `…/Delete` (strikethrough), `…/Italic`. Link text uses `Base/*` with the `Link` component + `colorLink`.

Rules: match by role → size/weight; if no exact match, choose the closest style and document it; preserve original characters exactly.

---

## Spacing mapping

Ant Design spacing tokens (default scale, px). Use **padding tokens** for internal frame/component padding and **spacing tokens** (same scale) for Auto Layout gaps. Never leave a raw spacing value; never create tokens. Preserve the original visual spacing.

| Raw px | Token (padding / gap) | Margin equivalent | Usage |
|---|---|---|---|
| 4 | `paddingXXS` | `marginXXS` | Icon↔text gap, tight inline |
| 8 | `paddingXS` | `marginXS` | Small internal gap, chip padding |
| 12 | `paddingSM` | `marginSM` | Compact component padding, list row padding |
| 16 | `padding` | `margin` | Default component padding |
| 20 | `paddingMD` | `marginMD` | Section spacing |
| 24 | `paddingLG` | `marginLG` | Card / page block padding, section gap |
| 32 | `paddingXL` | `marginXL` | Large section spacing |
| 48 | — | `marginXXL` | Page-level separation |

Base unit `sizeUnit = 4`; shell metrics derive from `shellLayout` (`src/theme/hydraAlias.ts`) — do not hard-code sidebar/header sizes.

If a raw value falls between tokens (e.g. 10, 14, 17), snap to the **nearest** token and document; do not introduce the raw value.

---

## Radius and border mapping

Ant Design radius tokens (default, px). Match by component type / visual role. Border **color** always comes from `colorBorder` / `colorBorderSecondary` (see Color mapping) — never a raw border hex.

| Raw px | Token | Usage |
|---|---|---|
| 2 | `borderRadiusXS` | Tiny chips, inner accents |
| 4 | `borderRadiusSM` | Small controls, tags, checkboxes |
| 6 | `borderRadius` | Inputs, buttons, default controls |
| 8 | `borderRadiusLG` | Cards, panels, list viewport, modals |

Notes: largest default token is `borderRadiusLG = 8` (there is no `xl`); Modal/large containers use `borderRadiusLG`. Border weight 1px binds to `Spacing/0.25`-style stroke where the DS uses it; otherwise a 1px stroke with a `colorBorder*` bound paint.

---

## Icon mapping

Icons are DS icon components in `Hydra Ant Design - DS` (Ant Design icon set). Use the DS icon component; do **not** paste raw SVG when a DS icon exists. In-component icons go through the component's **icon-swap** property, not a pasted layer. Standard frame icon size is **16×16** (resize the imported icon instance to match sibling icons); button/field icon size follows the component.

| Meaning | DS icon | Key | When | Size | Color |
|---|---|---|---|---|---|
| Add / create | `Plus` | `c3130c21e2e6959e0d404da56b6a643708b761a6` | "Create/Add" links & buttons | 16 (frame) / component slot | `colorPrimary` for links, inherits in buttons |
| Search | `Search` (in Input search slot) | via `Input` icon-swap | Search fields | component slot | `colorTextTertiary` placeholder-adjacent |
| Clear / remove | `CloseCircle` | (import by search) | Clearable input/tag | 16 | `colorTextTertiary` |
| Chevron down | `CaretDown` | `05cdfb4a01493e7a2f3f04d0cffa7c35891aa826` | Select/Dropdown affix | component slot | inherits |

For any icon meaning not listed, run `search_design_system` with the icon name **before** using a raw asset. If the icon truly is absent from the DS, document it as a **gap** (do not introduce a new icon source/library).

Rules: DS icon components only; button/field icons via component props; missing icon → documented gap.

---

## When something is missing from this map

1. Re-run `search_design_system` (scoped to the Hydra DS library key) with the exact / partial name — it may exist under a `Foo__Bar` name.
2. If it's an **Ant Design** pattern absent from the DS → **Ant Design fallback mapping** (local component, tokens only).
3. If it's a value with no exact token → nearest token by **usage**, documented.
4. If it's genuinely novel → clean local Auto Layout composition using tokens + Text styles, treated as a **local prototype**, never promoted to a shared component.
5. Log every gap in the final report so the DS can absorb it later.
