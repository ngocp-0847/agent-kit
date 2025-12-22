# Gherkin E2E Automation Skill

AI-powered end-to-end test generation framework that converts Google Sheets test cases to Gherkin scenarios and automatically generates Playwright tests using AI.

## Overview

This skill provides a complete workflow for modern test automation, combining:

- **Standardized Gherkin Templates** - Company-standard BDD scenario formats
- **Google Sheets Integration** - Convert spreadsheet test cases to Gherkin
- **AI-Powered Test Generation** - Automatically create Playwright E2E tests
- **UI Scanning & Mapping** - Intelligent selector detection and mapping
- **Production-Ready Output** - Clean, maintainable test code following best practices

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Google Sheets API access (service account)
- AI API key (Anthropic Claude or OpenAI)
- Target application for testing

### Installation

```bash
# Install dependencies
npm install -D @playwright/test @cucumber/cucumber
npm install openai anthropic google-spreadsheet

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys and configuration
```

### Basic Usage

1. **Convert Google Sheets to Gherkin**:
```bash
npx gherkin-e2e sheets-to-gherkin \
  --sheet-id "your-sheet-id" \
  --sheet-name "Test Cases" \
  --output "./features/user-login.feature"
```

2. **Generate Playwright Tests from Gherkin**:
```bash
npx gherkin-e2e gherkin-to-playwright \
  --feature "./features/user-login.feature" \
  --output "./tests/user-login.spec.ts" \
  --url "https://your-app.com"
```

3. **Complete Pipeline**:
```bash
npx gherkin-e2e full-pipeline \
  --sheet-id "your-sheet-id" \
  --sheet-name "Test Cases" \
  --url "https://your-app.com" \
  --output-dir "./tests/generated"
```

## Features

### 🎯 Standardized Gherkin Templates
- Company-standard BDD scenario formats
- Consistent step patterns and naming conventions
- Built-in validation and quality checks
- Tag-based organization and filtering

### 📊 Google Sheets Integration
- Direct conversion from spreadsheet test cases
- Support for multiple sheet formats
- Automatic data validation and cleaning
- Batch processing capabilities

### 🤖 AI-Powered Test Generation
- Intelligent Gherkin-to-code conversion
- Context-aware selector mapping
- Production-ready Playwright test generation
- Page Object Model pattern implementation

### 🔍 UI Scanning & Analysis
- Automatic UI element detection
- Smart selector generation (data-testid, aria-label, role-based)
- Element relationship mapping
- Dynamic content handling

### ⚙️ Automation & CI/CD
- Complete CLI tool for automation
- GitHub Actions workflow templates
- Configuration management
- Continuous test generation pipeline

## Architecture

```
Google Sheets → Gherkin Features → UI Scanning → AI Mapping → Playwright Tests
     ↓              ↓                ↓             ↓            ↓
  Test Cases    BDD Scenarios    Element Map   Selector Map   E2E Tests
```

### Core Components

1. **SheetsService** - Google Sheets API integration
2. **GherkinGenerator** - BDD scenario generation
3. **UIScanner** - Application UI analysis
4. **SelectorMapper** - AI-powered element mapping
5. **PlaywrightGenerator** - Test code generation
6. **Pipeline** - End-to-end automation orchestration

## Configuration

### Environment Variables

```bash
# Google Sheets API
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI Service (choose one)
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key

# Application
BASE_URL=https://your-app.com
```

### Pipeline Configuration

```typescript
// config/pipeline-config.ts
export const config = {
  ai: {
    provider: 'anthropic', // or 'openai'
    model: 'claude-3-sonnet-20240229',
    temperature: 0.1
  },
  playwright: {
    timeout: 30000,
    retries: 2,
    browsers: ['chromium', 'firefox', 'webkit']
  },
  output: {
    gherkinDir: './features',
    testsDir: './tests/e2e',
    reportsDir: './reports'
  }
};
```

## Examples

### Google Sheets Format

| Feature | Scenario | Given | When | Then | Priority | Tags |
|---------|----------|-------|------|------|----------|------|
| User Login | Valid login | user is on login page | user enters valid credentials | user is redirected to dashboard | high | smoke,login |
| User Login | Invalid login | user is on login page | user enters invalid credentials | error message is displayed | medium | regression |

### Generated Gherkin

```gherkin
Feature: User Login
  As a user
  I want to authenticate with the system
  So that I can access my account

  @smoke @login @priority-high
  Scenario: Valid login
    Given the user is on the login page
    When the user enters valid credentials
    Then the user is redirected to dashboard

  @regression @priority-medium
  Scenario: Invalid login
    Given the user is on the login page
    When the user enters invalid credentials
    Then an error message is displayed
```

### Generated Playwright Test

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

test.describe('User Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('Valid login', async ({ page }) => {
    // Given the user is on the login page
    await loginPage.navigate();
    
    // When the user enters valid credentials
    await loginPage.fillCredentials('user@example.com', 'password123');
    await loginPage.clickLoginButton();
    
    // Then the user is redirected to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
```

## Best Practices

### Gherkin Writing
- Use business language, not technical terms
- Keep scenarios independent and focused
- Follow Given-When-Then structure consistently
- Use meaningful tags for organization
- Write from user perspective

### Test Generation
- Provide comprehensive UI context to AI
- Validate generated code thoroughly
- Use stable selectors (data-testid preferred)
- Implement proper error handling
- Follow Page Object Model pattern

### Maintenance
- Regular UI scanning for selector updates
- Continuous validation of generated tests
- Version control for all generated artifacts
- Monitor test execution metrics
- Update AI prompts based on results

## Troubleshooting

### Common Issues

**AI generates incorrect selectors**:
- Re-scan UI with updated application
- Provide more detailed element descriptions
- Manually review and correct selectors

**Google Sheets integration fails**:
- Verify service account permissions
- Check sheet structure matches expected format
- Validate API credentials

**Generated tests are flaky**:
- Add explicit waits for elements
- Improve selector stability
- Implement proper test isolation

### Debug Mode

Enable debug logging:
```bash
DEBUG=gherkin-e2e:* npx gherkin-e2e full-pipeline ...
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Comprehensive guides and examples
- Community: Join discussions and share experiences

---

Transform your test automation workflow with AI-powered Gherkin to Playwright test generation!