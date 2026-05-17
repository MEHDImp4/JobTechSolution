import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'
import { routes } from '../helpers/routes'
import { expectNoHorizontalOverflow } from '../helpers/screenshots'
import { responsiveViewports } from '../helpers/test-data'

test('navigation mobile reste utilisable sans overflow horizontal', async ({ page }) => {
  await page.setViewportSize(responsiveViewports.mobile)
  await loginAs(page, 'rh')
  await page.goto(routes.dashboard)

  await page.getByRole('button', { name: /open menu/i }).click()
  await expect(page.getByRole('link', { name: /tableau de bord/i })).toBeVisible()
  await expectNoHorizontalOverflow(page)
})

test('page candidatures tablette garde sa structure', async ({ page }) => {
  await page.setViewportSize(responsiveViewports.tablet)
  await loginAs(page, 'rh')
  await page.goto(routes.candidatures)
  await expectNoHorizontalOverflow(page)
  await expect(page).toHaveScreenshot('responsive-candidatures-tablet.png', {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  })
})
