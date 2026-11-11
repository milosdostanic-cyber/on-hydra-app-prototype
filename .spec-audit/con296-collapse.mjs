import { chromium } from 'playwright';

const OUT = '.spec-audit/con296-current';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/projects/1/content', { waitUntil: 'networkidle' });
await page.waitForSelector('.download-history-table tbody tr.ant-table-row', { timeout: 15000 });
await page.locator('.download-history-table button.ant-table-row-expand-icon-expanded').first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/04-collapsed.png`, fullPage: true });
await browser.close();
