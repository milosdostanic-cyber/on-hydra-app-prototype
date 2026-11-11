#!/usr/bin/env python3
"""Generates Documentation/molecules/index.html and one plan report per accepted family.
Data comes from the read-only Figma audit of 2026-10-28 (see ledger.json)."""
import base64, html, json, os, pathlib

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent
IMG = HERE / "img"
DATE = "28 Oct 2026"

FILES = {
    "hydra": ("3ghYBXR6XVUEaeBo3D5E4q", "Hydra-Ant-Design---DS"),
    "bom": ("Ht3Up5MlRAKjK7eCuAy05L", "BOM-SPEC---ASC-Connected-v2"),
    "rn": ("a4gviD5oViRhasSCN6cC8Z", "Release-Notes"),
    "ps": ("fyhH2NtH20puYbGLDChPwn", "Part-Search---RSFC"),
    "spec": ("KmU1mTvL7D1fLZvJ8SIGTN", "SPEC---ASC-Connected"),
    "adm": ("rONB8aMPanOjS3GC1uN16d", "Admin---ASC-Connected"),
    "ct": ("pGzqSs0fMmuQ2BtjbMNVjP", "Content---RSFC"),
}
MODNAME = {"bom": "BOM", "rn": "Release Notes", "ps": "Part Search", "spec": "SPEC", "adm": "Admin", "ct": "Content"}


def link(f, node):
    k, n = FILES[f]
    return f"https://www.figma.com/design/{k}/{n}?node-id={node.replace(':', '-')}"


def e(s):
    return html.escape(str(s))


def img(name, alt=""):
    p = IMG / name
    if not name or not p.exists():
        return ""
    b = base64.b64encode(p.read_bytes()).decode()
    return f'<img loading="lazy" alt="{e(alt)}" src="data:image/png;base64,{b}">'


def chip(m):
    return f'<span class="chip m-{m}">{MODNAME[m]}</span>'


def badge(v):
    return '<span class="st st-v">Verified</span>' if v else '<span class="st st-i">Inferred</span>'


