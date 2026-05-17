import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const MEHDI_TAZI_NAME = /(?:mehdi tazi|tazi mehdi)/i;

test.describe('Interview Scheduling Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'rh');
  });

  test('should allow RH to schedule an interview for a candidate', async ({ page }) => {
    await page.goto('/candidatures');

    const offerEntry = page.getByRole('button', { name: /product owner/i }).first();
    await expect(offerEntry).toBeVisible({ timeout: 10000 });
    await offerEntry.click();

    const candidateRow = page.getByRole('row', { name: /mehdi tazi/i }).first();

    await expect(candidateRow).toBeVisible({ timeout: 10000 });
    await candidateRow.getByRole('button', { name: 'Gérer' }).click();

    await page.getByRole('button', { name: 'Entretien', exact: true }).click();
    await expect(page.locator('text=Statut mis à jour')).toBeVisible();

    await candidateRow.getByRole('button', { name: 'Gérer' }).click();

    const planifierBtn = page.getByRole('button', { name: 'Planifier un entretien' });
    await expect(planifierBtn).toBeVisible({ timeout: 10000 });
    await planifierBtn.click();

    await expect(page.locator('text=Planifier un entretien')).toBeVisible();

    await page.locator('select[name="recruteur_id"]').selectOption({ label: 'Driss Mansouri' });
    await page.locator('select[name="type_entretien"]').selectOption('technique');
    await page.locator('input[name="lieu"]').fill('Bureau Principal');
    await page.locator('input[name="lien_visio"]').fill('https://meet.google.com/abc-defg-hij');
    await page.getByRole('button', { name: 'Planifier l\'entretien' }).click();
    await expect(page.locator('text=Entretien planifié avec succès')).toBeVisible();

    await page.goto('/entretiens');
    await expect(page.locator('h1:has-text("Entretiens")')).toBeVisible();

    const scheduledInterviewCard = page
      .locator('div')
      .filter({ hasText: MEHDI_TAZI_NAME })
      .filter({ hasText: 'Product Owner' })
      .filter({ hasText: 'Bureau Principal' })
      .first();

    await expect(scheduledInterviewCard).toBeVisible();
    await expect(scheduledInterviewCard).toContainText('Technique');
  });
});
