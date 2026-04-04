# Figma screens — design system only (Hydra)

**Scope:** Every **screen frame** is built **only** from the **published design system** for which a **file link** is supplied for that project. Do not pull components, variables, or styles from other libraries unless explicitly agreed.

**Related repo rules:** `.cursor/rules/figma-repo-parity.mdc`, `.cursor/rules/hydra-ui-tokens.mdc` · typography/colour docs under `Documentation/`

---

## 1. Non‑negotiables

| Do | Don’t |
|----|--------|
| **Auto layout** on the screen root and on major sections (vertical flow; horizontal rows for toolbars, tables, split headers) | Primary structure built as **groups** or **absolute** placement |
| **Variables** (and DS **text styles** where the file defines them) for spacing, colour, radius, typography | **Raw** hex, rgb, or ad‑hoc **px** for layout, type, or brand surfaces |
| **Component instances** from that DS only — correct variant, properties, icon swaps | **Detached** instances, redrawn “fake” buttons/inputs, random shapes as UI |
| **Semantic layer names** (`Screen · Billing`, `Row · actions`) | Default names like `Frame 204`, `Group 3` |

**Do not invent** new **variables**, **colour styles**, or **components** in the screen file. If something is missing, **extend the DS** (or log a DS task) — don’t bake one-offs on the canvas.

---

## 2. Design system file

- Work **inside** the linked DS file (or its **published library** as the single source for instances).
- Prefer the **smallest set** of DS primitives that still reads clearly: one obvious **primary action**, consistent **density**, predictable **reading order** (top → bottom, start → end in LTR).
- When the screen **mirrors the Hydra app**, **code or an agreed spec** wins for **copy, hierarchy, and default states** — don’t improvise alternate labels or chrome.

### Finding components (pages match names)

In this design system, **page names and component families are usually aligned** — e.g. a page titled **Button** holds the Button set, **Input** holds inputs, **Typography** / **Text** holds type, and so on.

- Use the **Pages** list in the left sidebar as the **first index** when deciding what to place: open the page whose **name matches the UI piece** you need (tabs → Tabs page, search field → Input or Search page, etc.), then insert **instances** from the component sets on that page.
- If you are unsure which asset to use, **browse by page** before relying only on the **Assets** panel search — page structure mirrors how the library is organised and speeds up picking the correct variant set.

---

## 3. Layout and structure

- **Screen root:** vertical auto layout; consistent **padding** and **gaps** from DS variables (e.g. margin / padding scales the collection exposes).
- **Sections:** stack vertically with the same **spacing rhythm**; avoid mixed arbitrary gaps.
- **Rows** (headers, table lines, toolbars): horizontal auto layout; align items to the DS patterns (center for controls, baseline for text where appropriate).
- **Stretching:** If a **component instance** does not behave well as a stretched child, put it in a **plain auto-layout wrapper frame** and control **fill / hug** on the **frame**, not by detaching the component.
- **Order:** Add a node as a **child of an auto-layout frame first**, then set **fill container** / sizing — otherwise Figma may reject the sizing.

---

## 4. UX expectations

- **Clear hierarchy:** page title vs section vs body; use DS **Title / Text** roles that match importance (strong for emphasis, secondary for supporting copy).
- **Actions:** one **primary** CTA per view when the product spec implies it; secondary actions visually subordinate per DS button variants.
- **Forms and inputs:** real **placeholders** and **labels** as in spec; don’t ship “Lorem” or generic “Tab title” when real strings are defined.
- **States:** show **default** UI state (selected tab, toggles, empty copy) as agreed — designers and devs should see the same story.
- **Density:** align row height and spacing with **table/list** components if the DS provides them; otherwise compose rows but keep **consistent** vertical rhythm via variables.
- **Icons:** use **DS icon** components or approved swaps — no one-off drawings for standard metaphors (search, add, star, etc.).

---

## 5. Composite content (tables, lists)

- If the DS has a **Table** or **List** pattern, **use it**.
- If not: **vertical** stack of **horizontal** row frames; header cells use **secondary / description** text roles; body uses **default / strong** as appropriate; **narrow** columns (icons, counts) in **fixed-width** frames sized with DS spacing variables, not guessed pixels.

---

## 6. Handoff notes

- Use **short annotations** on the frame for anything non-obvious (e.g. deferred empty state, nested component editing).
- If the screen **intentionally** diverges from the app, state **why** on the frame.

---

## 7. Closing checklist

- [ ] Root + sections are **auto layout**; spacing/padding from **variables**.
- [ ] No **raw** colour, spacing, or typography for design intent where the DS exposes a token or style.
- [ ] Only **linked DS** components; **nothing detached**; no **new** DS primitives invented on the fly.
- [ ] **Copy and defaults** match spec/code where applicable.
- [ ] **Resize** the screen frame to confirm layout behaves; layer names stay **semantic**.

---

## Appendix A — Figma Console: Projects screen (Menu page `4:19`)

