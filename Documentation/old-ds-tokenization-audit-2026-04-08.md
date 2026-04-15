# Old DS Tokenization Audit (Figma MCP Console)

Date: 2026-04-08  
Target file: [Shared Library - Ant D (5.24) / ASC](https://www.figma.com/design/PgNDTnjYgSPNhl0xqQ7MXz/Shared-Library---Ant-D--5.24----ASC?node-id=317-21821&t=FTYPXvefObQ7jDah-1)  
Method: `user-figma-console` MCP (`figma_audit_design_system`, `figma_get_variables`, `figma_get_design_system_kit`, `figma_get_file_data`)

## Executive Summary

- The file has broad token inventory coverage and mature component taxonomy, but token architecture scoring is currently blocked by MCP permission scope for Variables API in one of the audit endpoints.
- Design-system health score from MCP audit: **56/100** (`needs-work`).
- This score is partially deflated by missing token introspection in `figma_audit_design_system`; direct variable extraction still confirms a large tokenized system.

## Audit Scores (from `figma_audit_design_system`)

- Overall Health: **56/100** (`needs-work`)
- Naming & Semantics: **77/100**
- Token Architecture: **0/100** *(tool reported missing token data)*
- Component Metadata: **68/100**
- Accessibility: **67/100**
- Consistency: **95/100**
- Coverage: **25/100**

## Tokenization Evidence (from `figma_get_variables`)

- Total variables: **2241**
- Collections: **4**
  - `1. Colors` (261 variables, Light/Dark modes)
  - `2. Dimensions` (65 variables, Default/Compact modes)
  - `3. Typography` (22 variables, Default/Compact modes)
  - `4. Components` (1893 variables, Value mode)
- Variable types:
  - `COLOR`: 1117
  - `FLOAT`: 1069
  - `STRING`: 55
- Naming structure shows strong semantic intent (`Colors/Brand/*`, `Colors/Neutral/*`, `Components/*/Global/*`, `Components/*/Component/*`, `Typography/*`, `Space/*`, `Size/*`).

## Important Limitation Detected

`figma_get_design_system_kit` returned:

- `tokens` section failed with **403** because current token/auth scope is missing `file_variables:read`.
- `styles` extraction still worked and returned:
  - **32 styles total**
  - **20 TEXT**, **10 EFFECT**, **2 GRID**

Practical impact:

- We can trust inventory-level token presence and naming from cached variable extraction.
- We cannot fully trust automated token-architecture scoring from the failing endpoint until scope is fixed.

## Findings

1. **Token inventory is strong, but audit confidence is reduced by auth scope mismatch.**
   - System likely has better token architecture than the reported `0/100`, but tooling could not validate it through that endpoint.
2. **Semantic namespace quality is generally good.**
   - Paths are structured and scalable across brand, neutral, component-global, and component-local token domains.
3. **Coverage score indicates potential uneven binding/application.**
   - Even with many variables, some components/pages may still rely on partial mapping or legacy style usage.
4. **Typography tokenization appears centralized and consistent.**
   - Typography collections and text styles are both present and coherent.

## Recommended Next Steps

1. Fix MCP token scope for the account/integration used by `figma_get_design_system_kit`:
   - add `file_variables:read`
2. Re-run token architecture audit after scope fix:
   - `figma_get_design_system_kit` (tokens+styles, summary/full)
   - `figma_audit_design_system`
3. Run page-by-page binding spot checks on high-use components (`Button`, `Input`, `Select`, `Table`, `Menu`) to confirm no local hardcoded drift.
4. Track and reconcile coverage gaps on pages with highest component density.

## Confidence Level

- **Medium** for inventory and naming quality (supported by successful variable extraction).
- **Low-to-medium** for architecture score and coverage quality details until `file_variables:read` scope is enabled and audit is rerun.

