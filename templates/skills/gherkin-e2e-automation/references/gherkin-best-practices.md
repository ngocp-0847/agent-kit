# Gherkin Best Practices for E2E Test Automation

Comprehensive guide for writing effective Gherkin scenarios that generate high-quality Playwright tests.

## Core Principles

### 1. Business Language First

**Write for humans, not machines**
- Use domain language that stakeholders understand
- Avoid technical implementation details
- Focus on user behavior and business outcomes

**Good Example**:
```gherkin
Scenario: Customer completes purchase
  Given the customer has items in their cart
  When the customer proceeds to checkout
  Then the order is confirmed
  And payment is processed
```

**Bad Example**:
```gherkin
Scenario: POST request to /api/orders endpoint
  Given the shopping_cart table has records
  When a POST request is sent to /api/orders
  Then the response status is 200
  And the database is updated
```

### 2. Declarative vs Imperative

**Declarative (What)** - Preferred for business scenarios:
```gherkin
Given the user is logged in
When the user adds a product to cart
Then the cart shows the added product
```

**Imperative (How)** - Use sparingly for specific UI testing:
```gherkin
Given the user clicks the login button
When the user types "email@example.com" in the email field
Then the login form is submitted
```

### 3. Independent Scenarios

Each scenario should be:
- **Self-contained**: Can run independently
- **Isolated**: Doesn't depend on other scenarios
- **Repeatable**: Produces same results every time

```gherkin
# Good: Each scenario sets up its own context
Scenario: View product details
  Given the user is on the product catalog
  And the "Laptop Pro" product exists
  When the user clicks on "Laptop Pro"
  Then the product details page is displayed

Scenario: Add product to cart
  Given the user is on the "Laptop Pro" product page
  When the user clicks "Add to Cart"
  Then the product is added to the cart
```

## Scenario Structure Patterns

### 1. Basic Given-When-Then

```gherkin
Scenario: [Specific behavior description]
  Given [initial context/preconditions]
  When [action/event occurs]
  Then [expected outcome/verification]
```

### 2. Extended with And/But

```gherkin
Scenario: User registration with validation
  Given the user is on the registration page
  And the registration form is displayed
  When the user fills in valid registration details
  And the user submits the form
  Then the account is created successfully
  And a confirmation email is sent
  But the user is not automatically logged in
```

### 3. Scenario Outline for Data-Driven Tests

```gherkin
Scenario Outline: Login with different user types
  Given the user is on the login page
  When the user logs in as "<user_type>"
  Then the user is redirected to "<landing_page>"
  And the user sees "<welcome_message>"

  Examples:
    | user_type | landing_page | welcome_message    |
    | admin     | /admin       | Admin Dashboard    |
    | customer  | /dashboard   | Welcome Customer   |
    | guest     | /home        | Browse Products    |
```

## Step Definition Patterns

### 1. Navigation Steps

**Given Steps** (Setup):
```gherkin
Given the user is on the homepage
Given the user is on the "Products" page
Given the user navigates to "/checkout"
```

**When Steps** (Actions):
```gherkin
When the user navigates to the profile page
When the user clicks the "Back" button
When the user goes to the previous page
```

**Then Steps** (Verification):
```gherkin
Then the user should be on the homepage
Then the page URL should contain "/products"
Then the page title should be "Checkout"
```

### 2. Form Interaction Steps

**Given Steps**:
```gherkin
Given the login form is displayed
Given the user has valid credentials
Given the form has the following fields:
  | field    | type     | required |
  | email    | text     | yes      |
  | password | password | yes      |
```

**When Steps**:
```gherkin
When the user fills in "email" with "user@example.com"
When the user enters the following information:
  | field     | value           |
  | firstName | John            |
  | lastName  | Doe             |
  | email     | john@email.com  |
When the user submits the form
When the user clears the "password" field
```

**Then Steps**:
```gherkin
Then the form should be submitted successfully
Then the "email" field should show error "Invalid email format"
Then the form should display validation errors
Then the submit button should be disabled
```

### 3. UI Element Interaction Steps

**Given Steps**:
```gherkin
Given the "Add to Cart" button is visible
Given the product list contains 5 items
Given the shopping cart is empty
```

**When Steps**:
```gherkin
When the user clicks the "Add to Cart" button
When the user hovers over the product image
When the user selects "Large" from the size dropdown
When the user toggles the "Show filters" option
```

