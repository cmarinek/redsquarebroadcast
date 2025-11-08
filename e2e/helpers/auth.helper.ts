import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async signUp(email: string, password: string) {
    await this.page.goto('/auth');
    await this.page.getByRole('tab', { name: /sign up/i }).click();
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).first().fill(password);
    await this.page.getByRole('button', { name: /sign up/i }).click();
  }

  async signIn(email: string, password: string) {
    await this.page.goto('/auth');
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
  }

  async signOut() {
    await this.page.getByRole('button', { name: /sign out/i }).click();
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.page.waitForURL('/', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
