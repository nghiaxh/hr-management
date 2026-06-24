import { Page } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
  }

  getStatCards() {
    return this.page.locator('[data-testid="stat-card"]');
  }

  async getStatValue(label: string) {
    return this.page.locator(`[data-testid="stat-${label}"]`).textContent();
  }
}
