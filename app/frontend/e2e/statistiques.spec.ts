import { test, expect } from '@playwright/test';

test.describe('Analytics & CSV Exports (RH)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as RH
    await page.goto('/connexion');
    await page.locator('input[name="email"]').fill('rh-test@jobtech.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should display KPIs, charts, and allow CSV export', async ({ page }) => {
    // 1. Navigate to Statistiques page
    await page.goto('/statistiques');
    await expect(page.locator('h1:has-text("Statistiques")')).toBeVisible();

    // 2. Verify KPI Cards are visible
    await expect(page.locator('text=Taux de conversion').first()).toBeVisible();
    await expect(page.locator('text=Délai moyen').first()).toBeVisible();
    await expect(page.locator('text=Score IA moyen').first()).toBeVisible();

    // 3. Verify Charts are rendered (Recharts wrapper)
    await expect(page.locator('.recharts-responsive-container').first()).toBeVisible();
    await expect(page.locator('text=Entonnoir de recrutement')).toBeVisible();
    await expect(page.locator('text=Top compétences demandées')).toBeVisible();

    // 4. Test Period Filter
    const periodSelect = page.locator('select');
    await periodSelect.selectOption('7d');
    await page.waitForLoadState('networkidle'); // Wait for API call to complete

    // 5. Test CSV Export Download
    // Playwright handles downloads via waitForEvent('download')
    const downloadPromise = page.waitForEvent('download');
    
    // Click the Export button
    await page.getByRole('button', { name: 'Export' }).click();
    
    const download = await downloadPromise;
    
    // Verify it's a CSV file
    expect(download.suggestedFilename()).toMatch(/.*\.csv/);
    
    // Optionally, save the file and verify its contents or existence
    // const path = await download.path();
    // expect(path).toBeTruthy();
  });
});
