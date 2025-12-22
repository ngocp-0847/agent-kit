---
name: gherkin-e2e-automation
description: AI-powered E2E test generation from Gherkin scenarios using Playwright, with Google Sheets integration and standardized BDD templates
version: 1.0.0
license: MIT
author: AI Assistant
tags: [gherkin, bdd, playwright, e2e-testing, test-automation, ai-generation, google-sheets]
allowed-tools: [Write, Read, Execute, Search]
dependencies: []
---

# Gherkin E2E Automation - AI-Powered Test Generation

Comprehensive framework for generating Playwright E2E tests from Gherkin scenarios using AI, with standardized templates and Google Sheets integration.

## Purpose

This skill provides a complete workflow for modern test automation that:

- **Standardizes Gherkin Templates** - Creates consistent, company-standard BDD scenarios
- **Enables Google Sheets Integration** - Converts spreadsheet test cases to Gherkin format
- **Generates Production-Ready Tests** - Uses AI to create Playwright E2E tests from Gherkin
- **Implements UI Scanning** - Maps selectors automatically for accurate test generation
- **Follows Best Practices** - Ensures maintainable, scalable test automation

Perfect for QA teams, developers, and organizations implementing BDD with AI-powered test generation.

## Core Concepts

### 1. AI-Powered Test Generation Architecture

Modern E2E test generation requires three key components:

**UI Model Extraction**:
- Scan application UI to build DOM/component model
- Extract selectors, roles, and element relationships
- Create structured UI context for AI understanding

**Selector Mapping**:
- Use AI (Claude Sonnet, GPT-4) to map Gherkin references to actual selectors
- Convert natural language to precise locators
- Handle dynamic elements and complex UI patterns

**Test Code Generation**:
- Generate production-ready Playwright TypeScript code
- Follow best practices (Page Object Model, DRY principles)
- Include proper error handling and assertions

### 2. Gherkin Template Standards

**Feature Structure**:
```gherkin
Feature: [Business Capability]
  As a [user type]
  I want [functionality]
  So that [business value]

  Background:
    Given [common setup conditions]

  Scenario: [Specific behavior]
    Given [initial context]
    When [action performed]
    Then [expected outcome]
    And [additional verification]
```

**Step Pattern Guidelines**:
- **Given**: Set up initial state and context
- **When**: Perform actions and interactions
- **Then**: Verify outcomes and assertions
- **And/But**: Continue previous step type

### 3. Google Sheets Integration

**Spreadsheet Structure**:
- Feature column: High-level functionality
- Scenario column: Specific test case
- Steps column: Given/When/Then steps
- Priority column: Test execution priority
- Status column: Implementation status

## Instructions

### Phase 1: Setup and Configuration

**Objective**: Establish the test automation framework and AI integration

**Steps**:

1. **Install Required Dependencies**
   ```bash
   # Install Playwright and testing framework
   npm install -D @playwright/test
   npm install -D @cucumber/cucumber
   npm install -D cucumber-html-reporter
   
   # Install AI integration tools
   npm install openai anthropic
   npm install google-spreadsheet
   ```

2. **Configure Playwright for BDD**
   ```typescript
   // playwright.config.ts
   import { defineConfig } from '@playwright/test';
   
   export default defineConfig({
     testDir: './tests/e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: [
       ['html'],
       ['cucumber-html-reporter', { 
         theme: 'bootstrap',
         jsonFile: 'reports/cucumber_report.json',
         output: 'reports/cucumber_report.html'
       }]
     ],
     use: {
       baseURL: 'http://localhost:3000',
       trace: 'on-first-retry',
       screenshot: 'only-on-failure'
     }
   });
   ```

3. **Setup AI Configuration**
   ```typescript
   // config/ai-config.ts
   export const aiConfig = {
     provider: 'anthropic', // or 'openai'
     model: 'claude-3-sonnet-20240229',
     apiKey: process.env.ANTHROPIC_API_KEY,
     maxTokens: 4000,
     temperature: 0.1
   };
   ```

**Expected Output**:
- Configured Playwright project with BDD support
- AI integration setup for test generation
- Google Sheets API configuration

### Phase 2: Create Gherkin Template Standards

**Objective**: Establish company-standard Gherkin templates and patterns

