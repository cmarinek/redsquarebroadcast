import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';
import { testUsers } from './fixtures/test-data';
import path from 'path';

test.describe('Content Upload Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    // Sign in as advertiser/broadcaster
    await authHelper.signUp(testUsers.advertiser.email, testUsers.advertiser.password);
    await page.goto('/role-selection');
    await page.getByRole('heading', { name: /broadcaster/i }).click();
    await page.getByRole('button', { name: /get started/i }).click();
  });

  test.describe('Upload Interface', () => {
    test('should display upload interface', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      await expect(page.getByText(/upload.*content/i)).toBeVisible();
      await expect(page.getByText(/drag.*drop|choose file/i)).toBeVisible();
      await expect(page.getByText(/supported formats/i)).toBeVisible();
    });

    test('should show supported file types', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      await expect(page.getByText(/image/i)).toBeVisible();
      await expect(page.getByText(/video/i)).toBeVisible();
      await expect(page.getByText(/gif/i)).toBeVisible();
    });

    test('should have file size limits displayed', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      await expect(page.getByText(/50.*mb|size limit/i)).toBeVisible();
    });
  });

  test.describe('Image Upload', () => {
    test('should upload valid image file', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      // Create a test image file
      const fileInput = page.locator('input[type="file"]');
      const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

      await fileInput.setInputFiles(testImagePath);

      // Should show preview
      await expect(page.locator('img[alt*="preview"]')).toBeVisible({ timeout: 5000 });

      // Should show file details
      await expect(page.getByText(/file size/i)).toBeVisible();
      await expect(page.getByText(/image/i)).toBeVisible();
    });

    test('should reject oversized images', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      // Create mock large file (>50MB)
      const largeFileContent = new Array(51 * 1024 * 1024).join('a');
      const blob = new Blob([largeFileContent], { type: 'image/jpeg' });
      const file = new File([blob], 'large-image.jpg', { type: 'image/jpeg' });

      const dataTransfer = await page.evaluateHandle((file) => {
        const dt = new DataTransfer();
        dt.items.add(file);
        return dt;
      }, file);

      const fileInput = page.locator('input[type="file"]');
      await fileInput.evaluate((input: HTMLInputElement, dt: DataTransfer) => {
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, dataTransfer);

      // Should show error
      await expect(page.getByText(/too large|size limit|50.*mb/i)).toBeVisible();
    });

    test('should reject invalid file types', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      const fileInput = page.locator('input[type="file"]');

      // Try to upload .exe file
      const invalidFile = new File(['test'], 'malware.exe', { type: 'application/x-msdownload' });
      const dataTransfer = await page.evaluateHandle((file) => {
        const dt = new DataTransfer();
        dt.items.add(file);
        return dt;
      }, invalidFile);

      await fileInput.evaluate((input: HTMLInputElement, dt: DataTransfer) => {
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, dataTransfer);

      await expect(page.getByText(/invalid.*file.*type|not supported/i)).toBeVisible();
    });
  });

  test.describe('Video Upload', () => {
    test('should upload valid video file', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      const fileInput = page.locator('input[type="file"]');
      const testVideoPath = path.join(__dirname, 'fixtures', 'test-video.mp4');

      await fileInput.setInputFiles(testVideoPath);

      // Should show video preview
      await expect(page.locator('video')).toBeVisible({ timeout: 5000 });

      // Should show play/pause button
      await expect(page.getByRole('button', { name: /play|pause/i })).toBeVisible();
    });

    test('should show video duration', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      const fileInput = page.locator('input[type="file"]');
      const testVideoPath = path.join(__dirname, 'fixtures', 'test-video.mp4');

      await fileInput.setInputFiles(testVideoPath);

      // Wait for video metadata to load
      await page.waitForTimeout(1000);

      // Should show duration or file info
      await expect(page.getByText(/duration|length|seconds|minutes/i)).toBeVisible();
    });
  });

  test.describe('Upload Progress', () => {
    test('should show upload progress', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      const fileInput = page.locator('input[type="file"]');
      const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

      await fileInput.setInputFiles(testImagePath);

      // Click upload/continue button
      await page.getByRole('button', { name: /upload|continue.*scheduling/i }).click();

      // Should show progress indicator
      await expect(page.getByText(/uploading|processing/i)).toBeVisible({ timeout: 2000 });
      await expect(page.locator('[role="progressbar"], .progress')).toBeVisible();
    });

    test('should show success message after upload', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      const fileInput = page.locator('input[type="file"]');
      const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

      await fileInput.setInputFiles(testImagePath);
      await page.getByRole('button', { name: /continue.*scheduling/i }).click();

      // Should show success message
      await expect(page.getByText(/success|uploaded|approved/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Content Moderation', () => {
    test('should indicate content pending moderation', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      const fileInput = page.locator('input[type="file"]');
      const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

      await fileInput.setInputFiles(testImagePath);
      await page.getByRole('button', { name: /upload/i }).click();

      // Should mention moderation process
      await expect(page.getByText(/pending|review|moderation|approved/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('File Management', () => {
    test('should allow removing selected file', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      const fileInput = page.locator('input[type="file"]');
      const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

      await fileInput.setInputFiles(testImagePath);

      // Should show remove/cancel button
      const removeButton = page.getByRole('button', { name: /remove|cancel|delete|choose different/i });
      await expect(removeButton).toBeVisible();

      // Click remove
      await removeButton.click();

      // Should be back to upload interface
      await expect(page.getByText(/drag.*drop|choose file/i)).toBeVisible();
    });

    test('should allow choosing different file', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      const fileInput = page.locator('input[type="file"]');
      const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

      await fileInput.setInputFiles(testImagePath);

      // Click choose different file
      await page.getByRole('button', { name: /choose different|change/i }).click();

      // Should allow new file selection
      await expect(page.locator('input[type="file"]')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back to screen details', async ({ page }) => {
      const screenId = 'test-screen-123';
      await page.goto(`/content-upload/${screenId}`);

      await page.getByRole('button', { name: /back.*screen/i }).click();

      await expect(page).toHaveURL(new RegExp(screenId));
    });

    test('should navigate to scheduling after upload', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      const fileInput = page.locator('input[type="file"]');
      const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

      await fileInput.setInputFiles(testImagePath);
      await page.getByRole('button', { name: /continue.*scheduling/i }).click();

      // After successful upload, should navigate to scheduling
      await expect(page).toHaveURL(/schedule|booking/, { timeout: 15000 });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle upload failure gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('**/functions/v1/create-signed-upload', route => route.abort());

      await page.goto('/content-upload/test-screen-123');

      const fileInput = page.locator('input[type="file"]');
      const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

      await fileInput.setInputFiles(testImagePath);
      await page.getByRole('button', { name: /upload/i }).click();

      // Should show error message
      await expect(page.getByText(/failed|error|try again/i)).toBeVisible({ timeout: 10000 });
    });

    test('should show retry option on failure', async ({ page }) => {
      await page.route('**/functions/v1/create-signed-upload', route => route.abort());

      await page.goto('/content-upload/test-screen-123');

      const fileInput = page.locator('input[type="file"]');
      const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

      await fileInput.setInputFiles(testImagePath);
      await page.getByRole('button', { name: /upload/i }).click();

      // Should have retry option
      await expect(page.getByRole('button', { name: /try again|retry/i })).toBeVisible({ timeout: 10000 });
    });

    test('should require authentication', async ({ page }) => {
      await authHelper.signOut();

      await page.goto('/content-upload/test-screen-123');

      // Should redirect to auth
      await expect(page).toHaveURL(/\/auth/);
    });
  });

  test.describe('Mobile Upload', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should be mobile responsive', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      await expect(page.getByText(/upload.*content/i)).toBeVisible();

      // Upload button should be full width on mobile
      const uploadArea = page.locator('[role="button"]:has-text("Choose"), .upload-area');
      await expect(uploadArea).toBeVisible();
    });
  });

  test.describe('Content Validation', () => {
    test('should validate file name for prohibited content', async ({ page }) => {
      await page.goto('/content-upload/test-screen-123');

      const fileInput = page.locator('input[type="file"]');

      // Create file with suspicious name
      const suspiciousFile = new File(['test'], 'porn-adult-xxx.jpg', { type: 'image/jpeg' });
      const dataTransfer = await page.evaluateHandle((file) => {
        const dt = new DataTransfer();
        dt.items.add(file);
        return dt;
      }, suspiciousFile);

      await fileInput.evaluate((input: HTMLInputElement, dt: DataTransfer) => {
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, dataTransfer);

      // Should show validation warning
      await expect(page.getByText(/content.*policy|inappropriate|review|moderation/i)).toBeVisible();
    });
  });
});
