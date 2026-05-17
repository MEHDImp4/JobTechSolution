import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('IA et Analyse NLP', () => {
  test('Le RH peut visualiser le score IA sur une candidature', async ({ page }) => {
    await loginAs(page, 'rh');
    
    // Accéder au module de candidatures
    await page.goto('/candidatures');
    await page.waitForLoadState('networkidle');

    // Vérifier la présence du titre
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    // S'il y a des candidatures listées, vérifier si un indicateur IA (score, badge, etc) est présent
    const firstRowOrCard = page.locator('.grid > div, table tbody tr').first();
    
    if (await firstRowOrCard.isVisible()) {
      await firstRowOrCard.click();
      
      // Chercher des mots-clés typiques d'un affichage IA (Score, Match, Compatibilité)
      const iaSection = page.locator('text=/Score IA|Compatibilité|Matching|Analyse/i').first();
      // On s'attend à ce que l'interface prévoie cet encart, même s'il indique "En cours"
      await expect(iaSection.or(page.locator('text=/En attente d\'analyse/i')).first()).toBeVisible();
    }
  });
});
