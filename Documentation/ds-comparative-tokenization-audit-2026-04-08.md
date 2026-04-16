# Comparative Tokenization Audit: Old ASC DS vs Current Hydra DS

Date: 2026-04-08  
Audited with: Figma MCP Console  
Files compared:

- Old DS (ASC): [Shared Library - Ant D (5.24) / ASC](https://www.figma.com/design/PgNDTnjYgSPNhl0xqQ7MXz/Shared-Library---Ant-D--5.24----ASC?node-id=317-21821&t=FTYPXvefObQ7jDah-1)
- Current DS (Hydra): [Hydra Ant Design - DS](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Hydra-Ant-Design---DS?node-id=204-47936&t=8TkSdYaAMyoN3HnF-1)

---

## 1) Headline Result

Current Hydra DS is **better in governance quality** (clearer semantics, cleaner metadata, tighter scope), but **not globally higher-scoring** yet in automated health.

- Old ASC overall health: **78/100**
- Current Hydra overall health: **76/100**

So, Hydra is not yet better by total score, but it is already better in the dimensions that matter most for maintainable design-system tokenization.

---

## 2) Side-by-Side Score Comparison

Source: `figma_audit_design_system`

| Dimension | Old ASC DS | Current Hydra DS | Better |
|---|---:|---:|---|
| Overall Health | 78 | 76 | Old (narrow) |
| Naming & Semantics | 77 | **90** | **Hydra** |
| Token Architecture | **79** | 76 | Old (small gap) |
| Component Metadata | 68 | **83** | **Hydra** |
| Accessibility | **87** | 60 | Old |
| Consistency | **71** | 68 | Old (small gap) |
| Coverage | **94** | 69 | Old |

Key interpretation:

- Hydra clearly wins in **semantic clarity** and **component metadata quality**.
- Old ASC still wins in **breadth-oriented metrics** (coverage/accessibility in this audit pass).

---

## 3) Token Inventory Comparison

Source: `figma_get_variables` (summary)

### Old ASC DS

- Total variables: **2241**
- Collections: **4**
  - `1. Colors` (261)
  - `2. Dimensions` (65)
  - `3. Typography` (22)
  - `4. Components` (1893)
- Types:
  - `COLOR`: 1117
  - `FLOAT`: 1069
  - `STRING`: 55

### Current Hydra DS

- Total variables: **313**
- Collections: **3**
  - `Colors` (152)
  - `Customize Theme` (139)
  - `Typography` (22)
- Types:
  - `COLOR`: 247
  - `FLOAT`: 64
  - `STRING`: 2

Interpretation:

- ASC is much larger and broader (full-spectrum library token footprint).
- Hydra is intentionally narrower and more product-focused, which helps governance and migration safety.

---

## 4) Why the Current Hydra DS Is Better (Where It Really Matters)

Even with slightly lower aggregate score, Hydra has concrete advantages:

1. **Stronger semantic model (90 vs 77).**  
   Better naming clarity improves developer mapping reliability and reduces token misuse.

2. **Higher component metadata quality (83 vs 68).**  
   Better metadata makes components easier to audit, automate, and connect to code workflows.

3. **Cleaner, curated token surface (313 vs 2241).**  
   Lower token volume reduces cognitive load and lowers accidental drift risk in active product work.

4. **Hydra-specific thematic focus.**  
   Collections like `Customize Theme` and Hydra-specific semantic paths show intentional adaptation to your actual DS needs, not generic kit sprawl.

In short: **Hydra is better as an operational DS baseline**, even if ASC still scores higher in broad-coverage checks.

---

## 5) Why Old ASC Still Scores Higher Overall

1. **Coverage metric bias toward breadth.**  
   Large token/component footprints naturally boost coverage-style metrics.

2. **Legacy library completeness.**  
   ASC includes many component-level tokens and variants that Hydra intentionally does not mirror one-to-one.

3. **Accessibility score gap (87 vs 60).**  
   Hydra likely needs additional accessibility-oriented token bindings and state coverage to close this quickly.

---

## 6) Technical Notes / Tooling Limits

- `figma_get_styles` and `figma_get_design_system_kit` fully returned style data for old ASC.
- The same style extraction endpoints returned `404` for Hydra in this run, while variable and audit data were still available from cache/bridge paths.
- Because of this, style-level parity detail for Hydra is under-reported in API-based comparison and should be validated with a direct in-file bridge pass.

---

## 7) Final Verdict

If the criterion is **“better foundation for current Hydra implementation and long-term maintainability”**, the current Hydra DS is better now (semantics + metadata + governance).

If the criterion is **“highest raw completeness and coverage score today”**, old ASC still leads.

Recommended framing to stakeholders:

- “Hydra is not a larger library; it is a cleaner, better-governed, product-aligned design system.  
  The remaining gap is mostly breadth/accessibility coverage, not semantic quality.”

---

## 8) Next Actions to Make Hydra Unambiguously Better in Score Too

1. Raise accessibility score by adding/checking tokenized states across key components (`Button`, `Input`, `Select`, `Table`, `Menu`).
2. Expand intentional coverage only where product needs it (avoid importing ASC sprawl blindly).
3. Run component-level lint/audit pass page-by-page in Hydra file and track closure in a delta checklist.
4. Re-run this comparative audit after fixes to measure score movement.

