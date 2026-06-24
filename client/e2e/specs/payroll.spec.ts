import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Payroll', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('admin@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
  });

  test('my payroll page shows payslip history', async ({ page }) => {
    await page.goto('/payroll');
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  test('payroll management page shows admin controls', async ({ page }) => {
    await page.goto('/payroll/manage');
    await expect(page.locator('button:has-text("Process")').first()).toBeVisible({ timeout: 10000 });
  });

  test('employee sees my payroll not management', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('employee@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
    await page.goto('/payroll/manage');
    await expect(page).not.toHaveURL(/\/payroll\/manage/);
  });
});
