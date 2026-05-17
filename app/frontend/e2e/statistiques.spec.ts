import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import { loginAs } from './helpers/auth';

test.describe('Analytics & CSV Exports (RH)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'rh');
  });

  test('should display KPIs, charts, and allow CSV export', async ({ page }) => {
    await page.goto('/statistiques');
    await expect(page.locator('h1:has-text("Statistiques")')).toBeVisible();

    await expect(page.locator('text=Taux de conversion').first()).toBeVisible();
    await expect(page.locator('text=Délai moyen').first()).toBeVisible();
    await expect(page.locator('text=Score IA moyen').first()).toBeVisible();

    await expect(page.locator('.recharts-responsive-container').first()).toBeVisible();
    await expect(page.locator('text=Entonnoir de recrutement')).toBeVisible();
    await expect(page.locator('text=Top compétences demandées')).toBeVisible();

    const periodSelect = page.locator('select');
    await periodSelect.selectOption('7d');
    await page.waitForLoadState('networkidle');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/.*\.csv/);
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const content = await fs.readFile(downloadPath!, 'utf8');
    expect(content).toContain('Candidat');
    expect(content).toContain('Offre');
  });
});