# ---------------------------------------------------------------- families
FAM = [
 {
  "slug": "file-upload-dropzone", "name": "File Upload Dropzone", "category": "Molecules · Data entry",
  "decision": "new", "priority": "High", "based": None,
  "purpose": "A bordered drop area where the user picks or drops one file, then sees the chosen file, the upload progress or a clear error, all in the same place.",
  "why": "SPEC and three separate Admin areas (Release Notes admin, Lead Time Import, Knowledge Center) each draw this box by hand. SPEC, Knowledge Center and Lead Time even share the same layer structure (upload icon, title and hint, button), which shows it is copied between files. Hydra has no Upload page and no molecule for it, so a new molecule is the clean option. In code it maps to the Ant Design Upload.Dragger plus Hydra state content.",
  "related": "Alert (the blue info line above the box in Knowledge Center and Lead Time stays an Alert, outside the molecule). Empty State Block is for empty lists, not for file picking.",
  "rationale": "Reuse: 4 product areas, 12 occurrences. Consistency: 4 visual drifts today (border, icon tile, button type, radius). Effort: medium (6 states, but only one structure).",
  "verified": 8, "estimated": 12, "mods": ["spec", "adm"],
  "layouts": ["default (full width of a modal body)"],
  "states": ["empty", "hover (drag over)", "selected", "uploading", "error", "disabled"],
  "props": [
   ("state", "Variant", "empty (default) · hover · selected · uploading · error · disabled", "hover is the drag-over preview"),
   ("↳ 🎰 icon", "Instance swap", "UploadOutlined", "error uses ExclamationCircleFilled; selected/uploading use a file-type icon"),
   ("✏️ title", "Text", "Click to upload or drag and drop", "error: “We could not process this file”"),
   ("show hint", "Boolean", "true", ""),
   ("✏️ hint", "Text", "PDF or Word document. Max 5 MB.", "error: the reason"),
   ("show button", "Boolean", "true", "nested Button (default, medium), exposed"),
   ("✏️ file name", "Text", "design-spec.pdf", "selected and uploading only"),
   ("✏️ file size", "Text", "12.4 MB", "selected and uploading only"),
   ("✏️ progress", "Text", "65%", "uploading only; nested Progress atom, exposed"),
   ("show remove", "Boolean", "false", "selected: “Remove file” link (RN Admin)"),
  ],
  "tokens": "Fill colorFillQuaternary; dashed stroke colorBorder (error: colorErrorBorder + colorErrorBg fill; hover: colorPrimary); radius borderRadiusLG; padding paddingLG; gaps marginXS / marginSM; title colorText; hint colorTextDescription; icon colorPrimary (error colorError).",
  "text": "Title Large/Medium · hint Base/Normal · file name Base/Medium · size and progress Small/Normal",
  "nested": "Button, Progress, Spin (not used after harmonization), UploadOutlined, ExclamationCircleFilled, FilePdfOutlined / FileExcelOutlined",
  "harm": [
   ("Border", "dashed (SPEC, Knowledge Center, Lead Time) · solid (RN Admin)", "dashed colorBorder", "canonical and most common"),
   ("Icon", "bare UploadOutlined (SPEC, KC, Lead Time) · icon in a tinted square (RN Admin)", "bare icon, colorPrimary", "canonical; the tile adds no meaning"),
   ("Button", "default medium “Choose file” (SPEC, KC, Lead Time) · small primary (RN Admin)", "default, medium", "the modal footer already has the primary action"),
   ("Radius", "borderRadiusLG (SPEC, KC, Lead Time) · 14 px (RN Admin)", "borderRadiusLG", "existing token"),
   ("Title size", "16 Medium (SPEC) · 16 Regular (RN Admin) · ~14 Medium (KC, Lead Time; visual estimate)", "Large/Medium", "canonical; to confirm in BUILD by reading the nodes"),
   ("Uploading", "progress bar + % (SPEC modal, RN Admin) · spinner only (SPEC Uploading State)", "progress bar (Progress atom)", "shows real progress; open question 2"),
  ],
  "occ": [
   ("spec", "02 — Upload SPEC · Choose file", "8028:37307", True, "crop-spec-dropzone.png", "Canonical. state empty, title “Choose PDF or Word document”.", "None (canonical)."),
   ("spec", "02 — Upload SPEC · Uploading (modal)", "8454:9193", True, "spec-uploading-modal.png", "state uploading: file row, bar 65 %, “About 12 seconds remaining”.", "Time-remaining text goes into ✏️ progress or stays outside."),
   ("spec", "02 — Upload SPEC · File cannot be processed", "8028:41317", True, "spec-upload-error.png", "state error: red dashed box, reason, “Choose another file”.", "None."),
   ("spec", "02 — Upload SPEC · File selected", "8305:89097", False, "", "state selected: “Project Spec - Plumbing…”, 268 KB (same structure in the scan).", "Not screenshotted today."),
   ("spec", "02 — Upload SPEC · Uploading State", "8491:32544", False, "", "Spinner and “Uploading file…”, no bar.", "Spinner becomes the progress bar."),
   ("spec", "03 — Upload new version · Choose file (NOT FOR RELEASE 1)", "8038:41748", False, "", "“Drop the replacement PDF or DOCX here”.", "Section is marked not for Release 1."),
   ("adm", "Admin · Knowledge Center · 02.05 Upload & Send File · Step 2", "2881:5362", True, "crop-kc-dropzone.png", "state empty, “Click to upload or drag and drop”, info Alert above.", "Title size to confirm."),
   ("adm", "Admin · Knowledge Center · 02.06 Replace File", "2881:5629", False, "", "Same structure and copy as 02.05.", "Not screenshotted today."),
   ("adm", "Admin · CFM · Lead Time Import · 2 Import Lead Time File", "2504:22727", True, "crop-leadtime-dropzone.png", "state empty, “CSV or XLSX · Max 5 MB”.", "Title size to confirm."),
   ("adm", "Admin · RN Admin · Bulk upload 1", "2218:11520", True, "rnadmin-dropzone.png", "state empty, tinted icon tile, small primary button.", "Border solid → dashed, button primary → default, radius 14 → borderRadiusLG."),
   ("adm", "Admin · RN Admin · Loading", "2218:11540", True, "rnadmin-uploading.png", "state uploading: name, size, bar, “Uploading…”.", "Same harmonization as above."),
   ("adm", "Admin · RN Admin · confirm", "2218:11567", True, "rnadmin-selected.png", "state selected: name, size, “Remove file”, “Choose file”.", "show remove = true."),
  ],
  "rejected": [("SPEC 02 — Confirm Master SPEC “Uploaded file” banner", "8028:39064", "spec", "A success Alert, not a dropzone state."),
               ("BOM 1.2 — Upload destination “Selected file”", "5289:28546", "bom", "Already an Alert atom.")],
  "questions": ["Should the dropzone be a Hydra molecule, or should Hydra first get an ❖ Upload atom page (Ant Design Upload.Dragger) with these states?",
                "Uploading: adopt the progress bar everywhere and drop the spinner-only version?",
                "RN Admin: accept the default button and bare icon instead of the primary button and tinted tile?"],
  "hero": "crop-spec-dropzone.png",
 },
 {
  "slug": "selection-summary", "name": "Selection Summary", "category": "Molecules · Data display",
  "decision": "new", "priority": "High", "based": None,
  "purpose": "A soft, read-only panel at the top of a modal or drawer that tells the user what they are about to act on: “These parts will be added”, “Adding”, “From your file”.",
  "why": "Content, Part Search and BOM each draw this panel from plain frames inside modal slots. The anatomy is tiny and static (an eyebrow plus one to three value lines), so a new molecule is cheap and removes drift. It is not an Alert: it carries no status, it only echoes the selection.",
  "related": "Alert is for status messages (the green “Selected file” / “Uploaded file” panels are Alerts). Attribute List describes one object with label/value pairs; Selection Summary lists what will be affected under one eyebrow.",
  "rationale": "Reuse: 3 modules, 8 occurrences. Consistency: value style and padding drift. Effort: low (no states).",
  "verified": 4, "estimated": 8, "mods": ["ct", "ps", "bom"],
  "layouts": ["default"], "states": ["static (no interaction)"],
  "props": [
   ("✏️ eyebrow", "Text", "These parts will be added", ""),
   ("✏️ value", "Text", "S7166NV — 316 SS 6000 CWP Thrd End Needle Valve", ""),
   ("value style", "Variant", "text (default) · link", "BOM shows the source line as a link"),
   ("show secondary", "Boolean", "false", ""),
   ("✏️ secondary", "Text", "Figure 200-B", "muted sub-line (Part Search)"),
  ],
  "tokens": "Fill colorFillQuaternary (Hydra has no colorFillAlter); radius borderRadiusLG; padding paddingSM / padding; gap marginXXS; eyebrow colorTextDescription; value colorText or colorLink; secondary colorTextTertiary.",
  "text": "Eyebrow Base/Normal · value Base/Medium · secondary Base/Normal",
  "nested": "none (text only)",
  "harm": [
   ("Value weight", "Base/Medium (Content submittal, Part Search) · Base/Normal (Content BOM)", "Base/Medium", "most common"),
   ("Value style", "text (Content, Part Search) · link (BOM)", "property value style", "carries meaning: the BOM value opens the source line"),
   ("Lines", "1 value (Content submittal) · 2 values (Content BOM) · value + sub-line (Part Search)", "one value + optional secondary", "a second item becomes a second value line in the same text"),
  ],
  "occ": [
   ("ct", "Content · Create Submittal Package", "9030:7076", True, "crop-content-summary.png", "Canonical. “These parts will be added” + one value.", "None."),
   ("ct", "Content · Create BOM", "9030:8465", False, "", "“These variations will be added” with 2 value lines (scan).", "Value weight Normal → Medium."),
   ("ct", "Content · New package / Package name dialogs ×3", "9030:7980", False, "", "Same panel in 9030:7980, 9030:10501, 9030:8102 (scan; verified on 20 Oct).", "None."),
   ("ps", "Part listing · Add to Submittal Package", "11059:22758", True, "crop-ps-summary.png", "“Adding”, value and muted “Figure 200-B”.", "show secondary = true."),
   ("ps", "Part listing · loose Modal (outside the section)", "11059:14186", False, "", "“Adding / 700-G — Check valve grooved” (scan).", "Frame sits outside the flow section; confirm it is in use."),
   ("bom", "BOM-356 · 03 Add information · Default", "6593:27719", True, "crop-bom356-summary.png", "“From your file” + link value.", "value style = link."),
   ("bom", "Local Components · BOM / Parsed Line Editor (used in 2.6 / 2.8 drawers)", "5570:201374", True, "crop-bom-edit-summary.png", "“From your file” + link value; nested in the row edit drawers.", "value style = link."),
   ("bom", "Local Components · BOM / Replace Match Picker", "5573:294537", False, "", "“Replace the match for this imported line” + link value (scan).", "value style = link."),
  ],
  "rejected": [("SPEC 02 — Confirm Master SPEC “Uploaded file”", "8028:39064", "spec", "Success-toned status line: use the Alert atom."),
               ("BOM 1.2 — “Selected file”", "5289:28546", "bom", "Already an Alert atom.")],
  "questions": ["Content and Part Search use an identical “Add to package” modal (summary + choice rows + “Create a new package instead”). Should that become a template later? It is outside molecule scope."],
  "hero": "crop-content-summary.png",
 },
 {
  "slug": "recommendation-card", "name": "Recommendation Card", "category": "Molecules · Cards",
  "decision": "extend", "priority": "High", "based": ("RecommendationCard", "2017:1141"),
  "purpose": "A compact card for one finding or update: a type tag, a title, an optional description and an optional meta line (section and page), with a status badge.",
  "why": "Hydra already has RecommendationCard (2017:1141) but it has no text properties, no description, a capitalised State=Rest/Hover/Resolved variant, and hard-coded tags. SPEC still uses its own local recommendation_card (8362:7673) on 4 screens, and no module uses the Hydra copy (0 instances found). Upgrading the Hydra set is cheap and safe: nothing breaks if its properties are renamed.",
  "related": "FeatureCard is a product card with image and link button (Part Search category). OptionCard is for picking or starting a choice. Release Notes cards share purpose and structure, so they join as state default without status or meta.",
  "rationale": "Reuse: 2 modules, 27+ cards on 3 verified screens. Consistency: SPEC local set and RN hand-built cards. Effort: low (upgrade an unused set).",
  "verified": 3, "estimated": 5, "mods": ["spec", "rn"],
  "layouts": ["default"], "states": ["default", "hover", "resolved"],
  "props": [
   ("state", "Variant", "default · hover · resolved", "renamed from State=Rest/Hover/Resolved (no instances use it)"),
   ("show tag", "Boolean", "true", "nested Tag__Colorful, exposed"),
   ("show status", "Boolean", "true", "nested Badge__Status, exposed"),
   ("✏️ title", "Text", "Clarify code reference", ""),
   ("show description", "Boolean", "true", ""),
   ("✏️ description", "Text", "The extracted clause would benefit from clearer wording.", ""),
   ("show meta", "Boolean", "true", ""),
   ("✏️ meta", "Text", "Section 22 05 00 | Page 8", ""),
  ],
  "tokens": "Fill colorBgContainer (resolved: colorFillQuaternary); stroke colorBorderSecondary (hover colorPrimaryBorder); radius borderRadiusLG; padding paddingSM; gap marginXS; title colorText; description and meta colorTextDescription.",
  "text": "Title Base/Medium · description Small/Normal · meta Small/Normal",
  "nested": "Tag__Colorful, Badge__Status (both already nested in the Hydra set)",
  "harm": [
   ("Tag position", "row above the title (SPEC) · inline before the title (Release Notes)", "row above the title", "canonical; open question 1"),
   ("Title size", "14 (SPEC) · 16 Medium (Release Notes)", "Base/Medium", "canonical, denser list"),
   ("Padding / fill", "12 px, white (SPEC) · 24 px, grey fill (Release Notes)", "paddingSM, colorBgContainer", "canonical"),
   ("Description", "present (SPEC dashboard, RN) · absent (SPEC review sidebar)", "show description", "real content difference"),
  ],
  "occ": [
   ("spec", "05 — Analysis dashboard · Recommendations ×21", "8362:8978", True, "crop-spec-rec-cards.png", "Canonical. Local recommendation_card, states To review / Accepted.", "Swap local set → Hydra set."),
   ("spec", "06 — Re-analysis · In progress · sidebar ×5", "8076:133925", True, "crop-spec-reanalysis-sidebar.png", "Same local card without description; one Resolved.", "show description = false."),
   ("spec", "05 — Review and edit · Recommendation list", "8066:124202", False, "", "Same local card in the sidebar (instance scan).", "show description = false."),
   ("spec", "TOC frame", "8362:9970", False, "", "Local instances in the loose TOC frame (instance scan).", "Confirm the frame is in use."),
   ("rn", "Release Notes · What's New modal ×3", "1:5344", True, "rn-cards.png", "Hand-built Feature / Improvement / Fix cards, tag inline before a 16 px title.", "Tag moves above title, padding 24 → 12, grey → white, show status/meta = false."),
  ],
  "rejected": [],
  "questions": ["Keep the name RecommendationCard, or rename it to something generic (for example “Tagged Summary Card”) because Release Notes uses it too?",
                "Release Notes: accept the tag above the title, or add a tag placement property?",
                "Approve renaming State=Rest/Hover/Resolved to state=default/hover/resolved (no instances use the Hydra set today)?"],
  "hero": "crop-spec-rec-cards.png",
 },
 {
  "slug": "choice-list-row", "name": "Choice List Row", "category": "Molecules · Data entry",
  "decision": "new", "priority": "Medium", "based": None,
  "purpose": "One selectable row in a bordered list: a radio or checkbox, a label, an optional description and an optional trailing count (“3 parts”).",
  "why": "Content, Part Search and SPEC draw these rows by hand inside modal slots, with divider lines and selected tint. A plain Radio or Checkbox atom has no row padding, divider, meta or selected fill. OptionCard type=option is a standalone bordered card; these rows sit together in one shared list, so they are a separate, denser molecule.",
  "related": "OptionCard (type option) for 2-4 rich, separate choices. Radio / Checkbox atoms for plain groups such as BOM 1.2. Table with row selection for multi-column data (Part Search variants).",
  "rationale": "Reuse: 3 modules, 4 occurrences. Consistency: hand-built rows, SPEC rows misaligned. Effort: low-medium (control × state).",
  "verified": 3, "estimated": 4, "mods": ["ct", "ps", "spec"],
  "layouts": ["radio", "checkbox"], "states": ["default", "hover", "selected", "disabled"],
  "props": [
   ("control", "Variant", "radio (default) · checkbox", ""),
   ("state", "Variant", "default · hover · selected · disabled", ""),
   ("✏️ label", "Text", "Seismic Bracing Cut Sheets", ""),
   ("show description", "Boolean", "false", "SPEC: “ASC Fire Protection Master · Current version 2026.3”"),
   ("✏️ description", "Text", "", ""),
   ("show meta", "Boolean", "true", ""),
   ("✏️ meta", "Text", "0 parts", "trailing, right-aligned"),
  ],
  "tokens": "Fill colorBgContainer (selected colorPrimaryBg at low opacity → use colorFillQuaternary or colorPrimaryBg; confirm in BUILD); bottom divider colorBorderSecondary; padding paddingSM; gap marginXS; label colorText; description and meta colorTextDescription.",
  "text": "Label Base/Normal (selected Base/Medium in SPEC) · description and meta Small/Normal",
  "nested": "Radio, Checkbox (exposed)",
  "harm": [
   ("Label weight", "Normal (Content, Part Search) · Medium (SPEC)", "Base/Normal", "most common"),
   ("Selected fill", "light tint (Content, Part Search) · none (SPEC)", "light tint", "clearer selected state"),
   ("Alignment", "aligned (Content, Part Search) · rows 2-3 offset (SPEC)", "aligned (auto layout)", "fix of a hand-built drift"),
  ],
  "occ": [
   ("ct", "Content · Create Submittal Package ×3 rows", "9030:7076", True, "crop-content-rows.png", "Canonical. Radio, label, “N parts”.", "None."),
   ("ct", "Content · Create BOM ×10 rows (with search)", "9030:8465", False, "", "Same row, meta “N items” (scan).", "None."),
   ("ps", "Part listing · Add to Submittal Package ×3 rows", "11059:22758", True, "crop-ps-rows.png", "Identical to Content.", "None."),
   ("spec", "04 — Download ASC Master SPEC ×3 rows + Select all", "8156:110292", True, "crop-spec-download-rows.png", "Checkbox, label, description, “1 of 3 selected” header.", "control = checkbox, show description; header stays in the list."),
  ],
  "rejected": [("BOM 1.2 — Upload destination radios", "5289:28546", "bom", "Plain Radio.Group with no row chrome: keep the Radio atom."),
               ("Part Search — Select variants for PDF / DWG / STEP / Add to BOM", "11059:23573", "ps", "A Table with row selection (organism), not list rows.")],
  "questions": ["Should the “Select all · 1 of 3 selected” header be a variant of the row (type = header) or stay part of the list wrapper?"],
  "hero": "crop-content-rows.png",
 },
 {
  "slug": "outcome-summary", "name": "Outcome Summary", "category": "Molecules · Feedback",
  "decision": "new", "priority": "Medium", "based": None,
  "purpose": "A tinted panel that closes a step: an optional status icon, a title, a summary line, an optional detail line and an optional row of Stat Tiles.",
  "why": "BOM and SPEC both end a step with this panel and both already nest the Hydra Stat Tile. The panel itself is hand-built. It is not the Result atom (no centred hero) and not an Alert (it contains stats).",
  "related": "Stat Tile (nested). Result atom for full-page success. Admin import results use Alert + Statistic instead (rejected).",
  "rationale": "Reuse: 2 modules, 5 occurrences. Consistency: title size and layout drift. Effort: medium (slot for stats).",
  "verified": 3, "estimated": 5, "mods": ["bom", "spec"],
  "layouts": ["stacked (stats below)", "inline (stats on the right)"], "states": ["static"],
  "props": [
   ("tone", "Variant", "neutral (default) · success", "sets fill and icon"),
   ("layout", "Variant", "stacked · inline", "BOM stacks tiles; SPEC puts them on the right"),
   ("show icon", "Boolean", "false", "CheckCircleFilled in success"),
   ("✏️ title", "Text", "Overall assessment", ""),
   ("✏️ summary", "Text", "", ""),
   ("show detail", "Boolean", "true", ""),
   ("✏️ detail", "Text", "", ""),
   ("show stats", "Boolean", "true", ""),
   ("↳ 🎰 stats", "Instance swap / slot", "Stat Tile row", "3 Stat Tile instances"),
  ],
  "tokens": "Fill colorFillQuaternary (success: colorSuccessBg + colorSuccessBorder); radius borderRadiusLG; padding paddingMD; gap marginSM; title colorTextHeading; detail colorTextDescription.",
  "text": "Title Large/Medium · summary Base/Medium · detail Base/Normal",
  "nested": "Stat Tile, CheckCircleFilled",
  "harm": [
   ("Title", "20 Medium (BOM) · 16 Medium (SPEC)", "Large/Medium (16)", "SPEC is the more common size"),
   ("Fill", "grey with success icon (BOM) · grey (SPEC)", "tone property", "success carries meaning"),
   ("Stats position", "below (BOM) · right (SPEC) · none (SPEC 05)", "layout + show stats", "real layout difference"),
  ],
  "occ": [
   ("bom", "2.14 — Guided matching · Complete", "5574:297556", True, "crop-bom-outcome.png", "Canonical. Check icon, title, 2 lines, 3 Stat Tiles below.", "Title 20 → 16."),
   ("spec", "07 — Export and create outputs · Overall assessment", "8112:21542", True, "crop-spec-outcome.png", "Title + description left, 3 Stat Tiles right.", "layout = inline."),
   ("spec", "05 — Analysis dashboard · Overall assessment", "8362:8955", True, "crop-spec-overall.png", "Title + one line, no tiles.", "show stats = false."),
   ("spec", "05B — Submittal Package created · Success", "8429:11661", False, "", "Same panel text as 07 (scan).", "layout = inline."),
   ("spec", "05C — Export doc ready", "8230:83425", False, "", "Same panel with Stat Tiles (scan).", "layout = inline."),
  ],
  "rejected": [("Admin · RN Admin · Bulk upload · Success", "2218:11585", "adm", "Centred Result-style block with Statistic atoms."),
               ("Admin · Lead Time · 5 Result Summary", "2570:20063", "adm", "Success Alert + 4 centred Statistic cells.")],
  "questions": ["Keep both layouts (stacked and inline), or standardise on one?"],
  "hero": "crop-bom-outcome.png",
 },
 {
  "slug": "attribute-list", "name": "Attribute List", "category": "Molecules · Data display",
  "decision": "new", "priority": "Medium", "based": None,
  "purpose": "Label and value pairs that describe one object, such as the imported part or a product's technical specifications.",
  "why": "BOM (guided matching, Cheat Sheet) and Part Search draw these pairs by hand in two layouts. The code equivalent is Ant Design Descriptions, which Hydra does not have as a page yet.",
  "related": "Selection Summary echoes a selection under one eyebrow; Attribute List shows many labelled values of one object.",
  "rationale": "Reuse: 2 modules, 4 occurrences (PS block repeats on 7 screens). Consistency: two layouts and divider drift. Effort: medium (item sub-component + layouts).",
  "verified": 3, "estimated": 4, "mods": ["bom", "ps"],
  "layouts": ["horizontal (label beside value)", "vertical grid (label above value)"], "states": ["static"],
  "props": [
   ("layout", "Variant", "horizontal · vertical", ""),
   ("columns", "Variant", "1 · 2 · 4", "vertical grid only"),
   ("show dividers", "Boolean", "false", "Cheat Sheet uses dividers"),
   ("✏️ title", "Text", "Your part", "optional heading; show title"),
   ("Attribute Item (sub-component)", "—", "✏️ label · ✏️ value", "internal helper, not used alone"),
  ],
  "tokens": "Label colorTextDescription; value colorText; dividers colorBorderSecondary; row gap marginXS; column gap marginLG.",
  "text": "Label Base/Normal (Cheat Sheet: Small/Normal) · value Base/Medium",
  "nested": "Divider (optional)",
  "harm": [
   ("Label style", "45 % with colon (BOM 2.11) · 65 % no colon (PS, Cheat Sheet)", "colorTextDescription, no colon", "most common"),
   ("Size", "14 (BOM 2.11, PS) · 12 (Cheat Sheet)", "Base", "most common"),
   ("Value alignment", "right (BOM 2.11) · left (Cheat Sheet, PS)", "left", "most common"),
  ],
  "occ": [
   ("ps", "Part listing · Information & Technical Specifications", "11024:17036", True, "ps-techspecs.png", "Canonical. 4-column grid, label above value; repeats on 7 PS screens.", "None."),
   ("bom", "2.11 — Guided matching · YOUR PART", "5572:204106", True, "crop-bom-yourpart.png", "Label left with colon, value right.", "Colon removed, value left."),
   ("bom", "2.12 / 2.13 — Guided matching · YOUR PART", "5741:48438", False, "", "Same rows (scan).", "Same as 2.11."),
   ("bom", "Cheat Sheet 1.4 — Part Match Details · Your Part", "6497:60488", True, "crop-bom-cheat-yourpart.png", "Rows with dividers, 12 px.", "show dividers = true; 12 → 14."),
  ],
  "rejected": [("Admin · CFM · Validation passed", "2016:4692", "adm", "Plain sentences in a confirm modal, no label/value styling.")],
  "questions": ["Build this as a Hydra molecule, or add an ❖ Descriptions atom page (Ant Design Descriptions) and use it directly?"],
  "hero": "ps-techspecs.png",
 },
 {
  "slug": "progress-summary", "name": "Progress Summary", "category": "Molecules · Feedback",
  "decision": "new", "priority": "Low", "based": None,
  "purpose": "A slim card that shows how far a long task is: a title, a detail line, a progress bar with a percentage, and an optional link action.",
  "why": "BOM guided matching and SPEC re-analysis draw the same white strip. The benefit is modest (2 modules, few screens), so it comes last.",
  "related": "Progress atom (nested). BOM workspace resume strips are warning Alerts with buttons inside a Collapse (rejected).",
  "rationale": "Reuse: 2 modules, 3 occurrences. Consistency: small. Effort: low.",
  "verified": 2, "estimated": 3, "mods": ["bom", "spec"],
  "layouts": ["default"], "states": ["in progress"],
  "props": [
   ("✏️ title", "Text", "0/10 reviewed", ""),
   ("✏️ detail", "Text", "10 remaining · 0 skipped", ""),
   ("✏️ percent", "Text", "5%", "nested Progress, exposed"),
   ("show action", "Boolean", "false", "link Button “Accept all high matches”"),
  ],
  "tokens": "Fill colorBgContainer; radius borderRadiusLG; padding paddingSM / paddingMD; gap marginSM; detail colorTextDescription.",
  "text": "Title Base/Medium · detail Small/Normal",
  "nested": "Progress, Button (link)",
  "harm": [("Action", "link button (BOM) · none (SPEC)", "show action", "real content difference")],
  "occ": [
   ("bom", "2.11 — Guided matching · Review suggestions", "5707:48333", True, "crop-bom-progress.png", "Canonical. Bar 5 %, action button.", "None."),
   ("bom", "2.12 — Guided matching · No suggestion", "5741:48431", False, "", "Same card at 70 % (scan).", "None."),
   ("spec", "06 — Re-analysis · In progress", "8076:134488", True, "crop-spec-progress.png", "“Re-analysis in progress”, 70 %, no action.", "show action = false."),
  ],
  "rejected": [("BOM 3.2 / 3.3 — Workspace resume strips", "5709:52453", "bom", "Warning Alert + Collapse with Cancel / Continue buttons; BOM only.")],
  "questions": ["Is a molecule worth it for 3 occurrences, or should designers compose Progress + text directly?"],
  "hero": "crop-bom-progress.png",
 },
]

