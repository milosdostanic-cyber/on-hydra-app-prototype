# Hydra typography — Figma ↔ repo parity

**Figma file:** [Hydra Ant Design - DS](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Hydra-Ant-Design---DS) (`3ghYBXR6XVUEaeBo3D5E4q`)
**Repo mirror:** [`src/theme/hydraTypography.ts`](../src/theme/hydraTypography.ts) → antd bridge in [`src/theme/hydraAntdTypography.ts`](../src/theme/hydraAntdTypography.ts)
**Last verified:** 2026-09-17 (full variable + text-style audit via Figma Console MCP)

Font family is **Barlow** everywhere — no Barlow Condensed, no separate code font. Metrics live in
`hydraTypography.ts`; `index.html` only delivers the webfont.

## Text style roles

Design text style ↔ repo constant. Weight column is the resolved value on both sides.

| Design style | Repo constant | Size / line height | Weight |
|---|---|---|---|
| `Title/Heading 1` | `hydraTitleHeading1` | 38 / 46 | **600** |
| `Title/Heading 2` | `hydraTitleHeading2` | 30 / 38 | **600** |
| `Title/Heading 3` | `hydraTitleHeading3` | 24 / 32 | 500 |
| `Title/Heading 4` | `hydraTitleHeading4` | 20 / 28 | 500 |
| `Title/Heading 5` | `hydraTitleHeading5` | 16 / 24 | 500 |
| `Subtitle/Large` | `hydraSubtitleLarge` | 16 / 24 | 500 |
| `Subtitle/Extra Large` | — (not mirrored) | 20 / 28 | 500 |
| `Extra Large/Normal` | `hydraExtraLargeNormal` | 20 / 28 | 400 |
| `Extra Large/Strong` | `hydraExtraLargeStrong` | 20 / 28 | **500** |
| `Large/Normal` | `hydraLargeNormal` | 16 / 24 | 400 |
| `Large/Strong` | `hydraLargeStrong` | 16 / 24 | **500** |
| `Base/Normal` | `hydraBaseNormal` | 14 / 22 | 400 |
| `Base/Strong` | `hydraBaseStrong` | 14 / 22 | **500** |
| `Small/Normal` | `hydraSmallNormal` | 12 / 20 | 400 |
| `Small/Strong` | `hydraSmallStrong` | 12 / 20 | **500** |

Each size family also has `Underline`, `Delete`, and `Italic` at weight 400, mirrored as
`hydra<Size><Variant>`. The `Italic` roles are **Barlow Italic** on both sides.

**Which role for an emphasized 16px title:** `Subtitle/Large` and `Large/Strong` now both resolve
to 500 — either works; `Subtitle/Large` remains the documented name for modal/panel headings, and
`Large/Strong` for `Alert` titles (its only real consumer).

## Figma `Typography` collection — 24 variables

Modes: `Default` and `Compact`. Family and weight are **identical in both modes** by design;
only sizes and line heights differ. The repo mirrors `Compact` in `hydraCompactFontMap`.

| Variable | Value | Bound consumers |
|---|---|---|
| `Font Family/fontFamily` | Barlow | all 27 text styles |
| `Font Family/fontFamilyCode` | Barlow | none in Figma; repo antd `fontFamilyCode` |
| `Font Weight/fontWeightNormal` | 400 | 12 text styles (Normal / Underline / Delete) |
| `Font Weight/fontWeightMedium` | 500 | 9 text styles (`Title/Heading 3-5`, `Subtitle/*`, all body `*/Strong`) |
| `Font Weight/fontWeightStrong` | 600 | 2 text styles (`Title/Heading 1-2`) |
| `Font Size/*` | 10 variables | per-role `fontSize` bindings |
| `Line Height/*` | 9 variables | per-role `lineHeight` bindings |

Every text style binds `fontFamily`, `fontSize`, and `lineHeight`. Weight is bound on 23 of 27 —
the 4 exceptions (the `Italic` styles) are listed below and are intentional.

## Intentional deviations — do not "fix" these

1. **The four `*/Italic` styles have no `fontWeight` binding.** A bound `fontWeight` makes Figma
   resolve the upright face and silently cancels the italic. Family, size, and line height stay bound.
2. **`fontFamilyCode` equals `fontFamily`.** There is no separate code font. It stays a separate
   variable because antd exposes `fontFamilyCode` as its own token.
