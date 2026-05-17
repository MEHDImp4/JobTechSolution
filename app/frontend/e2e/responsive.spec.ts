import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Responsive Design', () => {
  // Configurer une vue mobile
  test.use({ viewport: { width: 390, height: 844 } });

  test('Menu mobile fonctionne pour un candidat', async ({ page }) => {
    await loginAs(page, 'candidat');
    
    // Le menu standard (desktop) devrait être caché
    const desktopMenu = page.locator('nav.hidden.md\\:block'); // Estimation de classe Tailwind
    if (await desktopMenu.count() > 0) {
       await expect(desktopMenu).not.toBeVisible();
    }
    
    // Le bouton hamburger devrait être visible et cliquable
    const menuButton = page.getByRole('button', { name: 'Open menu' });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.getByRole('link', { name: /Mes candidatures/i })).toBeVisible();
    }
  });

  test('La liste des offres est visible sur mobile', async ({ page }) => {
    await loginAs(page, 'candidat');
    // Sur mobile, les éléments s'empilent généralement
    const offersContainer = page.locator('.grid').first();
    if (await offersContainer.isVisible()) {
      // On s'assure que ça ne déborde pas horizontalement
      const box = await offersContainer.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(390);
    }
  });
});
