import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4173';
const OUT = 'scripts/spec-audit/shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`);
});

await page.goto(`${BASE}/spec`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/home-facets.png`, fullPage: true });

const facetTexts = await page.locator('.ant-select-selection-item').allInnerTexts();
console.log('FACETS:', facetTexts);

const saved = page.getByRole('button', { name: /Saved searches/i });
console.log('SAVED SEARCH BUTTON:', await saved.count());
if (await saved.count()) {
  await saved.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/home-saved-searches.png` });
  await page.getByText('Division 22 — Plumbing', { exact: true }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/home-filtered.png`, fullPage: true });
}

console.log('CONSOLE:', errors.slice(0, 15));
await browser.close();