Use this when the **Ant Design — DS** file is open in **Figma Desktop** and the **Desktop Bridge** plugin is running (`figma_execute`). It mirrors `ShellHomeContent` per §1–§5 above: DS instances only, auto layout, variables where binding works, wrapper frames for stretchy cells.

**Before running**

1. Open [Ant Design — DS](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Ant-Design---DS?node-id=4-19). In this file, node **`4:19` is a PAGE** (`❖ Menu`), not a frame — the script **creates or reuses** a screen frame **on that page** (it does not wipe the page).
2. **Plugins → Development → Figma Desktop Bridge → Run** and wait until the console reports a connection.
3. If `importComponent*ByKeyAsync` fails after a library update, re-resolve keys from the DS file (pages share names with components — §2) and replace the string constants in the script.
4. After the run, give the screen frame a comfortable **height** (e.g. resize vertically) if content is clipped; set **Tabs** labels to **All / Recent / Starred** in nested instances if the kit shows placeholders.

**Paste into `figma_execute`**

```javascript
return await (async () => {
  const page = await figma.getNodeByIdAsync('4:19');
  if (!page || page.type !== 'PAGE') throw new Error('4:19 must be the Menu PAGE in this file');
  await figma.setCurrentPageAsync(page);

  let target = page.findOne((n) => n.type === 'FRAME' && n.name === 'Screen · Projects (ShellHomeContent) · 4:19 page');
  if (target) {
    while (target.children.length) target.children[0].remove();
  } else {
    target = figma.createFrame();
    target.name = 'Screen · Projects (ShellHomeContent) · 4:19 page';
    page.appendChild(target);
    const ref = page.findOne((n) => n.id === '711:10031');
    if (ref && 'x' in ref) {
      target.x = ref.x + (ref.width || 1200) + 80;
      target.y = ref.y;
    } else {
      target.x = 0;
      target.y = 4000;
    }
  }

  target.layoutMode = 'VERTICAL';
  target.primaryAxisAlignItems = 'MIN';
  target.counterAxisAlignItems = 'MIN';
  target.layoutSizingHorizontal = 'FIXED';
  target.layoutSizingVertical = 'HUG';
  target.resize(960, 1200);

  const vPadLG = await figma.variables.importVariableByKeyAsync('b480f7bc902453f835de601cba5441a0bca833cf');
  const vGapLG = await figma.variables.importVariableByKeyAsync('cad8221f68133569955d004f10ba01bb13fe3777');
  try {
    target.setBoundVariable('paddingTop', vPadLG);
    target.setBoundVariable('paddingBottom', vPadLG);
    target.setBoundVariable('paddingLeft', vPadLG);
    target.setBoundVariable('paddingRight', vPadLG);
  } catch (e) {
    target.paddingTop = target.paddingBottom = target.paddingLeft = target.paddingRight = 24;
  }
  try {
    target.setBoundVariable('itemSpacing', vGapLG);
  } catch (e) {
    target.itemSpacing = 24;
  }

  const header = figma.createFrame();
  header.name = 'Row · title + primary action';
  header.layoutMode = 'HORIZONTAL';
  header.primaryAxisAlignItems = 'SPACE_BETWEEN';
  header.counterAxisAlignItems = 'CENTER';
  header.layoutSizingVertical = 'HUG';
  try {
    header.setBoundVariable('itemSpacing', vGapLG);
  } catch (e) {
    header.itemSpacing = 16;
  }

  const titleCs = await figma.importComponentSetByKeyAsync('4b508277ed40d99318ceb2e1c5eb54e7bafde2aa');
  const titleInst = titleCs.children.find((c) => c.name === 'level=3').createInstance();
  titleInst.setProperties({ '✏️ title#114:1202': 'Projects' });

  const btnCs = await figma.importComponentSetByKeyAsync('c389ed6245c78052b051047e62217ddcdcb85970');
  const plus = await figma.importComponentByKeyAsync('c3130c21e2e6959e0d404da56b6a643708b761a6');
  const btnInst = btnCs.children
    .find((c) => c.name === 'type=primary, size=default, state=default, content=default, danger=false, ghost=false')
    .createInstance();
  btnInst.setProperties({
    'show icon left#35:1': true,
    '✏️ title#35:5': 'Create Project',
    '↳ 🎰 icon left#35:2': plus.id,
  });

  header.appendChild(titleInst);
  header.appendChild(btnInst);
  target.appendChild(header);
  header.layoutSizingHorizontal = 'FILL';

  const inCs = await figma.importComponentSetByKeyAsync('0d6fb8c5f63b36527ab779b3f2dcf107567d933a');
  const searchInst = inCs.children.find((c) => c.name === 'size=default, type=icon').createInstance();
  searchInst.setProperties({ '✏️ title#183:50': 'Search projects by name, address, city, or state...' });
  const searchWrap = figma.createFrame();
  searchWrap.name = 'Search wrap';
  searchWrap.layoutMode = 'VERTICAL';
  searchWrap.primaryAxisAlignItems = 'MIN';
  searchWrap.counterAxisAlignItems = 'MIN';
  searchWrap.layoutSizingVertical = 'HUG';
  searchWrap.appendChild(searchInst);
  target.appendChild(searchWrap);
  searchWrap.layoutSizingHorizontal = 'FILL';

  const tabCs = await figma.importComponentSetByKeyAsync('41a30c7019bcfc0c2ad01161bc374446d7af9402');
  const tabsInst = tabCs.children.find((c) => c.name === 'position=top, size=default').createInstance();
  target.appendChild(tabsInst);

  const tbl = figma.createFrame();
  tbl.name = 'Table · projects';
  tbl.layoutMode = 'VERTICAL';
  tbl.itemSpacing = 0;
  target.appendChild(tbl);
  tbl.layoutSizingHorizontal = 'FILL';

  const textCs = await figma.importComponentSetByKeyAsync('e27c9fd0bc1c3f7b367d8387dfb217edbe08e0fa');
  const txtDefault = textCs.children.find((c) => c.name === 'type=default, style=default, size=default');
  const txtStrong = textCs.children.find((c) => c.name === 'type=default, style=strong, size=default');
  const txtSec = textCs.children.find((c) => c.name === 'type=secondary, style=default, size=default');
  const starFill = await figma.importComponentByKeyAsync('232793a02c28173ecc12c24b0467c19061b85d15');
  const starOut = await figma.importComponentByKeyAsync('d5515544d7d908a5a24f5f52fd43a23d9fcbdcd5');

  function addTextCell(parent, comp, label, alignEnd) {
    const wrap = figma.createFrame();
    wrap.name = 'Cell · text';
    wrap.layoutMode = 'VERTICAL';
    wrap.primaryAxisAlignItems = 'MIN';
    wrap.counterAxisAlignItems = alignEnd ? 'MAX' : 'MIN';
    wrap.layoutSizingVertical = 'HUG';
    const i = comp.createInstance();
    i.setProperties({ '✏️ title#114:1208': label });
    wrap.appendChild(i);
    parent.appendChild(wrap);
    wrap.layoutSizingHorizontal = 'FILL';
  }

  function addStarCell(parent, inst) {
    const wrap = figma.createFrame();
    wrap.name = 'Cell · star';
    wrap.layoutMode = 'VERTICAL';
    wrap.primaryAxisAlignItems = 'CENTER';
    wrap.counterAxisAlignItems = 'CENTER';
    wrap.layoutSizingVertical = 'HUG';
    wrap.layoutSizingHorizontal = 'FIXED';
    wrap.resize(40, 40);
    wrap.appendChild(inst);
    parent.appendChild(wrap);
  }

  function makeRow(name) {
    const r = figma.createFrame();
    r.name = name;
    r.layoutMode = 'HORIZONTAL';
    r.primaryAxisAlignItems = 'MIN';
    r.counterAxisAlignItems = 'CENTER';
    r.layoutSizingVertical = 'HUG';
    try {
      r.setBoundVariable('paddingTop', vPadLG);
      r.setBoundVariable('paddingBottom', vPadLG);
    } catch (e) {
      r.paddingTop = r.paddingBottom = 12;
    }
    r.itemSpacing = 16;
    return r;
  }

  const headers = ['', 'Project Name', 'Address', 'City', 'State', 'Last Opened'];
  const hr = makeRow('Header row');
  for (let i = 0; i < headers.length; i++) {
    addTextCell(hr, txtSec, headers[i], i === headers.length - 1);
  }
  tbl.appendChild(hr);
  hr.layoutSizingHorizontal = 'FILL';

  const data = [
    { star: true, name: 'Downtown Convention Center', address: '123 Main Street', city: 'Phoenix', state: 'AZ', last: '2 hours ago' },
    { star: false, name: 'Riverside Office Park', address: '456 River Road', city: 'Tucson', state: 'AZ', last: 'Yesterday' },
    { star: true, name: 'Highland Retail Plaza', address: '789 Highland Ave', city: 'Scottsdale', state: 'AZ', last: '3 days ago' },
    { star: false, name: 'Desert Logistics Hub', address: '321 Desert Way', city: 'Mesa', state: 'AZ', last: 'Last week' },
  ];

  for (let r = 0; r < data.length; r++) {
    const d = data[r];
    const rr = makeRow(`Data row ${r + 1}`);
    const si = (d.star ? starFill : starOut).createInstance();
    addStarCell(rr, si);
    addTextCell(rr, txtStrong, d.name, false);
    addTextCell(rr, txtDefault, d.address, false);
    addTextCell(rr, txtDefault, d.city, false);
    addTextCell(rr, txtDefault, d.state, false);
    addTextCell(rr, txtDefault, d.last, true);
    tbl.appendChild(rr);
    rr.layoutSizingHorizontal = 'FILL';
  }

  figma.viewport.scrollAndZoomIntoView([target]);
  return { ok: true, frameId: target.id };
})();
```

After a successful run, resize the **screen frame** vertically if needed; set **Tabs** labels to **All / Recent / Starred** in the nested instances if the kit still shows placeholders.

---

*Living doc for **all** Hydra-related screens; the **design system URL** is the boundary — stay inside that library and its variables.*
