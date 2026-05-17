import { test, expect } from '@playwright/test'
import { loginAs, logout, users } from '../helpers/auth'
import { routes } from '../helpers/routes'

test('login invalide affiche une erreur', async ({ page }) => {
  await page.goto(routes.login)
  await page.getByLabel('Adresse e-mail').fill(users.rh.email)
  await page.getByLabel(/^Mot de passe$/).fill('wrong-password')
  await page.getByRole('button', { name: 'Se connecter' }).click()

  await expect(page).toHaveURL(/\/connexion$/)
  await expect(page.getByText(/identifiants|connexion|erreur/i)).toBeVisible()
})

test('login puis refresh conservent la session', async ({ page }) => {
  await loginAs(page, 'candidat')
  await expect(page).toHaveURL(/\/offres$/)
  await page.reload()
  await expect(page).toHaveURL(/\/offres$/)
})

test('logout renvoie à la connexion', async ({ page }) => {
  await loginAs(page, 'rh')
  await logout(page)
})
