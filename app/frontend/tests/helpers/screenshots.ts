import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function expectStablePageScreenshot(page: Page, name: string, masks: Locator[] = []) {
  await expect(page).toHaveScreenshot(name, {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
    mask: masks,
  })
}

export async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth
  })

  expect(hasOverflow).toBe(false)
}
