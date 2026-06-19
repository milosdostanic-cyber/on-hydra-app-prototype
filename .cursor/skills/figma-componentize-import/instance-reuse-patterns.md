# Instance Reuse & Replace-in-Place Patterns

Plugin API patterns for **`figma-componentize-import`**. Read before the first `use_figma` write.

For fonts, primitives, variable binding, and defensive annotations, see
`../prototype-to-figma/figma-patterns.md`.

Always pass `skillNames: "figma-componentize-import,figma-use"` on `use_figma` calls.

---

## Table of contents

1. In-file instance registry scan
2. Replace flat node in place (position + auto-layout)
3. Label (text) override — 1:1 with screen
4. Icon swap — 1:1 with screen
5. Import from attached DS library by key
6. Variable binding on instances
7. Batch replace helper
8. Return contract for `use_figma`

---

## 1. In-file instance registry scan

Read-only. Scans the **entire file** (not only the target frame) for reuse candidates.

```javascript
(async () => {
  const TARGET_FRAME_ID = 'NODE_ID_HERE'; // do not mutate in this call

  const pages = figma.root.children.filter(n => n.type === 'PAGE');
  const byKey = new Map();

  for (const page of pages) {
    await figma.setCurrentPageAsync(page);
    const instances = page.findAll(n => n.type === 'INSTANCE');
    for (const inst of instances) {
      const mc = inst.mainComponent;
      if (!mc) continue;
      const key = mc.key;
      if (byKey.has(key)) continue;

      const cs = mc.parent?.type === 'COMPONENT_SET' ? mc.parent : null;
      let exposed = [];
      try {
        exposed = Object.keys(inst.componentProperties || {});
      } catch (_) {}

      byKey.set(key, {
        mainComponentKey: key,
        mainComponentName: mc.name,
        componentSetName: cs?.name ?? null,
        componentSetKey: cs?.key ?? null,
        sampleInstanceId: inst.id,
        sampleInstanceName: inst.name,
        pageName: page.name,
        exposedPropertyNames: exposed,
      });
    }
  }

  figma.closePlugin(JSON.stringify({
    createdNodeIds: [],
    mutatedNodeIds: [],
    registry: [...byKey.values()],
    registryCount: byKey.size,
    targetFrameId: TARGET_FRAME_ID,
  }));
})();
```

---

## 2. Replace flat node in place (position + auto-layout)

```javascript
function getInsertIndex(parent, flatNode) {
  if (!parent || !('children' in parent)) return 0;
  const idx = parent.children.indexOf(flatNode);
  return idx >= 0 ? idx : parent.children.length;
}

function applyLayoutFromFlat(inst, flat) {
  const parent = flat.parent;
  if (!parent || !('layoutMode' in parent) || parent.layoutMode === 'NONE') {
    inst.x = flat.x;
    inst.y = flat.y;
    if ('resize' in inst && 'width' in flat) {
      inst.resize(flat.width, flat.height);
    }
    return;
  }

  // Parent uses auto-layout — prefer layout props over absolute x/y
  inst.layoutAlign = flat.layoutAlign ?? 'INHERIT';
  inst.layoutGrow = flat.layoutGrow ?? 0;
  if (flat.layoutPositioning === 'ABSOLUTE') {
    inst.layoutPositioning = 'ABSOLUTE';
    inst.x = flat.x;
    inst.y = flat.y;
  }
  if ('resize' in inst && flat.layoutGrow === 0 && flat.width > 0) {
    try {
      inst.resize(flat.width, flat.height);
    } catch (_) {}
  }
}

function replaceFlatWithInstance(flat, inst) {
  const parent = flat.parent;
  if (!parent) throw new Error('Flat node has no parent');

  applyLayoutFromFlat(inst, flat);
  const idx = getInsertIndex(parent, flat);
  parent.insertChild(idx, inst);
  flat.remove();
  return inst.id;
}
```

---

## 3. Label (text) override — 1:1 with screen

**Order of attempts:**

