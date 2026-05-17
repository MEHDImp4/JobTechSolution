import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const MEHDI_TAZI_NAME = /(?:mehdi tazi|tazi mehdi)/i;

test.describe('Evaluation Form (5 Stars)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'rh');
  });

  test('should allow RH to evaluate a candidate after interview', async ({ page }) => {
    await page.goto('/entretiens');

    const interviewCard = page
      .locator('div.rounded-xl')
      .filter({ hasText: MEHDI_TAZI_NAME })
      .filter({ hasText: 'Stage Développeur Frontend' })
      .first();
    await expect(interviewCard).toBeVisible({ timeout: 10000 });

    await interviewCard.locator('select').selectOption('termine');
    const evalBtn = interviewCard.getByRole('button', { name: 'Évaluer' });
    await expect(evalBtn).toBeVisible({ timeout: 10000 });
    await evalBtn.click();

    await expect(page.locator('text=Évaluer le candidat')).toBeVisible();

    const criteria = ['compétences', 'communication', 'motivation', 'adaptabilité', 'culture-fit'];
    for (const c of criteria) {
        await page.getByTestId(`stars-${c}`).locator('button').nth(3).click();
    }

    await page.getByText('Retenu', { exact: true }).click();

    await page
      .getByPlaceholder('Résume l’entretien, les points observés, le niveau du candidat et la justification de ta recommandation.')
      .fill('Le candidat a passé un excellent entretien technique. Sa maîtrise de Playwright est impressionnante. Je recommande fortement son embauche pour ce poste de développeur E2E au sein de notre équipe.');
    await page.getByTestId('submit-evaluation').click({ force: true });

    await expect(page.locator('text=Évaluation soumise avec succès')).toBeVisible({ timeout: 20000 });

    await page.goto('/evaluations');
    await expect(page.locator('h1:has-text("Évaluations")')).toBeVisible();

    const evalCard = page
      .locator('div.rounded-xl')
      .filter({ hasText: MEHDI_TAZI_NAME })
      .filter({ hasText: 'Stage Développeur Frontend' })
      .first();
    await expect(evalCard).toBeVisible();
    await expect(evalCard.locator('text=Retenu')).toBeVisible();
  });
});
