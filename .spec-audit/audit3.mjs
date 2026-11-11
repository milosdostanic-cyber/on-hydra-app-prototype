import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, 'shots3');
mkdirSync(shots, { recursive: true });
const BASE = 'http://localhost:5174';

// [name, scenarioLabel, path]
const targets = [
  ['prop23-analyze', 'Proprietary Division 23', '/spec/spec-prop-23/analyze'],
  ['scan21-analyze', 'Scanned Division 21', '/spec/spec-scan-21/analyze'],
  ['large-processing', 'Large project manual', '/spec/spec-large-manual/processing'],
  ['failed-processing', 'Failed processing', '/spec/spec-failed-1/processing'],
  ['nofit-products', 'No ASC fit', '/spec/spec-nofit-22/products'],
  ['nofit-substitution', 'No ASC fit', '/spec/spec-nofit-22/substitution'],
  ['restricted-deliver', 'Restricted external reviewer', '/spec/spec-clean-22/deliver-back'],
  ['contradict-analyze', 'Contradictory requirements', '/spec/spec-contradict/analyze'],
  ['addendum-review', 'Addendum review', '/spec/spec-addendum-22/review'],
];

const browser = await chromium.launch();

for (const [name, scenarioLabel, path] of targets) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 2100 } });
  await context.addInitScript(() => {
    localStorage.setItem('hydra-spec-demo', '1');
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(BASE + '/spec', { waitUntil: 'networkidle' });

  // open demo drawer and pick scenario
  await page.locator('.ant-float-btn').click();
  await page.waitForTimeout(400);
  const scenarioSelect = page.locator('.ant-drawer .ant-select').first();
  await scenarioSelect.click();
  await page.waitForTimeout(300);
  const opt = page.locator(`.ant-select-item-option[title="${scenarioLabel}"]`);
  await opt.scrollIntoViewIfNeeded();
  await opt.click();
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(shots, `${name}.png`) });
  const t = await page.evaluate(() => (document.querySelector('main')?.innerText || '').replace(/\s+/g, ' ').slice(0, 800));
  console.log(`\n=== ${name} [${scenarioLabel}] ${path} -> ${page.url().replace(BASE, '')}`);
  if (errors.length) console.log('PAGEERR:', errors.join(' || '));
  console.log(t);
  await context.close();
}

await browser.close();
