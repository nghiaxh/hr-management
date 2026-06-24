import { test as setup } from '@playwright/test';

setup('global setup', async () => {
  // Seed data is handled by the webServer command in playwright.config.ts
  // This file exists for future global setup needs (e.g., test user creation)
});
