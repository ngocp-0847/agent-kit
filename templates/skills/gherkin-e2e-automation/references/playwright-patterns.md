# Playwright Test Patterns for AI-Generated Tests

Best practices and patterns for Playwright tests generated from Gherkin scenarios.

## Page Object Model (POM) Pattern

### Basic Page Object Structure

```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators using best practices
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password' });
  }

  // Navigation methods
  async navigate(): Promise<void> {
    await this.page.goto('/login');
  }

  // Action methods
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  // Verification methods
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async isErrorVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }
}
```

### Advanced Page Object with Component Composition

```typescript
// Base component
export class NavigationComponent {
  readonly page: Page;
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartIcon: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.homeLink = page.getByRole('link', { name: 'Home' });
    this.productsLink = page.getByRole('link', { name: 'Products' });
    this.cartIcon = page.getByRole('button', { name: 'Cart' });
    this.userMenu = page.getByRole('button', { name: 'User Menu' });
  }

  async navigateToHome(): Promise<void> {
    await this.homeLink.click();
  }

  async navigateToProducts(): Promise<void> {
    await this.productsLink.click();
  }

  async openCart(): Promise<void> {
    await this.cartIcon.click();
  }

  async getCartItemCount(): Promise<number> {
    const badge = this.page.locator('[data-testid="cart-badge"]');
    const count = await badge.textContent();
    return parseInt(count || '0', 10);
  }
}

// Page using component
export class HomePage {
  readonly page: Page;
  readonly navigation: NavigationComponent;
  readonly searchInput: Locator;
  readonly featuredProducts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationComponent(page);
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
    this.featuredProducts = page.locator('[data-testid="featured-products"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  async searchForProduct(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }
}
```

## Selector Strategies

### Priority Order for Selectors

1. **Role-based selectors** (most semantic and stable):
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('link', { name: 'Learn More' })
page.getByRole('heading', { name: 'Welcome' })
```

2. **Test ID selectors** (explicit test hooks):
```typescript
page.locator('[data-testid="submit-button"]')
page.locator('[data-testid="email-input"]')
page.locator('[data-testid="error-message"]')
```

3. **Label-based selectors** (accessible):
```typescript
page.getByLabel('Email Address')
page.getByLabel('Password')
page.getByLabel('Remember Me')
```

4. **Placeholder selectors**:
```typescript
page.getByPlaceholder('Enter your email')
page.getByPlaceholder('Search products...')
```

5. **Text content selectors** (use sparingly):
```typescript
page.getByText('Submit Order')
page.getByText('Welcome back!')
```

6. **CSS selectors** (last resort):
```typescript
page.locator('.submit-button')
page.locator('#email-input')
page.locator('button.primary')
```

### Selector Best Practices

```typescript
// ✅ Good: Specific and stable
page.getByRole('button', { name: 'Add to Cart' })
page.locator('[data-testid="product-card"]').getByRole('button', { name: 'Add to Cart' })

// ❌ Bad: Brittle and non-semantic
page.locator('div.container > div:nth-child(2) > button.btn-primary')
page.locator('button').nth(3)

// ✅ Good: Scoped selectors
const productCard = page.locator('[data-testid="product-card"]').first();
await productCard.getByRole('button', { name: 'Add to Cart' }).click();

// ❌ Bad: Global selectors that might match multiple elements
await page.locator('button').click(); // Which button?
```

## Waiting and Synchronization Patterns

### Auto-waiting (Playwright's default)

```typescript
// Playwright automatically waits for elements to be:
// - Attached to DOM
// - Visible
// - Stable (not animating)
// - Enabled
// - Editable (for inputs)

await page.getByRole('button', { name: 'Submit' }).click();
// No explicit wait needed!
```

### Explicit Waits When Needed

```typescript
// Wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.getByRole('button', { name: 'Submit' }).click()
]);

// Wait for specific state
await page.getByRole('button', { name: 'Submit' }).waitFor({ state: 'visible' });
await page.getByRole('button', { name: 'Submit' }).waitFor({ state: 'hidden' });

// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for specific URL
await page.waitForURL('**/dashboard');
await page.waitForURL(/.*\/products\/\d+/);

