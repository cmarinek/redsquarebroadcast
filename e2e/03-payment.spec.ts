import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';
import { testUsers } from './fixtures/test-data';

test.describe('Payment Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    // Set up authenticated user
    await authHelper.signUp(testUsers.advertiser.email, testUsers.advertiser.password);
    await page.goto('/role-selection');
    await page.getByRole('heading', { name: /advertiser/i }).click();
    await page.getByRole('button', { name: /get started as advertiser/i }).click();
  });

  test('should display payment page with correct details', async ({ page }) => {
    await page.goto('/payment');
    
    // Should show payment form
    await expect(page.getByText(/payment details|card information/i)).toBeVisible();
    await expect(page.getByLabel(/card number/i)).toBeVisible();
  });

  test('should validate card number format', async ({ page }) => {
    await page.goto('/payment');
    
    await page.getByLabel(/card number/i).fill('1234');
    await page.getByRole('button', { name: /pay|submit|complete/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/invalid card|card number.*invalid/i)).toBeVisible();
  });

  test('should process test payment successfully', async ({ page }) => {
    await page.goto('/payment');
    
    // Fill in Stripe test card
    await page.getByLabel(/card number/i).fill('4242424242424242');
    await page.getByLabel(/expiry|expiration/i).fill('12/25');
    await page.getByLabel(/cvc|cvv/i).fill('123');
    await page.getByLabel(/zip|postal/i).fill('10001');
    
    await page.getByRole('button', { name: /pay|submit|complete/i }).click();
    
    // Should redirect to confirmation
    await expect(page).toHaveURL(/\/confirmation/, { timeout: 15000 });
    await expect(page.getByText(/success|confirmed|complete/i)).toBeVisible();
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    await page.goto('/payment');
    
    // Use Stripe test card that fails
    await page.getByLabel(/card number/i).fill('4000000000000002');
    await page.getByLabel(/expiry|expiration/i).fill('12/25');
    await page.getByLabel(/cvc|cvv/i).fill('123');
    await page.getByLabel(/zip|postal/i).fill('10001');
    
    await page.getByRole('button', { name: /pay|submit|complete/i }).click();
    
    // Should show error message
    await expect(page.getByText(/payment failed|declined|error/i)).toBeVisible();
  });

  test('should display order summary before payment', async ({ page }) => {
    await page.goto('/payment');
    
    // Should show summary section
    await expect(page.getByText(/order summary|booking details/i)).toBeVisible();
    await expect(page.getByText(/total|amount/i)).toBeVisible();
  });
});
