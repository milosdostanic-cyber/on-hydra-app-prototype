# Ant Design brand colors in Figma (community kit)

Hydra’s concrete primary mapping (hex 1:1 with code) lives in **[hydra-primary-figma-mapping.md](./hydra-primary-figma-mapping.md)**. Typography (Cairo) is in **[hydra-typography.md](./hydra-typography.md)**. Button-only orange primary (`#F05A23`) is in **[hydra-button-primary-orange.md](./hydra-button-primary-orange.md)**.

This guide describes how the **Ant Design Figma community file** documents applying a client **brand** to the kit via **Figma variables**, and how that relates to **Ant Design in code**.

**Reference file (community):**  
[Ant Design — Version 5.9.4 (Community)](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Ant-Design---Version-5.9.4--Community-?node-id=5-8688)

On that link, the canvas is named **Customize Theme** (`node-id=5-8688`). It contains:

- A **documentation frame** (“Customize Theme”) with step-by-step instructions and screenshots.
- One or more **Theme Editor** sections: live previews of components (buttons, inputs, alerts, etc.) after you change tokens.

---

## How to apply brand colors in Figma (per the kit)

The kit is wired around **local variables**, not a separate “import brandbook” button. Flow:

### 1. Open Local variables

In the Figma **right sidebar**, open **Local variables** (the icon with sliders / variables next to the label “Local variables”).

### 2. Switch to the **Customize Theme** collection

In the variables panel, use the **collection** dropdown. You will see collections such as **Colors**, **Neutral**, palette collections (**Dust Red**, **Volcano**, **Sunset Orange**, etc.).

Select **`Customize Theme`**.  
That collection holds the tokens you override so the **whole Ant Design kit** in this file follows your brand.

### 3. Edit token values (colors and sizes)

Under **Customize Theme**:

**Color**

- Expand **Color** → **Primary** (and other semantic groups as needed: Success, Warning, Error, Info, Neutral).
- Typical **Primary** tokens include:
  - `colorPrimaryBG`
  - `colorPrimaryBGHover`
  - `colorPrimaryBorder`
  - `colorPrimaryBorderHover`
  - `colorPrimary`
  - `colorPrimaryActive`

Click a token’s **value**. You can:

- Set a **hex** (or other) color directly from the brandbook, or  
- **Link** the value to a variable from your **brand library** (e.g. map `colorPrimary` to something like `primary-6` from a shared **Colors** collection), so design and brand stay in sync.

**Size**

- Under **Size**, tokens such as `sizeXXL`, `sizeXL`, `sizeLG`, `sizeMD`, `size`, `sizeSM`, `sizeXS` control spacing / scale used by the system.
- Change numbers or bind them to your own size variables if your brandbook defines a spacing scale.

After edits, instances and **Theme Editor** previews in the file should reflect the new theme.

---

## Duplicate the community file first

Community files are read-only until you duplicate them.

1. **Duplicate** the file into your team / draft space (or **publish** your copy as a library if multiple files should consume it).
2. Apply **Customize Theme** variable overrides in **your** copy so updates are not lost when the community file updates.

---

## From Figma to Ant Design in React

Figma variables drive **design** in this file. In **code**, the same intent is expressed with **Design Tokens** on `ConfigProvider`:

- Official guide: [Customize Theme](https://ant.design/docs/react/customize-theme)
- Visual playground: [Theme Editor](https://ant.design/theme-editor) (the kit’s doc page references this pattern)

Map at least:

| Figma (Customize Theme) | Typical code (`theme.token`) |
|-------------------------|------------------------------|
| `colorPrimary` | `colorPrimary` |
| Related primary BG / border / active | `colorPrimaryBg`, `colorPrimaryBorder`, etc. (see Ant Design token list) |
| Radius / size tokens | `borderRadius`, padding-related tokens as needed |

Example:

```tsx
import { ConfigProvider } from 'antd';

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#yourBrandPrimary',
      borderRadius: 8,
    },
  }}
>
  <App />
</ConfigProvider>
```

Keep **hex values aligned** between Figma variables and `theme.token` (or generate one from the other in your workflow).

---

## Figma MCP notes (Cursor)

When using the **official Figma MCP** from this repo:

- **`get_metadata`** for `fileKey` + `nodeId` can return the **structure** of the **Customize Theme** canvas (sections, Theme Editor frames, component instances).
- **`get_screenshot`** can capture documentation frames (e.g. node `234:3341` — “Customize Theme” content) for visual reference.
- **`get_design_context`** / **`get_variable_defs`** may respond with *“You need to select a layer first”* if the integration expects the **Figma desktop app** with an active selection. In that case, open the file in Figma, select the target frame, and retry, or rely on metadata + screenshots + this guide.

**Extracted IDs from metadata (reference):**

- Canvas **Customize Theme:** `5:8688`
- Documentation content frame: `234:3341` (child of section **Customize Theme** `234:3340`)

---

## Version note

The community file targets **Ant Design 5.9.x** in Figma. Project code may use **antd 6.x**; theming still centers on **`ConfigProvider` → `theme`**, but check the [antd customize theme](https://ant.design/docs/react/customize-theme) docs for v6 specifics (e.g. `zeroRuntime` and CSS import if you enable it).
