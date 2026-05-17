import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const MEHDI_TAZI_NAME = /(?:mehdi tazi|tazi mehdi)/i;

test.describe('Interview Interface (Auto-save)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'rh');
  });

  test('should allow RH to write notes and auto-save', async ({ page }) => {
    await page.goto('/entretiens');
    await expect(page.locator('h1:has-text("Entretiens")')).toBeVisible();

    const interviewCard = page
      .locator('div.rounded-xl')
      .filter({ hasText: MEHDI_TAZI_NAME })
      .filter({ hasText: 'Stage Développeur Frontend' })
      .first();
    await expect(interviewCard).toBeVisible({ timeout: 10000 });

    await interviewCard.getByRole('button', { name: 'Notes' }).click();
    await expect(page.locator('text=Notes d\'entretien')).toBeVisible();

    const uniqueNote = `E2E Note ${Math.random().toString(36).substring(7)}`;
    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.fill(uniqueNote);

    const indicator = page.getByTestId('save-indicator');
    await expect(indicator).toContainText(/:/, { timeout: 15000 });

    await page.locator('button:has-text("Fermer")').last().click();
    await expect(page.locator('text=Notes d\'entretien')).not.toBeVisible();

    await interviewCard.getByRole('button', { name: 'Notes' }).click();
    await expect(textarea).toHaveValue(uniqueNote);

    await page.locator('button:has-text("Fermer")').last().click();
  });
});
