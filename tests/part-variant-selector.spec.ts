import { expect, test, type Page } from '@playwright/test';

const PART_WITH_THREE_VARIANTS = '/search/parts/p-200';
const PART_OTHER = '/search/parts/p-300';

async function seedActiveProject(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('hydra:bomActiveProjectId', '1');
  });
}

test.describe('Part variant selector optimization', () => {
  test.beforeEach(async ({ page }) => {
    await seedActiveProject(page);
  });

  test('action button opens multi-select — no page-level picker', async ({ page }) => {
    await page.goto(PART_WITH_THREE_VARIANTS);
    await expect(page.getByRole('button', { name: 'Change variation' })).toHaveCount(0);
    await expect(page.getByText(/selected for this visit/i)).toHaveCount(0);

    await page.getByRole('button', { name: 'Download PDF File' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('0 selected')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Download PDF files' })).toBeDisabled();

    await dialog.getByRole('button', { name: 'Select all' }).click();
    await expect(dialog.getByText(/^[1-9]\d* selected$/)).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Download PDF files' })).toBeEnabled();

    await dialog.getByRole('button', { name: 'Clear all' }).click();
    await expect(dialog.getByText('0 selected')).toBeVisible();

    await dialog.getByRole('checkbox').first().check();
    await expect(dialog.getByText('1 selected')).toBeVisible();
    await dialog.getByRole('button', { name: 'Download PDF files' }).click();
    await expect(dialog).toBeHidden();
  });

  test('unavailable STEP variants block submit until removed', async ({ page }) => {
    await page.goto(PART_WITH_THREE_VARIANTS);
    await page.getByRole('button', { name: 'Download STEP File' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Select all' }).click();
    await expect(dialog.getByRole('button', { name: 'Download STEP files' })).toBeEnabled();

    const unavailableCheckbox = dialog.getByRole('checkbox', { name: /STEP unavailable/i }).first();
    await expect(unavailableCheckbox).toHaveCount(1);
    await unavailableCheckbox.check();
    await expect(dialog.getByText(/do not include STEP|does not include STEP/i)).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Download STEP files' })).toBeDisabled();

    await unavailableCheckbox.uncheck();
    await expect(dialog.getByRole('button', { name: 'Download STEP files' })).toBeEnabled();
  });

  test('session checks persist across actions even after Cancel', async ({ page }) => {
    await page.goto(PART_WITH_THREE_VARIANTS);
    await page.getByRole('button', { name: 'Download STEP File' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Select all' }).click();
    const countText = await dialog.locator('text=/\\d+ selected/').first().textContent();
    const count = Number(countText?.match(/(\d+)/)?.[1] ?? 0);
    expect(count).toBeGreaterThan(0);
    // Cancel closes without running STEP — checks must still stick for the next CTA
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole('button', { name: 'Download PDF File' }).click();
    const pdfDialog = page.getByRole('dialog');
    await expect(pdfDialog.getByText(`${count} selected`)).toBeVisible();
    await expect(pdfDialog.locator('[data-carried="true"]')).toHaveCount(count);
    await pdfDialog.getByRole('button', { name: 'Cancel' }).click();

    await page.getByRole('button', { name: 'Add to BOM' }).click();
    const bomSelectDialog = page.getByRole('dialog');
    await expect(bomSelectDialog.getByText(`${count} selected`)).toBeVisible();
    await expect(bomSelectDialog.locator('[data-carried="true"]')).toHaveCount(count);
    await bomSelectDialog.getByRole('button', { name: 'Cancel' }).click();

    await page.goto(PART_OTHER);
    await page.getByRole('button', { name: 'Download PDF File' }).click();
    await expect(page.getByRole('dialog').getByText('0 selected')).toBeVisible();
  });

  test('single selected variant still completes download', async ({ page }) => {
    await page.goto(PART_WITH_THREE_VARIANTS);
    await page.getByRole('button', { name: 'Download DWG File' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Select all' }).click();
    await expect(dialog.getByRole('button', { name: 'Download DWG files' })).toBeEnabled();
    await dialog.getByRole('button', { name: 'Download DWG files' }).click();
    await expect(page.getByText(/DWG file.*download queue/i)).toBeVisible();
  });

  test('Add to BOM batch uses destination modal without variation dropdown', async ({ page }) => {
    await page.goto(PART_WITH_THREE_VARIANTS);
    await page.getByRole('button', { name: 'Add to BOM' }).click();
    const selectDialog = page.getByRole('dialog');
    await selectDialog.getByRole('button', { name: 'Select all' }).click();
    await selectDialog.getByRole('button', { name: 'Add to BOM' }).click();

    const bomDialog = page.getByRole('dialog').filter({ hasText: 'Select a BOM to add this part to' });
    await expect(bomDialog).toBeVisible();
    await expect(bomDialog.getByText(/variations will be added/i)).toBeVisible();
    await expect(bomDialog.getByText('Select a size or variation to add to this BOM.')).toHaveCount(0);

    const addButton = bomDialog.getByRole('button', { name: /Add \d+ to BOM|Add to BOM/ });
    await bomDialog.getByRole('combobox').click();
    await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .first()
      .click({ force: true });
    await expect(addButton).toBeEnabled({ timeout: 5_000 });
    await addButton.click();
    await expect(page.getByText(/added to/i).first()).toBeVisible();
  });

  test('BOM match SKU picker stays single-select and never opens action modal', async ({ page }) => {
    await page.goto('/bom/projects/1/matching/table');
    await expect(page.getByText('Select variants for')).toHaveCount(0);

    const pickExact = page.getByRole('button', { name: 'Pick exact product' }).first();
    await expect(pickExact).toBeVisible({ timeout: 15_000 });
    await pickExact.click();

    const skuModal = page.getByRole('dialog').filter({ hasText: 'Select SKU' });
    await expect(skuModal).toBeVisible();
    await expect(page.getByText('Select variants for')).toHaveCount(0);
    await expect(skuModal.getByRole('checkbox')).toHaveCount(0);
    await expect(skuModal.getByRole('button', { name: 'Select SKU' })).toBeVisible();
  });
});
