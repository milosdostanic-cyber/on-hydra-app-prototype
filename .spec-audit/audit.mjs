import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, 'shots');
mkdirSync(shots, { recursive: true });

const BASE = 'http://localhost:5174';
const DOC = 'spec-clean-22';

const routes = [
  ['home', '/spec'],
  ['add-document', '/spec/new'],
  ['guide-specs', '/spec/guide-specs'],
  ['project-detail', '/spec/projects/1'],
  ['project-add', '/spec/projects/1/new'],
  ['processing', `/spec/${DOC}/processing`],
  ['analyze', `/spec/${DOC}/analyze`],
  ['edit', `/spec/${DOC}/edit`],
  ['review', `/spec/${DOC}/review`],
  ['products', `/spec/${DOC}/products`],
  ['submittals', `/spec/${DOC}/submittals`],
  ['substitution', `/spec/${DOC}/substitution`],
  ['ask', `/spec/${DOC}/ask`],
  ['deliver-back', `/spec/${DOC}/deliver-back`],
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.addInitScript(() => {
  localStorage.setItem('hydra-spec-demo', '1');
});

const report = [];

for (const [name, path] of routes) {
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text().slice(0, 300));
  });
  page.on('pageerror', (e) => errors.push(`PAGEERROR ${String(e).slice(0, 300)}`));

  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const info = await page.evaluate(() => {
    const main = document.querySelector('main') ?? document.body;
    const text = (main.innerText || '').replace(/\s+/g, ' ').trim();
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5')].map((h) => h.textContent?.trim()).filter(Boolean);
    const buttons = [...document.querySelectorAll('button')]
      .map((b) => ({ label: (b.innerText || b.getAttribute('aria-label') || '').trim(), disabled: b.disabled }))
      .filter((b) => b.label);
    const tabs = [...document.querySelectorAll('.ant-tabs-tab')].map((t) => t.textContent?.trim());
    const alerts = [...document.querySelectorAll('.ant-alert')].map((a) => a.textContent?.trim().slice(0, 160));
    const empties = [...document.querySelectorAll('.ant-empty')].map((a) => a.textContent?.trim().slice(0, 120));
    const skeletons = document.querySelectorAll('.ant-skeleton').length;
    return {
      url: location.pathname + location.search,
      chars: text.length,
      headings,
      tabs,
      buttons,
      alerts,
      empties,
      skeletons,
      textHead: text.slice(0, 900),
    };
  });

  await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
  report.push({ name, path, errors, ...info });
  await page.close();
}

await browser.close();
writeFileSync(join(here, 'report.json'), JSON.stringify(report, null, 2));

for (const r of report) {
  console.log('\n=== ' + r.name + ' ' + r.path + ' -> ' + r.url);
  console.log('chars:', r.chars, '| skeletons:', r.skeletons, '| errors:', r.errors.length);
  if (r.errors.length) console.log('ERR:', r.errors.slice(0, 3).join(' || '));
  console.log('H:', r.headings.slice(0, 10).join(' | '));
  if (r.tabs.length) console.log('TABS:', r.tabs.join(' | '));
  console.log('BTN:', r.buttons.map((b) => b.label + (b.disabled ? '[x]' : '')).slice(0, 18).join(' | '));
  if (r.alerts.length) console.log('ALERT:', r.alerts.join(' // '));
  if (r.empties.length) console.log('EMPTY:', r.empties.join(' // '));
  console.log('TXT:', r.textHead.slice(0, 400));
}