**Steps**:

1. **Define Feature Template Structure**
   ```gherkin
   # templates/feature-template.feature
   Feature: [Feature Name]
     As a [user role]
     I want [desired functionality]
     So that [business value/benefit]
   
     Background:
       Given the application is running
       And the user is on the [initial page]
   
     @smoke @priority-high
     Scenario: [Happy path scenario]
       Given [preconditions]
       When [user action]
       Then [expected result]
       And [additional verification]
   
     @regression @priority-medium
     Scenario Outline: [Data-driven scenario]
       Given [preconditions with <parameter>]
       When [action with <parameter>]
       Then [result with <parameter>]
   
       Examples:
         | parameter | expected_result |
         | value1    | result1        |
         | value2    | result2        |
   
     @edge-case @priority-low
     Scenario: [Error handling scenario]
       Given [error condition setup]
       When [action that triggers error]
       Then [error handling verification]
   ```

2. **Create Step Definition Patterns**
   ```typescript
   // templates/step-patterns.ts
   export const stepPatterns = {
     navigation: {
       given: [
         "the user is on the {string} page",
         "the user navigates to {string}",
         "the {string} page is loaded"
       ],
       when: [
         "the user clicks on {string}",
         "the user navigates to {string}",
         "the user goes back"
       ],
       then: [
         "the user should be on the {string} page",
         "the page title should be {string}",
         "the URL should contain {string}"
       ]
     },
     forms: {
       given: [
         "the {string} form is displayed",
         "the form has the following fields:",
         "the user has valid credentials"
       ],
       when: [
         "the user fills in {string} with {string}",
         "the user submits the form",
         "the user clears the {string} field"
       ],
       then: [
         "the form should be submitted successfully",
         "the {string} field should show error {string}",
         "the form should display validation errors"
       ]
     },
     ui_elements: {
       given: [
         "the {string} button is visible",
         "the {string} element is present",
         "the page contains {string}"
       ],
       when: [
         "the user clicks the {string} button",
         "the user hovers over {string}",
         "the user selects {string} from {string}"
       ],
       then: [
         "the {string} should be visible",
         "the {string} should contain {string}",
         "the {string} should be disabled"
       ]
     }
   };
   ```

3. **Setup Template Validation**
   ```typescript
   // utils/gherkin-validator.ts
   export class GherkinValidator {
     validateFeature(content: string): ValidationResult {
       const errors: string[] = [];
       
       // Check feature structure
       if (!content.includes('Feature:')) {
         errors.push('Missing Feature declaration');
       }
       
       // Validate user story format
       const userStoryPattern = /As a .+\s+I want .+\s+So that .+/;
       if (!userStoryPattern.test(content)) {
         errors.push('Invalid user story format');
       }
       
       // Check scenario structure
       const scenarios = content.match(/Scenario[^:]*:/g);
       if (!scenarios || scenarios.length === 0) {
         errors.push('No scenarios found');
       }
       
       // Validate step patterns
       const steps = content.match(/(Given|When|Then|And|But) .+/g);
       steps?.forEach(step => {
         if (!this.isValidStepPattern(step)) {
           errors.push(`Invalid step pattern: ${step}`);
         }
       });
       
       return {
         isValid: errors.length === 0,
         errors,
         warnings: this.getWarnings(content)
       };
     }
   }
   ```

**Expected Output**:
- Standardized Gherkin feature templates
- Step definition patterns library
- Template validation system

### Phase 3: Google Sheets to Gherkin Conversion

**Objective**: Convert spreadsheet test cases to standardized Gherkin format

**Steps**:

1. **Setup Google Sheets Integration**
   ```typescript
   // services/sheets-service.ts
   import { GoogleSpreadsheet } from 'google-spreadsheet';
   
   export class SheetsService {
     private doc: GoogleSpreadsheet;
   
     constructor(spreadsheetId: string) {
       this.doc = new GoogleSpreadsheet(spreadsheetId);
     }
   
     async authenticate(): Promise<void> {
       await this.doc.useServiceAccountAuth({
         client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
         private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
       });
       await this.doc.loadInfo();
     }
   
     async getTestCases(sheetName: string): Promise<TestCase[]> {
       const sheet = this.doc.sheetsByTitle[sheetName];
       const rows = await sheet.getRows();
       
       return rows.map(row => ({
         feature: row.Feature,
         scenario: row.Scenario,
         given: row.Given,
         when: row.When,
         then: row.Then,
         priority: row.Priority || 'medium',
         tags: row.Tags?.split(',').map(t => t.trim()) || []
       }));
     }
   }
   ```

