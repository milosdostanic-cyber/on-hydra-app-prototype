import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/projects/1/content', { waitUntil: 'networkidle' });
await page.waitForSelector('.download-history-table tbody tr.ant-table-row');
await page.waitForTimeout(600);

const probe = () =>
  page.evaluate(() => {
    const card = document.querySelector('.download-history-table')?.closest('.ant-card');
    const strip = card?.previousElementSibling;
    const thead = document.querySelector('.download-history-table thead');
    return {
      stripHeight: strip ? Math.round(strip.getBoundingClientRect().height) : null,
      stripText: strip ? strip.innerText.replace(/\n/g, ' | ') : null,
      theadTop: thead ? Math.round(thead.getBoundingClientRect().top + window.scrollY) : null,
    };
  });

const before = await probe();
await page.locator('.download-history-table tbody tr.ant-table-row input[type="checkbox"]').first().check();
await page.waitForTimeout(400);
const after = await probe();

console.log(JSON.stringify({ before, after, jumpPx: after.theadTop - before.theadTop }, null, 2));
await browser.close();
