import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'
import { routes } from '../helpers/routes'

test('une page protégée redirige vers la connexion', async ({ page }) => {
  await page.goto(routes.dashboard)
  await expect(page).toHaveURL(/\/connexion$/)
})

test('la navigation staff affiche les entrées principales', async ({ page }) => {
  await loginAs(page, 'rh')
  await page.goto(routes.dashboard)

  await expect(page.getByRole('link', { name: /candidatures/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /statistiques/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /entretiens/i })).toBeVisible()
})
