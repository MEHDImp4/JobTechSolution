import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/connexion');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByText('Connexion', { exact: true })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.locator('input[name="email"]').fill('wrong@example.com');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Check for any text containing "identifiant" or "invalide" or the generic error
    const errorToast = page.locator('text=/identifiants invalides|erreur/i');
    await expect(errorToast).toBeVisible({ timeout: 10000 });
  });

  test('should redirect RH to dashboard after login', async ({ page }) => {
    await page.locator('input[name="email"]').fill('rh-test@jobtech.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Wait for the redirect to /dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /tableau de bord/i })).toBeVisible();
  });

  test('should redirect candidate to offers after login', async ({ page }) => {
    // This test assumes we have a test user in the database.
    // We use the one created by prepare_e2e_db.py
    await page.locator('input[name="email"]').fill('candidat-test@jobtech.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Wait for the redirect to /offres
    await expect(page).toHaveURL(/.*\/offres/, { timeout: 10000 });
  });
});
