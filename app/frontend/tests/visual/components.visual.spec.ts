import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'
import { routes } from '../helpers/routes'

test('snapshot modale import utilisateurs', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto(routes.adminUsers)
  await page.getByRole('button', { name: /importer/i }).click()
  await expect(page.getByRole('dialog')).toHaveScreenshot('component-modal-import-utilisateurs.png', {
    animations: 'disabled',
    caret: 'hide',
  })
})

test('snapshot menu utilisateur', async ({ page }) => {
  await loginAs(page, 'rh')
  await page.goto(routes.dashboard)
  await page.locator('header button').last().click()
  await expect(page.locator('header')).toHaveScreenshot('component-topbar-user-menu.png', {
    animations: 'disabled',
    caret: 'hide',
  })
})
