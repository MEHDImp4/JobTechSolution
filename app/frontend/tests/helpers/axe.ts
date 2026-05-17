import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

export async function analyzeA11y(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForFunction(() => {
    const main = document.querySelector('main, [role="main"]')
    const root = document.querySelector('#root')
    return Boolean(main && root && root.childElementCount > 0)
  })

  return new AxeBuilder({ page })
    .disableRules(['color-contrast'])
    .analyze()
}
