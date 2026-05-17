import { test } from '@playwright/test'
import { loginAs } from '../helpers/auth'
import { routes } from '../helpers/routes'
import { expectStablePageScreenshot } from '../helpers/screenshots'

test('snapshot page login', async ({ page }) => {
  await page.goto(routes.login)
  await expectStablePageScreenshot(page, 'page-login.png')
})

test('snapshot dashboard RH', async ({ page }) => {
  await loginAs(page, 'rh')
  await page.goto(routes.dashboard)
  await expectStablePageScreenshot(page, 'page-dashboard-rh.png')
})

test('snapshot liste offres candidat', async ({ page }) => {
  await loginAs(page, 'candidat')
  await page.goto(routes.offers)
  await expectStablePageScreenshot(page, 'page-offres-candidat.png')
})

test('snapshot statistiques RH', async ({ page }) => {
  await loginAs(page, 'rh')
  await page.goto(routes.statistiques)
  await expectStablePageScreenshot(page, 'page-statistiques-rh.png')
})

test('snapshot 404', async ({ page }) => {
  await page.goto(routes.notFound)
  await expectStablePageScreenshot(page, 'page-404.png')
})