EXISTING = [
 ("Sidebar", "662:10029", "Component, no properties (fixed composition)", "Every module: BOM 57 screens, SPEC 23, Admin CFM 38, KC 18, Content 5, PS 8, RN 2", "Reuse as-is"),
 ("Topbar", "768:62213", "Component; ✏️ Product, ✏️ Desc (text, Hydra naming not applied)", "Every module (RN Admin uses Topbar without Sidebar on 6 screens)", "Reuse as-is"),
 ("OptionCard", "826:1181", "12 variants: layout vertical/horizontal × type action/option × state default/hover/selected/disabled; show icon, ↳ 🎰 icon, show tag, show link, ✏️ link, show radio, show checkbox, ✏️ title, ✏️ description", "BOM 11 screens, SPEC 3 screens (library instances)", "Reuse as-is (open gaps G1–G4 from the 21 Oct report)"),
 ("FeatureCard", "1555:370", "2 variants state default/hover; ✏️ title, ✏️ description; Divider, link Button, image", "Part Search · Category ×6", "Reuse as-is"),
 ("RecommendationCard", "2017:1141", "3 variants State=Rest/Hover/Resolved; no text properties; no description", "0 instances (SPEC uses its local copy)", "Extend → Recommendation Card"),
 ("Empty State Block", "1932:81", "Component; ✏️ title, show description, ✏️ description, show action, show secondary action", "BOM 5, Content 1, Admin CFM 2, KC 4, RN Admin 2 screens", "Reuse as-is"),
 ("Stat Tile", "1992:58", "5 variants tone neutral/success/warning/error/info; ✏️ label, ✏️ value", "BOM 5, SPEC 3 screens", "Reuse as-is"),
]

