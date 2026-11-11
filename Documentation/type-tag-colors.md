# Type tag colours (Hydra)

Single lookup for which `Tag__Colorful` colour each Type value uses. Read this before adding or changing a Type column, in Figma or in code. Rule behind it: `.cursor/rules/table-tags-badges.mdc`. Updated 2026-11-09.

**Rule:** a value keeps one colour on every screen. Colours may repeat across different columns (only 10 presets) but never inside one column. A new value takes a free preset and is added here first.

Component: DS `Tag__Colorful`, `border=true`. Layer name: `Tag__Colorful / <value>`. Code preset names match the Figma `color` variant.

## Admin module (Admin - RSFC)

| Column | Value | Colour |
| --- | --- | --- |
| Users → Type | Admin | `volcano` |
| Users → Type | User | `blue` |
| Company Roles → Type | System | `geekblue` |
| Company Roles → Type | Custom | `gold` |
| Admin Roles → System Role | System | `geekblue` |
| Access Blacklist → Type | Domain | `purple` |
| Access Blacklist → Type | Email | `cyan` |
| Release Notes → Type | Feature | `green` |
| Release Notes → Type | Improvement | `blue` |
| Release Notes → Type | Fix | `orange` |

## Content file types (all modules)

Source: `.cursor/rules/content-file-type-tags.mdc`.

| File type | Colour |
| --- | --- |
| RFA | `blue` |
| STEP | `geekblue` |
| PDF | `cyan` |
| DWG | `orange` |
| IGES | `magenta` |
| SAT | `purple` |
| IEZ | `green` |
| TXT | `gold` |
| PNG | `lime` |

## Not colourful (do not use `Tag__Colorful`)

| What | Treatment |
| --- | --- |
| Record status, access state, Included / Excluded | `Badge__Status` |
| Confidence (High / Medium / Low, Added manually) | `Tag__Status` |
| Users → Roles, Knowledge Center categories | neutral `Tag` |
| Counts, quantities, dates, Yes / No, feed format | plain text |

## Free presets

`magenta` and `lime` are not used by any Admin Type value yet.
