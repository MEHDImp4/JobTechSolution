import { test, expect } from '@playwright/test';
import { loginAs, logout } from './helpers/auth';

test.describe('Authentification & Autorisation', () => {
  
  test('Login avec un compte invalide affiche une erreur', async ({ page }) => {
    await page.goto('/connexion');
    await page.locator('input[name="email"]').fill('wrong@example.com');
    await page.locator('input[name="password"]').fill('badpass');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.locator('text=/identifiants invalides|erreur/i')).toBeVisible();
  });

  test('Login en tant que Candidat redirige vers les offres', async ({ page }) => {
    await loginAs(page, 'candidat');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Offres|Emploi/i);
    await logout(page);
  });

  test('Login en tant que RH redirige vers le dashboard', async ({ page }) => {
    await loginAs(page, 'rh');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Tableau de bord/i);
    await logout(page);
  });

  test('Persistance de la session après rechargement', async ({ page }) => {
    await loginAs(page, 'rh');
    await page.reload();
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Tableau de bord/i);
  });
});