ORG = [
 "Molecules section has one page per molecule (❖ Sidebar, ❖ Topbar, ❖ Cards, ❖ Empty State Block, ❖ Stat Tile). Empty State Block and Stat Tile follow the Components + Replace in modules section pattern.",
 "❖ Cards: OptionCard sits in a section with a labelled layout × state matrix and has a Replace in modules section. FeatureCard and RecommendationCard are loose on the canvas with no Components section.",
 "❖ Empty State Block: a loose “Frame 1” (1935:314) sits outside the sections.",
 "Set names mix PascalCase (OptionCard, FeatureCard, RecommendationCard) and spaced Title Case (Empty State Block, Stat Tile). Variant names are lower case except RecommendationCard (State=Rest/Hover/Resolved). Topbar text properties lack the ✏️ prefix.",
 "Descriptions: Stat Tile follows the full Hydra format (composition statement, code, properties, Use for / Do not use for). Empty State Block has a short one, OptionCard lacks the “not an Ant Design component” and code lines, RecommendationCard has none.",
 "Token gaps: no colorFillAlter variable (use colorFillQuaternary) and no Base/Strong text style (use Base/Medium). Hydra has no ❖ Upload or ❖ Descriptions page.",
]

REJECTED = [
 ("SPEC “Uploaded file” banner", "spec", "8028:39064", "A status line: use the Alert atom."),
 ("BOM 1.2 “Selected file” panel", "bom", "5289:28546", "Already an Alert atom."),
 ("BOM 1.2 destination radios", "bom", "5289:28546", "Plain Radio atom group."),
 ("Part Search variant selection (PDF / DWG / STEP / Add to BOM)", "ps", "11059:23573", "Table organism with row selection."),
 ("Admin Dashboard KPI and grouped analytics cards", "adm", "2483:68240", "Admin only; Card + Statistic atoms."),
 ("Admin Lead Time Result Summary stats", "adm", "2570:20063", "Alert + centred Statistic cells (Stat Tile says: do not use for centred numbers)."),
 ("Admin RN bulk upload success", "adm", "2218:11585", "Result-style block with Statistic atoms."),
 ("BOM workspace resume strips", "bom", "5709:52453", "Warning Alert + Collapse with actions; BOM only."),
 ("SPEC ConnectED Actions cards (Submittal Package / BOM)", "spec", "8112:21588", "SPEC only; the card contains its own button (different interaction from OptionCard)."),
 ("Release Notes View All module column tiles", "rn", "172:12107", "Navigation."),
 ("Home “Modules” tiles (BOM 9 BOMs …)", "rn", "1:5013", "Only in the Release Notes background home screen; SPEC copies sit in excluded brand-exploration frames."),
 ("Part Summary Card (BOM SKU Match Card, Cheat Sheet ASC equivalents)", "bom", "5741:48203", "Deferred: the selectable card exists only in BOM. Part Search has a static header with the same content, not a card."),
 ("BOM-356 aggregate warnings", "bom", "6705:165", "Alert atom + Table."),
 ("CFM search panel (×30 screens)", "adm", "2009:5338", "Admin-only search toolbar (organizational)."),
 ("SPEC editor toolbar “All changes saved” (×8)", "spec", "8066:124232", "Toolbar."),
 ("“How this flow works” / Doc cards", "spec", "8091:17220", "Design-file documentation utility, not product UI."),
]

