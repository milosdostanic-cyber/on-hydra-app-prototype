import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const OUT = 'scripts/spec-audit/live';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1512, height: 900 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/spec`, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.setItem('hydra-spec-demo', '1'));
await page.locator('button.ant-float-btn').click();
const drawer = page.getByRole('dialog', { name: 'Spec demo controls' });
await drawer.getByRole('combobox').first().click();
await page.locator('.ant-select-item-option').filter({ hasText: 'Scanned Division 21' }).first().click();
await page.waitForTimeout(900);
await page.keyboard.press('Escape');

await page.goto(`${BASE}/projects/3/spec/spec-scan-21/edit`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.querySelectorAll('[data-spec-document-scroll]').length >= 2);
await page.waitForTimeout(1500);

await page.evaluate(() => {
  for (const el of document.querySelectorAll('[data-spec-document-scroll]')) {
    el.scrollTop = 240;
  }
});
await page.waitForTimeout(400);

const audit = await page.evaluate(() => {
  const ports = [...document.querySelectorAll('[data-spec-document-scroll]')].map((el, index) => {
    const rect = el.getBoundingClientRect();
    const panel = el.parentElement;
    const panelRect = panel?.getBoundingClientRect();
    const listbox = el.querySelector('[role="listbox"]');
    return {
      index,
      label: listbox?.getAttribute('aria-label') ?? `port-${index}`,
      scroll: {
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
      },
      panel: panelRect
        ? {
            top: Math.round(panelRect.top),
            bottom: Math.round(panelRect.bottom),
            right: Math.round(panelRect.right),
          }
        : null,
      bottomGap: panelRect ? Math.round(panelRect.bottom - rect.bottom) : null,
      rightGap: panelRect ? Math.round(panelRect.right - rect.right) : null,
      scrollable: el.scrollHeight > el.clientHeight + 2,
    };
  });

  const sidePorts = ports.filter((port) => port.label === 'Document sections' || port.index === 2);
  return {
    ports,
    pass: sidePorts.every((port) => (port.bottomGap ?? 99) <= 2 && (port.rightGap ?? 99) <= 2),
    url: location.href,
  };
});

writeFileSync(`${OUT}/scrollbar-audit.json`, JSON.stringify(audit, null, 2));
console.log(JSON.stringify(audit, null, 2));
await page.screenshot({ path: `${OUT}/scrollbar-audit-full.png` });
await browser.close();
process.exit(audit.pass ? 0 : 1);
