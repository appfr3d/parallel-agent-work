import { expect, test } from '@playwright/test';

test('front page renders and is captured as a screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('.loading-state')).toHaveCount(0);

  // Load lazy images before the full-page screenshot so it shows the real design.
  await page.evaluate(() => document.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; }));
  await page.waitForFunction(() => [...document.images].every((img) => img.complete), undefined, { timeout: 15_000 });

  await page.screenshot({ path: 'screenshots/front-page.png', fullPage: true });
});