COVERAGE = [
 ("Hydra DS", "hydra", "📘 Hydra v6 / AI contract; ❖ Sidebar, ❖ Topbar, ❖ Cards, ❖ Empty State Block, ❖ Stat Tile; Drafts (1 frame, no components)", "Atom pages (out of scope), Cover, Welcome, Colors, Logo, Utility, Changelog, QA, Local Dependencies", "—"),
 ("BOM", "bom", "BOM · Prototype Flows: Local Components, End-to-end flows 1–4, Cheat Sheet, BOM-356 ×2 (≈70 screens scanned, 14 screenshotted)", "🖼️ cover, Draft, 🎨 Random, Legacy BOM/SPEC Request, Change Log", "—"),
 ("SPEC", "spec", "SPEC Flows: Core user flows (Release 1) and 03 Upload new version (marked NOT FOR RELEASE 1) (≈30 screens scanned, 9 screenshotted)", "Category tags and usage (documentation guide), COMPARISON REBRANDING and RSFC brand frames (exploration), Draft, Change Log, cover. “V1 proposal – Recommended parts” scanned only", "—"),
 ("Content", "ct", "Content – Prototype flows: 01 Content download history (10 frames scanned, 1 screenshotted)", "🖼️ cover, Change Log, Drafts", "—"),
 ("Part Search", "ps", "Part Search – Prototype flows: 01 Part listing + Category page (9 frames scanned, 3 screenshotted)", "🖼️ cover, Drafts", "—"),
 ("Admin", "adm", "Content File Manager (UATL-367, CON-231, Lead Time Import, Dashboard), Release Notes Manager (RN – ADMIN), Knowledge Center (3 sections) (≈70 frames scanned, 9 screenshotted)", "ADMIN FLOWS (empty page), Cover, “--”, Change Log, Draft", "—"),
 ("Release Notes", "rn", "Flow: Release Notes Flow (4 frames scanned, 2 screenshotted)", "Cover, “--”", "—"),
]