2. **Create Gherkin Generator**
   ```typescript
   // generators/gherkin-generator.ts
   export class GherkinGenerator {
     generateFeature(testCases: TestCase[]): string {
       const groupedByFeature = this.groupByFeature(testCases);
       let gherkinContent = '';
   
       Object.entries(groupedByFeature).forEach(([featureName, scenarios]) => {
         gherkinContent += this.generateFeatureHeader(featureName);
         gherkinContent += this.generateBackground(scenarios[0]);
         
         scenarios.forEach(scenario => {
           gherkinContent += this.generateScenario(scenario);
         });
         
         gherkinContent += '\n';
       });
   
       return gherkinContent;
     }
   
     private generateFeatureHeader(featureName: string): string {
       return `Feature: ${featureName}
     As a user
     I want to interact with the application
     So that I can accomplish my goals
   
   `;
     }
   
     private generateScenario(testCase: TestCase): string {
       const tags = testCase.tags.length > 0 ? `  ${testCase.tags.map(t => `@${t}`).join(' ')}\n` : '';
       
       return `${tags}  Scenario: ${testCase.scenario}
     Given ${testCase.given}
     When ${testCase.when}
     Then ${testCase.then}
   
   `;
     }
   }
   ```

3. **Implement Conversion Pipeline**
   ```typescript
   // pipelines/sheets-to-gherkin.ts
   export class SheetsToGherkinPipeline {
     async convert(spreadsheetId: string, sheetName: string, outputPath: string): Promise<void> {
       // Step 1: Extract data from Google Sheets
       const sheetsService = new SheetsService(spreadsheetId);
       await sheetsService.authenticate();
       const testCases = await sheetsService.getTestCases(sheetName);
   
       // Step 2: Validate and clean data
       const validator = new GherkinValidator();
       const cleanedTestCases = testCases.filter(tc => 
         tc.given && tc.when && tc.then
       );
   
       // Step 3: Generate Gherkin content
       const generator = new GherkinGenerator();
       const gherkinContent = generator.generateFeature(cleanedTestCases);
   
       // Step 4: Validate generated Gherkin
       const validationResult = validator.validateFeature(gherkinContent);
       if (!validationResult.isValid) {
         throw new Error(`Invalid Gherkin generated: ${validationResult.errors.join(', ')}`);
       }
   
       // Step 5: Write to file
       await fs.writeFile(outputPath, gherkinContent, 'utf8');
       console.log(`Gherkin feature file generated: ${outputPath}`);
     }
   }
   ```

**Expected Output**:
- Google Sheets integration service
- Automated Gherkin generation from spreadsheets
- Data validation and cleaning pipeline

### Phase 4: UI Scanning and Model Extraction

**Objective**: Build UI model for accurate selector mapping

**Steps**:

