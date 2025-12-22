# Gherkin E2E Automation - Examples

Comprehensive examples demonstrating the complete workflow from Google Sheets to Playwright tests.

## Example 1: E-commerce Application Testing

### Scenario: Complete user journey from product search to checkout

#### Input: Google Sheets Test Cases

| Feature | Scenario | Given | When | Then | Priority | Tags |
|---------|----------|-------|------|------|----------|------|
| Product Search | Search for products | user is on homepage | user searches for "laptop" | search results are displayed | high | smoke,search |
| Product Details | View product details | user is on search results | user clicks on first product | product details page is shown | high | smoke,product |
| Shopping Cart | Add product to cart | user is on product page | user clicks add to cart | product is added to cart | high | smoke,cart |
| Checkout | Complete purchase | user has items in cart | user proceeds to checkout | checkout form is displayed | high | smoke,checkout |

#### Generated Gherkin Feature

```gherkin
Feature: E-commerce User Journey
  As a customer
  I want to search, view, and purchase products
  So that I can complete my shopping online

  Background:
    Given the e-commerce application is running
    And the user is on the homepage

  @smoke @search @priority-high
  Scenario: Search for products
    Given the user is on the homepage
    When the user searches for "laptop"
    Then search results are displayed
    And the results contain laptop products

  @smoke @product @priority-high
  Scenario: View product details
    Given the user is on search results page
    And search results are displayed
    When the user clicks on the first product
    Then the product details page is shown
    And product information is visible

  @smoke @cart @priority-high
  Scenario: Add product to cart
    Given the user is on a product details page
    When the user clicks the add to cart button
    Then the product is added to cart
    And the cart counter is updated

  @smoke @checkout @priority-high
  Scenario: Complete purchase
    Given the user has items in cart
    When the user proceeds to checkout
    Then the checkout form is displayed
    And payment options are available
```

#### Generated Playwright Tests

**Main Test File: `e-commerce-journey.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { SearchResultsPage } from '../pages/search-results-page';
import { ProductDetailsPage } from '../pages/product-details-page';
import { CartPage } from '../pages/cart-page';
import { CheckoutPage } from '../pages/checkout-page';

test.describe('E-commerce User Journey', () => {
  let homePage: HomePage;
  let searchResultsPage: SearchResultsPage;
  let productDetailsPage: ProductDetailsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    searchResultsPage = new SearchResultsPage(page);
    productDetailsPage = new ProductDetailsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    // Background: Navigate to homepage
    await homePage.navigate();
    await expect(homePage.logo).toBeVisible();
  });

  test('Search for products', async ({ page }) => {
    // Given the user is on the homepage
    await expect(homePage.searchInput).toBeVisible();

    // When the user searches for "laptop"
    await homePage.searchForProduct('laptop');

    // Then search results are displayed
    await expect(searchResultsPage.resultsContainer).toBeVisible();
    await expect(searchResultsPage.searchQuery).toContainText('laptop');

    // And the results contain laptop products
    const productTitles = await searchResultsPage.getProductTitles();
    expect(productTitles.some(title => 
      title.toLowerCase().includes('laptop')
    )).toBeTruthy();
  });

  test('View product details', async ({ page }) => {
    // Given the user is on search results page
    await homePage.searchForProduct('laptop');
    await expect(searchResultsPage.resultsContainer).toBeVisible();

    // When the user clicks on the first product
    await searchResultsPage.clickFirstProduct();

    // Then the product details page is shown
    await expect(productDetailsPage.productTitle).toBeVisible();
    await expect(productDetailsPage.productPrice).toBeVisible();

    // And product information is visible
    await expect(productDetailsPage.productDescription).toBeVisible();
    await expect(productDetailsPage.addToCartButton).toBeVisible();
  });

  test('Add product to cart', async ({ page }) => {
    // Given the user is on a product details page
    await homePage.searchForProduct('laptop');
    await searchResultsPage.clickFirstProduct();
    await expect(productDetailsPage.productTitle).toBeVisible();

    // Get initial cart count
    const initialCartCount = await homePage.getCartCount();

    // When the user clicks the add to cart button
    await productDetailsPage.addToCart();

    // Then the product is added to cart
    await expect(productDetailsPage.addToCartSuccessMessage).toBeVisible();

    // And the cart counter is updated
    const updatedCartCount = await homePage.getCartCount();
    expect(updatedCartCount).toBe(initialCartCount + 1);
  });

  test('Complete purchase', async ({ page }) => {
    // Given the user has items in cart
    await homePage.searchForProduct('laptop');
    await searchResultsPage.clickFirstProduct();
    await productDetailsPage.addToCart();
    
    // Navigate to cart
    await homePage.clickCartIcon();
    await expect(cartPage.cartItems).toHaveCount(1);

    // When the user proceeds to checkout
    await cartPage.proceedToCheckout();

    // Then the checkout form is displayed
    await expect(checkoutPage.checkoutForm).toBeVisible();
    await expect(checkoutPage.billingAddressSection).toBeVisible();

    // And payment options are available
    await expect(checkoutPage.paymentMethodsSection).toBeVisible();
    await expect(checkoutPage.creditCardOption).toBeVisible();
    await expect(checkoutPage.paypalOption).toBeVisible();
  });

  test('Complete user journey end-to-end', async ({ page }) => {
    // Complete flow: Search → View → Add to Cart → Checkout
    
    // Search for product
    await homePage.searchForProduct('laptop');
    await expect(searchResultsPage.resultsContainer).toBeVisible();

    // View product details
    const productName = await searchResultsPage.getFirstProductName();
    await searchResultsPage.clickFirstProduct();
    await expect(productDetailsPage.productTitle).toContainText(productName);

    // Add to cart
    await productDetailsPage.addToCart();
    await expect(productDetailsPage.addToCartSuccessMessage).toBeVisible();

    // Go to checkout
    await homePage.clickCartIcon();
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.checkoutForm).toBeVisible();

    // Verify order summary
    await expect(checkoutPage.orderSummary).toContainText(productName);
  });
});
```

