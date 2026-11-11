## Stat Tile molecule added to Hydra DS and applied in BOM and SPEC

**Component:** [Stat Tile (component set)](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Hydra-Ant-Design-System?node-id=1992-58) in Hydra DS. Properties: tone (neutral, success, warning, error, info), label, value.

**Shared pattern:** one labelled count with a semantic tone accent, used alone or in a row for outcome counts (for example accepted / denied / undecided, or ready / skipped / needs attention). The same hand-built tile appeared on several screens, so it is now one reusable component that is set only through tone, label and value.

**Totals (verified in Figma):**
* Completed: 6 usage locations (20 Stat Tile instances) in 2 modules (BOM: 3 locations, 11 tiles; SPEC: 3 locations, 9 tiles).
* Planned: 2 usage locations (8 tiles) in 1 module (BOM). Still hand-built, not counted as completed.
* Content, Part Search, Release Notes: 0.

Note: this task covers the SPEC file too. UATL-574 is the Spec counterpart; it was not touched.

### Completed

| Module | Screen / location | Change | Status | Figma link |
|---|---|---|---|---|
| BOM | 2.14 Guided matching · Complete | 3 tiles: Ready to import 5 (success), Skipped 2 (warning), Total in file 7 (info) | Completed | [Row 7259:32020](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=7259-32020) |
| BOM | 2.15 Matching results · Table | 4 tiles: Total parts 7 (info), Ready to import 5 (success), Needs attention 0 (error), Skipped 2 (warning) | Completed | [Row 7259:32032](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=7259-32032) |
| BOM | 2.17 Matching results · Import processing | 4 tiles, same set as 2.15 | Completed | [Row 7259:32046](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=7259-32046) |
| SPEC | 07 — Export and create outputs · 05 — Export and create outputs | 3 tiles: Accepted 1 (success), Denied 0 (error), Undecided 18 (info) | Completed | [Row 8762:119151](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC---ASC-Connected?node-id=8762-119151) |
| SPEC | 05B Submittal Package created · Success | 3 tiles, same set | Completed | [Row 8762:119173](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC---ASC-Connected?node-id=8762-119173) |
| SPEC | 05C Export doc ready | 3 tiles, same set | Completed | [Row 8762:119162](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC---ASC-Connected?node-id=8762-119162) |

### Planned

| Module | Screen / location | Change | Status | Figma link |
|---|---|---|---|---|
| BOM | 2.15.1 Matching results · Bulk | 4 hand-built tiles to be replaced by Stat Tile | **Planned** | [Row 5818:48687](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=5818-48687) |
| BOM | 2.16 Matching results · Skipped rows filter | 4 hand-built tiles to be replaced by Stat Tile | **Planned** | [Row 5585:301053](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=5585-301053) |

**Not planned (Statistic atom kept by decision):** Admin, Release Notes Admin · Bulk upload · Success (2 Statistic atom instances) keeps the Statistic atom.

**Unconfirmed (not counted):** look-alike tile rows on Draft pages, not verified as the same pattern or as real usage.
* BOM Draft: [5499:150640](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=5499-150640), [5506:187692](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=5506-187692), [5549:189085](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=5549-189085)
* SPEC Draft: [8225:82887](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC---ASC-Connected?node-id=8225-82887), [8083:151182](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC---ASC-Connected?node-id=8083-151182)

### Change Log entries
* BOM: [2026-10-20 · Stat Tile](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=7268-45)
* SPEC: [2026-10-20 · Stat Tile](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC---ASC-Connected?node-id=8762-119216)