QUESTIONS = [
 "File Upload Dropzone: Hydra molecule, or first an ❖ Upload atom page (Ant Design Upload.Dragger)?",
 "File Upload Dropzone: adopt the progress bar everywhere and drop the spinner-only uploading state?",
 "Recommendation Card: keep the name or rename it generically now that Release Notes uses it; tag above or inline?",
 "Recommendation Card: approve renaming State=Rest/Hover/Resolved to state=default/hover/resolved (0 instances affected)?",
 "Choice List Row: is the “Select all” header a row variant or part of the list wrapper?",
 "Attribute List: Hydra molecule or an ❖ Descriptions atom page?",
 "Outcome Summary: keep both stacked and inline layouts?",
 "Progress Summary: worth a molecule for 3 occurrences?",
 "Content and Part Search share an identical “Add to package” modal: plan a template later?",
 "Library tidy-up during BUILD: move FeatureCard and RecommendationCard into Components sections and remove the loose Frame 1 on ❖ Empty State Block?",
 "Are there other ConnectED module files (for example SeisBrace, Submittal Manager, Revit Plug-in) to include? The MCP cannot list team files.",
]

ORDER = [
 "1. File Upload Dropzone (new) — highest reach; decide question 1 first.",
 "2. Selection Summary (new) — smallest build, quick win.",
 "3. Recommendation Card (extend 2017:1141) — then swap the SPEC local set (4 screens) and the Release Notes cards.",
 "4. Choice List Row (new) — together with Selection Summary it covers the Content / Part Search “Add to package” modal.",
 "5. Outcome Summary (new) — nests the existing Stat Tile.",
 "6. Attribute List (new or Descriptions atom) — after question 6.",
 "7. Progress Summary (new) — optional.",
 "Replace in modules after each publish, in module order BOM, SPEC, Content, Part Search, Admin, Release Notes.",
]

# ---------------------------------------------------------------- templates
CSS = (HERE / "base.css").read_text() + """
.dec-ext{background:var(--warn-soft);color:var(--warn)}.dec-reuse{background:var(--ok-soft);color:var(--ok)}
.pri{font-size:12px;font-weight:700;padding:2px 8px;border-radius:6px}.pri-High{background:var(--bom-s);color:var(--bom)}.pri-Medium{background:var(--spec-s);color:var(--spec)}.pri-Low{background:var(--surface2);color:var(--ink2)}
.status{display:inline-block;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;background:var(--warn-soft);color:var(--warn);margin-top:6px}
.occ{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-top:12px}
.oc{border:1px solid var(--line);border-radius:12px;padding:14px;background:var(--surface)}
.oc .im{background:var(--surface2);border-radius:8px;min-height:80px;display:grid;place-items:center;padding:8px;margin-bottom:10px}
.oc .im img{max-width:100%;max-height:240px;border-radius:4px}
.oc .noimg{font-size:13px;color:var(--muted);padding:18px;text-align:center}
.oc h4{margin:6px 0 4px;font-size:15px}.oc p{margin:4px 0;font-size:13.5px;color:var(--ink2)}
.matrix{display:flex;flex-wrap:wrap;gap:6px}.matrix span{background:var(--surface2);border-radius:6px;padding:3px 8px;font-size:13px}
details{margin-top:14px}summary{cursor:pointer;font-weight:600;color:var(--ink2)}
pre{white-space:pre-wrap;background:var(--surface2);padding:12px;border-radius:8px;font-size:12.5px;overflow-x:auto}
button.copy{font:inherit;font-size:12px;padding:4px 10px;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer;margin-top:6px}
ul.plain{padding-left:18px;margin:6px 0}ul.plain li{margin:4px 0}
img{max-width:100%;height:auto}
@media (max-width:640px){h1{font-size:26px}.hero{grid-template-columns:1fr}.mol{padding:16px}.card{padding:16px}td,th{padding:8px 6px}}
"""
COPYJS = "<script>document.querySelectorAll('button.copy').forEach(b=>b.onclick=()=>{navigator.clipboard.writeText(b.previousElementSibling.textContent);b.textContent='Copied';setTimeout(()=>b.textContent='Copy Markdown',1500)})</script>"


