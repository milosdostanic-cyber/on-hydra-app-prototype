import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, 'shots2');
mkdirSync(shots, { recursive: true });

const BASE = 'http://localhost:5174';

// [name, path, scenarioId|null]
const targets = process.argv.slice(2).length
  ? JSON.parse(process.argv[2])
  : [
      ['guide-specs', '/spec/guide-specs', null],
      ['submittals', '/spec/spec-clean-22/submittals', null],
      ['deliver-back', '/spec/spec-clean-22/deliver-back', null],
      ['ask-full', '/spec/spec-clean-22/ask', null],
      ['project-detail', '/spec/projects/1', null],
      ['processing-large', '/spec/spec-large-manual/processing', 'large-project-manual'],
      ['failed', '/spec/spec-failed-1/processing', 'failed-processing'],
      ['empty-home', '/spec', 'empty-project-first-onboarding'],
      ['prop23-analyze', '/spec/spec-prop-23/analyze', 'proprietary-division-23'],
      ['scan21-analyze', '/spec/spec-scan-21/analyze', 'scanned-division-21'],
      ['nofit-products', '/spec/spec-nofit-22/products', 'no-asc-fit'],
    ];

const browser = await chromium.launch();

for (const [name, path, scenario] of targets) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 2100 } });
  await context.addInitScript((sc) => {
    localStorage.setItem('hydra-spec-demo', '1');
    if (sc) localStorage.setItem('hydra-spec-mock-v1', JSON.stringify({ scenarioId: sc, role: 'editor', delayMs: 200 }));
    else localStorage.removeItem('hydra-spec-mock-v1');
  }, scenario);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(shots, `${name}.png`) });
  const t = await page.evaluate(() => (document.querySelector('main')?.innerText || '').replace(/\s+/g, ' ').slice(0, 700));
  console.log(`\n=== ${name} ${path} -> ${page.url().replace(BASE, '')}`);
  if (errors.length) console.log('PAGEERR:', errors.join(' || '));
  console.log(t);
  await context.close();
}

await browser.close();
