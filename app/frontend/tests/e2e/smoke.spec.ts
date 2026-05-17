import { test, expect } from '@playwright/test'
import { routes } from '../helpers/routes'

test('l application charge et ne remonte pas d erreur console bloquante', async ({ page }) => {
  const severeErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error') {
      const text = message.text()
      if (!/favicon|Failed to load resource/i.test(text)) {
        severeErrors.push(text)
      }
    }
  })

  await page.goto(routes.login)
  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible()
  expect(severeErrors).toEqual([])
})