**Then Steps**:
```gherkin
Then the "Success" message should be visible
Then the cart counter should show "1"
Then the product should appear in the cart
Then the "Remove" button should be enabled
```

### 4. Data Verification Steps

**Then Steps**:
```gherkin
Then the user profile should contain:
  | field     | value           |
  | name      | John Doe        |
  | email     | john@email.com  |
  | status    | Active          |

Then the product list should include:
  | name        | price  | availability |
  | Laptop Pro  | $1299  | In Stock     |
  | Mouse       | $29    | Limited      |

Then the following items should be visible:
  | element          | status  |
  | header           | visible |
  | navigation menu  | visible |
  | footer           | hidden  |
```

## Tag Strategy

### 1. Functional Tags

```gherkin
@smoke          # Critical functionality tests
@regression     # Full regression test suite
@integration    # Integration between components
@api            # API-related tests
@ui             # User interface tests
@performance    # Performance-related scenarios
```

### 2. Priority Tags

```gherkin
@priority-high     # Must run in every build
@priority-medium   # Run in nightly builds
@priority-low      # Run in weekly builds
@critical          # Blocking issues if failed
```

### 3. Feature Tags

```gherkin
@authentication    # Login, registration, password reset
@shopping-cart     # Cart operations
@checkout         # Purchase flow
@user-profile     # Profile management
@search           # Search functionality
```

### 4. Environment Tags

```gherkin
@staging-only     # Only run in staging environment
@production-safe  # Safe to run in production
@requires-data    # Needs specific test data
@cleanup-after    # Requires cleanup after execution
```

### 5. Test Type Tags

```gherkin
@happy-path       # Successful user journeys
@error-handling   # Error scenarios
@edge-case        # Boundary conditions
@validation       # Input validation tests
```

## Background Usage

### Effective Background Patterns

```gherkin
Feature: Shopping Cart Management

  Background:
    Given the e-commerce application is running
    And the user is logged in as a customer
    And the product catalog is available

  Scenario: Add single product to cart
    Given the user is viewing the "Laptop Pro" product
    When the user adds the product to cart
    Then the cart should contain 1 item

  Scenario: Remove product from cart
    Given the user has "Laptop Pro" in their cart
    When the user removes the product from cart
    Then the cart should be empty
```

### Background Anti-Patterns

**Too Much Setup**:
```gherkin
# Bad: Too much detail in background
Background:
  Given the database is seeded with test data
  And the user "john@example.com" is registered
  And the user has completed email verification
  And the user has set up their profile
  And the user has added payment methods
  And the user is logged in
  And the user has browsed products before
```

**Scenario-Specific Setup**:
```gherkin
# Bad: Background too specific for some scenarios
Background:
  Given the user has items in their cart
  # This doesn't make sense for "empty cart" scenarios
```

## Data Management Patterns

### 1. Inline Data Tables

```gherkin
When the user creates a new product with:
  | name        | Wireless Headphones |
  | price       | 199.99             |
  | category    | Electronics        |
  | description | High-quality sound |
```

### 2. Examples Tables

```gherkin
Scenario Outline: Product search validation
  When the user searches for "<search_term>"
  Then the results should show "<expected_count>" products
  And the results should be sorted by "<sort_order>"

  Examples:
    | search_term | expected_count | sort_order |
    | laptop      | 5             | relevance  |
    | mouse       | 12            | price      |
    | keyboard    | 8             | rating     |
```

### 3. External Data References

```gherkin
Given the system has the following test users:
  | reference    | role     | status |
  | @admin_user  | admin    | active |
  | @test_user   | customer | active |
  | @guest_user  | guest    | pending|

When the user "@admin_user" logs in
Then the admin dashboard should be displayed
```

## Error Handling Scenarios

### 1. Validation Errors

```gherkin
Scenario Outline: Registration form validation
  Given the user is on the registration page
  When the user enters "<field>" as "<invalid_value>"
  And the user submits the form
  Then the "<field>" field should show error "<error_message>"
  And the form should not be submitted

  Examples:
    | field    | invalid_value | error_message              |
    | email    | invalid-email | Please enter a valid email |
    | password | 123          | Password too short         |
    | age      | -5           | Age must be positive       |
```

### 2. System Errors

```gherkin
Scenario: Handle server unavailability
  Given the user is logged in
  And the server becomes unavailable
  When the user tries to save their profile
  Then an error message should be displayed
  And the user should be offered retry options
  And the unsaved changes should be preserved locally
```

### 3. Network Errors