3. **`fontSizeIcon` does not scale in `Compact`** (12 in both modes) — matches the antd default;
   icon size is not a text-scaling concern.
4. **`Subtitle/Extra Large` is not mirrored** in the repo — no consumer yet.

## When changing typography

1. Change the Figma **variable** (not just the text style) so bindings propagate, then mirror the
   value in `hydraTypography.ts`.
2. If a new weight or style (e.g. italic, 700) is introduced, update the webfont URL in
   `index.html` — it currently ships `Barlow:ital,wght@0,400;0,500;0,600;1,400`. A weight that is
   not delivered gets synthesized by the browser and will not match Figma.
3. Never set `fontSize` / `lineHeight` / `fontWeight` / `fontFamily` ad hoc in screens — see
   [`hydra-ui-tokens.mdc`](../.cursor/rules/hydra-ui-tokens.mdc).
4. Verifying against Figma: read variables with `refreshCache: true`. A cached read has already
   returned an incomplete variable list once and produced a false "clean" verdict.
5. Value parity is not enough — check that text styles are actually **bound** to the variables.
   An unbound style keeps matching by coincidence until someone edits the variable.

## Changelog

### 2026-09-17 — Heading 1-2 back to Strong, all body `Strong` roles down to Medium

- **`Title/Heading 1-2`:** 500 → **600**. Rebound from `fontWeightMedium` to `fontWeightStrong`.
  `Title/Heading 3-5` stay at 500 (`fontWeightMedium`) — H1/H2 are heavier again, H3-H5 are not.
- **`Base/Strong`, `Small/Strong`, `Extra Large/Strong`:** 600 → **500**. Rebound from
  `fontWeightStrong` to `fontWeightMedium`. All body-text `Strong` roles are now one consistent
  tier (Medium), separate from the heavier heading tier (Strong).
- **`Large/Strong`:** 400 → **500**. Rebound from unbound to `fontWeightMedium` — the 2026-09-16
  deviation (kept at 400 because 600 was too heavy) no longer applies now that `Strong` body text
  is 500. `Large/Strong` now resolves identically to `hydraSubtitleLarge`, same as before the
  2026-09-16 change. No repo call sites needed to move (both roles already correct).
- **Repo:** `hydraTypography.ts` — `hydraTitleHeading1`/`2` → `W_SEMI`; `hydraBaseStrong`,
  `hydraSmallStrong`, `hydraExtraLargeStrong`, `hydraLargeStrong` → `W_MEDIUM`.
  `hydraAntdTypography.ts` — `hydraCompactFontMap.fontWeightStrong` was a hardcoded `600` literal
  (didn't track `Base/Strong`); changed to reference `hydraBaseStrong.fontWeight` so Compact can't
  drift from Default again.

### 2026-09-16 — Barlow revert, lighter headings, token consolidation

- **Family:** reverted Cairo → **Barlow**; heading family reverted Barlow Condensed → Barlow.
  `fontFamilyCode` Courier Prime → Barlow. Cleaned up 152 leftover Cairo text segments across
  5 Figma pages (Table, Menu, Collapse, Cover, Dropdown).
- **Headings:** `Title/Heading 1-5` lowered to **500 (Medium)** — H1/H2 are no longer heavier
  than H3-H5.
- **`Large/Strong`:** 600 → **400**. 11 repo call sites that combined `<Typography.Text strong>`
  with this role were moved to `hydraSubtitleLarge` (500), since the inline weight was cancelling
  the `strong` prop.
- **Tokens:** deleted `fontFamilyHeading` and `fontWeightHeading` (both had zero consumers and
  duplicated existing values); renamed `fontWeightSubheading` → **`fontWeightMedium`** as the
  single 500 tier. Bound `Title/Heading 1-5` and `Subtitle/*` to `fontFamily` + `fontWeightMedium`
  — previously their family and weight were hardcoded, so editing the variables did nothing.
- **Italic:** the four `*/Italic` styles were upright (Barlow Regular); set to **Barlow Italic**
  to match the repo.
- **Compact mode (pending):** `lineHeightXL` should go 28 → 24, so 16px Compact XL text stops
  sitting in a 28px box. Agreed but **not yet applied** in Figma — the Desktop Bridge dropped
  mid-session. Repo needs no change (antd has no `lineHeightXL` token).
