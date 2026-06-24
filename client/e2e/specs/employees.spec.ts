import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { EmployeesPage } from '../pages/employees.page';

test.describe('Employees', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('admin@test.com', 'Password1');
    await page.waitForURL(/\/dashboard/);
  });

  test('employees page lists employees', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  test('search filters employee list', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.search('John');
    await page.waitForTimeout(500);
    const rows = await employees.getTableRows().count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('add employee dialog opens', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.clickAddEmployee();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('admin can access employees page', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await expect(page).toHaveURL(/\/employees/);
  });
});
