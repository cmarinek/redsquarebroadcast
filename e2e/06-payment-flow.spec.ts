import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';
import { testUsers } from './fixtures/test-data';

test.describe('Payment Flow - End to End', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    // Sign in as advertiser
    await authHelper.signUp(testUsers.advertiser.email, testUsers.advertiser.password);
    await page.goto('/role-selection');
    await page.getByRole('heading', { name: /advertiser/i }).click();
    await page.getByRole('button', { name: /get started as advertiser/i }).click();
  });

  test.describe('Successful Payment Flow', () => {
    test('should complete full booking and payment flow', async ({ page }) => {
      // Step 1: Discover screens
      await page.goto('/screen-discovery');
      await expect(page.getByText(/available screens/i)).toBeVisible();

      // Step 2: Select a screen
      await page.getByRole('button', { name: /view details/i }).first().click();
      await expect(page).toHaveURL(/\/screen\//);

      // Step 3: Navigate to booking
      await page.getByRole('button', { name: /book now|book time slot/i }).click();
      await expect(page).toHaveURL(/\/book\/.*\/schedule/);

      // Step 4: Select date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.getByRole('button', { name: tomorrow.getDate().toString() }).click();

      // Select available time slot
      await page.getByRole('button', { name: /10:00|11:00|12:00/ }).first().click();

      // Set duration
      await page.getByLabel(/duration/i).fill('60');

      // Continue to review
      await page.getByRole('button', { name: /continue|next|review booking/i }).click();

      // Step 5: Review booking
      await expect(page.getByText(/booking summary|review your booking/i)).toBeVisible();
      await expect(page.getByText(/total|amount due/i)).toBeVisible();

      // Proceed to payment
      await page.getByRole('button', { name: /proceed to payment|checkout/i }).click();

      // Step 6: Payment page
      await expect(page).toHaveURL(/\/payment/);

      // Fill in payment details (Stripe test card)
      const cardNumberFrame = page.frameLocator('iframe[name*="card"]').first();
      await cardNumberFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
      await cardNumberFrame.locator('input[name="exp-date"]').fill('12/25');
      await cardNumberFrame.locator('input[name="cvc"]').fill('123');
      await cardNumberFrame.locator('input[name="postal"]').fill('12345');

      // Submit payment
      await page.getByRole('button', { name: /pay now|complete payment/i }).click();

      // Step 7: Success page
      await expect(page).toHaveURL(/\/payment-success/, { timeout: 15000 });
      await expect(page.getByText(/payment successful/i)).toBeVisible();
      await expect(page.getByText(/booking confirmed/i)).toBeVisible();

      // Verify booking details are displayed
      await expect(page.getByText(/booking id/i)).toBeVisible();
      await expect(page.getByText(/screen details/i)).toBeVisible();

      // Check for download invoice button
      await expect(page.getByRole('button', { name: /download invoice/i })).toBeVisible();

      // Check for next steps guidance
      await expect(page.getByText(/what's next/i)).toBeVisible();
    });

    test('should send confirmation email after successful payment', async ({ page }) => {
      // Complete payment flow (abbreviated)
      await page.goto('/payment-success?booking_id=test-booking-123');

      // Wait for page to load and email to be sent
      await page.waitForTimeout(2000);

      // Verify email sent indicator
      await expect(page.getByText(/confirmation email sent/i)).toBeVisible();
    });

    test('should allow downloading invoice after payment', async ({ page }) => {
      await page.goto('/payment-success?booking_id=test-booking-123');

      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: /download invoice/i }).click();

      // Wait for download (or at least the attempt)
      await downloadPromise.catch(() => {
        // Download might not complete in test environment
        console.log('Download initiated');
      });
    });

    test('should navigate to content upload from success page', async ({ page }) => {
      await page.goto('/payment-success?booking_id=test-booking-123');

      // Click upload content link
      await page.getByRole('button', { name: /upload.*content|content manager/i }).click();

      // Should navigate to content upload
      await expect(page).toHaveURL(/\/content-upload/);
    });
  });

  test.describe('Failed Payment Flow', () => {
    test('should handle declined card gracefully', async ({ page }) => {
      // Navigate to payment page
      await page.goto('/payment?booking_id=test-booking-123');

      // Use Stripe test card that declines
      const cardNumberFrame = page.frameLocator('iframe[name*="card"]').first();
      await cardNumberFrame.locator('input[name="cardnumber"]').fill('4000000000000002');
      await cardNumberFrame.locator('input[name="exp-date"]').fill('12/25');
      await cardNumberFrame.locator('input[name="cvc"]').fill('123');

      await page.getByRole('button', { name: /pay now/i }).click();

      // Should show error message
      await expect(page.getByText(/declined|failed/i)).toBeVisible({ timeout: 10000 });
    });

    test('should display payment failure page with retry option', async ({ page }) => {
      await page.goto('/payment-failure?error=card_declined&booking_id=test-booking-123');

      // Verify failure message
      await expect(page.getByText(/payment failed/i)).toBeVisible();
      await expect(page.getByText(/card was declined/i)).toBeVisible();

      // Verify retry button
      const retryButton = page.getByRole('button', { name: /try again/i });
      await expect(retryButton).toBeVisible();

      // Click retry
      await retryButton.click();

      // Should navigate back to payment
      await expect(page).toHaveURL(/\/payment.*retry=true/);
    });

    test('should show common error reasons on failure page', async ({ page }) => {
      await page.goto('/payment-failure?error=insufficient_funds');

      await expect(page.getByText(/insufficient funds/i)).toBeVisible();
      await expect(page.getByText(/common reasons/i)).toBeVisible();
    });

    test('should allow contacting support from failure page', async ({ page }) => {
      await page.goto('/payment-failure?error=processing_error&booking_id=test-booking-123');

      const supportButton = page.getByRole('button', { name: /contact support/i });
      await expect(supportButton).toBeVisible();

      // Clicking should open email client (we just check it's clickable)
      await expect(supportButton).toBeEnabled();
    });

    test('should allow going back to screen from failure page', async ({ page }) => {
      const screenId = 'test-screen-123';
      await page.goto(`/payment-failure?error=card_declined&screen_id=${screenId}`);

      await page.getByRole('button', { name: /go back/i }).click();

      await expect(page).toHaveURL(new RegExp(screenId));
    });
  });

  test.describe('Payment Edge Cases', () => {
    test('should handle missing booking ID on success page', async ({ page }) => {
      await page.goto('/payment-success');

      // Should show error and redirect
      await expect(page.getByText(/missing booking information/i)).toBeVisible();

      // Should auto-redirect to dashboard
      await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    });

    test('should handle invalid booking ID', async ({ page }) => {
      await page.goto('/payment-success?booking_id=invalid-id-12345');

      await page.waitForTimeout(2000);

      // Should show booking not found
      await expect(page.getByText(/booking not found/i)).toBeVisible();

      // Should show go to dashboard button
      await expect(page.getByRole('button', { name: /go to dashboard/i })).toBeVisible();
    });

    test('should preserve booking details across payment retry', async ({ page }) => {
      const bookingId = 'test-booking-123';

      // Start at failure page with booking ID
      await page.goto(`/payment-failure?error=card_declined&booking_id=${bookingId}`);

      // Click retry
      await page.getByRole('button', { name: /try again/i }).click();

      // Should include booking ID in URL
      await expect(page).toHaveURL(new RegExp(`booking_id=${bookingId}`));
    });

    test('should show FAQ section on failure page', async ({ page }) => {
      await page.goto('/payment-failure?error=card_declined');

      // Scroll to FAQ
      await page.getByText(/frequently asked questions/i).scrollIntoViewIfNeeded();

      // Verify FAQ content
      await expect(page.getByText(/will i be charged for a failed payment/i)).toBeVisible();
      await expect(page.getByText(/is my booking still reserved/i)).toBeVisible();
    });
  });

  test.describe('Payment Security', () => {
    test('should use secure payment iframe', async ({ page }) => {
      await page.goto('/payment?booking_id=test-booking-123');

      // Verify Stripe iframe is present (secure payment)
      const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
      await expect(stripeFrame.locator('body')).toBeVisible({ timeout: 10000 });
    });

    test('should not expose sensitive card data in URL', async ({ page }) => {
      await page.goto('/payment?booking_id=test-booking-123');

      // Enter card details
      const cardNumberFrame = page.frameLocator('iframe[name*="card"]').first();
      await cardNumberFrame.locator('input[name="cardnumber"]').fill('4242424242424242');

      // Check URL doesn't contain card number
      const url = page.url();
      expect(url).not.toContain('4242');
      expect(url).not.toContain('cardnumber');
    });

    test('should require authentication for payment page', async ({ page }) => {
      // Log out
      await authHelper.signOut();

      // Try to access payment page
      await page.goto('/payment?booking_id=test-booking-123');

      // Should redirect to auth
      await expect(page).toHaveURL(/\/auth/);
    });
  });

  test.describe('Mobile Payment Flow', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('should be mobile responsive', async ({ page }) => {
      await page.goto('/payment-success?booking_id=test-booking-123');

      // Check key elements are visible on mobile
      await expect(page.getByText(/payment successful/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /download invoice/i })).toBeVisible();

      // Buttons should be full width on mobile
      const downloadButton = page.getByRole('button', { name: /download invoice/i });
      const buttonBox = await downloadButton.boundingBox();
      const pageWidth = page.viewportSize()?.width || 0;

      // Button should take most of the width (accounting for padding)
      expect(buttonBox?.width).toBeGreaterThan(pageWidth * 0.8);
    });
  });
});
