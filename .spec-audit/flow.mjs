import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, 'flow');
mkdirSync(shots, { recursive: true });
const BASE = 'http://localhost:5174';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 2100 } });
await context.addInitScript(() => localStorage.setItem('hydra-spec-demo', '1'));
const page = await context.newPage();
const log = (...a) => console.log(...a);

// 1. Products -> add to substitution
await page.goto(`${BASE}/spec/spec-clean-22/products`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Add to substitution' }).first().click();
await page.waitForTimeout(800);
log('after add-to-substitution:', (await page.locator('.ant-message').innerText().catch(() => '(no message)')).trim());

// 2. Substitution page
await page.goto(`${BASE}/spec/spec-clean-22/substitution`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: join(shots, 'substitution-populated.png') });
log('\nSUBSTITUTION:\n', (await page.locator('main').innerText()).replace(/\s+/g, ' ').slice(0, 1400));

// 3. Home search behaviour
await page.goto(`${BASE}/spec`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const searchBox = page.locator('main input[type="search"], main .ant-input').first();
await searchBox.fill('zzzz-no-match');
await page.getByRole('button', { name: 'Search' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: join(shots, 'home-no-results.png') });
log('\nHOME no-results:\n', (await page.locator('main').innerText()).replace(/\s+/g, ' ').slice(0, 500));

// 4. Analyze -> requirement -> correction drawer
await page.goto(`${BASE}/spec/spec-scan-21/analyze`, { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(600);
await page.goto(`${BASE}/spec/spec-clean-22/analyze`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.getByRole('tab', { name: /Requirements/ }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: join(shots, 'analyze-requirements.png') });
log('\nREQ TAB btns:', (await page.locator('main button').allInnerTexts()).filter(Boolean).slice(0, 20).join(' | '));

const correct = page.getByRole('button', { name: /Correct/ }).first();
if (await correct.count()) {
  await correct.click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: join(shots, 'correction-drawer.png') });
  log('\nCORRECTION DRAWER:\n', (await page.locator('.ant-drawer').innerText().catch(() => '(none)')).replace(/\s+/g, ' ').slice(0, 600));
} else {
  log('\nNO "Correct" button found on Requirements tab');
}

// 5. Review page — look for export
await page.goto(`${BASE}/spec/spec-clean-22/review`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
log('\nREVIEW btns:', (await page.locator('main button').allInnerTexts()).filter(Boolean).map((s) => s.replace(/\s+/g, ' ')).slice(0, 20).join(' | '));

await browser.close();