def page(title, eyebrow, h1, lede, stats, toc, body):
    st = "".join(f'<div class="stat"><b>{e(a)}</b><span>{e(b)}</span></div>' for a, b in stats)
    tc = "".join(f'<a href="#{a}">{e(b)}</a>' for a, b in toc)
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)}</title><style>{CSS}</style></head><body>
<header class="top"><div class="wrap"><div class="eyebrow">{eyebrow}</div><h1>{e(h1)}</h1><p class="lede">{lede}</p><div class="status">Partial – awaiting approval</div><div class="stats">{st}</div></div></header>
<nav class="toc"><div class="wrap">{tc}</div></nav><main><div class="wrap">{body}</div></main>{COPYJS}</body></html>"""


def dec(d):
    cls = {"new": "dec-new", "extend": "dec-ext", "reuse": "dec-reuse"}[d]
    return f'<span class="dec {cls}">{ {"new": "New", "extend": "Extend", "reuse": "Reuse"}[d] }</span>'


def fam_status(f):
    return "Plan – awaiting approval" if all(o[3] for o in f["occ"]) else "Partial – awaiting approval"


def occ_cards(f):
    out = []
    for m, scr, node, ver, im, what, diff in f["occ"]:
        pic = img(im, scr) if im else '<div class="noimg">Not screenshotted today (structure read from the node)</div>'
        out.append(f'<div class="oc"><div class="im">{pic}</div>{chip(m)} {badge(ver)}<h4>{e(scr)}</h4><p>{e(what)}</p><p><span class="lbl">What changes:</span>{e(diff)}</p><p><a href="{link(m, node)}">Open in Figma → {e(node)}</a></p></div>')
    return '<div class="occ">' + "".join(out) + "</div>"


def tbl(head, rows):
    h = "".join(f"<th>{e(x)}</th>" for x in head)
    r = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in row) + "</tr>" for row in rows)
    return f'<div class="tblwrap"><table><thead><tr>{h}</tr></thead><tbody>{r}</tbody></table></div>'


def based_html(f):
    if not f["based"]:
        return "none"
    n, node = f["based"]
    return f'<a href="{link("hydra", node)}">{e(n)} ({e(node)}) →</a>'


def md_block(f):
    lines = [f"**Molecule:** {f['name']}", f"**Purpose:** {f['purpose']}", f"**Decision:** {f['decision']}", f"**Why:** {f['why']}",
             f"**Existing Hydra molecule:** {f['based'][0] + ' ' + link('hydra', f['based'][1]) if f['based'] else 'none'}",
             f"**Related molecules:** {f['related']}", f"**Destination:** Hydra DS · {f['category']}",
             f"**Reach:** {', '.join(MODNAME[m] for m in f['mods'])} · verified {f['verified']} / estimated {f['estimated']}", "",
             "| Module | Screen / frame | Node link | Verified / Inferred | What differs |", "|---|---|---|---|---|"]
    for m, scr, node, ver, im, what, diff in f["occ"]:
        lines.append(f"| {MODNAME[m]} | {scr} | {link(m, node)} | {'Verified' if ver else 'Inferred'} | {diff} |")
    lines += ["", "**Harmonization:**"] + [f"- {a}: {b} → {c} ({d})" for a, b, c, d in f["harm"]]
    return "\n".join(lines)


def family_report(f, i):
    props = tbl(["Property", "Type", "Values / default", "Notes"], [[e(a), e(b), e(c), e(d)] for a, b, c, d in f["props"]])
    harm = tbl(["Element", "Values seen (modules)", "Chosen", "Why"], [[e(a), e(b), e(c), e(d)] for a, b, c, d in f["harm"]])
    rej = "".join(f'<li>{chip(m)} {e(t)} — {e(r)} <a href="{link(m, n)}">{e(n)} →</a></li>' for t, n, m, r in f["rejected"]) or "<li>None.</li>"
    qs = "".join(f"<li>{e(q)}</li>" for q in f["questions"])
    matrix = "".join(f"<span>{e(l)} × {e(s)}</span>" for l in f["layouts"] for s in f["states"])
    replace = tbl(["Card label (Replace in modules)", "Configuration", "Link"],
                  [[e(f"{MODNAME[m]} · {scr} →"), e(diff), f'<a href="{link(m, n)}">{e(n)}</a>'] for m, scr, n, ver, im, what, diff in f["occ"]])
    body = f"""
