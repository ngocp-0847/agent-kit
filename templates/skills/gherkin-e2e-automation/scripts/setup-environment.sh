#!/bin/bash

# Gherkin E2E Automation Environment Setup Script
# Sets up the development environment for AI-powered E2E test generation

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
check_node_version() {
    log_info "Checking Node.js version..."
    
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $node_version -ge 18 ]]; then
        log_success "Node.js version is compatible: $(node --version)"
    else
        log_error "Node.js version $(node --version) is not supported. Please upgrade to Node.js 18+"
        exit 1
    fi
}

# Check npm/yarn
check_package_manager() {
    log_info "Checking package manager..."
    
    if command_exists yarn; then
        log_success "Yarn is available: $(yarn --version)"
        PACKAGE_MANAGER="yarn"
    elif command_exists npm; then
        log_success "npm is available: $(npm --version)"
        PACKAGE_MANAGER="npm"
    else
        log_error "No package manager found. Please install npm or yarn."
        exit 1
    fi
}

# Initialize package.json if it doesn't exist
init_package_json() {
    if [[ ! -f "package.json" ]]; then
        log_info "Initializing package.json..."
        
        cat > package.json << 'EOF'
{
  "name": "gherkin-e2e-automation",
  "version": "1.0.0",
  "description": "AI-powered E2E test generation from Gherkin scenarios",
  "main": "index.js",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui",
    "gherkin:validate": "cucumber-js --dry-run",
    "gherkin:generate": "node scripts/generate-tests.js",
    "sheets:convert": "node scripts/sheets-to-gherkin.js",
    "setup": "playwright install",
    "lint": "eslint . --ext .ts,.js",
    "format": "prettier --write ."
  },
  "keywords": [
    "gherkin",
    "bdd",
    "playwright",
    "e2e-testing",
    "ai-generation",
    "test-automation"
  ],
  "author": "",
  "license": "MIT"
}
EOF
        log_success "Created package.json"
    else
        log_info "package.json already exists"
    fi
}

# Install core dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Core testing dependencies
    local dev_deps=(
        "@playwright/test"
        "@cucumber/cucumber"
        "cucumber-html-reporter"
        "typescript"
        "@types/node"
        "ts-node"
    )
    
    # AI and integration dependencies
    local deps=(
        "anthropic"
        "openai"
        "google-spreadsheet"
        "dotenv"
        "commander"
        "chalk"
    )
    
    # Development tools
    local dev_tools=(
        "eslint"
        "@typescript-eslint/eslint-plugin"
        "@typescript-eslint/parser"
        "prettier"
        "husky"
        "lint-staged"
    )
    
    log_info "Installing core dependencies..."
    if [[ "$PACKAGE_MANAGER" == "yarn" ]]; then
        yarn add "${deps[@]}"
        yarn add -D "${dev_deps[@]}" "${dev_tools[@]}"
    else
        npm install "${deps[@]}"
        npm install -D "${dev_deps[@]}" "${dev_tools[@]}"
    fi
    
    log_success "Dependencies installed successfully"
}

# Setup Playwright
setup_playwright() {
    log_info "Setting up Playwright..."
    
    # Create Playwright config
    if [[ ! -f "playwright.config.ts" ]]; then
        cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['cucumber-html-reporter', {
      theme: 'bootstrap',
      jsonFile: 'test-results/cucumber_report.json',
      output: 'test-results/cucumber_report.html'
    }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
EOF
        log_success "Created playwright.config.ts"
    fi
    
    # Install Playwright browsers
    log_info "Installing Playwright browsers..."
    if [[ "$PACKAGE_MANAGER" == "yarn" ]]; then
        yarn playwright install
    else
        npx playwright install
    fi
    
    log_success "Playwright setup completed"
}

# Setup TypeScript configuration
setup_typescript() {
    log_info "Setting up TypeScript..."
    
    if [[ ! -f "tsconfig.json" ]]; then
        cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@pages/*": ["tests/pages/*"],
      "@utils/*": ["tests/utils/*"]
    }
  },
  "include": [
    "src/**/*",
    "tests/**/*",
    "scripts/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "test-results"
  ]
}
EOF
        log_success "Created tsconfig.json"
    fi
}

# Create directory structure
create_directories() {
    log_info "Creating directory structure..."
    
    local directories=(
        "src"
        "src/services"
        "src/generators"
        "src/parsers"
        "src/utils"
        "src/types"
        "tests/e2e"
        "tests/pages"
        "tests/utils"
        "tests/fixtures"
        "features"
        "scripts"
        "config"
        "reports"
        "test-results"
    )
    
    for dir in "${directories[@]}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir"
            log_success "Created directory: $dir"
        fi
    done
}