1. **Implement UI Scanner**
   ```typescript
   // services/ui-scanner.ts
   import { Page } from '@playwright/test';
   
   export class UIScanner {
     async scanPage(page: Page, url: string): Promise<UIModel> {
       await page.goto(url);
       
       // Extract all interactive elements
       const elements = await page.evaluate(() => {
         const interactiveSelectors = [
           'button', 'input', 'select', 'textarea', 'a[href]',
           '[role="button"]', '[role="link"]', '[role="textbox"]',
           '[data-testid]', '[aria-label]'
         ];
         
         const elements: UIElement[] = [];
         
         interactiveSelectors.forEach(selector => {
           document.querySelectorAll(selector).forEach((el, index) => {
             const element = el as HTMLElement;
             elements.push({
               selector: this.generateSelector(element),
               type: element.tagName.toLowerCase(),
               text: element.textContent?.trim() || '',
               ariaLabel: element.getAttribute('aria-label') || '',
               dataTestId: element.getAttribute('data-testid') || '',
               role: element.getAttribute('role') || '',
               placeholder: element.getAttribute('placeholder') || '',
               id: element.id || '',
               className: element.className || '',
               position: { x: element.offsetLeft, y: element.offsetTop }
             });
           });
         });
         
         return elements;
       });
       
       return {
         url,
         title: await page.title(),
         elements,
         timestamp: new Date().toISOString()
       };
     }
   
     private generateSelector(element: HTMLElement): string {
       // Priority order for selector generation
       if (element.getAttribute('data-testid')) {
         return `[data-testid="${element.getAttribute('data-testid')}"]`;
       }
       
       if (element.id) {
         return `#${element.id}`;
       }
       
       if (element.getAttribute('aria-label')) {
         return `[aria-label="${element.getAttribute('aria-label')}"]`;
       }
       
       // Generate role-based selector for Playwright
       const role = element.getAttribute('role') || this.inferRole(element);
       const text = element.textContent?.trim();
       
       if (role && text) {
         return `role=${role}[name="${text}"]`;
       }
       
       // Fallback to CSS selector
       return this.generateCSSSelector(element);
     }
   }
   ```

2. **Create Selector Mapping Service**
   ```typescript
   // services/selector-mapper.ts
   export class SelectorMapper {
     constructor(private aiService: AIService) {}
   
     async mapGherkinToSelectors(gherkinStep: string, uiModel: UIModel): Promise<SelectorMapping> {
       const prompt = this.buildMappingPrompt(gherkinStep, uiModel);
       
       const response = await this.aiService.generateCompletion({
         prompt,
         maxTokens: 1000,
         temperature: 0.1
       });
   
       return this.parseMapping(response);
     }
   
     private buildMappingPrompt(step: string, uiModel: UIModel): string {
       return `
   Map this Gherkin step to the appropriate UI selector:
   
   Gherkin Step: "${step}"
   
   Available UI Elements:
   ${uiModel.elements.map(el => 
     `- ${el.selector} (${el.type}): "${el.text}" ${el.ariaLabel ? `[${el.ariaLabel}]` : ''}`
   ).join('\n')}
   
   Return the mapping in this JSON format:
   {
     "selector": "the most appropriate selector",
     "action": "click|fill|select|check|etc",
     "value": "value to use if applicable",
     "confidence": 0.95
   }
   
   Choose the selector that best matches the intent of the Gherkin step.
   `;
     }
   }
   ```

**Expected Output**:
- UI scanning service for element extraction
- AI-powered selector mapping system
- Structured UI model for test generation

### Phase 5: AI-Powered Test Generation

**Objective**: Generate production-ready Playwright tests from Gherkin scenarios

**Steps**:

1. **Create Test Generator**
   ```typescript
   // generators/playwright-generator.ts
   export class PlaywrightGenerator {
     constructor(
       private aiService: AIService,
       private selectorMapper: SelectorMapper
     ) {}
   
     async generateTest(feature: GherkinFeature, uiModel: UIModel): Promise<string> {
       const testCode = await this.generateTestStructure(feature);
       const stepImplementations = await this.generateStepImplementations(feature.scenarios, uiModel);
       
       return this.combineTestCode(testCode, stepImplementations);
     }
   
     private async generateTestStructure(feature: GherkinFeature): Promise<string> {
       const prompt = `
   Generate a Playwright test structure for this Gherkin feature:
   
   ${feature.content}
   
   Requirements:
   - Use TypeScript
   - Follow Page Object Model pattern
   - Include proper imports and setup
   - Add descriptive test names
   - Include proper error handling
   
   Return only the test structure without step implementations.
   `;
   
       return await this.aiService.generateCompletion({ prompt });
     }
   
     private async generateStepImplementations(scenarios: GherkinScenario[], uiModel: UIModel): Promise<StepImplementation[]> {
       const implementations: StepImplementation[] = [];
   
       for (const scenario of scenarios) {
         for (const step of scenario.steps) {
           const mapping = await this.selectorMapper.mapGherkinToSelectors(step.text, uiModel);
           const implementation = await this.generateStepCode(step, mapping);
           implementations.push(implementation);
         }
       }
   
       return implementations;
     }
   
     private async generateStepCode(step: GherkinStep, mapping: SelectorMapping): Promise<StepImplementation> {
       const prompt = `
   Generate Playwright code for this Gherkin step:
   
   Step: "${step.text}"
   Selector: "${mapping.selector}"
   Action: "${mapping.action}"
   Value: "${mapping.value || ''}"
   
   Requirements:
   - Use async/await
   - Include proper error handling
   - Add meaningful assertions for Then steps
   - Use Playwright best practices
   - Include comments explaining the action
   
   Return only the implementation code.
   `;
   
       const code = await this.aiService.generateCompletion({ prompt });
       
       return {
         step: step.text,
         code: code.trim(),
         selector: mapping.selector,
         confidence: mapping.confidence
       };
     }
   }
   ```

2. **Implement Complete Generation Pipeline**
   ```typescript
   // pipelines/gherkin-to-playwright.ts
   export class GherkinToPlaywrightPipeline {
     async generate(gherkinPath: string, outputPath: string, baseUrl: string): Promise<void> {
       // Step 1: Parse Gherkin feature
       const gherkinContent = await fs.readFile(gherkinPath, 'utf8');
       const feature = this.parseGherkin(gherkinContent);
   
       // Step 2: Scan UI and build model
       const browser = await chromium.launch();
       const page = await browser.newPage();
       const uiScanner = new UIScanner();
       const uiModel = await uiScanner.scanPage(page, baseUrl);
       await browser.close();
   
       // Step 3: Generate test code
       const generator = new PlaywrightGenerator(this.aiService, this.selectorMapper);
       const testCode = await generator.generateTest(feature, uiModel);
   
       // Step 4: Validate generated code
       const validator = new CodeValidator();
       const validationResult = await validator.validateTypeScript(testCode);
       
       if (!validationResult.isValid) {
         throw new Error(`Generated code is invalid: ${validationResult.errors.join(', ')}`);
       }
   
       // Step 5: Write test file
       await fs.writeFile(outputPath, testCode, 'utf8');
       console.log(`Playwright test generated: ${outputPath}`);
   
       // Step 6: Format code
       await this.formatCode(outputPath);
     }
   }
   ```

3. **Setup Page Object Model Generation**
   ```typescript
   // generators/page-object-generator.ts
   export class PageObjectGenerator {
     async generatePageObject(uiModel: UIModel, pageName: string): Promise<string> {
       const prompt = `
   Generate a Page Object Model class for this UI:
   
   Page: ${pageName}
   URL: ${uiModel.url}
   
   Elements:
   ${uiModel.elements.map(el => 
     `- ${el.selector}: ${el.text || el.ariaLabel || el.type}`
   ).join('\n')}
   
   Requirements:
   - Use TypeScript
   - Extend base Page class
   - Include all interactive elements as methods
   - Add navigation methods
   - Include assertions for page verification
   - Use Playwright locators
   
   Return complete Page Object class.
   `;
   
       return await this.aiService.generateCompletion({ prompt });
     }
   }
   ```

**Expected Output**:
- AI-powered Playwright test generator
- Complete test generation pipeline
- Page Object Model generation
- Code validation and formatting

### Phase 6: Integration and Automation

**Objective**: Create end-to-end automation pipeline

**Steps**:

1. **Create CLI Tool**
   ```typescript
   // cli/gherkin-e2e-cli.ts
   #!/usr/bin/env node
   
   import { Command } from 'commander';
   
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
       const pipeline = new SheetsToGherkinPipeline();
       await pipeline.convert(options.sheetId, options.sheetName, options.output);
     });
   
   program
     .command('gherkin-to-playwright')
     .description('Generate Playwright tests from Gherkin')
     .requiredOption('-f, --feature <path>', 'Gherkin feature file path')
     .requiredOption('-o, --output <path>', 'Output test file path')
     .requiredOption('-u, --url <url>', 'Base URL for UI scanning')
     .action(async (options) => {
       const pipeline = new GherkinToPlaywrightPipeline();
       await pipeline.generate(options.feature, options.output, options.url);
     });
   
   program
     .command('full-pipeline')
     .description('Complete pipeline: Sheets → Gherkin → Playwright')
     .requiredOption('-s, --sheet-id <id>', 'Google Sheets ID')
     .requiredOption('-n, --sheet-name <name>', 'Sheet name')
     .requiredOption('-u, --url <url>', 'Base URL for testing')
     .requiredOption('-o, --output-dir <dir>', 'Output directory')
     .action(async (options) => {
       await runFullPipeline(options);
     });
   
   program.parse();
   ```

2. **Setup CI/CD Integration**
   ```yaml
   # .github/workflows/e2e-generation.yml
   name: E2E Test Generation
   
   on:
     schedule:
       - cron: '0 2 * * *'  # Daily at 2 AM
     workflow_dispatch:
       inputs:
         sheet_id:
           description: 'Google Sheets ID'
           required: true
         base_url:
           description: 'Application URL'
           required: true
   
   jobs:
     generate-tests:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             
         - name: Install dependencies
           run: npm ci
           
         - name: Generate tests from sheets
           run: |
             npx gherkin-e2e full-pipeline \
               --sheet-id ${{ github.event.inputs.sheet_id }} \
               --sheet-name "Test Cases" \
               --url ${{ github.event.inputs.base_url }} \
               --output-dir ./tests/generated
           env:
             GOOGLE_SERVICE_ACCOUNT_EMAIL: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_EMAIL }}
             GOOGLE_PRIVATE_KEY: ${{ secrets.GOOGLE_PRIVATE_KEY }}
             ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
             
         - name: Run generated tests
           run: npx playwright test tests/generated/
           
         - name: Upload test results
           uses: actions/upload-artifact@v3
           if: always()
           with:
             name: test-results
             path: test-results/
   ```

3. **Create Configuration Management**
   ```typescript
   // config/pipeline-config.ts
   export interface PipelineConfig {
     googleSheets: {
       serviceAccountEmail: string;
       privateKey: string;
       defaultSheetName: string;
     };
     ai: {
       provider: 'anthropic' | 'openai';
       model: string;
       apiKey: string;
       maxTokens: number;
       temperature: number;
     };
     playwright: {
       baseUrl: string;
       timeout: number;
       retries: number;
       browsers: string[];
     };
     output: {
       gherkinDir: string;
       testsDir: string;
       reportsDir: string;
     };
   }
   
   export const defaultConfig: PipelineConfig = {
     googleSheets: {
       serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
       privateKey: process.env.GOOGLE_PRIVATE_KEY!,
       defaultSheetName: 'Test Cases'
     },
     ai: {
       provider: 'anthropic',
       model: 'claude-3-sonnet-20240229',
       apiKey: process.env.ANTHROPIC_API_KEY!,
       maxTokens: 4000,
       temperature: 0.1
     },
     playwright: {
       baseUrl: process.env.BASE_URL || 'http://localhost:3000',
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

**Expected Output**:
- Complete CLI tool for automation
- CI/CD pipeline integration
- Configuration management system
- End-to-end automation workflow

## Examples

### Example 1: Google Sheets to Gherkin Conversion

**Input Google Sheet**:
| Feature | Scenario | Given | When | Then | Priority | Tags |
|---------|----------|-------|------|------|----------|------|
| User Login | Valid credentials login | the user is on the login page | the user enters valid credentials and clicks login | the user should be redirected to dashboard | high | smoke,login |
| User Login | Invalid credentials | the user is on the login page | the user enters invalid credentials | an error message should be displayed | medium | regression,login |

**Generated Gherkin**:
```gherkin
Feature: User Login
  As a user
  I want to interact with the application
  So that I can accomplish my goals

  @smoke @login @priority-high
  Scenario: Valid credentials login
    Given the user is on the login page
    When the user enters valid credentials and clicks login
    Then the user should be redirected to dashboard

  @regression @login @priority-medium
  Scenario: Invalid credentials
    Given the user is on the login page
    When the user enters invalid credentials
    Then an error message should be displayed
```

**CLI Command**:
```bash
npx gherkin-e2e sheets-to-gherkin \
  --sheet-id "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" \
  --sheet-name "Test Cases" \
  --output "./features/user-login.feature"
```

### Example 2: Gherkin to Playwright Test Generation

**Input Gherkin**:
```gherkin
Feature: User Registration
  Scenario: Successful user registration
    Given the user is on the registration page
    When the user fills in the registration form with valid data
    And the user clicks the register button
    Then the user should see a success message
    And the user should be redirected to the welcome page
```

**Generated Playwright Test**:
```typescript
import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../pages/registration-page';

test.describe('User Registration', () => {
  let registrationPage: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
  });

  test('Successful user registration', async ({ page }) => {
    // Given the user is on the registration page
    await registrationPage.navigate();
    await expect(registrationPage.registrationForm).toBeVisible();

    // When the user fills in the registration form with valid data
    await registrationPage.fillRegistrationForm({
      email: 'test@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe'
    });

    // And the user clicks the register button
    await registrationPage.clickRegisterButton();

    // Then the user should see a success message
    await expect(registrationPage.successMessage).toBeVisible();
    await expect(registrationPage.successMessage).toContainText('Registration successful');

    // And the user should be redirected to the welcome page
    await expect(page).toHaveURL(/.*\/welcome/);
    await expect(page.locator('h1')).toContainText('Welcome');
  });
});
```

**Generated Page Object**:
```typescript
import { Page, Locator } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;
  readonly registrationForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly registerButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.registrationForm = page.locator('[data-testid="registration-form"]');
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm Password' });
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.registerButton = page.getByRole('button', { name: 'Register' });
    this.successMessage = page.locator('[data-testid="success-message"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/register');
  }

  async fillRegistrationForm(data: RegistrationData): Promise<void> {
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword);
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
  }

  async clickRegisterButton(): Promise<void> {
    await this.registerButton.click();
  }
}
```

### Example 3: Complete Pipeline Automation

**CLI Command**:
```bash
npx gherkin-e2e full-pipeline \
  --sheet-id "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" \
  --sheet-name "E2E Test Cases" \
  --url "https://staging.myapp.com" \
  --output-dir "./tests/generated"
```

**Pipeline Output**:
```
✅ Connected to Google Sheets
✅ Extracted 15 test cases from sheet "E2E Test Cases"
✅ Generated 3 Gherkin feature files
✅ Scanned UI at https://staging.myapp.com
✅ Mapped 45 UI elements to selectors
✅ Generated 15 Playwright test files
✅ Created 8 Page Object Model classes
✅ Validated all generated code
✅ Formatted code with Prettier

Generated Files:
- features/user-authentication.feature
- features/product-catalog.feature
- features/shopping-cart.feature
- tests/e2e/user-authentication.spec.ts
- tests/e2e/product-catalog.spec.ts
- tests/e2e/shopping-cart.spec.ts
- pages/login-page.ts
- pages/product-page.ts
- pages/cart-page.ts

Next Steps:
1. Review generated tests in ./tests/generated
2. Run tests: npx playwright test tests/generated/
3. Update selectors if needed
4. Add to CI/CD pipeline
```

## Best Practices

### Gherkin Writing Standards

**Do's**:
- ✅ Use business language, not technical terms
- ✅ Write from user perspective
- ✅ Keep scenarios focused and independent
- ✅ Use consistent step patterns
- ✅ Include meaningful tags for organization
- ✅ Write clear, actionable steps

**Don'ts**:
- ❌ Don't include implementation details
- ❌ Don't make scenarios dependent on each other
- ❌ Don't use technical jargon
- ❌ Don't write overly long scenarios
- ❌ Don't duplicate step definitions

### AI Test Generation

**Do's**:
- ✅ Provide comprehensive UI context
- ✅ Use specific, descriptive prompts
- ✅ Validate generated code thoroughly
- ✅ Review and refine AI outputs
- ✅ Maintain consistent coding standards
- ✅ Use proper error handling

**Don'ts**:
- ❌ Don't trust AI output blindly
- ❌ Don't skip code validation
- ❌ Don't ignore edge cases
- ❌ Don't use overly complex prompts
- ❌ Don't forget to test generated tests

### Selector Strategy

**Priority Order**:
1. `data-testid` attributes (most stable)
2. `aria-label` attributes (accessible)
3. `id` attributes (unique identifiers)
4. Role-based selectors (semantic)
5. CSS selectors (last resort)

**Selector Guidelines**:
- Use Playwright's `getByRole()` when possible
- Prefer semantic selectors over CSS
- Avoid brittle selectors (nth-child, complex CSS)
- Use `data-testid` for test-specific elements
- Document selector strategies in code

## Quality Standards

### Generated Code Quality

**Code Standards**:
- TypeScript with strict mode enabled
- ESLint and Prettier formatting
- Comprehensive error handling
- Meaningful variable and function names
- Proper async/await usage
- Page Object Model pattern

**Test Quality Metrics**:
- Test execution time < 30 seconds per scenario
- Test reliability > 95% pass rate
- Code coverage > 80% for critical paths
- Selector stability (no frequent changes needed)
- Clear test failure messages

### Validation Checklist

**Gherkin Validation**:
- [ ] Feature has clear business value
- [ ] Scenarios are independent
- [ ] Steps follow Given-When-Then pattern
- [ ] Language is business-focused
- [ ] Tags are meaningful and consistent

**Generated Test Validation**:
- [ ] Code compiles without errors
- [ ] Tests run successfully
- [ ] Selectors are stable and reliable
- [ ] Error handling is comprehensive
- [ ] Page objects follow conventions
- [ ] Tests are maintainable

## Troubleshooting

### Common Issues

#### Issue 1: AI Generates Incorrect Selectors

**Symptoms**:
- Tests fail with "element not found" errors
- Selectors don't match actual UI elements
- Inconsistent selector patterns

**Causes**:
- Insufficient UI context provided to AI
- UI elements changed after scanning
- Poor quality UI scanning results

**Solutions**:
1. Re-scan UI with updated application
2. Provide more detailed element descriptions
3. Use more specific prompts for AI
4. Manually review and correct selectors
5. Implement selector validation

#### Issue 2: Google Sheets Integration Fails

**Symptoms**:
- Authentication errors
- Empty or malformed data extraction
- API rate limiting issues

**Causes**:
- Invalid service account credentials
- Incorrect sheet permissions
- Malformed sheet structure

**Solutions**:
1. Verify service account setup and permissions
2. Check sheet sharing settings
3. Validate sheet structure matches expected format
4. Implement retry logic for API calls
5. Add proper error handling

#### Issue 3: Generated Tests Are Flaky

**Symptoms**:
- Tests pass/fail inconsistently
- Timing-related failures
- Element interaction issues

**Causes**:
- Missing wait conditions
- Race conditions in UI
- Unstable selectors

**Solutions**:
1. Add explicit waits for elements
2. Use Playwright's auto-waiting features
3. Implement retry mechanisms
4. Improve selector stability
5. Add proper test isolation

### Debugging Strategies

**UI Scanning Debug**:
```typescript
// Enable debug mode for UI scanning
const uiScanner = new UIScanner({ debug: true });
const uiModel = await uiScanner.scanPage(page, url);

// Log detailed element information
console.log('Scanned elements:', JSON.stringify(uiModel.elements, null, 2));
```

**AI Generation Debug**:
```typescript
// Log AI prompts and responses
const aiService = new AIService({ 
  debug: true,
  logPrompts: true 
});

// Save intermediate results
await fs.writeFile('debug-ui-model.json', JSON.stringify(uiModel, null, 2));
await fs.writeFile('debug-generated-code.ts', generatedCode);
```

**Test Execution Debug**:
```typescript
// Enable Playwright debug mode
test.use({ 
  trace: 'on',
  video: 'on',
  screenshot: 'only-on-failure'
});

// Add debug logging to tests
test('debug test', async ({ page }) => {
  console.log('Starting test execution');
  await page.goto('/');
  console.log('Page loaded:', await page.title());
  // ... rest of test
});
```

## References

- [Playwright Documentation](https://playwright.dev/) - Official Playwright testing framework
- [Cucumber.js](https://cucumber.io/docs/cucumber/) - BDD framework for JavaScript
- [Google Sheets API](https://developers.google.com/sheets/api) - Integration documentation
- [Anthropic Claude API](https://docs.anthropic.com/) - AI service for test generation
- [OpenAI API](https://platform.openai.com/docs/) - Alternative AI service
- [Agent Skills Specification](https://agentskills.io/) - Skill development standards
- [BDD Best Practices](https://cucumber.io/docs/bdd/) - Behavior-driven development guide
- [Page Object Model](https://playwright.dev/docs/pom) - Test organization pattern

---

This skill provides a comprehensive framework for modern, AI-powered E2E test automation. Start with simple scenarios, validate thoroughly, and gradually expand to more complex test generation workflows.