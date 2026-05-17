import { Page, expect } from '@playwright/test';
import { USERS } from '../fixtures/users';

export type Role = keyof typeof USERS;

export async function loginAs(page: Page, role: Role) {
  const user = USERS[role];
  
  await page.goto('/connexion');
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole('button', { name: 'Se connecter' }).click();

  // Attendre la redirection selon le rôle
  if (role === 'candidat') {
    await expect(page).toHaveURL(/.*\/offres/, { timeout: 10000 });
  } else {
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  }
}

export async function logout(page: Page) {
  const mobileMenuBtn = page.getByRole('button', { name: /open menu/i });
  if (await mobileMenuBtn.isVisible().catch(() => false)) {
    await mobileMenuBtn.click();
  }

  const namedProfileBtn = page.getByRole('button', {
    name: /candidat|recruteur|responsable rh|administrateur/i,
  });
  const fallbackProfileBtn = page.locator('header button').last();
  const profileMenuBtn = await namedProfileBtn.isVisible().catch(() => false)
    ? namedProfileBtn
    : fallbackProfileBtn;

  await expect(profileMenuBtn).toBeVisible();
  await profileMenuBtn.click();

  const logoutBtn = page.getByRole('button', { name: /se déconnecter/i });
  await expect(logoutBtn).toBeVisible();
  await logoutBtn.click();

  await expect(page).toHaveURL(/.*\/connexion/);
  await page.evaluate(() => localStorage.clear());
}