# Create environment file template
create_env_template() {
    log_info "Creating environment configuration..."
    
    if [[ ! -f ".env.example" ]]; then
        cat > .env.example << 'EOF'
# Application Configuration
BASE_URL=http://localhost:3000
NODE_ENV=development

# Google Sheets API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI Service Configuration (choose one or both for fallback)
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key

# AI Configuration
AI_PROVIDER=anthropic
AI_MODEL=claude-3-sonnet-20240229
AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.1

# Test Configuration
PLAYWRIGHT_TIMEOUT=30000
PLAYWRIGHT_RETRIES=2
PLAYWRIGHT_WORKERS=1

# Output Configuration
GHERKIN_OUTPUT_DIR=./features
TESTS_OUTPUT_DIR=./tests/e2e
REPORTS_OUTPUT_DIR=./reports

# Debug Configuration
DEBUG=false
VERBOSE_LOGGING=false
EOF
        log_success "Created .env.example"
    fi
    
    if [[ ! -f ".env" ]]; then
        cp .env.example .env
        log_success "Created .env from template"
        log_warning "Please update .env with your actual API keys and configuration"
    fi
}

# Setup ESLint configuration
setup_eslint() {
    log_info "Setting up ESLint..."
    
    if [[ ! -f ".eslintrc.js" ]]; then
        cat > .eslintrc.js << 'EOF'
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error',
  },
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'test-results/',
    'playwright-report/',
  ],
};
EOF
        log_success "Created .eslintrc.js"
    fi
}

# Setup Prettier configuration
setup_prettier() {
    log_info "Setting up Prettier..."
    
    if [[ ! -f ".prettierrc" ]]; then
        cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
EOF
        log_success "Created .prettierrc"
    fi
    
    if [[ ! -f ".prettierignore" ]]; then
        cat > .prettierignore << 'EOF'
node_modules/
dist/
test-results/
playwright-report/
coverage/
*.md
EOF
        log_success "Created .prettierignore"
    fi
}

# Create sample files
create_sample_files() {
    log_info "Creating sample files..."
    
    # Sample Gherkin feature
    if [[ ! -f "features/sample-login.feature" ]]; then
        cat > features/sample-login.feature << 'EOF'
Feature: User Authentication
  As a user
  I want to authenticate with the system
  So that I can access my account

  Background:
    Given the application is running
    And the user is on the login page

  @smoke @auth @priority-high
  Scenario: Successful login with valid credentials
    Given the user has a valid account
    When the user enters valid credentials
    And the user clicks the login button
    Then the user should be redirected to the dashboard
    And the user session should be established

  @validation @auth @priority-medium
  Scenario: Login fails with invalid credentials
    Given the user is on the login page
    When the user enters invalid credentials
    And the user clicks the login button
    Then an error message should be displayed
    And the user should remain on the login page
EOF
        log_success "Created sample Gherkin feature"
    fi
    
    # Sample page object
    if [[ ! -f "tests/pages/login-page.ts" ]]; then
        cat > tests/pages/login-page.ts << 'EOF'
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
}
EOF
        log_success "Created sample page object"
    fi
    
    # Sample test
    if [[ ! -f "tests/e2e/sample-login.spec.ts" ]]; then
        cat > tests/e2e/sample-login.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

test.describe('User Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('successful login with valid credentials', async ({ page }) => {
    // Given the user has a valid account (setup in beforeEach)
    
    // When the user enters valid credentials and clicks login
    await loginPage.login('test@example.com', 'password123');
    
    // Then the user should be redirected to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('login fails with invalid credentials', async ({ page }) => {
    // When the user enters invalid credentials
    await loginPage.login('test@example.com', 'wrongpassword');
    
    // Then an error message should be displayed
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
    
    // And the user should remain on the login page
    await expect(page).toHaveURL(/.*\/login/);
  });
});
EOF
        log_success "Created sample test file"
    fi
}

# Setup Git hooks
setup_git_hooks() {
    if command_exists git && [[ -d ".git" ]]; then
        log_info "Setting up Git hooks..."
        
        if [[ "$PACKAGE_MANAGER" == "yarn" ]]; then
            yarn husky install
        else
            npx husky install
        fi
        
        # Pre-commit hook
        if [[ "$PACKAGE_MANAGER" == "yarn" ]]; then
            yarn husky add .husky/pre-commit "yarn lint-staged"
        else
            npx husky add .husky/pre-commit "npx lint-staged"
        fi
        
        # Create lint-staged config
        if [[ ! -f ".lintstagedrc" ]]; then
            cat > .lintstagedrc << 'EOF'
{
  "*.{ts,js}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{md,json}": [
    "prettier --write"
  ]
}
EOF
            log_success "Created lint-staged configuration"
        fi
        
        log_success "Git hooks configured"
    else
        log_info "Skipping Git hooks setup (not a Git repository)"
    fi
}

