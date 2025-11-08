import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';
import { testUsers, testScreen } from './fixtures/test-data';

test.describe('Screen Setup Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    // Sign in as screen owner
    await authHelper.signUp(testUsers.screenOwner.email, testUsers.screenOwner.password);
    await page.goto('/role-selection');
    await page.getByRole('heading', { name: /screen owner/i }).click();
    await page.getByRole('button', { name: /get started as.*screen owner/i }).click();
  });

  test('should access screen registration page', async ({ page }) => {
    await page.goto('/screen-registration');
    
    // Should show registration form
    await expect(page.getByText(/register.*screen/i)).toBeVisible();
    await expect(page.getByLabel(/screen name/i)).toBeVisible();
  });

  test('should register new screen with basic info', async ({ page }) => {
    await page.goto('/screen-registration');
    
    // Fill in screen details
    await page.getByLabel(/screen name/i).fill(testScreen.name);
    await page.getByLabel(/location/i).fill(testScreen.location);
    await page.getByLabel(/price/i).fill(testScreen.pricePerSlot.toString());
    
    // Submit registration
    await page.getByRole('button', { name: /register|submit/i }).click();
    
    // Should show success message
    await expect(page.getByText(/success|registered|created/i)).toBeVisible({ timeout: 10000 });
  });

  test('should generate unique screen ID and QR code', async ({ page }) => {
    await page.goto('/screen-registration');
    
    await page.getByLabel(/screen name/i).fill(testScreen.name);
    await page.getByLabel(/location/i).fill(testScreen.location);
    await page.getByLabel(/price/i).fill(testScreen.pricePerSlot.toString());
    
    await page.getByRole('button', { name: /register|submit/i }).click();
    
    // Wait for registration to complete
    await page.waitForTimeout(2000);
    
    // Should display screen ID
    await expect(page.getByText(/screen id|id:/i)).toBeVisible();
    
    // Should display QR code
    await expect(page.locator('svg[role="img"], img[alt*="qr"]')).toBeVisible();
  });

  test('should set availability schedule', async ({ page }) => {
    await page.goto('/screen-owner-dashboard');
    
    // Navigate to availability settings
    await page.getByRole('button', { name: /availability|schedule/i }).click();
    
    // Set available hours
    await page.getByLabel(/start time|from/i).fill('09:00');
    await page.getByLabel(/end time|to/i).fill('18:00');
    
    // Save schedule
    await page.getByRole('button', { name: /save|update/i }).click();
    
    // Should show success message
    await expect(page.getByText(/saved|updated/i)).toBeVisible();
  });

  test('should update screen pricing', async ({ page }) => {
    await page.goto('/screen-owner-dashboard');
    
    // Find pricing controls
    await page.getByRole('button', { name: /pricing|edit price/i }).click();
    
    // Update price
    await page.getByLabel(/price per slot/i).fill('75');
    await page.getByRole('button', { name: /save|update/i }).click();
    
    // Should confirm update
    await expect(page.getByText(/updated|saved/i)).toBeVisible();
  });

  test('should view screen analytics', async ({ page }) => {
    await page.goto('/screen-owner-dashboard');
    
    // Should show revenue tracking
    await expect(page.getByText(/earnings|revenue/i)).toBeVisible();
    
    // Should show booking statistics
    await expect(page.getByText(/bookings|impressions/i)).toBeVisible();
  });

  test('should download screen application', async ({ page }) => {
    await page.goto('/screen-owner-dashboard');
    
    // Find download section
    await page.getByRole('button', { name: /download.*app/i }).click();
    
    // Should show platform options
    await expect(page.getByText(/android|ios|windows|macos/i)).toBeVisible();
  });
});
