import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = 'scripts/spec-audit/live/variation-action-level';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`${m.type()}: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

const shot = async (name) => {
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`  shot: ${name}`);
};

const dialog = () => page.locator('.ant-modal-container:visible').last();
const tableRows = () => dialog().locator('.ant-table-tbody tr.ant-table-row');
const selectedCountLabel = () => dialog().getByText(/\d+ of \d+ selected/);

const dismissToasts = async () => {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
};

const pickProjectIfGated = async () => {
  const useProject = dialog().getByRole('button', { name: /Use this project/i });
  if (await useProject.count()) {
    await useProject.click();
    await page.waitForTimeout(500);
  }
};

await page.goto(`${BASE}/search/parts/p-100`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(700);

console.log('\n[rail] PART ACTIONS');
for (const label of [
  'Add Part Variants to BOM',
  'Add Part to Submittal Package',
  'Add Revit File to Downloads',
  'Add PDF File to Downloads',
  'Add DWG File to Downloads',
  'Add STEP File to Downloads',
]) {
  const btn = page.getByRole('button', { name: label });
  console.log(`  "${label}" enabled:`, await btn.isEnabled());
}
console.log(
  '  master picker present:',
  (await page.getByRole('button', { name: /^(Select|Change) variation$/ }).count()) > 0,
);
await shot('01-rail');

// ---- 13. Bulk Revit is variant-level ---------------------------------------
console.log('\n[13] REVIT / RFA VARIANT PICKER');
await page.getByRole('button', { name: 'Add Revit File to Downloads' }).click();
await page.waitForTimeout(500);
await pickProjectIfGated();
console.log('  picker title:', await dialog().locator('.ant-modal-title').innerText());
console.log('  variation rows:', await tableRows().count());
await shot('13-revit-picker');
await dialog().getByRole('button', { name: 'Cancel' }).click();
await page.waitForTimeout(300);

// ---- 1. Select 8 in download picker → BOM pre-checked ----------------------
console.log('\n[1] SELECTION CARRIES PDF → BOM');
await page.getByRole('button', { name: 'Add PDF File to Downloads' }).click();
await page.waitForTimeout(400);
await pickProjectIfGated();
for (let i = 0; i < 8; i += 1) {
  await tableRows().nth(i).locator('.ant-checkbox').click();
}
await page.waitForTimeout(200);
console.log('  pdf selected label:', await selectedCountLabel().innerText());
await shot('04-pdf-eight-selected');
await dialog().locator('.ant-btn-primary').last().click();
await page.waitForTimeout(700);
console.log('  toast:', await page.locator('.ant-message-notice-content').first().innerText());

await page.getByRole('button', { name: 'Add Part Variants to BOM' }).click();
await page.waitForTimeout(500);
console.log('  bom selected label:', await selectedCountLabel().innerText());
const bomChecked = await dialog().locator('.ant-table-tbody .ant-checkbox-wrapper-checked').count();
console.log('  bom checked rows:', bomChecked);
await shot('01-bom-prechecked');
await dialog().getByRole('button', { name: 'Cancel' }).click();
await page.waitForTimeout(300);

// ---- 8. After STEP exclusion, BOM still has all 8 --------------------------
console.log('\n[7+8] STEP FILTER VS PERSISTED SELECTION');
await page.getByRole('button', { name: 'Add STEP File to Downloads' }).click();
await page.waitForTimeout(500);
const stepRows = await tableRows().count();
const stepAlert = dialog().locator('.ant-alert-info');
console.log('  step rows listed:', stepRows);
console.log('  exclusion alert:', (await stepAlert.count()) > 0 ? await stepAlert.innerText() : 'none');
await shot('07-step-filtered');
if (stepRows > 0) {
  await dialog().locator('.ant-btn-primary').last().click();
  await page.waitForTimeout(700);
} else {
  await dialog().getByRole('button', { name: 'Cancel' }).click();
}

await page.getByRole('button', { name: 'Add Part Variants to BOM' }).click();
await page.waitForTimeout(500);
console.log('  bom after step label:', await selectedCountLabel().innerText());
await shot('08-bom-still-eight');
await dialog().getByRole('button', { name: 'Cancel' }).click();
await page.waitForTimeout(300);

// ---- 5/6 Search filters visible rows ---------------------------------------
console.log('\n[5+6] SEARCH FILTER');
await page.getByRole('button', { name: 'Add PDF File to Downloads' }).click();
await page.waitForTimeout(400);
await dialog().getByPlaceholder(/Search by SKU/i).fill('1/2');
await page.waitForTimeout(400);
const matching = await tableRows().count();
console.log('  matching rows for 1/2:', matching);
console.log('  search input:', await dialog().getByPlaceholder(/Search by SKU/i).inputValue());
if (matching === 0) {
  throw new Error('expected 1/2 search to return rows');
}
await tableRows().first().locator('.ant-checkbox').click();
await page.waitForTimeout(200);
console.log('  after single filtered select:', await selectedCountLabel().innerText());
await shot('05-search-filter');
await dialog().getByRole('button', { name: 'Cancel' }).click();
await page.waitForTimeout(300);

// ---- 9. DWG has zero eligible on p-100 --------------------------------------
console.log('\n[9] ZERO-ELIGIBLE FORMAT');
const dwg = page.getByRole('button', { name: 'Add DWG File to Downloads' });
console.log('  DWG enabled (expect false):', await dwg.isEnabled());
await dwg.hover();
await page.waitForTimeout(400);
console.log(
  '  DWG tooltip:',
  await page.locator('.ant-tooltip:visible').last().innerText().catch(() => 'none'),
);
await shot('09-dwg-disabled');

// ---- 10. BOM partial duplicates: add 2, then add 6 including those 2 --------
console.log('\n[10] BOM PARTIAL FAILURE');
await page.getByRole('button', { name: 'Add Part Variants to BOM' }).click();
await page.waitForTimeout(500);
while ((await dialog().locator('.ant-table-row-selected .ant-checkbox').count()) > 0) {
  await dialog().locator('.ant-table-row-selected .ant-checkbox').first().click();
  await page.waitForTimeout(100);
}
await tableRows().nth(0).locator('.ant-checkbox').click();
await tableRows().nth(1).locator('.ant-checkbox').click();
await dialog().locator('.ant-btn-primary').last().click();
await page.waitForTimeout(900);
console.log('  first add toast:', await page.locator('.ant-message-notice-content').first().innerText());

await page.getByRole('button', { name: 'Add Part Variants to BOM' }).click();
await page.waitForTimeout(500);
for (let i = 0; i < 6; i += 1) {
  const box = tableRows().nth(i).locator('.ant-checkbox');
  const checked = await tableRows().nth(i).locator('.ant-checkbox-wrapper-checked').count();
  if (!checked) await box.click();
}
console.log('  second add selected:', await selectedCountLabel().innerText());
await dialog().locator('.ant-btn-primary').last().click();
await page.waitForTimeout(900);
console.log('  partial toast:', await page.locator('.ant-message-notice-content').last().innerText());
await shot('10-bom-duplicates');

// ---- 14. History entries are per-variant -----------------------------------
console.log('\n[14] DOWNLOAD HISTORY ATTRIBUTION');
const history = await page.evaluate(() => {
  try {
    return JSON.parse(sessionStorage.getItem('hydra-download-history') || '[]');
  } catch {
    return [];
  }
});
const withVariant = history.filter((e) => e.variationKey && e.partKey === 'p-100');
const uniqueSkus = new Set(withVariant.map((e) => e.sku));
console.log('  p-100 history with variationKey:', withVariant.length);
console.log('  unique SKUs:', uniqueSkus.size);
console.log(
  '  batch anonymous rows:',
  history.filter((e) => e.partKey === 'p-100' && !e.variationKey && !e.sku).length,
);

// ---- 2. Leave and return clears selection ----------------------------------
console.log('\n[2] LEAVE AND RETURN');
await page.goto(`${BASE}/search`, { waitUntil: 'domcontentloaded' });
await page.goto(`${BASE}/search/parts/p-100`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);
console.log(
  '  strip visible after return (expect false):',
  (await page.getByText(/variations selected/i).count()) > 0,
);
await shot('02-returned-empty');

// ---- 3/4. Navigate between parts; single-variant auto-select ----------------
console.log('\n[3+4] PART SWITCH + SINGLE VARIANT');
await page.goto(`${BASE}/search/parts/p-200`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);
console.log(
  '  p-200 strip (hidden for single variant):',
  (await page.getByText(/variations selected/i).count()) > 0,
);
console.log('  p-200 one-SKU copy:', (await page.getByText(/one SKU/i).count()) > 0);
await page.getByRole('button', { name: 'Add PDF File to Downloads' }).click();
await page.waitForTimeout(400);
await pickProjectIfGated();
await page.waitForTimeout(500);
console.log(
  '  p-200 download picker open (expect 0):',
  await page.locator('.ant-modal-container:visible').count(),
);
console.log(
  '  p-200 queued toast:',
  await page.locator('.ant-message-notice-content').last().innerText().catch(() => 'none'),
);
await page.getByRole('button', { name: 'Add Part Variants to BOM' }).click();
await page.waitForTimeout(400);
console.log(
  '  p-200 BOM one-SKU note:',
  await dialog().getByText(/This figure has one SKU/i).innerText(),
);
await shot('04-single-variant');
await dialog().getByRole('button', { name: 'Cancel' }).click();

await page.goto(`${BASE}/search/parts/p-100`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);
console.log(
  '  p-100 strip after p-200 (expect false):',
  (await page.getByText(/variations selected/i).count()) > 0,
);

// ---- 12. Format policy seam in source --------------------------------------
console.log('\n[12] isFigureLevelFileFormat SEAM');
const actionsSrc = readFileSync('src/search/components/ActionsPanel.tsx', 'utf8');
const flowSrc = readFileSync('src/search/useVariantActionFlows.tsx', 'utf8');
const policySrc = readFileSync('src/search/partFileFormats.ts', 'utf8');
console.log('  ActionsPanel consults isFigureLevelFileFormat:', actionsSrc.includes('isFigureLevelFileFormat'));
console.log('  flows consult isFigureLevelFileFormat:', flowSrc.includes('isFigureLevelFileFormat'));
console.log(
  '  FIGURE_LEVEL_FORMATS empty:',
  /const FIGURE_LEVEL_FORMATS: readonly PartFileFormat\[\] = \[\]/.test(policySrc),
);

// ---- 15. Same UnifiedPartDetailPage host -----------------------------------
console.log('\n[15] HOST CONSISTENCY');
const pageSrc = readFileSync('src/search/UnifiedPartDetailPage.tsx', 'utf8');
console.log('  unified page owns selection:', pageSrc.includes('selectedVariantKeys'));

console.log('\nCONSOLE ERRORS:', errors.length ? errors.slice(0, 10) : 'none');
await browser.close();