```gherkin
Scenario: Handle network timeout
  Given the user is on a slow network connection
  When the user uploads a large file
  And the upload takes longer than expected
  Then a progress indicator should be shown
  And the user should be able to cancel the upload
  And appropriate timeout handling should occur
```

## AI-Friendly Gherkin Patterns

### 1. Clear Element References

**Good for AI**:
```gherkin
When the user clicks the "Submit Order" button
When the user fills in the "Email Address" field
When the user selects "Express Shipping" from the delivery options
```

**Problematic for AI**:
```gherkin
When the user clicks the button
When the user fills in the field
When the user selects an option
```

### 2. Consistent Terminology

**Establish a glossary**:
```gherkin
# Use consistent terms throughout
"shopping cart" (not "basket", "bag", or "cart")
"product" (not "item", "article", or "good")
"checkout" (not "purchase", "buy", or "order")
```

### 3. Specific Actions

**Good**:
```gherkin
When the user clicks the "Add to Cart" button
When the user enters "john@example.com" in the email field
When the user selects "Credit Card" as payment method
```

**Better for AI mapping**:
```gherkin
When the user clicks the primary action button labeled "Add to Cart"
When the user enters a valid email address in the email input field
When the user chooses "Credit Card" from the payment method dropdown
```

## Common Anti-Patterns to Avoid

### 1. Implementation Details

**Bad**:
```gherkin
Given the user table has a record with id=123
When a POST request is sent to /api/login
Then the response should have status code 200
```

**Good**:
```gherkin
Given the user has a valid account
When the user logs in with correct credentials
Then the user should be successfully authenticated
```

### 2. UI-Specific Language

**Bad**:
```gherkin
When the user clicks the button with class "btn-primary"
When the user types in the input field with id "email-input"
```

**Good**:
```gherkin
When the user clicks the "Submit" button
When the user enters their email address
```

### 3. Overly Complex Scenarios

**Bad**:
```gherkin
Scenario: Complete user journey with multiple validations and edge cases
  Given the user is on the homepage
  And the user navigates to products
  And the user filters by category
  And the user sorts by price
  And the user selects a product
  And the user adds to cart
  And the user modifies quantity
  And the user applies a coupon
  And the user proceeds to checkout
  And the user fills shipping information
  And the user selects payment method
  And the user reviews order
  And the user confirms purchase
  Then the order should be successful
```

**Good** (Break into multiple scenarios):
```gherkin
Scenario: Filter and find products
  Given the user is on the products page
  When the user filters by "Electronics" category
  And the user sorts by "Price: Low to High"
  Then relevant products should be displayed in price order

Scenario: Add product to cart
  Given the user is viewing a product
  When the user adds the product to cart
  Then the cart should contain the product

Scenario: Complete checkout process
  Given the user has products in their cart
  When the user completes the checkout process
  Then the order should be confirmed
```

### 4. Scenario Dependencies

**Bad**:
```gherkin
Scenario: User logs in
  # ... login steps

Scenario: User adds product (depends on previous scenario)
  # This scenario assumes user is already logged in
```

**Good**:
```gherkin
Scenario: User logs in
  # ... complete login scenario

Scenario: Logged-in user adds product
  Given the user is logged in
  # ... rest of scenario
```

## Quality Checklist

### Scenario Quality

- [ ] **Clear Purpose**: Each scenario has a single, clear objective
- [ ] **Business Language**: Uses domain terminology, not technical jargon
- [ ] **Independent**: Can run without depending on other scenarios
- [ ] **Specific**: Provides enough detail for implementation
- [ ] **Testable**: Can be verified with concrete assertions
- [ ] **Maintainable**: Easy to update when requirements change

### Step Quality

- [ ] **Actionable**: Steps describe concrete actions or verifications
- [ ] **Unambiguous**: Clear meaning with no room for interpretation
- [ ] **Reusable**: Steps can be used across multiple scenarios
- [ ] **Atomic**: Each step does one thing well
- [ ] **Consistent**: Similar actions use similar language

### Feature Quality

- [ ] **Cohesive**: All scenarios relate to the same feature
- [ ] **Complete**: Covers main flows and important edge cases
- [ ] **Organized**: Logical order and grouping of scenarios
- [ ] **Tagged**: Appropriate tags for filtering and organization
- [ ] **Documented**: Clear feature description and context

This guide ensures your Gherkin scenarios will generate high-quality, maintainable Playwright tests through AI-powered automation.