#### Generated Page Objects

**HomePage (`pages/home-page.ts`)**

```typescript
import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly cartIcon: Locator;
  readonly cartCounter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByRole('img', { name: 'Company Logo' });
    this.searchInput = page.getByRole('textbox', { name: 'Search products' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.cartIcon = page.getByRole('button', { name: 'Shopping Cart' });
    this.cartCounter = page.locator('[data-testid="cart-counter"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  async searchForProduct(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async getCartCount(): Promise<number> {
    const countText = await this.cartCounter.textContent();
    return parseInt(countText || '0', 10);
  }

  async clickCartIcon(): Promise<void> {
    await this.cartIcon.click();
  }
}
```

**ProductDetailsPage (`pages/product-details-page.ts`)**

```typescript
import { Page, Locator } from '@playwright/test';

export class ProductDetailsPage {
  readonly page: Page;
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly addToCartButton: Locator;
  readonly addToCartSuccessMessage: Locator;
  readonly quantitySelector: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productTitle = page.locator('[data-testid="product-title"]');
    this.productPrice = page.locator('[data-testid="product-price"]');
    this.productDescription = page.locator('[data-testid="product-description"]');
    this.addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    this.addToCartSuccessMessage = page.locator('[data-testid="add-to-cart-success"]');
    this.quantitySelector = page.getByRole('spinbutton', { name: 'Quantity' });
  }

  async addToCart(quantity: number = 1): Promise<void> {
    if (quantity > 1) {
      await this.quantitySelector.fill(quantity.toString());
    }
    await this.addToCartButton.click();
  }

  async getProductName(): Promise<string> {
    return await this.productTitle.textContent() || '';
  }

  async getProductPrice(): Promise<string> {
    return await this.productPrice.textContent() || '';
  }
}
```

## Example 2: User Authentication Flow

### Scenario: Complete authentication system testing

#### Input: Google Sheets Test Cases

