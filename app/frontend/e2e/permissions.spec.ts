import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Permissions et RBAC', () => {
  test('Un candidat ne peut pas accéder au dashboard RH', async ({ page }) => {
    await loginAs(page, 'candidat');
    await page.goto('/dashboard');
    const menu = page.locator('nav');
    await expect(menu.getByRole('link', { name: /Offres d'emploi/i })).toBeVisible();
    await expect(menu.getByRole('link', { name: /Mes candidatures/i })).toBeVisible();
    await expect(menu.getByRole('link', { name: /^Candidatures$/i })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /Tableau de bord/i })).toHaveCount(0);
  });

  test('Un candidat ne peut pas créer une offre', async ({ page }) => {
    await loginAs(page, 'candidat');
    await page.goto('/gestion-offres/nouvelle');
    const menu = page.locator('nav');
    await expect(menu.getByRole('link', { name: /Offres d'emploi/i })).toBeVisible();
    await expect(menu.getByRole('link', { name: /Mes candidatures/i })).toBeVisible();
    await expect(menu.getByRole('link', { name: /Offres$/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Créer|Enregistrer/i })).toHaveCount(0);
  });

  test('Un RH voit le menu de gestion', async ({ page }) => {
    await loginAs(page, 'rh');
    const menu = page.locator('nav');
    await expect(menu.getByRole('link', { name: /Candidatures/i })).toBeVisible();
    await expect(menu.getByRole('link', { name: /Statistiques/i })).toBeVisible();
  });
  
  test('Un Candidat ne voit pas le menu de gestion', async ({ page }) => {
    await loginAs(page, 'candidat');
    const menu = page.locator('nav');
    await expect(menu.getByRole('link', { name: /Statistiques/i })).not.toBeVisible();
    await expect(menu.getByRole('link', { name: /Gestion offres/i })).not.toBeVisible();
  });
});
