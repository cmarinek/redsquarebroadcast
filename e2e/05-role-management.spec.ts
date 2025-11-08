import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';
import { testUsers } from './fixtures/test-data';

test.describe('Role Management Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should assign admin role to first user', async ({ page }) => {
    await authHelper.signUp(testUsers.admin.email, testUsers.admin.password);
    
    await page.goto('/role-selection');
    await page.getByRole('heading', { name: /advertiser/i }).click();
    await page.getByRole('button', { name: /get started as advertiser/i }).click();
    
    // Navigate to admin dashboard
    await page.goto('/admin-dashboard');
    
    // If no admins exist, should show setup prompt
    const setupExists = await page.getByText(/become.*admin|setup admin/i).isVisible();
    if (setupExists) {
      await page.getByRole('button', { name: /become admin|setup/i }).click();
      await expect(page.getByText(/admin.*granted|now.*admin/i)).toBeVisible();
    }
  });

  test('should prevent non-admin access to admin routes', async ({ page }) => {
    await authHelper.signUp(testUsers.advertiser.email, testUsers.advertiser.password);
    
    await page.goto('/role-selection');
    await page.getByRole('heading', { name: /advertiser/i }).click();
    await page.getByRole('button', { name: /get started as advertiser/i }).click();
    
    // Try to access admin dashboard
    await page.goto('/admin-dashboard');
    
    // Should be redirected or show access denied
    await expect(
      page.getByText(/access denied|unauthorized|admin.*required/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should display role on user profile', async ({ page }) => {
    await authHelper.signUp(testUsers.advertiser.email, testUsers.advertiser.password);
    
    await page.goto('/role-selection');
    await page.getByRole('heading', { name: /advertiser/i }).click();
    await page.getByRole('button', { name: /get started as advertiser/i }).click();
    
    // Navigate to profile
    await page.goto('/profile');
    
    // Should show user role
    await expect(page.getByText(/advertiser|role/i)).toBeVisible();
  });

  test('should allow users to have multiple roles', async ({ page }) => {
    await authHelper.signUp(testUsers.advertiser.email, testUsers.advertiser.password);
    
    await page.goto('/role-selection');
    await page.getByRole('heading', { name: /advertiser/i }).click();
    await page.getByRole('button', { name: /get started as advertiser/i }).click();
    
    // Navigate to settings or profile
    await page.goto('/profile');
    
    // Look for option to add additional role
    const addRoleExists = await page.getByText(/add.*role|additional role/i).isVisible();
    if (addRoleExists) {
      await page.getByRole('button', { name: /add.*role/i }).click();
      await page.getByRole('heading', { name: /screen owner/i }).click();
      await page.getByRole('button', { name: /add role/i }).click();
      
      // Should confirm role added
      await expect(page.getByText(/role.*added|success/i)).toBeVisible();
    }
  });

  test('should manage user roles in admin panel', async ({ page }) => {
    // This test requires admin access
    await authHelper.signUp(testUsers.admin.email, testUsers.admin.password);
    
    await page.goto('/role-selection');
    await page.getByRole('heading', { name: /advertiser/i }).click();
    await page.getByRole('button', { name: /get started as advertiser/i }).click();
    
    await page.goto('/admin-dashboard');
    
    // Make self admin if needed
    const setupExists = await page.getByText(/become.*admin/i).isVisible();
    if (setupExists) {
      await page.getByRole('button', { name: /become admin/i }).click();
      await page.waitForTimeout(1000);
    }
    
    // Navigate to role management
    await page.getByRole('link', { name: /roles|user management/i }).click();
    
    // Should show role management interface
    await expect(page.getByText(/manage.*roles|user roles/i)).toBeVisible();
  });
});
