import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const OUT = 'scripts/spec-audit/live/asc-swap';
mkdirSync(OUT, { recursive: true });

const DOCS = ['spec-dcc-hvac-bid', 'spec-rop-fire-bid', 'spec-dlh-plumb-manual'];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

async function exportState() {
  return page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const bom = buttons.find((b) => b.innerText.trim() === 'Add to BOM');
    const sub = buttons.find((b) => b.innerText.trim() === 'Add to Submittal Package');
    return { bomEnabled: bom ? !bom.disabled : null, submittalEnabled: sub ? !sub.disabled : null };
  });
}

for (const id of DOCS) {
  console.log(`\n===== ${id}`);

  await page.goto(`${BASE}/spec/${id}/export`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  console.log('export before accept:', JSON.stringify(await exportState()));

  await page.goto(`${BASE}/spec/${id}/edit`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const target = page
    .getByText(/Allow approved equivalent manufacturers|Add a clear substitution approval path/)
    .first();
  if ((await target.count()) === 0) {
    console.log('no substitution recommendation found in the editor list');
    continue;
  }
  await target.click();
  await page.waitForTimeout(900);

  const evidence = await page.evaluate(() =>
    [...document.querySelectorAll('*')]
      .filter((n) => n.children.length === 0 && /ASC-[A-Z0-9-]+ ·/.test(n.textContent?.trim() ?? ''))
      .map((n) => n.textContent.trim())
      .slice(0, 3),
  );
  console.log('catalog evidence on detail:', evidence);
  const proposed = await page.evaluate(() => {
    const node = [...document.querySelectorAll('p, div')].find((n) =>
      /may be approved instead/.test(n.textContent ?? ''),
    );
    return node ? node.textContent.trim().slice(0, 220) : null;
  });
  console.log('proposed text:', proposed);
  await page.screenshot({ path: `${OUT}/${id}-edit-detail.png`, fullPage: false });

  const accept = page.getByRole('button', { name: /^Accept/ }).first();
  if ((await accept.count()) === 0) {
    console.log('no Accept button visible');
    continue;
  }
  await accept.click();
  await page.waitForTimeout(1200);

  await page.goto(`${BASE}/spec/${id}/export`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('export after accept:', JSON.stringify(await exportState()));
  await page.screenshot({ path: `${OUT}/${id}-export-after.png`, fullPage: false });
}

console.log('\nPAGE ERRORS:', errors.slice(0, 10));
await browser.close();
