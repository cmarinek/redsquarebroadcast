import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';
import { testUsers, testBooking } from './fixtures/test-data';

test.describe('Booking Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    // Sign in as advertiser
    await authHelper.signUp(testUsers.advertiser.email, testUsers.advertiser.password);
    await page.goto('/role-selection');
    await page.getByRole('heading', { name: /advertiser/i }).click();
    await page.getByRole('button', { name: /get started as advertiser/i }).click();
  });

  test('should discover screens on map', async ({ page }) => {
    await page.goto('/screen-discovery');
    
    // Wait for map to load
    await expect(page.locator('.mapboxgl-canvas, .leaflet-container')).toBeVisible({ timeout: 10000 });
    
    // Should show screens
    await expect(page.getByText(/available screens/i)).toBeVisible();
  });

  test('should view screen details', async ({ page }) => {
    await page.goto('/screen-discovery');
    
    // Click on first available screen
    await page.getByRole('button', { name: /view details/i }).first().click();
    
    // Should show screen details page
    await expect(page).toHaveURL(/\/screen-details/);
    await expect(page.getByText(/price per slot/i)).toBeVisible();
    await expect(page.getByText(/book time slot/i)).toBeVisible();
  });

  test('should complete booking with calendar selection', async ({ page }) => {
    await page.goto('/scheduling');
    
    // Select date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByRole('button', { name: tomorrow.getDate().toString() }).click();
    
    // Select time slot
    await page.getByRole('button', { name: /10:00|11:00|12:00/ }).first().click();
    
    // Select duration
    await page.getByLabel(/duration/i).fill(testBooking.duration.toString());
    
    // Proceed to confirmation
    await page.getByRole('button', { name: /continue|next/i }).click();
    
    // Should show booking summary
    await expect(page.getByText(/booking summary|confirm booking/i)).toBeVisible();
  });

  test('should prevent booking unavailable slots', async ({ page }) => {
    await page.goto('/scheduling');
    
    // Try to select a past date
    await page.getByRole('button', { name: '1' }).first().click();
    
    // Should show error or disable the slot
    await expect(
      page.getByText(/unavailable|past date|not available/i)
    ).toBeVisible();
  });

  test('should calculate correct booking price', async ({ page }) => {
    await page.goto('/scheduling');
    
    // Select booking details
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByRole('button', { name: tomorrow.getDate().toString() }).click();
    await page.getByRole('button', { name: /10:00/ }).first().click();
    await page.getByLabel(/duration/i).fill('60');
    
    await page.getByRole('button', { name: /continue|next/i }).click();
    
    // Should display total cost
    await expect(page.getByText(/total.*\$/i)).toBeVisible();
    await expect(page.getByText(/platform fee/i)).toBeVisible();
  });
});
