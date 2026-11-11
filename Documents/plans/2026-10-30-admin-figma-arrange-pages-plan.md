# Plan — arrange every Admin - RSFC module page like Access Blacklist

**Date:** 2026-10-30
**File:** Admin - RSFC (`rONB8aMPanOjS3GC1uN16d`). Pages: Dashboard, Release Notes, Knowledge Center, Content, Companies, Users, Company Roles, Admin Roles, Feature Access Limit (Access Blacklist is the model).
**User instruction:** "apply the canvas colour and section fill everywhere, arrange screens everywhere the same way, sections look the same, don't delete anything, just arrange."

## Standard (taken from Access Blacklist / Knowledge Center)
| Thing | Value |
|---|---|
| Page canvas | `#787A7E` |
| Every Section fill | white `#FFFFFF` at 10% |
| Top-level sections | x 0, stacked from y 0, 290 apart |
| Inside a section | 48 left/right, 80 top, 140 bottom |
| Screens in a row | 96 apart, at most 3 of the 1750 wide screens per row, reading order kept |
| Rows | next row 210 below the tallest screen of the row |
| Nested section | own row, 290 gap |
| Section size | fits its content |

## Guards
- Nothing is deleted, renamed, resized (screens) or reparented. Only x and y of screens and sections change, plus section size and fill.
- Every moved screen frame is fingerprinted (size, descendant structure) before and after in the same script. Any difference throws and rolls the change back.
- Ready for Dev status could not be read (Plugin API, REST token). Screens are only moved, never edited, so protected ones stay as they are. Frames are never moved out of their section.
- "To design" placeholder sections: colour and fill only, no arrangement.
- Section names are kept (several carry status such as "Needs changes"). Renaming is a separate question.

## Order of frames
Reading order by current position (row clusters, then x). Explicit order for Lead Time (Flow, then steps 1 to 7) and Release Notes (List, Empty State, Delete Note, then the two flows).
