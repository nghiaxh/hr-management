import { Page } from '@playwright/test';

export class EmployeesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employees');
  }

  async search(query: string) {
    await this.page.fill('[data-testid="search-input"]', query);
    await this.page.waitForTimeout(300);
  }

  getTableRows() {
    return this.page.locator('table tbody tr');
  }

  async clickAddEmployee() {
    await this.page.click('[data-testid="add-employee-btn"]');
  }
}
