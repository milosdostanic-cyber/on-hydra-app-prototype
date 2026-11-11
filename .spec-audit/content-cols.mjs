import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = '.spec-audit/content-cols';
mkdirSync(OUT, { recursive: true });

const measure = async (page) =>
  page.evaluate(() => {
    const table = document.querySelector('.download-history-table table');
    if (!table) return null;
    const layout = getComputedStyle(table).tableLayout;
    const headers = [...table.querySelectorAll('thead th')].map((th) => ({
      label: th.innerText.trim() || '(select)',
      w: Math.round(th.getBoundingClientRect().width),
    }));
    return { layout, headers, tableWidth: Math.round(table.getBoundingClientRect().width) };
  });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/projects/1/content', { waitUntil: 'networkidle' });
await page.waitForSelector('.download-history-table tbody tr.ant-table-row');
await page.waitForTimeout(600);

const states = {};
states.initial = await measure(page);
await page.screenshot({ path: `${OUT}/01-initial.png`, fullPage: true });

// select first figure row checkbox
const firstCheckbox = page.locator('.download-history-table tbody tr.ant-table-row input[type="checkbox"]').first();
await firstCheckbox.check();
await page.waitForTimeout(500);
states.afterSelect = await measure(page);
await page.screenshot({ path: `${OUT}/02-selected.png`, fullPage: true });

// select all (header checkbox)
await page.locator('.download-history-table thead input[type="checkbox"]').first().check();
await page.waitForTimeout(500);
states.afterSelectAll = await measure(page);
await page.screenshot({ path: `${OUT}/03-select-all.png`, fullPage: true });

// clear
await page.locator('.download-history-table thead input[type="checkbox"]').first().uncheck();
await page.waitForTimeout(500);
states.afterClear = await measure(page);

// collapse all expand icons (the "-" action)
const expandIcons = page.locator('.download-history-table tbody .ant-table-row-expand-icon-expanded');
const count = await expandIcons.count();
for (let i = 0; i < count; i += 1) {
  const icon = page.locator('.download-history-table tbody .ant-table-row-expand-icon-expanded').first();
  if ((await icon.count()) === 0) break;
  await icon.click();
  await page.waitForTimeout(150);
}
await page.waitForTimeout(500);
states.afterCollapseAll = await measure(page);
await page.screenshot({ path: `${OUT}/04-collapsed.png`, fullPage: true });

// re-expand one
const collapsed = page.locator('.download-history-table tbody .ant-table-row-expand-icon-collapsed').first();
if ((await collapsed.count()) > 0) {
  await collapsed.click();
  await page.waitForTimeout(500);
}
states.afterReexpandOne = await measure(page);
await page.screenshot({ path: `${OUT}/05-reexpand-one.png`, fullPage: true });

console.log(JSON.stringify(states, null, 2));
await browser.close();
