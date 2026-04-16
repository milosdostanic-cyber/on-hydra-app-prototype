# BOM — product reference (Documents/Bom)

This folder holds **product and UX context** for the new BOM experience. Implementation in the app follows the **Hydra design system** (Ant Design Figma kit, repo tokens)—not visuals from these sources.

## Files

| Asset | Purpose |
|--------|---------|
| `Hydra-BOM Re-Write — PRD (v2)-040426-162429.pdf` | Product requirements |
| `Current BOM Screens (Old application).pdf` | Screens from the legacy app (baseline) |
| `Revamp BOM Tool v1 (Loza).zip` | **Figma Make** prototype reflecting how PM framed the **flow** |
| `prd-reconciliation-checklist.md` | Checklist to reconcile the live `/bom` demo with the PRD and legacy screens PDFs |

## Figma Make prototype — how we use it

**Use from the zip**

- **Flow** — steps, navigation intent, and what the user is trying to accomplish
- **Concept** — problems the prototype is solving; ideas to **refine and improve** in UX

**Do not use from the prototype**

- **UI** — layout, styling, or pixel-level choices
- **Components** — do not mirror prototype components in code
- **Tokens** — no colors, type, or spacing from the prototype; use Hydra / Ant Design tokens only

Treat the Make file as a **conversation starter** for UX and IA, then design and build against the real design system.
