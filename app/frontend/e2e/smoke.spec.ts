import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('L\'application charge correctement', async ({ page }) => {
    const response = await page.goto('/connexion');
    expect(response?.status()).toBeLessThan(400);
    
    // Vérification du titre principal
    await expect(page).toHaveTitle(/JobTech/i);
    
    // Vérification qu'aucune erreur critique n'est affichée à l'écran
    const errorToast = page.locator('.toast-error');
    await expect(errorToast).not.toBeVisible();
  });

  test('Aucune erreur console critique au chargement', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('401')) {
        errors.push(msg.text());
      }
    });

    await page.goto('/connexion');
    await page.waitForLoadState('networkidle');
    
    // Tolère certaines erreurs comme les 401 (logique non-authentifié)
    expect(errors.length).toBe(0);
  });
});
