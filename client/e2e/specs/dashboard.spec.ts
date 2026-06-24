import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('admin@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
  });

  test('dashboard displays stat cards', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await expect(dashboard.getStatCards().first()).toBeVisible({ timeout: 10000 });
    expect(await dashboard.getStatCards().count()).toBeGreaterThan(0);
  });

  test('employee dashboard shows personal stats', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('employee@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
    const dashboard = new DashboardPage(page);
    await expect(dashboard.getStatCards().first()).toBeVisible({ timeout: 10000 });
  });
});
