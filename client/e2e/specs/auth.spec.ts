import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('login page renders correctly', async ({ page }) => {
    await loginPage.goto();
    await expect(page.locator('h1')).toContainText(/login|sign in/i);
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('admin@test.com', 'Password1');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('invalid credentials shows error message', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('wrong@test.com', 'wrong');
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
  });

  test('protected route redirects unauthenticated user', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('admin@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
    await page.click('[aria-label="Logout"]');
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/\/login/);
  });
});
