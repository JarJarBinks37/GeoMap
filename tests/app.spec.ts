import { expect, test } from '@playwright/test';

test('globe renders and layers are editable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByText(/countries & territories/i)).toBeVisible();

  const mountains = page.getByRole('button', { name: /mountain ranges/i });
  await expect(mountains).toHaveAttribute('aria-pressed', 'true');
  await mountains.click();
  await expect(mountains).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByLabel('RELIEF SCALE')).toHaveCount(0);
  await mountains.click();
  await expect(mountains).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await page.getByRole('button', { name: 'Zoom out' }).click();
  await page.getByRole('button', { name: 'Hide layers' }).click();
  await expect(page.getByRole('button', { name: 'Show layers' })).toBeVisible();
  await page.getByRole('button', { name: 'Show layers' }).click();

  expect(errors).toEqual([]);
});

test('country index filters, sorts, searches, and opens a country', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /country index/i }).click();
  await expect(page.getByRole('heading', { name: /country index/i })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(249);
  await expect(page.locator('tbody tr').first().locator('.country-name strong')).toHaveText('China');
  await expect(page.locator('.index-content')).not.toContainText('NaN');

  await page.getByRole('button', { name: /^Africa/i }).click();
  await expect(page.getByText(/places in Africa/i)).toBeVisible();
  expect(await page.locator('tbody tr').count()).toBeGreaterThan(50);

  const search = page.getByPlaceholder(/search country or capital/i);
  await search.fill('Kenya');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByText('Nairobi')).toBeVisible();

  await page.locator('tbody tr').click();
  await expect(page.getByText('SELECTED COUNTRY')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kenya' })).toBeVisible();
});

test('desktop composition is visually stable', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1800);
  await page.screenshot({ path: '/tmp/geomap-globe.png', fullPage: true });
  await page.getByRole('button', { name: /country index/i }).click();
  await page.screenshot({ path: '/tmp/geomap-index.png', fullPage: true });
});

test('globe canvas stays centered on high-density displays', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto('/');
  const stage = await page.locator('.globe-stage').boundingBox();
  const canvas = await page.locator('canvas').boundingBox();
  expect(stage).not.toBeNull();
  expect(canvas).not.toBeNull();
  expect(canvas!.width).toBeCloseTo(stage!.width, 0);
  expect(canvas!.height).toBeCloseTo(stage!.height, 0);
  expect(canvas!.x).toBeCloseTo(0, 0);
  await context.close();
});
