import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Candidature Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Candidate
    await page.goto('/connexion');
    await page.locator('input[name="email"]').fill('candidat-test@jobtech.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/.*\/offres/);
  });

  test('should allow a candidate to apply for a job', async ({ page }) => {
    // 1. Browse offers
    await expect(page.locator('text=Découvrez les postes disponibles')).toBeVisible();
    
    // Give it a bit of time for the offer created in the other test to appear 
    // or wait for the list to be stable
    await page.waitForLoadState('networkidle');
    
    // We need at least one offer.
    const offerCard = page.locator('text=Dev E2E').first();
    await expect(offerCard).toBeVisible({ timeout: 15000 });
    
    // Click on "Voir les détails" or the card itself to go to detail page
    await offerCard.click();
    await expect(page).toHaveURL(/.*\/offres\/\d+/);

    // 2. Click Postuler
    await page.getByRole('button', { name: 'Postuler' }).click();
    await expect(page).toHaveURL(/.*\/postuler\/\d+/);

    // 3. Fill Application Form
    // Upload CV
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('text=Cliquez pour uploader votre CV').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(process.cwd(), '..', 'dummy.pdf'));

    // Verify file name appears
    await expect(page.locator('text=dummy.pdf')).toBeVisible();

    // Contact info
    await page.locator('input[name="telephone"]').fill('0612345678');
    await page.locator('input[name="experience_annees"]').fill('3');
    
    // Motivation
    await page.locator('textarea[name="lettre_motivation"]').fill('Je suis très motivé par ce poste de testeur E2E car j\'adore automatiser des workflows complexes.');

    // Submit
    await page.getByRole('button', { name: 'Envoyer ma candidature' }).click();

    // 4. Verify redirect and dashboard
    // Wait for the success toast first - this confirms the backend responded
    await expect(page.locator('text=Candidature envoyée avec succès')).toBeVisible({ timeout: 15000 });
    
    await expect(page).toHaveURL(/.*\/mes-candidatures/, { timeout: 15000 });
    
    // Check if "Dev E2E" is in the list of applications
    await expect(page.locator('text=Dev E2E').first()).toBeVisible();
    
    // Verify Stepper is present
    await expect(page.locator('.flex.items-center.gap-1').first()).toBeVisible();
  });
});
