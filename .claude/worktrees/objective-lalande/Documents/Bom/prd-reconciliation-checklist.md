# PRD and legacy UI — reconciliation checklist

Use this when reviewing **`Hydra-BOM Re-Write — PRD (v2)-040426-162429.pdf`** and **`Current BOM Screens (Old application).pdf`** against the implemented `/bom/*` demo.

## Flow and IA

- [ ] PRD defines a different step order than: landing → parsing → matching → narrowing → recommend → workspace → export → (optional) service request. If yes, update routes and copy.
- [ ] PRD requires entry points not covered (e.g. ERP sync, templates). Document gap or add stubs.
- [ ] Old app screens show mandatory fields or columns missing from demo tables. Add to mock data and UI.

## Copy and compliance

- [ ] Replace demo disclaimers with PRD-approved terminology (product name, legal, units).
- [ ] Validate file types and size limits against PRD (current upload check is illustrative only).

## Roles and permissions

- [ ] PRD specifies view/edit/export by role. Shell is unchanged; document if BOM routes need guards later.

## Integrations

- [ ] Catalog: PRD expects deeper BOM ↔ catalog linking than “open catalog search”. Specify deep links or shared context.
- [ ] Export: PRD defines real formats, naming, and submittal package contents. Replace stub `message.success` behavior.

## Done when

All items are checked or explicitly deferred with a short note in this file or in the issue tracker.