// Wait for selector with timeout
await page.locator('[data-testid="success-message"]').waitFor({ 
  state: 'visible',
  timeout: 5000 
});
```

### Polling and Retry Patterns

```typescript
// Wait for condition with polling
await page.waitForFunction(() => {
  const element = document.querySelector('[data-testid="cart-count"]');
  return element && parseInt(element.textContent || '0') > 0;
}, { timeout: 10000 });

// Retry action until condition is met
async function retryUntilSuccess<T>(
  action: () => Promise<T>,
  condition: (result: T) => boolean,
  maxAttempts: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await action();
    if (condition(result)) {
      return result;
    }
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Max retry attempts reached');
}

// Usage
const cartCount = await retryUntilSuccess(
  async () => await page.locator('[data-testid="cart-count"]').textContent(),
  (count) => parseInt(count || '0') > 0,
  3
);
```

## Assertion Patterns

### Basic Assertions

```typescript
import { expect } from '@playwright/test';

// Visibility assertions
await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
await expect(page.getByRole('button', { name: 'Cancel' })).toBeHidden();
await expect(page.locator('[data-testid="loading"]')).not.toBeVisible();

// Text content assertions
await expect(page.getByRole('heading')).toHaveText('Welcome');
await expect(page.locator('[data-testid="message"]')).toContainText('Success');
await expect(page.getByRole('alert')).toHaveText(/error|warning/i);

// Value assertions
await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('test@example.com');
await expect(page.getByRole('checkbox', { name: 'Terms' })).toBeChecked();
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();

// URL assertions
await expect(page).toHaveURL('https://example.com/dashboard');
await expect(page).toHaveURL(/.*\/products\/\d+/);

// Count assertions
await expect(page.locator('[data-testid="product-card"]')).toHaveCount(5);
await expect(page.getByRole('listitem')).toHaveCount(10);

// Attribute assertions
await expect(page.locator('img')).toHaveAttribute('alt', 'Product Image');
await expect(page.locator('a')).toHaveAttribute('href', '/products');
```

### Advanced Assertions

```typescript
// Custom matchers
expect.extend({
  async toHaveValidEmail(locator: Locator) {
    const value = await locator.inputValue();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(value);
    
    return {
      pass,
      message: () => pass 
        ? `Expected ${value} not to be a valid email`
        : `Expected ${value} to be a valid email`
    };
  }
});

// Usage
await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValidEmail();

// Soft assertions (continue test even if assertion fails)
await expect.soft(page.getByRole('heading')).toHaveText('Welcome');
await expect.soft(page.locator('[data-testid="subtitle"]')).toBeVisible();
// Test continues even if above assertions fail

// Multiple assertions with custom error messages
await expect(page.getByRole('button', { name: 'Submit' }), 
  'Submit button should be visible and enabled'
).toBeVisible();

await expect(page.getByRole('button', { name: 'Submit' }),
  'Submit button should be enabled after form is filled'
).toBeEnabled();
```

## Test Organization Patterns

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  // Setup before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  // Cleanup after each test
  test.afterEach(async ({ page }) => {
    // Clear cookies, local storage, etc.
    await page.context().clearCookies();
  });

  test('successful login with valid credentials', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    
    // Act
    await loginPage.login('user@example.com', 'password123');
    
    // Assert
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('login fails with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.login('user@example.com', 'wrongpassword');
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
  });
});
```

### Parameterized Tests

```typescript
// Data-driven tests
const testData = [
  { email: 'invalid-email', password: 'pass123', error: 'Invalid email format' },
  { email: 'test@example.com', password: '123', error: 'Password too short' },
  { email: '', password: 'password123', error: 'Email is required' }
];

testData.forEach(({ email, password, error }) => {
  test(`login validation: ${error}`, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    
    await loginPage.fillEmail(email);
    await loginPage.fillPassword(password);
    await loginPage.clickLogin();
    
    await expect(loginPage.errorMessage).toContainText(error);
  });
});
```

### Test Fixtures

```typescript
// Custom fixtures for reusable setup
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { DashboardPage } from '../pages/dashboard-page';

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  authenticatedPage: async ({ page }, use) => {
    // Automatically log in before each test
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    await use(page);
  }
});

// Usage
test('view user profile', async ({ authenticatedPage, dashboardPage }) => {
  // Already logged in via fixture
  await dashboardPage.navigateToProfile();
  await expect(dashboardPage.profileSection).toBeVisible();
});
```

