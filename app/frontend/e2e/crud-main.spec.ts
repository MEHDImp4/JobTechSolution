import { expect, test } from '@playwright/test';

import { loginAs } from './helpers/auth';

test.describe('CRUD principal', () => {
  test.describe.configure({ mode: 'serial' });

  const offerTitle = `Offre Playwright ${Date.now()}`;

  test('un RH peut creer une offre', async ({ page }) => {
    await loginAs(page, 'rh');
    await page.goto('/gestion-offres/nouvelle');

    await page.getByLabel(/titre|poste/i).fill(offerTitle);
    await page
      .getByPlaceholder(/décrivez le poste|decrivez le poste/i)
      .fill('Offre creee automatiquement par la suite critique.');
    await page.locator('input[name="experience_requise"]').fill('3');
    await page.locator('select[name="type_contrat"]').selectOption('CDI');
    await page.locator('input[name="date_cloture"]').fill('2099-12-31');
    await page.getByRole('button', { name: /créer|enregistrer|publier/i }).click();

    await expect(page.getByText(offerTitle).first()).toBeVisible({ timeout: 15000 });
    const publishButton = page.locator('button[title="Basculer le statut"]').first();
    if (await publishButton.isVisible().catch(() => false)) {
      await publishButton.click();
    }
  });

  test('un candidat retrouve l offre creee dans la liste', async ({ page }) => {
    await loginAs(page, 'candidat');
    await page.goto('/offres');

    const searchInput = page.getByPlaceholder(/rechercher/i);
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(offerTitle);
      await page.keyboard.press('Enter');
    }

    await expect(page.getByText(offerTitle).first()).toBeVisible({ timeout: 15000 });
  });
});
