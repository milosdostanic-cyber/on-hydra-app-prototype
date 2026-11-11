# Hydra DS — Dark theme token fix plan

> **Revised 2026-11-02 (after apply):** The user asked for no new tokens and no visible UI change. Everything below was applied, then rolled back from the in-file snapshot (`figma.root` shared plugin data `hydra_darkfix / rollback_2026_11_02`). Verified: 0 resolved-value differences across all 414 variables, 0 extra variables.
> **Kept (value-neutral):** step 3 Light parity relinks (7 tokens) and Dark `colorFillQuaternary` → `Opacity/white-4`.
> **Applied after review (small visible fixes, existing tokens only):** Dark `colorBorderDisabled` → `colorBorder` (white 35% → 20%), Dark `colorHighlight` → `colorErrorText` (red-4, readable on navy). Declined: BorderHover change, subtle primary border, visible Dark elevation (shadows stay invisible on purpose).
> **Applied later the same day (Dark only, existing primitives, Light verified unchanged):** `colorSuccessBorder` → green-9, `colorActionBorder` → hydra-9, `colorErrorBg` → red-10, `colorInfoBg` → blue-10, `colorInfoBgHover` → blue-9 (`colorErrorOutline` follows). Removed the stale "Palette-only" note from red-10, blue-9, blue-10. Steps 8–10 already had descriptions (audit COL-08, 2026-10-12) saying they are dark tones on purpose, so no new descriptions were needed. Changelog entry "2 November 2026 — Dark theme tokens" covers all of today's changes.
> **Not kept:** new dark scales, white-18/12/8/20/35, Navy Surface, Dark relinks, step 8–10 restores. Steps 8–10 must keep their current (dark) values, because 33 Dark tokens depend on them.

**Date:** 2026-11-02
**File:** Hydra Ant Design – DS (`3ghYBXR6XVUEaeBo3D5E4q`)
**Collections:** `Colors` (primitives, 1 mode) · `Customize Theme` (semantic, Light `11:1` / Dark `1761:0`)
**Source audit:** `Documentation/ds-dark-theme-audit-2026-11-02.html`
**Scope:** Figma variables only. No component, page or code changes.

## Decisions (confirmed with the user)

| Topic | Decision |
|---|---|
| Dark base | **Navy** stays (`#0A2238` / `#0C3559` / `#004173`). Code alignment is a separate task. |
| Dark primitives | **Separate dark scales** in `Colors`, one mode, explicit names. |
| Main colours in Dark | **Use the dark scale** (no longer identical to Light). |
| Text colours in Dark | **Keep lighter tints**, relinked to the matching dark-scale step; fix the ones under 4.5:1. |
| Dark scale values | **Option A — Ant standard dark scales** (generated against `#141414`). They keep each status hue on navy. Option B (mixed against navy) drifts Error/Warning toward purple/blue, so it is not used. |

## Step 0 — Safety

1. Save a named version in Figma history: "Before dark token fix 2026-11-02".
2. Scan every page for nodes bound **directly** to `Colors` steps 8–10 of the palettes in step 4 (primitives are hidden from publishing, so this should be 0). If any exist, list them and stop for review.

## Step 1 — New primitives in `Colors`

All new primitives: hidden from publishing, no scopes (same as the existing 196).

**1a. Dark scales (14 × 10 = 140).** Group name `<Palette> Dark/<prefix>-1 … 10`, e.g. `Daybreak Blue Dark/blue-1`.

| Palette | Source of values |
|---|---|
| Dust Red, Volcano, Sunset Orange, Calendula Gold, Sunrise Yellow, Lime, Polar Green, Cyan, Daybreak Blue, Geek Blue, Golden Purple, Magenta | `@ant-design/colors` `presetDarkPalettes` |
| Primary | repo `bluePrimaryPrimitiveDark` (`src/theme/primaryPrimitiveBlue.ts`) |
| Hydra Action Orange | repo `volcanoPrimitiveDark` (`src/theme/primaryPrimitiveOrange.ts`) |

**1b. White alpha (5):** `Opacity/white-18`, `white-12`, `white-8`, `white-20`, `white-35`.

**1c. Dark surfaces (3):** `Navy Surface/layout #0A2238`, `container #0C3559`, `elevated #004173`. Same values as today, but no longer shared with the brand `Primary` scale.

## Step 2 — Relink `Customize Theme` Dark mode

**Step rule on the dark scale** (one rule for every colour family):

| Role | Dark step | Notes |
|---|---|---|
| Bg | 1 | solid; replaces the alpha on Primary, Info, Error |
| BgHover | 2 | |
| Border | 3 | |
| BorderHover | 4 | fixes the bright hover jump |
| Active | 6 | pressed is dimmer than rest |
| Base | 7 | one step brighter than Ant's 6, so it reads on navy |
| Hover | 8 | brighter than rest |
| Text | 8 | = today's light-4 tint |
| TextHover | 9 | = today's light-3 tint |
| TextActive | 7, or 8 where 7 is under 4.5:1 on `#0C3559` | Primary, Info, Error, Action use 8 |

