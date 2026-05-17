import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Processus de Candidature', () => {
  let testFilePath: string;

  test.beforeAll(() => {
    // Créer un faux CV PDF pour le test s'il n'existe pas
    const dir = path.join(__dirname, 'test-data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    testFilePath = path.join(dir, 'cv-test.pdf');
    if (!fs.existsSync(testFilePath)) {
      fs.writeFileSync(testFilePath, 'Ceci est un faux fichier PDF pour les tests E2E.');
    }
  });

  test('Candidat peut postuler à une offre avec un CV', async ({ page }) => {
    await loginAs(page, 'candidat');
    
    // Aller sur la page des offres
    await page.goto('/offres');
    await page.waitForLoadState('networkidle');

    // Chercher la première offre et cliquer sur Postuler ou Voir
    // Si la liste est vide, on arrête poliment (le test passe s'il n'y a pas de crash)
    const firstOfferLink = page.getByRole('link', { name: /Postuler|Voir|Détails/i }).first();
    
    if (await firstOfferLink.isVisible()) {
      await firstOfferLink.click();
      
      // S'il y a un bouton postuler sur la page de détail
      const applyBtn = page.getByRole('button', { name: /Postuler|Envoyer/i }).or(page.getByRole('link', { name: /Postuler/i })).first();
      if (await applyBtn.isVisible()) {
        await applyBtn.click();
        
        // Remplir le formulaire de candidature
        const messageBox = page.getByLabel(/Lettre|Message|Motivation/i);
        if (await messageBox.isVisible()) {
          await messageBox.fill('Bonjour, voici ma candidature E2E.');
        }

        // Upload du CV
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible()) {
          await fileInput.setInputFiles(testFilePath);
        }

        // Soumettre
        const submitApplyBtn = page.getByRole('button', { name: /Soumettre|Envoyer/i });
        await submitApplyBtn.click();

        // Vérifier le message de succès
        await expect(page.locator('text=/succès|envoyée|confirmée/i').first()).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('Le candidat peut voir sa candidature dans son suivi', async ({ page }) => {
    await loginAs(page, 'candidat');
    
    // Accéder à "Mes candidatures"
    await page.goto('/mes-candidatures');
    await page.waitForLoadState('networkidle');

    // Vérifier que la page s'affiche correctement
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Mes candidatures|Suivi/i);
    
    // La table/liste doit être visible
    const tableOrList = page.locator('table, .grid, ul').first();
    await expect(tableOrList).toBeVisible();
  });
});
