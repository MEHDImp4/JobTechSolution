import { expect, test } from '@playwright/test';

import { loginAs } from './helpers/auth';

test.describe('Navigation critique', () => {
  test('une route protegee redirige vers la connexion hors session', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/connexion/);
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
  });

  test('un candidat voit sa navigation metier', async ({ page }) => {
    await loginAs(page, 'candidat');

    await expect(page.getByRole('link', { name: /offres d'emploi/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /mes candidatures/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /statistiques/i })).toHaveCount(0);
  });

  test('un RH voit la navigation de gestion', async ({ page }) => {
    await loginAs(page, 'rh');

    await expect(page.getByRole('link', { name: /candidatures/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /statistiques/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^offres$/i })).toBeVisible();
  });
});
