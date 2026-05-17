import { Page, expect } from '@playwright/test';

export async function navigateTo(page: Page, linkName: string | RegExp) {
  await page.getByRole('link', { name: linkName }).click();
}

export async function expectPageTitle(page: Page, titlePattern: RegExp | string) {
  await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(titlePattern);
}
