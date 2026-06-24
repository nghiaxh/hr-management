import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Leaves', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('admin@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
  });

  test('my leaves page shows balance and requests', async ({ page }) => {
    await page.goto('/leaves');
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    expect(await page.locator('table tbody tr').count()).toBeGreaterThan(0);
  });

  test('leave approvals page shows pending requests', async ({ page }) => {
    await page.goto('/leaves/approvals');
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  test('employee can access my leaves', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('employee@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
    await page.goto('/leaves');
    await expect(page).toHaveURL(/\/leaves/);
  });

  test('employee cannot access approvals page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('employee@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
    await page.goto('/leaves/approvals');
    await expect(page).not.toHaveURL(/\/leaves\/approvals/);
  });
});
