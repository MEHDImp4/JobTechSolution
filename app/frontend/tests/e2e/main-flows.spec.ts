import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'
import { routes } from '../helpers/routes'

test('le candidat peut rechercher une offre et ouvrir son détail', async ({ page }) => {
  await loginAs(page, 'candidat')
  await page.goto(routes.offers)

  await expect(page.getByRole('heading', { name: /offres/i })).toBeVisible()
  const cards = page.locator('article, [data-testid="job-card"]')
  await expect(cards.first()).toBeVisible()

  const firstTitle = await cards.first().locator('h3, h2').first().textContent()
  if (firstTitle) {
    await page.getByRole('textbox').first().fill(firstTitle.trim())
  }

  await cards.first().click()
  await expect(page).toHaveURL(/\/offres\/\d+/)
})

test('le responsable RH accède à la gestion des offres et à la liste des candidatures', async ({ page }) => {
  await loginAs(page, 'rh')

  await page.goto(routes.offersManage)
  await expect(page.getByRole('heading', { name: /offres/i })).toBeVisible()

  await page.goto(routes.candidatures)
  await expect(page.getByText(/postes|candidatures/i).first()).toBeVisible()
})