## Error Handling Patterns

### Graceful Error Handling

```typescript
test('handle network errors gracefully', async ({ page }) => {
  // Simulate offline mode
  await page.context().setOffline(true);
  
  await page.goto('/products');
  
  // Verify error handling
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  
  // Go back online and retry
  await page.context().setOffline(false);
  await page.locator('[data-testid="retry-button"]').click();
  
  await expect(page.locator('[data-testid="products-list"]')).toBeVisible();
});
```

### Timeout Handling

```typescript
test('handle slow loading gracefully', async ({ page }) => {
  // Set custom timeout for this test
  test.setTimeout(60000);
  
  await page.goto('/large-dataset');
  
  // Wait with custom timeout
  await expect(page.locator('[data-testid="data-table"]')).toBeVisible({ 
    timeout: 30000 
  });
  
  // Verify loading indicator was shown
  const loadingWasVisible = await page.locator('[data-testid="loading"]')
    .isVisible()
    .catch(() => false);
  
  expect(loadingWasVisible).toBeTruthy();
});
```

## API Mocking Patterns

### Mock API Responses

```typescript
test('display products from API', async ({ page }) => {
  // Mock API response
  await page.route('**/api/products', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        products: [
          { id: 1, name: 'Product 1', price: 99.99 },
          { id: 2, name: 'Product 2', price: 149.99 }
        ]
      })
    });
  });
  
  await page.goto('/products');
  
  await expect(page.locator('[data-testid="product-card"]')).toHaveCount(2);
  await expect(page.getByText('Product 1')).toBeVisible();
});
```

### Mock API Errors

```typescript
test('handle API errors', async ({ page }) => {
  // Mock API error
  await page.route('**/api/products', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal Server Error'
      })
    });
  });
  
  await page.goto('/products');
  
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="error-message"]'))
    .toContainText('Unable to load products');
});
```

### Intercept and Modify Requests

```typescript
test('modify API request', async ({ page }) => {
  // Intercept and modify request
  await page.route('**/api/search', async (route, request) => {
    const postData = request.postDataJSON();
    
    // Modify request
    await route.continue({
      postData: JSON.stringify({
        ...postData,
        limit: 10 // Override limit
      })
    });
  });
  
  await page.goto('/search');
  await page.getByRole('textbox', { name: 'Search' }).fill('laptop');
  await page.getByRole('button', { name: 'Search' }).click();
  
  // Verify results are limited to 10
  await expect(page.locator('[data-testid="search-result"]')).toHaveCount(10);
});
```

## Performance Testing Patterns

### Measure Page Load Time

```typescript
test('page loads within acceptable time', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

### Monitor Network Requests

```typescript
test('minimize API calls', async ({ page }) => {
  const apiCalls: string[] = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiCalls.push(request.url());
    }
  });
  
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Verify reasonable number of API calls
  expect(apiCalls.length).toBeLessThan(10);
  
  // Verify no duplicate calls
  const uniqueCalls = new Set(apiCalls);
  expect(uniqueCalls.size).toBe(apiCalls.length);
});
```

## Accessibility Testing Patterns

### Basic Accessibility Checks

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Keyboard Navigation

```typescript
test('form is keyboard accessible', async ({ page }) => {
  await page.goto('/contact');
  
  // Tab through form fields
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Name' })).toBeFocused();
  
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeFocused();
  
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Message' })).toBeFocused();
  
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Submit' })).toBeFocused();
  
  // Submit with Enter key
  await page.keyboard.press('Enter');
});
```

## Visual Regression Testing

```typescript
test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  
  // Take screenshot and compare
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    maxDiffPixels: 100
  });
});

test('component visual regression', async ({ page }) => {
  await page.goto('/components');
  
  const button = page.getByRole('button', { name: 'Primary Button' });
  
  // Screenshot specific element
  await expect(button).toHaveScreenshot('primary-button.png');
});
```

These patterns ensure AI-generated Playwright tests are robust, maintainable, and follow industry best practices.