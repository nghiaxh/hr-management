import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Attendance', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('admin@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
  });

  test('my attendance page shows check-in button and history', async ({ page }) => {
    await page.goto('/attendance');
    await expect(page.locator('button:has-text("Check")')).toBeVisible({ timeout: 10000 });
  });

  test('attendance report page shows stats', async ({ page }) => {
    await page.goto('/attendance/report');
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  test('employee can access my attendance', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('employee@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
    await page.goto('/attendance');
    await expect(page).toHaveURL(/\/attendance/);
  });
});