| Feature | Scenario | Given | When | Then | Priority | Tags |
|---------|----------|-------|------|------|----------|------|
| User Registration | Valid registration | user is on registration page | user fills valid registration form | account is created successfully | high | smoke,auth |
| User Registration | Invalid email format | user is on registration page | user enters invalid email format | email validation error is shown | medium | validation,auth |
| User Login | Valid credentials | user has registered account | user logs in with valid credentials | user is redirected to dashboard | high | smoke,auth |
| User Login | Invalid credentials | user is on login page | user enters wrong password | login error message is displayed | medium | security,auth |
| Password Reset | Request password reset | user is on login page | user clicks forgot password | password reset email is sent | medium | auth,recovery |

#### Generated Gherkin Feature

```gherkin
Feature: User Authentication
  As a user
  I want to register, login, and manage my account
  So that I can access the application securely

  Background:
    Given the application is running
    And the authentication system is available

  @smoke @auth @priority-high
  Scenario: Valid registration
    Given the user is on the registration page
    When the user fills the registration form with valid data:
      | field            | value                |
      | email           | test@example.com     |
      | password        | SecurePass123!       |
      | confirmPassword | SecurePass123!       |
      | firstName       | John                 |
      | lastName        | Doe                  |
    And the user submits the registration form
    Then the account is created successfully
    And a welcome email is sent
    And the user is redirected to the dashboard

  @validation @auth @priority-medium
  Scenario Outline: Invalid registration data
    Given the user is on the registration page
    When the user enters "<field>" as "<value>"
    And the user submits the registration form
    Then the "<error_message>" validation error is shown

    Examples:
      | field    | value           | error_message                    |
      | email    | invalid-email   | Please enter a valid email       |
      | email    | test@          | Please enter a valid email       |
      | password | 123            | Password must be at least 8 chars|
      | password | password       | Password must contain numbers     |

  @smoke @auth @priority-high
  Scenario: Valid login
    Given the user has a registered account with:
      | email    | test@example.com |
      | password | SecurePass123!   |
    And the user is on the login page
    When the user enters valid credentials
    And the user clicks the login button
    Then the user is redirected to the dashboard
    And the user session is established

  @security @auth @priority-medium
  Scenario: Invalid login attempts
    Given the user is on the login page
    When the user enters incorrect credentials 3 times
    Then the account is temporarily locked
    And a security notification is sent

  @auth @recovery @priority-medium
  Scenario: Password reset flow
    Given the user has a registered account
    And the user is on the login page
    When the user clicks "Forgot Password"
    And the user enters their email address
    And the user submits the password reset request
    Then a password reset email is sent
    And the user receives reset instructions
```

#### Generated Playwright Tests

