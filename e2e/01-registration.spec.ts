import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';
import { testUsers } from './fixtures/test-data';

test.describe('User Registration Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should complete advertiser registration', async ({ page }) => {
    // Sign up
    await authHelper.signUp(testUsers.advertiser.email, testUsers.advertiser.password);
    
    // Should redirect to role selection
    await expect(page).toHaveURL(/\/role-selection/);
    
    // Select advertiser role
    await page.getByRole('heading', { name: /advertiser/i }).click();
    await page.getByRole('button', { name: /get started as advertiser/i }).click();
    
    // Should redirect to home after role selection
    await expect(page).toHaveURL('/');
    
    // Verify user is authenticated
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should complete screen owner registration', async ({ page }) => {
    // Sign up
    await authHelper.signUp(testUsers.screenOwner.email, testUsers.screenOwner.password);
    
    // Should redirect to role selection
    await expect(page).toHaveURL(/\/role-selection/);
    
    // Select screen owner role
    await page.getByRole('heading', { name: /screen owner/i }).click();
    await page.getByRole('button', { name: /get started as.*screen owner/i }).click();
    
    // Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('should handle duplicate email registration', async ({ page }) => {
    const duplicateUser = {
      email: testUsers.advertiser.email,
      password: 'AnotherPassword123!',
    };

    // Try to sign up with already used email
    await authHelper.signUp(duplicateUser.email, duplicateUser.password);
    
    // Should show error message
    await expect(page.getByText(/already registered|already exists/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth');
    await page.getByRole('tab', { name: /sign up/i }).click();
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).first().fill('TestPassword123!');
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/auth');
    await page.getByRole('tab', { name: /sign up/i }).click();
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).first().fill('weak');
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Should show password validation error
    await expect(page.getByText(/password.*6 characters/i)).toBeVisible();
  });
});
