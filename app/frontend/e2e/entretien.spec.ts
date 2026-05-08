import { test, expect } from '@playwright/test';

test.describe('Interview Scheduling Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as RH
    await page.goto('/connexion');
    await page.locator('input[name="email"]').fill('rh-test@jobtech.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should allow RH to schedule an interview for a candidate', async ({ page }) => {
    // 1. Go to Candidatures
    await page.goto('/candidatures');
    
    // Select the "Dev E2E" offer tab. Use .first() to avoid strict mode violation if multiple exist.
    const offerTab = page.locator('button:has-text("Dev E2E")').first();
    await expect(offerTab).toBeVisible({ timeout: 10000 });
    await offerTab.click();

    // 2. Find the candidate and change status to 'Entretien'
    // Search for the specific candidate text and then find the container (tr or card div)
    const candidateContainer = page.locator('div, tr').filter({ hasText: 'Test Candidat' }).filter({ has: page.getByRole('button', { name: 'Gérer' }) }).first();
    
    await expect(candidateContainer).toBeVisible({ timeout: 10000 });
    await candidateContainer.getByRole('button', { name: 'Gérer' }).click();
    
    await expect(page.locator('text=Changer le statut')).toBeVisible();
    
    // Click on "Entretien" status button
    await page.getByRole('button', { name: 'Entretien', exact: true }).click();
    await expect(page.locator('text=Statut mis à jour')).toBeVisible();

    // 3. Open Planifier Modal
    // Re-open manage modal to see the new Planifier button
    await candidateContainer.getByRole('button', { name: 'Gérer' }).click();
    const planifierBtn = page.getByRole('button', { name: 'Planifier un entretien' });
    await expect(planifierBtn).toBeVisible({ timeout: 10000 });
    await planifierBtn.click();

    // 4. Fill Interview Form
    await expect(page.locator('text=Planifier un entretien')).toBeVisible();
    
    // Select Recruiter (Test RH should be in the list)
    await page.locator('select[name="recruteur_id"]').selectOption({ label: 'RH Test' });
    
    // Type d'entretien
    await page.locator('select[name="type_entretien"]').selectOption('technique');
    
    // Lieu/Visio
    await page.locator('input[name="lieu"]').fill('Bureau Principal');
    await page.locator('input[name="lien_visio"]').fill('https://meet.google.com/abc-defg-hij');

    // Submit
    await page.getByRole('button', { name: 'Planifier l\'entretien' }).click();
    await expect(page.locator('text=Entretien planifié avec succès')).toBeVisible();

    // 5. Verify in Entretiens Page
    await page.goto('/entretiens');
    await expect(page.locator('h1:has-text("Entretiens")')).toBeVisible();
    
    // Check if the scheduled interview appears
    await expect(page.locator('text=Test Candidat').first()).toBeVisible();
    await expect(page.locator('text=Technique').first()).toBeVisible();
    await expect(page.locator('text=Bureau Principal').first()).toBeVisible();
  });
});