```typescript
import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../pages/registration-page';
import { LoginPage } from '../pages/login-page';
import { DashboardPage } from '../pages/dashboard-page';
import { EmailService } from '../services/email-service';

test.describe('User Authentication', () => {
  let registrationPage: RegistrationPage;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let emailService: EmailService;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    emailService = new EmailService();
  });

  test('Valid registration', async ({ page }) => {
    // Given the user is on the registration page
    await registrationPage.navigate();
    await expect(registrationPage.registrationForm).toBeVisible();

    // When the user fills the registration form with valid data
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe'
    };
    
    await registrationPage.fillRegistrationForm(userData);
    await registrationPage.submitForm();

    // Then the account is created successfully
    await expect(registrationPage.successMessage).toBeVisible();
    await expect(registrationPage.successMessage).toContainText('Account created successfully');

    // And the user is redirected to the dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(dashboardPage.welcomeMessage).toContainText('Welcome, John');

    // And a welcome email is sent (mock verification)
    const emails = await emailService.getEmailsFor(userData.email);
    expect(emails).toContainEqual(
      expect.objectContaining({
        subject: expect.stringContaining('Welcome'),
        to: userData.email
      })
    );
  });

  const invalidRegistrationData = [
    { field: 'email', value: 'invalid-email', error: 'Please enter a valid email' },
    { field: 'email', value: 'test@', error: 'Please enter a valid email' },
    { field: 'password', value: '123', error: 'Password must be at least 8 characters' },
    { field: 'password', value: 'password', error: 'Password must contain numbers' }
  ];

  invalidRegistrationData.forEach(({ field, value, error }) => {
    test(`Invalid registration - ${field}: ${value}`, async ({ page }) => {
      // Given the user is on the registration page
      await registrationPage.navigate();

      // When the user enters invalid data
      await registrationPage.fillField(field, value);
      await registrationPage.submitForm();

      // Then validation error is shown
      await expect(registrationPage.getFieldError(field)).toContainText(error);
      await expect(registrationPage.successMessage).not.toBeVisible();
    });
  });

  test('Valid login', async ({ page }) => {
    // Given the user has a registered account
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!'
    };
    
    // Pre-register user (setup)
    await registrationPage.navigate();
    await registrationPage.registerUser(userData);

    // And the user is on the login page
    await loginPage.navigate();
    await expect(loginPage.loginForm).toBeVisible();

    // When the user enters valid credentials
    await loginPage.fillCredentials(userData.email, userData.password);
    await loginPage.clickLoginButton();

    // Then the user is redirected to the dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(dashboardPage.userProfile).toBeVisible();

    // And the user session is established
    const sessionToken = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(sessionToken).toBeTruthy();
  });

  test('Invalid login attempts and account lockout', async ({ page }) => {
    // Given the user is on the login page
    await loginPage.navigate();

    // When the user enters incorrect credentials 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      await loginPage.fillCredentials('test@example.com', 'wrongpassword');
      await loginPage.clickLoginButton();
      
      if (attempt < 3) {
        await expect(loginPage.errorMessage).toContainText('Invalid credentials');
      }
    }

    // Then the account is temporarily locked
    await expect(loginPage.lockoutMessage).toBeVisible();
    await expect(loginPage.lockoutMessage).toContainText('Account temporarily locked');

    // Verify login is disabled
    await expect(loginPage.loginButton).toBeDisabled();
  });

  test('Password reset flow', async ({ page }) => {
    const userEmail = 'test@example.com';

    // Given the user has a registered account and is on login page
    await loginPage.navigate();
    await expect(loginPage.loginForm).toBeVisible();

    // When the user clicks "Forgot Password"
    await loginPage.clickForgotPassword();
    await expect(loginPage.passwordResetForm).toBeVisible();

    // And enters their email address
    await loginPage.fillResetEmail(userEmail);
    await loginPage.submitPasswordReset();

    // Then a password reset email is sent
    await expect(loginPage.resetSuccessMessage).toBeVisible();
    await expect(loginPage.resetSuccessMessage).toContainText('Password reset email sent');

    // Verify email was sent (mock verification)
    const emails = await emailService.getEmailsFor(userEmail);
    expect(emails).toContainEqual(
      expect.objectContaining({
        subject: expect.stringContaining('Password Reset'),
        to: userEmail
      })
    );
  });
});
```

## Example 3: API Integration Testing

### Scenario: Testing application with backend API integration

#### Input: Google Sheets Test Cases

| Feature | Scenario | Given | When | Then | Priority | Tags |
|---------|----------|-------|------|------|----------|------|
| User Profile | Load user profile | user is authenticated | user navigates to profile page | profile data is loaded from API | high | api,profile |
| User Profile | Update profile info | user is on profile page | user updates profile information | changes are saved to backend | high | api,profile |
| Data Sync | Sync user data | user has made changes offline | user comes back online | local changes sync with server | medium | api,sync |
| Error Handling | Handle API errors | API server is unavailable | user tries to load data | appropriate error message is shown | medium | api,error |

#### Generated Gherkin Feature

