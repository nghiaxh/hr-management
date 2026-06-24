import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Departments', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('admin@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
  });

  test('departments page lists departments', async ({ page }) => {
    await page.goto('/departments');
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    expect(await page.locator('table tbody tr').count()).toBeGreaterThan(0);
  });

  test('add department dialog opens', async ({ page }) => {
    await page.goto('/departments');
    await page.click('[data-testid="add-department-btn"]');
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('employee cannot access departments page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('employee@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
    await page.goto('/departments');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
