import { test, expect } from '@playwright/test';

test.describe('Routine Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Test1234!');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Wait for redirect to dashboard
    await page.waitForURL(/\/$/);
  });

  test('should navigate to routines page', async ({ page }) => {
    await page.goto('/routines');
    await expect(page.getByRole('heading', { name: /my routines/i })).toBeVisible();
  });

  test('should create a new routine', async ({ page }) => {
    await page.goto('/routines');
    await page.getByRole('link', { name: /create routine/i }).click();
    await expect(page.getByRole('heading', { name: /create routine/i })).toBeVisible();
  });

  test('should navigate to exercise library', async ({ page }) => {
    await page.goto('/exercises');
    await expect(page.getByRole('heading', { name: /exercise library/i })).toBeVisible();
  });
});