**2a. Main families** — Primary, Success, Warning, Error, Info, Action: all roles above (≈ 60 tokens). Includes `colorLink*` (Dark `colorLinkHover` → Primary Dark-9, `colorLinkActive` → Primary Dark-8; `colorLink` keeps its alias to `colorPrimaryText`).

**2b. Presets** — Volcano, Lime, Sunset Orange, Sunrise Yellow, Cyan, Geek Blue, Golden Purple, Magenta, Hydra Action Orange text: Bg 1, BgHover 2, Border 3, BorderHover 4, Base 7, Hover 8, Text 9 (today they use light-5 for base and light-3 for text, so the look stays close).

**2c. Primary extras** — `colorPrimaryBgSubtle` → Primary Dark-2, `colorPrimaryBorderSubtle` → Primary Dark-3 (matches repo `bluePrimaryBgSubtleDark` / `bluePrimaryBorderSubtleDark`; fixes the invisible border).

**2d. Surfaces** — `colorBgBase`, `colorBgLayout` → `Navy Surface/layout`; `colorBgContainer` → `container`; `colorBgElevated` → `elevated`. Values unchanged. `colorSidebar*` keeps `Primary`.

**2e. Neutrals** (values unchanged unless marked):
- `colorFill` → `white-18`, `colorFillSecondary` → `white-12`, `colorFillTertiary` → `white-8`, `colorFillQuaternary` → `white-4`
- `colorBorder` → `white-20`, `colorBorderSecondary` → `white-12`, `colorSplit` → `white-12`
- `colorTextDisabled` → `white-35`
- `colorBorderDisabled` → `white-20` **(value change: 35% → 20%, same as `colorBorder`, as in Light)**
- `colorSidebarMenuItemHoverBg` → `white-8` in both modes

**2f. Highlight** — Dark `colorHighlight` → `colorErrorText` (readable on navy). Light keeps `colorError`.

Semantic-to-semantic aliases (`controlItemBgActive*`, `controlOutline`, `colorErrorOutline`, `colorWarningOutline`, `colorBorderBg`, text aliases) follow automatically.

## Step 3 — Light parity relinks (values unchanged)

Light links to the same semantic token as Dark:

| Token | Light: from → to |
|---|---|
| colorBgContainerDisabled | `opacity-4` → `colorFillTertiary` |
| controlItemBgHover | `opacity-4` → `colorFillTertiary` |
| controlItemBgActive | `primary-1` → `colorPrimaryBg` |
| controlItemBgActiveHover | `primary-2` → `colorPrimaryBgHover` |
| controlItemBgActiveDisabled | `opacity-15` → `colorFill` |
| colorBgTextActive | `opacity-15` → `colorFill` |
| colorBgTextHover | `opacity-6` → `colorFillSecondary` |

## Step 4 — Restore true light values in `Colors` steps 8–10

Only after step 2, so no Dark token still points at these steps.

- Red, Volcano, Orange, Gold, Yellow, Lime, Cyan, Blue, Geek Blue, Purple, Magenta: steps 8, 9, 10 → Ant light values (e.g. `blue-8 #003EB3`, `blue-9 #002C8C`, `blue-10 #001D66`).
- Polar Green: steps 9, 10 → `#135200`, `#092B00`.
- Hydra Action Orange: steps 9, 10 → `#9E3010`, `#6B200B` (repo `volcanoPrimitiveLight`).

**Light values that change (intended fixes):** `colorInfoTextActive`, `colorErrorTextActive`, `colorWarningText`, `colorWarningTextActive`, `colorSuccessTextActive`, `colorActionTextActive`.

## Step 5 — Verify

1. Re-run the audit script: 0 Dark links into light steps 8–10, 0 Dark main colours identical to Light, no alpha status backgrounds, Light parity holds, every Light value outside the 6 intended fixes is unchanged (before/after diff of resolved hex).
2. Contrast on `#0C3559`: all Text and TextHover ≥ 4.5:1.
3. Screenshot Alert (all 4 types) and a primary Button in Dark using a temporary instance with Dark mode, then delete it.
4. Add a Changelog entry on page `233:658` (format per existing entries).
5. Update the audit artifact with an "After" note.

## Out of scope (flag only)

- `colorIcon` Light `#000000` and `colorIconHover` linking (needs a Light decision).
- `colorNeutralBg` Dark `#000000`, `colorBgSpotlight` Light opacity modifier.
- Aligning `src/theme` dark theme with navy.
- Publishing the library: the user publishes manually; module files update after they accept the library update.

## Size

148 new primitives · ~110 Dark relinks · 7 Light relinks · 37 primitive value restores.
Rollback: restore the named version from step 0.
