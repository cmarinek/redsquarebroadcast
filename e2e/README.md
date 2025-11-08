# End-to-End Testing with Playwright

This directory contains comprehensive E2E tests for the Red Square platform.

## Setup

Install dependencies:
```bash
npm install
npx playwright install
```

## Running Tests

Run all tests:
```bash
npx playwright test
```

Run specific test suite:
```bash
npx playwright test e2e/01-registration.spec.ts
```

Run tests in headed mode (see browser):
```bash
npx playwright test --headed
```

Run tests in debug mode:
```bash
npx playwright test --debug
```

Run tests for specific browser:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

- `01-registration.spec.ts` - User registration and role selection
- `02-booking.spec.ts` - Screen discovery and booking flow
- `03-payment.spec.ts` - Payment processing
- `04-screen-setup.spec.ts` - Screen owner registration and management
- `05-role-management.spec.ts` - Admin and role management

## Helpers

- `helpers/auth.helper.ts` - Authentication utilities
- `fixtures/test-data.ts` - Test data and constants

## View Test Results

After running tests:
```bash
npx playwright show-report
```

## CI Integration

Tests run automatically on GitHub Actions. See `.github/workflows/` for configuration.

## Best Practices

1. Use unique test data (timestamps) to avoid conflicts
2. Clean up after tests when possible
3. Use page object patterns for complex pages
4. Keep tests independent and idempotent
5. Use meaningful test descriptions
6. Add proper waits for async operations

## Debugging

- Use `await page.pause()` to pause execution
- Use `--headed` flag to see browser
- Check screenshots in `test-results/` on failure
- Use Playwright Inspector with `--debug` flag
