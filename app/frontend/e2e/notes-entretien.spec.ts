import { test, expect } from '@playwright/test';

test.describe('Interview Interface (Auto-save)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as RH
    await page.goto('/connexion');
    await page.locator('input[name="email"]').fill('rh-test@jobtech.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should allow RH to write notes and auto-save', async ({ page }) => {
    // 1. Go to Entretiens
    await page.goto('/entretiens');
    await expect(page.locator('h1:has-text("Entretiens")')).toBeVisible();

    // 2. Open Notes Modal for the specific interview
    // Filter by both candidate and offer to be unique
    const interviewCard = page.locator('div.shadow-card', { hasText: 'Test Candidat' }).filter({ hasText: 'Dev E2E' }).first();
    await expect(interviewCard).toBeVisible({ timeout: 10000 });
    
    await interviewCard.getByRole('button', { name: 'Prendre des notes' }).click();
    await expect(page.locator('text=Notes d\'entretien')).toBeVisible();

    // 3. Type some unique notes
    const uniqueNote = `E2E Note ${Math.random().toString(36).substring(7)}`;
    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.fill(uniqueNote); // Simple fill is faster and safer for uniqueness check
    
    // 4. Verify Auto-save indicator using data-testid
    const indicator = page.getByTestId('save-indicator');
    await expect(indicator).toContainText(/:/, { timeout: 15000 });

    // 5. Close and Re-open to verify persistence
    await page.locator('button:has-text("Fermer")').last().click();
    await expect(page.locator('text=Notes d\'entretien')).not.toBeVisible();
    
    // RE-OPEN the same card
    await interviewCard.getByRole('button', { name: 'Prendre des notes' }).click();
    
    // Check if value is persistent
    await expect(textarea).toHaveValue(uniqueNote);
    
    // Close again
    await page.locator('button:has-text("Fermer")').last().click();
  });
});