```gherkin
Feature: API Integration
  As a user
  I want the application to sync data with the backend
  So that my information is always up to date

  Background:
    Given the application is connected to the API
    And the user is authenticated

  @api @profile @priority-high
  Scenario: Load user profile from API
    Given the user is authenticated with valid session
    When the user navigates to the profile page
    Then the profile data is loaded from the API
    And the user information is displayed correctly
    And the loading state is handled properly

  @api @profile @priority-high
  Scenario: Update profile information
    Given the user is on the profile page
    And the profile data is loaded
    When the user updates their profile information:
      | field     | value              |
      | firstName | John Updated       |
      | lastName  | Doe Updated        |
      | phone     | +1-555-0123       |
    And the user saves the changes
    Then the changes are saved to the backend API
    And a success confirmation is displayed
    And the updated data persists on page reload

  @api @sync @priority-medium
  Scenario: Sync offline changes
    Given the user has made profile changes while offline
    And the changes are stored locally
    When the user comes back online
    And the application detects connectivity
    Then the local changes are synced with the server
    And any conflicts are resolved appropriately
    And the user is notified of sync completion

  @api @error @priority-medium
  Scenario: Handle API server unavailability
    Given the API server is unavailable
    When the user tries to load profile data
    Then an appropriate error message is displayed
    And the user is offered retry options
    And cached data is shown if available

  @api @error @priority-medium
  Scenario: Handle network timeout
    Given the network connection is slow
    When the user makes an API request
    And the request takes longer than expected
    Then a loading indicator is shown
    And the request times out gracefully
    And the user can retry the operation
```

#### Generated Playwright Tests with API Mocking

