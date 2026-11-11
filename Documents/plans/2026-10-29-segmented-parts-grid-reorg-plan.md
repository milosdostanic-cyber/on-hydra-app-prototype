# Segmented — Parts grid reorganization (prompt)

**File:** Hydra Ant Design – DS (`3ghYBXR6XVUEaeBo3D5E4q`), page ❖ Segmented (`5:53`), section **Parts** (`1503:80521`)
**Reference pattern:** ❖ Radio → Parts (`1503:80505`): the `.radioButton__item` set sits exactly on top of an "Instances" frame of empty dashed cells, labels sit in one "Labels" group, and the header stretches to the section width.

## What is wrong now

1. **Two systems mixed in one grid.** The 4 × 12 grid shows real variants (left 2 columns, top 6 rows) and 24 instance copies (right 2 columns and the bottom 6 rows) that only toggle `show icon` / `show title`. Those are boolean properties, not variants, so half the grid is not the component set.
2. **The set is not aligned to the grid.** `.segmented__item` is at x 376 and 714 × 460; the "Instances" frame is at x 370 and 504 × 926. Variants do not sit centered in their cells.
3. **Hover and pressed float outside the grid.** The 6 new variants and their "State: Hover / State: Pressed" labels sit to the right with no cells, no brackets and labels outside the Labels group.
4. **Labels do not match property names.** "Active" means `selected`, "Show Text" means `show title`. `state` and its values are not labelled at all.
5. **Empty and uneven cells.** "Show Icon: False × Show Text: False" is 12 empty cells. Row heights vary (70 / 76 / 84) and some cells have a fill while others do not.

## Prompt

> On the Segmented page in Hydra DS, rebuild the **Parts** section so it follows the Radio Parts pattern. Do not change the `.segmented__item` component itself: no variant, property, token, size or color changes. Only move variants and rebuild the docs grid around them.
>
> **Grid axes (variant properties only):**
> - Columns: two groups, **Selected: True** and **Selected: False**, each with three sub-columns **Default / Large / Small** (size = medium / large / small). 6 columns.
> - Rows: **Default / Hover / Pressed / Disabled** (state = default, hover, pressed; Disabled = disabled=true, state=default). 4 rows.
> - 24 cells; 18 hold a variant. The 6 cells for Selected: True × Hover/Pressed stay empty, because Ant has no hover or pressed style on the selected option.
>
> **Build:**
> 1. Replace the "Instances" frame with a new one of equal, empty cells: auto layout rows, every cell the same size (fits the large option plus padding, e.g. 120 × 80), no fill, the existing 1 px dashed stroke `[10, 5]`, content centered.
> 2. Position `.segmented__item` exactly over the new Instances frame (same x, y, width, height). Move each variant to the center of its cell. Order the variants in the layer list to match the grid, row by row.
> 3. Rebuild the "Labels" group with the same label style, brackets and spacing as today: top group labels "Selected: True" / "Selected: False" with bracket, sub-labels "Default / Large / Small", left row labels "Default / Hover / Pressed / Disabled". Delete the floating "State: Hover" / "State: Pressed" texts.
> 4. Remove the 24 instance copies that only show `show icon` / `show title` combinations. Below the grid, add one small labelled row **"Content options"** with three instances of the default variant: Icon + text, Text only, Icon only. Use the same label style; keep it outside the variant grid.
> 5. Resize the Parts section to fit with 80 px side margins and stretch the `.header` instance to the section width, as on the Radio page. Keep the section at the same canvas position and do not overlap the Components section.
>
> **Check before finishing:** every variant sits centered in one cell, no two nodes overlap, no floating labels remain, Segmented instances on the Components section are unchanged, and a screenshot of the Parts section matches the Radio Parts layout style.

---

# Part 2 — Changelog: links and easy reading

**Page:** 📋 Changelog (`233:658`), content frame `234:691`.

## What is wrong now

1. **No way to jump to a component.** Only the 27 Oct entry has links (3), and they look exactly like normal text: same color, no underline.
2. **Hard to scan.** Each entry opens with a long block of token names. A reader has to get through 20–30 lines to learn what changed and whether they need to do anything.
3. **No overview.** There is no list of entries at the top, so finding "what changed in Segmented" means scrolling a 7,000 px page.
4. **A report sits between dated entries.** "Compared with the A3 token export" (147 lines, tag UATL-562) is a reference report, not a library publish, yet it sits between 27 Oct and 16 Oct.
5. **Tags are inconsistent.** Update, Fix, Audit and a Jira key (UATL-562) are mixed, with no legend.

## Prompt

> On the Changelog page in Hydra DS, make every entry quick to read and add links to the components. Keep all existing facts and wording in the details; only restructure, shorten the openings and add links. Use only existing text styles (Base/Normal, Base/Medium, Base/Underline, Heading styles already on the page) and existing color tokens.
>
> **1. Page top**
> - Under the page description, add **"How to read this page"** (2 short lines): newest first; each entry starts with a summary and what to do; details follow for designers and developers.
> - Add a **tag legend** using the existing Tag component: **New** (new component or variant), **Update** (visual or behavior change), **Fix** (bug fix, no intended visual change), **Audit** (audit clean-up), **Report** (reference report, not a publish).
> - Add **"Entries"**: one line per entry, "29 October 2026 — Segmented", each line linked to its entry frame.
>
> **2. Same layout for every entry**
> 1. Title: date + component name(s), short. Example: "29 October 2026 — Segmented".
> 2. Tag (from the legend).
> 3. **Summary** (Base/Medium heading): 1–2 plain-language sentences. No token names. Example: "Segmented now looks and behaves like Ant Design: a white selected option, hover and pressed states, and smaller icons."
> 4. **Components** line: every component touched, each a link to its component set in this file, for example "Segmented · .segmented__item".
> 5. **What to do**: one line. Example: "Accept the library update in product files." or "Nothing."
> 6. **Details**: the current grouped text (Components, Tokens, Typography, Spacing and effects, Validation), unchanged apart from linking component names.
>
> **3. Links**
> - Link each component name to its node with a Figma URL (`…/Hydra-Ant-Design---DS?node-id=<id>`), the same way the 27 Oct entry does.
> - Make links visible: Base/Underline text style with the `colorLink` fill.
> - Restyle the 3 existing links in 27 Oct the same way.
> - Known targets: Segmented `202:43207`, .segmented__item `202:42576`, Sidebar `662:10029`, .menu__submenu `168:7164`, Admin Sidebar example `2164:7599`. Find the Button set for 16 Oct, and for 12 Oct link the components named in its Components group (Table, Collapse, Cards, Menu, Sidebar, Avatar, Topbar, Progress__Line).
>
> **4. Order**
> - Dated entries newest first: 29 Oct, 27 Oct, 16 Oct, 12 Oct.
> - Move the A3 comparison to the bottom under a **"Reference reports"** heading, tagged Report, with UATL-562 kept in its title or summary.
>
> **5. Finish**
> - Retag entries to the legend: 29 Oct Update, 27 Oct Fix, 16 Oct Fix, 12 Oct Audit, A3 Report.
> - Resize the Changelog section to fit.
> - Check: every link opens the right node, every body is fully styled (no text without a style), nothing overlaps, and take a screenshot of the top of the page and one entry.