# Create CLI script
create_cli_script() {
    log_info "Creating CLI script..."
    
    if [[ ! -f "scripts/gherkin-e2e-cli.js" ]]; then
        cat > scripts/gherkin-e2e-cli.js << 'EOF'
#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');

const program = new Command();

program
  .name('gherkin-e2e')
  .description('AI-powered E2E test generation from Gherkin')
  .version('1.0.0');

program
  .command('sheets-to-gherkin')
  .description('Convert Google Sheets to Gherkin features')
  .requiredOption('-s, --sheet-id <id>', 'Google Sheets ID')
  .requiredOption('-n, --sheet-name <name>', 'Sheet name')
  .requiredOption('-o, --output <path>', 'Output Gherkin file path')
  .action(async (options) => {
    console.log(chalk.blue('Converting Google Sheets to Gherkin...'));
    console.log('Sheet ID:', options.sheetId);
    console.log('Sheet Name:', options.sheetName);
    console.log('Output:', options.output);
    
    // TODO: Implement sheets-to-gherkin conversion
    console.log(chalk.yellow('Implementation pending...'));
  });

program
  .command('gherkin-to-playwright')
  .description('Generate Playwright tests from Gherkin')
  .requiredOption('-f, --feature <path>', 'Gherkin feature file path')
  .requiredOption('-o, --output <path>', 'Output test file path')
  .requiredOption('-u, --url <url>', 'Base URL for UI scanning')
  .action(async (options) => {
    console.log(chalk.blue('Generating Playwright tests from Gherkin...'));
    console.log('Feature file:', options.feature);
    console.log('Output:', options.output);
    console.log('Base URL:', options.url);
    
    // TODO: Implement gherkin-to-playwright generation
    console.log(chalk.yellow('Implementation pending...'));
  });

program
  .command('full-pipeline')
  .description('Complete pipeline: Sheets → Gherkin → Playwright')
  .requiredOption('-s, --sheet-id <id>', 'Google Sheets ID')
  .requiredOption('-n, --sheet-name <name>', 'Sheet name')
  .requiredOption('-u, --url <url>', 'Base URL for testing')
  .requiredOption('-o, --output-dir <dir>', 'Output directory')
  .action(async (options) => {
    console.log(chalk.blue('Running full pipeline...'));
    console.log('Sheet ID:', options.sheetId);
    console.log('Sheet Name:', options.sheetName);
    console.log('Base URL:', options.url);
    console.log('Output Directory:', options.outputDir);
    
    // TODO: Implement full pipeline
    console.log(chalk.yellow('Implementation pending...'));
  });

program.parse();
EOF
        chmod +x scripts/gherkin-e2e-cli.js
        log_success "Created CLI script"
    fi
}

# Main setup function
main() {
    echo "Gherkin E2E Automation Environment Setup"
    echo "========================================"
    echo ""
    
    check_node_version
    check_package_manager
    
    init_package_json
    install_dependencies
    
    setup_playwright
    setup_typescript
    
    create_directories
    create_env_template
    
    setup_eslint
    setup_prettier
    
    create_sample_files
    create_cli_script
    
    setup_git_hooks
    
    echo ""
    log_success "Environment setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env with your API keys and configuration"
    echo "2. Run 'npm test' or 'yarn test' to verify Playwright setup"
    echo "3. Start building your Gherkin features in the 'features/' directory"
    echo "4. Use the CLI script: './scripts/gherkin-e2e-cli.js --help'"
    echo ""
    echo "For more information, see the README.md and documentation."
}

# Show help if requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Gherkin E2E Automation Environment Setup"
    echo ""
    echo "Usage: $0"
    echo ""
    echo "Sets up the complete development environment for AI-powered"
    echo "E2E test generation from Gherkin scenarios."
    echo ""
    echo "This script will:"
    echo "- Check Node.js and package manager"
    echo "- Install required dependencies"
    echo "- Setup Playwright configuration"
    echo "- Create directory structure"
    echo "- Configure TypeScript, ESLint, and Prettier"
    echo "- Create sample files and templates"
    echo "- Setup Git hooks (if in Git repository)"
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help message"
    echo ""
    exit 0
fi

# Run main setup
main "$@"