import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export const users = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@jobtech.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'password123',
  },
  rh: {
    email: process.env.E2E_RH_EMAIL || 'rh@jobtech.com',
    password: process.env.E2E_RH_PASSWORD || 'password123',
  },
  recruteur: {
    email: process.env.E2E_RECRUTEUR_EMAIL || 'recruteur@jobtech.com',
    password: process.env.E2E_RECRUTEUR_PASSWORD || 'password123',
  },
  candidat: {
    email: process.env.E2E_CANDIDAT_EMAIL || 'candidat@jobtech.com',
    password: process.env.E2E_CANDIDAT_PASSWORD || 'password123',
  },
} as const

export type UserRole = keyof typeof users

export async function loginAs(page: Page, role: UserRole) {
  const user = users[role]
  await page.goto('/connexion')
  await page.getByLabel('Adresse e-mail').fill(user.email)
  await page.getByLabel(/^Mot de passe$/).fill(user.password)
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/auth/login/') && response.request().method() === 'POST'
    ),
    page.getByRole('button', { name: 'Se connecter' }).click(),
  ])
  await page.waitForURL((url) => !url.pathname.endsWith('/connexion'), { timeout: 15000 })
}

export async function logout(page: Page) {
  const menuButton = page.getByRole('button', { name: /menu utilisateur/i })
  await expect(menuButton).toBeVisible()
  await menuButton.click()
  await page.getByRole('button', { name: /se déconnecter/i }).click()
  await expect(page).toHaveURL(/\/connexion$/)
}