```typescript
import { test, expect } from '@playwright/test';
import { ProfilePage } from '../pages/profile-page';
import { ApiMockService } from '../services/api-mock-service';

test.describe('API Integration', () => {
  let profilePage: ProfilePage;
  let apiMock: ApiMockService;

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    apiMock = new ApiMockService(page);
    
    // Setup authentication
    await apiMock.mockAuthenticationEndpoints();
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
  });

  test('Load user profile from API', async ({ page }) => {
    // Given the user is authenticated with valid session
    const mockProfileData = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      phone: '+1-555-0100'
    };

    // Mock the profile API endpoint
    await apiMock.mockGetProfile(mockProfileData);

    // When the user navigates to the profile page
    await profilePage.navigate();

    // Then the profile data is loaded from the API
    await expect(profilePage.loadingSpinner).toBeVisible();
    await expect(profilePage.loadingSpinner).not.toBeVisible();

    // And the user information is displayed correctly
    await expect(profilePage.firstNameField).toHaveValue(mockProfileData.firstName);
    await expect(profilePage.lastNameField).toHaveValue(mockProfileData.lastName);
    await expect(profilePage.emailField).toHaveValue(mockProfileData.email);
    await expect(profilePage.phoneField).toHaveValue(mockProfileData.phone);

    // Verify API was called
    const apiCalls = await apiMock.getApiCalls();
    expect(apiCalls).toContainEqual(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/api/profile')
      })
    );
  });

  test('Update profile information', async ({ page }) => {
    // Given the user is on the profile page with loaded data
    const initialData = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      phone: '+1-555-0100'
    };

    await apiMock.mockGetProfile(initialData);
    await profilePage.navigate();
    await expect(profilePage.firstNameField).toHaveValue(initialData.firstName);

    // Mock the update API endpoint
    const updatedData = {
      ...initialData,
      firstName: 'John Updated',
      lastName: 'Doe Updated',
      phone: '+1-555-0123'
    };
    await apiMock.mockUpdateProfile(updatedData);

    // When the user updates their profile information
    await profilePage.updateProfile({
      firstName: 'John Updated',
      lastName: 'Doe Updated',
      phone: '+1-555-0123'
    });

    await profilePage.saveChanges();

    // Then the changes are saved to the backend API
    await expect(profilePage.successMessage).toBeVisible();
    await expect(profilePage.successMessage).toContainText('Profile updated successfully');

    // Verify API was called with correct data
    const updateCalls = await apiMock.getApiCalls('PUT', '/api/profile');
    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0].body).toMatchObject({
      firstName: 'John Updated',
      lastName: 'Doe Updated',
      phone: '+1-555-0123'
    });

    // And the updated data persists on page reload
    await page.reload();
    await expect(profilePage.firstNameField).toHaveValue('John Updated');
  });

  test('Sync offline changes', async ({ page }) => {
    // Given the user has made profile changes while offline
    await apiMock.mockGetProfile({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com'
    });

    await profilePage.navigate();

    // Simulate going offline
    await page.context().setOffline(true);
    
    // Make changes while offline
    await profilePage.updateProfile({
      firstName: 'John Offline',
      lastName: 'Doe Offline'
    });
    await profilePage.saveChanges();

    // Verify offline storage
    const offlineData = await page.evaluate(() => 
      JSON.parse(localStorage.getItem('offlineChanges') || '{}')
    );
    expect(offlineData).toMatchObject({
      firstName: 'John Offline',
      lastName: 'Doe Offline'
    });

    // When the user comes back online
    await page.context().setOffline(false);
    await apiMock.mockUpdateProfile({
      id: 1,
      firstName: 'John Offline',
      lastName: 'Doe Offline',
      email: 'test@example.com'
    });

    // Trigger sync (simulate app detecting connectivity)
    await page.click('[data-testid="sync-button"]');

    // Then the local changes are synced with the server
    await expect(profilePage.syncSuccessMessage).toBeVisible();
    await expect(profilePage.syncSuccessMessage).toContainText('Changes synced successfully');

    // Verify sync API call
    const syncCalls = await apiMock.getApiCalls('PUT', '/api/profile');
    expect(syncCalls).toContainEqual(
      expect.objectContaining({
        body: expect.objectContaining({
          firstName: 'John Offline',
          lastName: 'Doe Offline'
        })
      })
    );
  });

  test('Handle API server unavailability', async ({ page }) => {
    // Given the API server is unavailable
    await apiMock.mockServerError(500);

    // When the user tries to load profile data
    await profilePage.navigate();

    // Then an appropriate error message is displayed
    await expect(profilePage.errorMessage).toBeVisible();
    await expect(profilePage.errorMessage).toContainText('Unable to load profile data');

    // And the user is offered retry options
    await expect(profilePage.retryButton).toBeVisible();

    // Test retry functionality
    await apiMock.mockGetProfile({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com'
    });

    await profilePage.retryButton.click();
    await expect(profilePage.firstNameField).toHaveValue('John');
  });

  test('Handle network timeout', async ({ page }) => {
    // Given the network connection is slow
    await apiMock.mockSlowResponse('/api/profile', 10000); // 10 second delay

    // When the user makes an API request
    await profilePage.navigate();

    // Then a loading indicator is shown
    await expect(profilePage.loadingSpinner).toBeVisible();

    // And the request times out gracefully (after 5 seconds)
    await expect(profilePage.timeoutMessage).toBeVisible({ timeout: 6000 });
    await expect(profilePage.timeoutMessage).toContainText('Request timed out');

    // And the user can retry the operation
    await expect(profilePage.retryButton).toBeVisible();
  });
});
```

## CLI Usage Examples

### Basic Commands

```bash
# Convert Google Sheets to Gherkin
npx gherkin-e2e sheets-to-gherkin \
  --sheet-id "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" \
  --sheet-name "E2E Test Cases" \
  --output "./features/user-journey.feature"

# Generate Playwright tests from Gherkin
npx gherkin-e2e gherkin-to-playwright \
  --feature "./features/user-journey.feature" \
  --output "./tests/user-journey.spec.ts" \
  --url "https://staging.myapp.com"

# Run complete pipeline
npx gherkin-e2e full-pipeline \
  --sheet-id "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" \
  --sheet-name "E2E Test Cases" \
  --url "https://staging.myapp.com" \
  --output-dir "./tests/generated"
```

### Advanced Configuration

