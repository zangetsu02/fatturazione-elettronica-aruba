import { test, expect } from '@playwright/test';

test.describe('Documentation Site', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('italian homepage has correct title', async ({ page }) => {
    await page.goto('/it');

    await expect(page).toHaveTitle(/Fatturazione Elettronica/);
  });

  test('english homepage has correct title', async ({ page }) => {
    await page.goto('/en');

    await expect(page).toHaveTitle(/Fatturazione Elettronica/);
  });

  test('getting started page loads', async ({ page }) => {
    await page.goto('/it/getting-started/installation');

    await expect(page.locator('h1')).toContainText('Installazione');
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/it');

    // Click on "Per Iniziare" or similar navigation
    const navLink = page.locator('a[href*="getting-started"]').first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await expect(page).toHaveURL(/getting-started/);
    }
  });

  test('code blocks are rendered', async ({ page }) => {
    await page.goto('/it/getting-started/quick-start');

    // Check that code blocks exist
    const codeBlocks = page.locator('pre code');
    await expect(codeBlocks.first()).toBeVisible();
  });

  test('language switcher works', async ({ page }) => {
    await page.goto('/it');

    // Look for language switcher
    const langSwitcher = page.locator('button:has-text("Italiano"), a:has-text("English")');
    if (await langSwitcher.first().isVisible()) {
      await langSwitcher.first().click();
      // Should navigate to english version
    }
  });
});

test.describe('API Reference', () => {
  test('core reference page loads', async ({ page }) => {
    await page.goto('/it/api-reference/core');

    await expect(page.locator('h1')).toContainText('Core');
  });

  test('invoices reference page loads', async ({ page }) => {
    await page.goto('/it/api-reference/invoices');

    await expect(page.locator('h1')).toContainText('Invoices');
  });

  test('errors reference page loads', async ({ page }) => {
    await page.goto('/it/api-reference/errors');

    await expect(page.locator('h1')).toContainText('Errori');
  });
});

test.describe('Guides', () => {
  test('authentication guide loads', async ({ page }) => {
    await page.goto('/it/guides/authentication');

    await expect(page.locator('h1')).toContainText('Autenticazione');
  });

  test('invoices guide loads', async ({ page }) => {
    await page.goto('/it/guides/invoices');

    await expect(page.locator('h1')).toContainText('Fatture');
  });

  test('notifications guide loads', async ({ page }) => {
    await page.goto('/it/guides/notifications');

    await expect(page.locator('h1')).toContainText('Notifiche');
  });

  test('communications guide loads', async ({ page }) => {
    await page.goto('/it/guides/communications');

    await expect(page.locator('h1')).toContainText('Comunicazioni');
  });
});