1. Exposed **TEXT** component property via `setProperties`.
2. Exposed property whose name contains `label`, `text`, `title`, `placeholder`, `value`.
3. Deepest single `TEXT` child (for simple buttons/inputs).
4. Named text layer: `#Text`, `Label`, `title`, `placeholder`.

```javascript
async function setInstanceLabel(inst, labelText, exposedPropertyNames = []) {
  if (!labelText) return false;

  // 1–2: component properties
  const props = inst.componentProperties || {};
  for (const [name, def] of Object.entries(props)) {
    if (def.type !== 'TEXT') continue;
    const lower = name.toLowerCase();
    if (
      exposedPropertyNames.includes(name) ||
      lower.includes('label') ||
      lower.includes('text') ||
      lower.includes('title') ||
      lower.includes('placeholder') ||
      lower.includes('value') ||
      lower === 'children'
    ) {
      try {
        inst.setProperties({ [name]: labelText });
        return true;
      } catch (_) {}
    }
  }

  // 3–4: direct text node
  const textNode =
    inst.findOne(n => n.type === 'TEXT' && /label|title|placeholder|text/i.test(n.name)) ||
    inst.findOne(n => n.type === 'TEXT');

  if (!textNode || textNode.type !== 'TEXT') return false;

  await figma.loadFontAsync(textNode.fontName);
  textNode.characters = labelText;
  return true;
}
```

Extract `labelText` from the flat subtree: prefer the main `TEXT` node; for inputs, use
placeholder or value text visible on the imported screen.

---

## 4. Icon swap — 1:1 with screen

**Order of attempts:**

1. **`INSTANCE_SWAP`** component property — set to the DS icon component key or id.
2. Inner icon `INSTANCE` — `swapComponent(importedIconComponent)`.
3. Vector/group beside label — identify icon by position; map antd icon name from repo to DS
   search result; swap inner instance.

```javascript
async function setInstanceIcon(inst, iconComponentKey, iconPropertyName = null) {
  if (!iconComponentKey) return false;

  const imported = await figma.importComponentByKeyAsync(iconComponentKey);

  // 1: INSTANCE_SWAP prop
  const props = inst.componentProperties || {};
  for (const [name, def] of Object.entries(props)) {
    if (def.type !== 'INSTANCE_SWAP') continue;
    if (iconPropertyName && name !== iconPropertyName) continue;
    try {
      inst.setProperties({ [name]: imported.id });
      return true;
    } catch (_) {}
  }

  // 2: inner icon instance
  const iconInst = inst.findOne(
    n =>
      n.type === 'INSTANCE' &&
      (/icon/i.test(n.name) || /icon/i.test(n.mainComponent?.name || ''))
  );
  if (iconInst?.type === 'INSTANCE') {
    iconInst.swapComponent(imported);
    return true;
  }

  return false;
}
```

**Finding icon key from attached library** (agent runs `search_design_system` outside this
script, then passes `iconComponentKey` into the replace batch):

- Repo: `<SearchOutlined />` → search `Search`, `SearchOutlined`
- Flat screen: small square frame or vector left of label text

If no DS icon match: leave default instance icon and flag in summary — do not draw a vector.

---

## 5. Import from attached DS library by key

When no in-file sample exists:

```javascript
async function createInstanceFromLibraryKey(componentKey) {
  const component = await figma.importComponentByKeyAsync(componentKey);
  return component.createInstance();
}

// Variant component set — pick variant by name
async function createInstanceFromSetKey(setKey, variantNameSubstring) {
  const set = await figma.importComponentSetByKeyAsync(setKey);
  const variant =
    set.findChild(
      n => n.type === 'COMPONENT' && n.name.includes(variantNameSubstring)
    ) || set.defaultVariant;
  if (variant?.type !== 'COMPONENT') throw new Error('No variant found');
  return variant.createInstance();
}
```

Variant names often look like `Type=Primary, Size=large, State=Default` — map repo props to
substring matches before `setProperties` fine-tunes.

---

## 6. Variable binding on instances

After placement, bind semantic fills when variable keys are known from `get_variable_defs`:

