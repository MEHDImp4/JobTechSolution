import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'
import { routes } from '../helpers/routes'

function contrastRatio(rgbA: number[], rgbB: number[]) {
  const luminance = (rgb: number[]) => {
    const channels = rgb.map((value) => {
      const normalized = value / 255
      return normalized <= 0.03928
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4
    })

    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  }

  const a = luminance(rgbA)
  const b = luminance(rgbB)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}

test('les CTA principaux gardent un contraste lisible', async ({ page }) => {
  await loginAs(page, 'rh')
  await page.goto(routes.dashboard)

  const ratio = await page.getByRole('link', { name: /candidatures/i }).first().evaluate((element) => {
    const color = window.getComputedStyle(element).color
    const background = window.getComputedStyle(element).backgroundColor

    const parse = (value: string) => value.match(/\d+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0]
    return { foreground: parse(color), background: parse(background) }
  })

  expect(contrastRatio(ratio.foreground, ratio.background)).toBeGreaterThan(3)
})

test('aucun élément invisible cliquable sur login', async ({ page }) => {
  await page.goto(routes.login)

  const invisibleClickableCount = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('button, a, input, select, textarea'))
    return elements.filter((element) => {
      const styles = window.getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return styles.opacity === '0' && rect.width > 0 && rect.height > 0
    }).length
  })

  expect(invisibleClickableCount).toBe(0)
})
