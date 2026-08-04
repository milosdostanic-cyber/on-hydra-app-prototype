# Hydra Ant Design DS source contract

## Canonical source

- **Library name:** `Hydra Ant Design - DS`
- **Figma file key:** `3ghYBXR6XVUEaeBo3D5E4q`
- **Provided entry URL:** `https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Hydra-Ant-Design---DS?node-id=137-4507`
- **Provided entry node:** `137:4507` (`Modal__Overlay` at inspection time)
- **Allowed library key:** `lk-0d30b3c585621778932fa331ee41bae63d4de909f26f80911a7a4b3db61a93641afadfdebd413c3fee615b87b1b49ed17cf9574625892ba8af7162787da919ed`

Use the live published library as authority. The entry node proves the intended file/library but is not the full component inventory.

## Allowlist rule

Pass exactly this value in every library-scoped design-system search:

```text
includeLibraryKeys = [
  "lk-0d30b3c585621778932fa331ee41bae63d4de909f26f80911a7a4b3db61a93641afadfdebd413c3fee615b87b1b49ed17cf9574625892ba8af7162787da919ed"
]
```

Reject:

- results from community libraries;
- results from other organization or team libraries;
- results with absent or ambiguous library provenance;
- repo token mirrors, Code Connect implementations, screenshots, or cached maps as sources of visual values;
- generic Ant Design kits, even when component semantics match.

Do not silently fall back when the library is unavailable in the target file. Stop and ask the user to make the Hydra library available.

## Stable versus live data

Treat only these values as stable in this skill:

- Figma file key;
- library name;
- allowed library key;
- user-provided entry node.

Discover these live on every run:

- component and component-set keys;
- variant names and property definitions;
- variable and style keys;
- variable modes and scopes;
- token aliases and resolved values;
- component availability and publish state.

Never hardcode observed colors, font metrics, spacing values, or component variants as authority. The published library may change.

## Reference-screen isolation

The supplied reference screen is a specification of appearance and content only.

Allowed extraction:

- screenshot;
- natural dimensions;
- visible hierarchy and region order;
- product copy and visible data;
- component semantics and states;
- alignment and proportions.

Forbidden extraction or reuse:

- component keys or instances;
- variables and styles;
- color/spacing/type/effect values;
- icons, vectors, SVGs, images, or image hashes;
- detached layers;
- source-file library subscriptions.

All implemented UI assets and styling must resolve independently from the canonical Hydra library.

## Zero-raw contract

For manually composed nodes, require Hydra bindings for:

- fills and strokes;
- text color;
- padding on every edge;
- item spacing;
- corner radius;
- supported size properties when a matching variable exists;
- text style;
- effect style.

Allow raw geometry only for:

- the outer screen width and height copied from the reference;
- top-level canvas placement needed to avoid overlap.

Do not allow a raw internal layout value because it is visually close. Missing exact coverage is a blocker.

## Fail-closed decisions

| Situation | Required action |
|-----------|-----------------|
| Exact Hydra component exists | Import and instance it; set exact properties. |
| Hydra component exists but required state/size does not | Stop and report the missing variant. |
| Required icon is absent | Stop; do not import SVG or use another icon library. |
| Required variable/style/effect is absent | Stop; do not use a raw or closest value. |
| A generic Ant Design pattern is absent from Hydra | Stop; do not create a local Ant Design fallback. |
| Reference style conflicts with an available Hydra token | Report the conflict and ask which requirement changes. |
| Target file cannot access Hydra library | Stop and ask the user to enable the library. |
| Visual parity remains blocked after targeted iterations | Report the DS coverage conflict; do not claim completion. |

## Source precedence

1. User's explicit screen/state and target-node instructions.
2. This Hydra DS source contract.
3. Live Hydra library components, variables, and styles.
4. Reference screen for geometry, hierarchy, content, and visible state only.
5. Repository UX rules for behavior and wayfinding, provided they do not introduce non-Hydra visual assets.

No lower source may override a higher source or broaden the allowlist.
