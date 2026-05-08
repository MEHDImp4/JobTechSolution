import { test, expect } from '@playwright/test';

test.describe('Offres Management (RH)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as RH
    await page.goto('/connexion');
    await page.locator('input[name="email"]').fill('rh-test@jobtech.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should create a new job offer', async ({ page }) => {
    await page.goto('/gestion-offres/nouvelle');

    // Fill the form
    const jobTitle = 'Dev E2E';
    await page.locator('input[name="titre"]').fill(jobTitle);
    await page.locator('textarea[name="description"]').fill('Nous recherchons un expert en tests automatisés pour valider toute notre plateforme JobTech Solutions.');
    await page.locator('select[name="type_contrat"]').selectOption('CDI');
    await page.locator('input[name="salaire_min"]').fill('20000');
    await page.locator('input[name="salaire_max"]').fill('35000');
    await page.locator('input[name="date_cloture"]').fill('2026-12-31');

    // Add competencies
    const compInput = page.locator('input[placeholder="Ex: Python, React, SQL..."]');
    await compInput.fill('Playwright');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    // Submit
    await page.getByRole('button', { name: "Créer l'offre" }).click();

    // Verify redirect to management list
    await expect(page).toHaveURL(/.*\/gestion-offres/, { timeout: 10000 });
    
    // Wait for the list to load (LoadingState disappears)
    await expect(page.locator('text=Chargement...')).not.toBeVisible();

    // Check if the new offer is in the list
    const offerItem = page.locator(`text=${jobTitle} >> visible=true`).first();
    await expect(offerItem).toBeVisible({ timeout: 10000 });

    // Publish it (toggle status)
    const toggleButton = page.locator('button[title="Basculer le statut"]').filter({ visible: true }).first();
    await toggleButton.click();
    
    // Verify status change (it should show "Publiée")
    await expect(page.locator('text=Publiée').first()).toBeVisible({ timeout: 10000 });
  });
});
