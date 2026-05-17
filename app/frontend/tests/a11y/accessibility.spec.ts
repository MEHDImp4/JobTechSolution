import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'
import { analyzeA11y } from '../helpers/axe'
import { routes } from '../helpers/routes'

test('page login sans violation axe critique', async ({ page }) => {
  await page.goto(routes.login)
  const results = await analyzeA11y(page)
  expect(results.violations).toEqual([])
})

test('dashboard RH sans violation axe critique', async ({ page }) => {
  await loginAs(page, 'rh')
  await page.goto(routes.dashboard)
  const results = await analyzeA11y(page)
  expect(results.violations).toEqual([])
})

test('modale admin sans violation axe critique', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto(routes.adminUsers)
  await page.getByRole('button', { name: /importer/i }).click()
  const results = await analyzeA11y(page)
  expect(results.violations).toEqual([])
})
