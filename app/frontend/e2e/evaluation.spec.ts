import { test, expect } from '@playwright/test';

test.describe('Evaluation Form (5 Stars)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as RH
    await page.goto('/connexion');
    await page.locator('input[name="email"]').fill('rh-test@jobtech.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should allow RH to evaluate a candidate after interview', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    // 1. Go to Entretiens
    await page.goto('/entretiens');
    
    // Find the latest interview for Test Candidat
    const interviewCard = page.locator('div.shadow-card').filter({ hasText: 'Test Candidat' }).last();
    await expect(interviewCard).toBeVisible({ timeout: 10000 });

    // 2. Change status to Terminé to show the Évaluer button
    await interviewCard.locator('select').selectOption('termine');
    
    // Wait for the button to appear
    const evalBtn = interviewCard.getByRole('button', { name: 'Évaluer' });
    await expect(evalBtn).toBeVisible({ timeout: 10000 });
    await evalBtn.click();

    // 3. Fill Evaluation Form
    await expect(page.locator('text=Évaluer le candidat')).toBeVisible();

    // Click on 4th star for each criteria using test-ids
    const criteria = ['compétences', 'communication', 'motivation', 'adaptabilité', 'culture-fit'];
    for (const c of criteria) {
        await page.getByTestId(`stars-${c}`).locator('button').nth(3).click();
    }

    // Select Recommendation (Retenu)
    await page.getByText('Retenu', { exact: true }).click();

    // Fill Comments (must be > 100 characters for backend validation)
    await page.locator('textarea').fill('Le candidat a passé un excellent entretien technique. Sa maîtrise de Playwright est impressionnante. Je recommande fortement son embauche pour ce poste de développeur E2E au sein de notre équipe.');

    // Submit
    await page.getByTestId('submit-evaluation').click({ force: true });
    
    // 4. Verify toast and redirection
    // Check if there are validation errors
    const validationErrors = page.locator('.text-danger');
    if (await validationErrors.count() > 0) {
        console.log('Validation errors found:', await validationErrors.allTextContents());
    }

    // Increasing timeout because Celery Eager task might take time (PDF gen)
    await expect(page.locator('text=Évaluation soumise avec succès')).toBeVisible({ timeout: 20000 });

    // 5. Verify in Evaluations Page
    await page.goto('/evaluations');
    await expect(page.locator('h1:has-text("Évaluations")')).toBeVisible();
    
    // Check if the evaluation for Test Candidat is there
    const evalCard = page.locator('div.shadow-card').filter({ hasText: 'Test Candidat' }).first();
    await expect(evalCard).toBeVisible();
    await expect(evalCard.locator('text=Retenu')).toBeVisible();
  });
});
