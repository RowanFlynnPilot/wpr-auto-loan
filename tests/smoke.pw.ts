import { expect, test, type Page } from '@playwright/test';

// What a reader would notice if it broke, checked on the built site. Each
// of these caught a real regression by hand this autumn; now they run on
// every deploy. `npx playwright test` locally, after `npm run build`.

const SCENARIO = 'income=5000&share=0.1&down=2000&trade=0&owed=0&apr=0.069&term=60';

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'horizontal overflow').toBe(0);
}

test('the tool loads, computes, and shows the lot', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`#${SCENARIO}`);
  await expect(page.locator('h1')).toHaveText('What can I drive?');
  await expect(page.locator('.ceiling .figure')).toHaveText(/^\$[\d,]+$/);
  await expect(page.locator('.card').first()).toBeVisible();
  await expect(page.locator('.wpr-masthead')).toHaveCount(1); // the pre-painted shell was replaced, not doubled
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);

  // The term rows are real buttons; choosing one rewrites the scenario.
  await page.getByRole('button', { name: '72 months' }).click();
  await expect.poll(() => page.evaluate(() => location.hash)).toContain('term=72');

  // Phones: 16px controls (or iOS zooms), hover kept for pointers that hover.
  if (info.project.name === 'phone') {
    for (const sel of ['.field input', 'select[name=term]', '.sort select']) {
      expect(await page.locator(sel).first().evaluate((el) => getComputedStyle(el).fontSize), sel).toBe('16px');
    }
  }
});

test('the lot is honest about its photos and its view', async ({ page }) => {
  // The pitch preview: the one lot with photos (the demo lot has none).
  await page.goto(`?pitch=brickners#${SCENARIO}&body=Sedan&sort=allin`);
  await expect(page.locator('.chip.on')).toContainText('Sedan');
  await expect(page.locator('.sort select')).toHaveValue('allin');
  // The silhouette under a photo is decoration; a failed photo falls back to it.
  const ground = page.locator('.card .photo .ground').first();
  await expect(ground).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.card .photo img').first()).toHaveAttribute('alt', /\d{4} /);
  // A new filter rides into the hash and starts the paging over.
  await page.getByRole('button', { name: /^All/ }).click();
  await expect.poll(() => page.evaluate(() => location.hash)).not.toContain('body=');
  await expect(page.locator('.card')).toHaveCount(Math.min(24, await page.locator('.card').count()));
});

test('"How we figure this" opens the methodology where it lives', async ({ page }) => {
  await page.goto(`#${SCENARIO}`);
  await page.getByRole('button', { name: 'How we figure this' }).click();
  await expect(page.locator('#method')).toHaveAttribute('open', '');
  await expect(page.locator('#method summary')).toBeFocused();
});

test('the mini plays, steps, and refuses a stranger as its destination', async ({ page }) => {
  await page.goto('mini.html?to=https%3A%2F%2Fevil.example%2F');
  await expect(page.locator('.mini h2')).toBeVisible();
  const cta = page.locator('.mini-cta');
  expect(await cta.getAttribute('href')).toMatch(/^http:\/\/localhost:4173\/wpr-auto-loan\/\?utm_source=/);
  await expect(page.locator('.mini-count')).toHaveText(/^1 of \d+$/);
  await page.getByRole('button', { name: 'Next vehicle' }).click();
  await expect(page.locator('.mini-count')).toHaveText(/^2 of \d+$/);
  await expect(page.locator('.mini-controls button').first()).toHaveText('Pause'); // first in reading order, label carries the state
  await noHorizontalOverflow(page);
});