<section class="card" id="decision"><h2>Decision</h2><p>{dec(f['decision'])}<span class="pri pri-{f['priority']}">{f['priority']} priority</span> <span class="reach">{f['category']}</span></p>
<div class="kv"><span class="k">Why</span><p>{e(f['why'])}</p></div><div class="kv"><span class="k">Based on</span><p>{based_html(f)}</p></div>
<div class="kv"><span class="k">Related</span><p>{e(f['related'])}</p></div><div class="kv"><span class="k">Priority rationale</span><p>{e(f['rationale'])}</p></div>
<figure class="canon"><div class="canon-img">{img(f['hero'], f['name'])}</div><figcaption>Canonical sample</figcaption></figure></section>
<section class="card" id="component"><h2>Proposed component</h2><div class="kv"><span class="k">Matrix (layout × state)</span><div class="matrix">{matrix}</div></div>{props}
<div class="kv" style="margin-top:14px"><span class="k">Tokens</span><p>{e(f['tokens'])}</p></div><div class="kv"><span class="k">Text styles</span><p>{e(f['text'])}</p></div><div class="kv"><span class="k">Nested atoms (exposed)</span><p>{e(f['nested'])}</p></div></section>
<section class="card" id="harm"><h2>Harmonization</h2>{harm}</section>
<section class="card" id="where"><h2>Where it appears ({f['verified']} verified, {f['estimated']} estimated)</h2>{occ_cards(f)}</section>
<section class="card" id="replace"><h2>Proposed “Replace in modules” mapping</h2><p>One card per occurrence: an instance configured with properties and one link. Instance-slot elements link to the screen.</p>{replace}</section>
<section class="card" id="rejected"><h2>Rejected candidates</h2><ul class="plain">{rej}</ul></section>
<section class="card" id="questions"><h2>Open questions</h2><ul class="plain">{qs}</ul></section>
<section class="card"><p>Read-only plan from {DATE}. Nothing was written to Figma. Back to the <a href="index.html">molecule index</a>.</p></section>"""
    html_ = page(f"{f['name']} · Hydra molecule plan", f"Hydra design system · Molecule plan · {DATE}", f["name"], e(f["purpose"]),
                 [(f["verified"], "verified occurrences"), (f["estimated"], "estimated occurrences"), (len(f["mods"]), "modules"), (fam_status(f).split(" –")[0], "status")],
                 [("decision", "Decision"), ("component", "Component"), ("harm", "Harmonization"), ("where", "Where it appears"), ("replace", "Replace in modules"), ("rejected", "Rejected"), ("questions", "Open questions")], body)
    html_ = html_.replace('<div class="status">Partial – awaiting approval</div>', f'<div class="status">{fam_status(f)}</div>')
    (OUT / f"{f['slug']}.html").write_text(html_)


def index():
    rows = []
    for i, f in enumerate(FAM, 1):
        rows.append([str(i), f'<a href="{f["slug"]}.html">{e(f["name"])}</a>', e(f["category"]), dec(f["decision"]), based_html(f),
                     f'<b>{f["verified"]}</b>', str(f["estimated"]), "".join(chip(m) for m in f["mods"]), f'<span class="pri pri-{f["priority"]}">{f["priority"]}</span>'])
    short = tbl(["#", "Molecule", "Category", "Decision", "Based on", "Verified", "Estimated", "Modules", "Priority"], rows)
    blocks = []
    for i, f in enumerate(FAM, 1):
        blocks.append(f"""<section class="mol" id="{f['slug']}"><div class="molhead"><div class="num">{i}</div><div><h2>{e(f['name'])}</h2><p class="purpose">{e(f['purpose'])}</p>
{dec(f['decision'])}<span class="pri pri-{f['priority']}">{f['priority']}</span> <span class="reach">{f['verified']} verified · {f['estimated']} estimated</span>{''.join(chip(m) for m in f['mods'])}</div></div>
<div class="hero"><figure class="canon"><div class="canon-img">{img(f['hero'], f['name'])}</div><figcaption>Canonical sample</figcaption></figure>
<div><div class="kv"><span class="k">Why</span><p>{e(f['why'])}</p></div><div class="kv"><span class="k">Rationale</span><p>{e(f['rationale'])}</p></div><div class="kv"><span class="k">Report</span><p><a href="{f['slug']}.html">Full plan ({fam_status(f)}) →</a></p></div></div></div>
<details><summary>Markdown copy</summary><pre>{e(md_block(f))}</pre><button class="copy">Copy Markdown</button></details></section>""")
    ex = tbl(["Molecule", "Node", "Properties / variants (verified 28 Oct)", "Used in modules", "Recommendation"],
             [[e(a), f'<a href="{link("hydra", b)}">{e(b)}</a>', e(c), e(d), e(r)] for a, b, c, d, r in EXISTING])
    org = "".join(f"<li>{e(x)}</li>" for x in ORG)
    rej = tbl(["Pattern", "Module", "Node", "Reason"], [[e(a), chip(m), f'<a href="{link(m, n)}">{e(n)}</a>', e(r)] for a, m, n, r in REJECTED])
    cov = tbl(["File", "Reviewed", "Excluded (reason)", "Blocked"], [[f'<a href="https://www.figma.com/design/{FILES[k][0]}/{FILES[k][1]}">{e(a)}</a>', e(b), e(c), e(d)] for a, k, b, c, d in COVERAGE])
    qs = "".join(f"<li>{e(q)}</li>" for q in QUESTIONS)
    order = "".join(f"<li>{e(o)}</li>" for o in ORDER)
    body = f"""
<section class="card" id="summary"><h2>Ranked shortlist</h2><p>Verified = seen in a screenshot today. Estimated = verified + inferred (same structure in the read-only scan, not screenshotted). Nothing was written to Figma.</p>{short}</section>
{''.join(blocks)}
<section class="card" id="existing"><h2>Existing Hydra molecules</h2>{ex}<h3>Library organization findings</h3><ul class="plain">{org}</ul>
<p>Earlier reports: <a href="option-card.html">Option Card</a> · <a href="empty-state-block.html">Empty State Block</a> · <a href="stat-tile.html">Stat Tile</a>.</p></section>
<section class="card" id="order"><h2>Suggested order</h2><ul class="plain">{order}</ul></section>
<section class="card" id="rejected"><h2>Rejected and deferred</h2>{rej}</section>
<section class="card" id="questions"><h2>Open questions</h2><ul class="plain">{qs}</ul></section>
<section class="card" id="coverage"><h2>Coverage</h2>{cov}
<ul class="plain"><li>All 7 files opened with a Full seat (whoami: Milos Dostanic). No access errors.</li>
<li>Every frame on the reviewed pages was read with read-only structure scans (Hydra instance counts, local components, text patterns, card signatures); about 190 screen frames in total. 35 screenshots were taken of representative screens and nodes; the rest is labelled Inferred.</li>
<li>Discovery gap: get_libraries lists only the Hydra library on these files, and the MCP cannot list team projects. Other ConnectED files may exist and were not reviewed.</li>
<li>Archived work skipped: Draft / Drafts pages, Random, Legacy, Change Log pages, exploration and rebranding frames.</li>
<li>Tools: Official Figma MCP (create_session, whoami, use_figma read-only, get_screenshot, get_libraries).</li></ul></section>"""
    total_v = sum(f["verified"] for f in FAM); total_e = sum(f["estimated"] for f in FAM)
    h = page("Hydra Molecules · audit and plan", f"Hydra design system · Molecules · {DATE}", "Molecule candidates across ConnectED modules",
             "A read-only audit of the Hydra library and six module files. It re-checks the built molecules and ranks the next molecules to build. Nothing was changed in Figma.",
             [(len(FAM), "molecules proposed (6 new, 1 extend)"), (total_v, "verified occurrences"), (total_e, "estimated occurrences"), (7, "existing molecules re-checked"), (7, "files opened")],
             [("summary", "Shortlist")] + [(f["slug"], f["name"]) for f in FAM] + [("existing", "Existing"), ("order", "Order"), ("rejected", "Rejected"), ("questions", "Questions"), ("coverage", "Coverage")], body)
    (OUT / "index.html").write_text(h)


if __name__ == "__main__":
    for i, f in enumerate(FAM, 1):
        family_report(f, i)
    index()
    (HERE / "ledger.json").write_text(json.dumps({"date": "2026-10-28", "mode": "PLAN (read-only)", "figma_writes": 0,
        "families": [{k: f[k] for k in ("slug", "name", "decision", "priority", "verified", "estimated", "mods")} for f in FAM],
        "occurrences": {f["slug"]: [{"module": o[0], "screen": o[1], "node": o[2], "verified": o[3]} for o in f["occ"]] for f in FAM},
        "missing_since_20_oct": ["BOM 5546:188176 (local Export Format Card, replaced by OptionCard)", "BOM 5574:297524, 5585:299533, 5913:14446 (Stat Tile rows replaced)", "SPEC 8112:21546, 8230:83441, 8429:11676, 8231:83826 (no longer exist; the screens now use OptionCard and Stat Tile library instances)"],
        "notes": "All files done. Screenshots in img/. Regenerate with python3 gen.py."}, indent=1))
    print("ok", [f["slug"] for f in FAM])