```javascript
async function bindFillVariable(node, colorVarKey, fillIndex = 0) {
  try {
    const v = await figma.importVariableByKeyAsync(colorVarKey);
    node.setBoundVariableForPaint('fills', fillIndex, v);
    return true;
  } catch (_) {
    return false;
  }
}
```

See `../prototype-to-figma/figma-patterns.md` §3 (DS variable binding) for radius and spacing.

---

## 7. Batch replace helper

Example single-replace operation inside a batched `use_figma` call:

```javascript
(async () => {
  const TARGET_FRAME_ID = 'FRAME_ID';
  const ops = [
    {
      flatNodeId: '123:456',
      mode: 'reuse-in-file', // or 'ds-library-by-name'
      sampleInstanceId: '789:0',
      componentKey: null, // set when mode is ds-library-by-name
      properties: { Type: 'Primary', Size: 'large', State: 'Default' },
      labelText: 'Save changes',
      iconComponentKey: null, // optional
      iconPropertyName: null, // optional INSTANCE_SWAP prop name
    },
  ];

  const frame = await figma.getNodeByIdAsync(TARGET_FRAME_ID);
  if (!frame) throw new Error('Target frame not found');

  const mutatedNodeIds = [];
  const errors = [];

  for (const op of ops) {
    try {
      const flat = await figma.getNodeByIdAsync(op.flatNodeId);
      if (!flat || flat.id === TARGET_FRAME_ID) {
        errors.push({ flatNodeId: op.flatNodeId, error: 'Flat node not found' });
        continue;
      }
      // Guard: flat must be inside target frame
      let p = flat.parent;
      let inside = false;
      while (p) {
        if (p.id === TARGET_FRAME_ID) { inside = true; break; }
        p = p.parent;
      }
      if (!inside) {
        errors.push({ flatNodeId: op.flatNodeId, error: 'Outside target frame' });
        continue;
      }

      let inst;
      if (op.mode === 'reuse-in-file') {
        const sample = await figma.getNodeByIdAsync(op.sampleInstanceId);
        if (!sample || sample.type !== 'INSTANCE') throw new Error('Bad sample instance');
        inst = sample.clone();
      } else if (op.mode === 'ds-library-by-name') {
        inst = await createInstanceFromLibraryKey(op.componentKey);
      } else {
        throw new Error(`Unsupported mode: ${op.mode}`);
      }

      if (op.properties) inst.setProperties(op.properties);
      await setInstanceLabel(inst, op.labelText);
      if (op.iconComponentKey) {
        await setInstanceIcon(inst, op.iconComponentKey, op.iconPropertyName);
      }

      const newId = replaceFlatWithInstance(flat, inst);
      mutatedNodeIds.push(newId);
    } catch (e) {
      errors.push({ flatNodeId: op.flatNodeId, error: String(e.message || e) });
    }
  }

  figma.closePlugin(JSON.stringify({ createdNodeIds: [], mutatedNodeIds, errors }));
})();
```

Build the `ops` array from the Phase 3 mapping table. Split large screens across multiple
`use_figma` calls (~10 ops each).

---

## 8. Return contract for `use_figma`

Always end scripts with:

```javascript
figma.closePlugin(JSON.stringify({
  createdNodeIds: [],      // usually empty — we clone/import instances, not create masters
  mutatedNodeIds: [...],   // new instance ids placed in the frame
  errors: [],              // per-op failures
}));
```

Never leave the plugin open without `closePlugin`.

---

## Icon name mapping (antd → DS search)

| Repo import | search_design_system query |
|-------------|----------------------------|
| `SearchOutlined` | `Search` |
| `PlusOutlined` | `Plus`, `Add` |
| `DeleteOutlined` | `Delete`, `Trash` |
| `EditOutlined` | `Edit` |
| `CloseOutlined` | `Close` |
| `ArrowLeftOutlined` | `ArrowLeft`, `Left` |
| `UploadOutlined` | `Upload` |
| `DownloadOutlined` | `Download` |
| `SettingOutlined` | `Setting`, `Settings` |

When multiple icon hits return, prefer the name closest to the ant design icon set in the
attached Hydra / Ant Design library.