```bash
# With custom configuration
npx gherkin-e2e full-pipeline \
  --config "./config/custom-config.json" \
  --sheet-id "your-sheet-id" \
  --url "https://your-app.com" \
  --output-dir "./tests/generated" \
  --ai-provider "openai" \
  --ai-model "gpt-4" \
  --browsers "chromium,firefox" \
  --parallel \
  --debug
```

### Batch Processing

```bash
# Process multiple sheets
npx gherkin-e2e batch-process \
  --config "./config/batch-config.json" \
  --output-dir "./tests/generated"

# batch-config.json
{
  "sheets": [
    {
      "id": "sheet-1-id",
      "name": "Authentication Tests",
      "feature": "user-auth"
    },
    {
      "id": "sheet-2-id", 
      "name": "E-commerce Tests",
      "feature": "e-commerce"
    }
  ],
  "baseUrl": "https://staging.myapp.com",
  "outputDir": "./tests/generated"
}
```

## Integration Examples

### GitHub Actions Workflow

```yaml
name: Automated E2E Test Generation

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:
    inputs:
      sheet_id:
        description: 'Google Sheets ID'
        required: true
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'

jobs:
  generate-and-run-tests:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate tests from Google Sheets
        run: |
          npx gherkin-e2e full-pipeline \
            --sheet-id "${{ github.event.inputs.sheet_id || secrets.DEFAULT_SHEET_ID }}" \
            --sheet-name "E2E Test Cases" \
            --url "https://${{ github.event.inputs.environment || 'staging' }}.myapp.com" \
            --output-dir "./tests/generated" \
            --ai-provider "anthropic"
        env:
          GOOGLE_SERVICE_ACCOUNT_EMAIL: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_EMAIL }}
          GOOGLE_PRIVATE_KEY: ${{ secrets.GOOGLE_PRIVATE_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          
      - name: Install Playwright browsers
        run: npx playwright install
        
      - name: Run generated E2E tests
        run: npx playwright test tests/generated/ --reporter=html
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results-${{ github.run_number }}
          path: |
            test-results/
            playwright-report/
            
      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const path = './test-results/results.json';
            if (fs.existsSync(path)) {
              const results = JSON.parse(fs.readFileSync(path, 'utf8'));
              const comment = `## 🤖 Generated E2E Test Results
              
              - **Total Tests**: ${results.total}
              - **Passed**: ${results.passed} ✅
              - **Failed**: ${results.failed} ❌
              - **Skipped**: ${results.skipped} ⏭️
              
              [View detailed report](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})`;
              
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: comment
              });
            }
```

### Docker Integration

```dockerfile
# Dockerfile for E2E test generation
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    firefox \
    webkit2gtk \
    && rm -rf /var/cache/apk/*

# Install npm dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Install Playwright browsers
RUN npx playwright install

# Set environment variables
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Create entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npx", "gherkin-e2e", "full-pipeline"]
```

```bash
#!/bin/bash
# docker-entrypoint.sh

set -e

# Validate required environment variables
if [ -z "$GOOGLE_SERVICE_ACCOUNT_EMAIL" ]; then
    echo "Error: GOOGLE_SERVICE_ACCOUNT_EMAIL is required"
    exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "Error: ANTHROPIC_API_KEY is required"
    exit 1
fi

# Run the command
exec "$@"
```

```bash
# Usage
docker build -t gherkin-e2e-generator .

docker run --rm \
  -e GOOGLE_SERVICE_ACCOUNT_EMAIL="$GOOGLE_SERVICE_ACCOUNT_EMAIL" \
  -e GOOGLE_PRIVATE_KEY="$GOOGLE_PRIVATE_KEY" \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  -v $(pwd)/tests:/app/tests \
  gherkin-e2e-generator \
  npx gherkin-e2e full-pipeline \
    --sheet-id "your-sheet-id" \
    --url "https://your-app.com" \
    --output-dir "./tests/generated"
```

These examples demonstrate the complete workflow from Google Sheets test cases to production-ready Playwright tests, showcasing the power of AI-driven test automation with proper integration patterns.