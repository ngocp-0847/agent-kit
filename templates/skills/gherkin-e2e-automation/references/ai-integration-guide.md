# AI Integration Guide for E2E Test Generation

Comprehensive guide for integrating AI services (Claude, GPT-4) into the Gherkin-to-Playwright test generation pipeline.

## AI Service Architecture

### Service Abstraction Layer

```typescript
// interfaces/ai-service.interface.ts
export interface AIService {
  generateCompletion(request: CompletionRequest): Promise<string>;
  generateStructuredOutput<T>(request: StructuredRequest<T>): Promise<T>;
  validateResponse(response: string, schema?: any): boolean;
}

export interface CompletionRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

export interface StructuredRequest<T> extends CompletionRequest {
  outputSchema: any;
  examples?: T[];
}
```

### Claude Integration

```typescript
// services/claude-service.ts
import Anthropic from '@anthropic-ai/sdk';
import { AIService, CompletionRequest, StructuredRequest } from '../interfaces/ai-service.interface';

export class ClaudeService implements AIService {
  private client: Anthropic;
  
  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey: apiKey
    });
  }

  async generateCompletion(request: CompletionRequest): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: request.maxTokens || 4000,
        temperature: request.temperature || 0.1,
        system: request.systemPrompt || 'You are a helpful assistant that generates high-quality code.',
        messages: [
          {
            role: 'user',
            content: request.prompt
          }
        ],
        stop_sequences: request.stopSequences
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Claude API request failed: ${error.message}`);
    }
  }

  async generateStructuredOutput<T>(request: StructuredRequest<T>): Promise<T> {
    const prompt = this.buildStructuredPrompt(request);
    const response = await this.generateCompletion({
      ...request,
      prompt
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`Failed to parse structured response: ${response}`);
    }
  }

  private buildStructuredPrompt<T>(request: StructuredRequest<T>): string {
    let prompt = request.prompt + '\n\n';
    
    if (request.outputSchema) {
      prompt += `Return the response in the following JSON format:\n`;
      prompt += `${JSON.stringify(request.outputSchema, null, 2)}\n\n`;
    }

    if (request.examples && request.examples.length > 0) {
      prompt += `Examples:\n`;
      request.examples.forEach((example, index) => {
        prompt += `Example ${index + 1}:\n${JSON.stringify(example, null, 2)}\n\n`;
      });
    }

    prompt += `Return only valid JSON without any additional text or formatting.`;
    
    return prompt;
  }

  validateResponse(response: string, schema?: any): boolean {
    try {
      const parsed = JSON.parse(response);
      if (schema) {
        // Add JSON schema validation here if needed
        return true;
      }
      return true;
    } catch {
      return false;
    }
  }
}
```

### OpenAI Integration

```typescript
// services/openai-service.ts
import OpenAI from 'openai';
import { AIService, CompletionRequest, StructuredRequest } from '../interfaces/ai-service.interface';

export class OpenAIService implements AIService {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey
    });
  }

  async generateCompletion(request: CompletionRequest): Promise<string> {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      
      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt
        });
      }
      
      messages.push({
        role: 'user',
        content: request.prompt
      });

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        max_tokens: request.maxTokens || 4000,
        temperature: request.temperature || 0.1,
        stop: request.stopSequences
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API request failed: ${error.message}`);
    }
  }

  async generateStructuredOutput<T>(request: StructuredRequest<T>): Promise<T> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: request.systemPrompt || 'You are a helpful assistant that returns structured JSON responses.'
        },
        {
          role: 'user',
          content: this.buildStructuredPrompt(request)
        }
      ],
      max_tokens: request.maxTokens || 4000,
      temperature: request.temperature || 0.1,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse structured response: ${content}`);
    }
  }

  private buildStructuredPrompt<T>(request: StructuredRequest<T>): string {
    let prompt = request.prompt + '\n\n';
    
    if (request.outputSchema) {
      prompt += `Return the response as JSON matching this schema:\n`;
      prompt += `${JSON.stringify(request.outputSchema, null, 2)}\n\n`;
    }

    if (request.examples && request.examples.length > 0) {
      prompt += `Examples of expected output:\n`;
      request.examples.forEach((example, index) => {
        prompt += `Example ${index + 1}:\n${JSON.stringify(example, null, 2)}\n\n`;
      });
    }

    return prompt;
  }

  validateResponse(response: string, schema?: any): boolean {
    try {
      JSON.parse(response);
      return true;
    } catch {
      return false;
    }
  }
}
```

## Prompt Engineering Patterns

### Selector Mapping Prompts

```typescript
// prompts/selector-mapping.ts
export class SelectorMappingPrompts {
  static buildMappingPrompt(gherkinStep: string, uiModel: UIModel): string {
    return `
You are an expert at mapping Gherkin test steps to UI selectors for Playwright tests.

TASK: Map this Gherkin step to the most appropriate UI selector from the available elements.

GHERKIN STEP: "${gherkinStep}"

AVAILABLE UI ELEMENTS:
${uiModel.elements.map((el, index) => 
  `${index + 1}. Selector: ${el.selector}
     Type: ${el.type}
     Text: "${el.text}"
     Aria Label: "${el.ariaLabel}"
     Role: "${el.role}"
     Data Test ID: "${el.dataTestId}"`
).join('\n\n')}

MAPPING RULES:
1. Prioritize selectors in this order:
   - data-testid attributes (most stable)
   - role-based selectors (semantic)
   - aria-label attributes (accessible)
   - id attributes (unique)
   - text content (if specific)

2. Choose the selector that best matches the intent of the Gherkin step
3. Consider the action type (click, fill, select, etc.)
4. Ensure the selector is specific enough to avoid ambiguity

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "selector": "the most appropriate selector from the list",
  "action": "click|fill|select|check|hover|press|clear",
  "value": "value to use if applicable (for fill, select actions)",
  "confidence": 0.95,
  "reasoning": "brief explanation of why this selector was chosen"
}

EXAMPLES:
Gherkin: "When the user clicks the login button"
Response: {
  "selector": "page.getByRole('button', { name: 'Login' })",
  "action": "click",
  "value": null,
  "confidence": 0.95,
  "reasoning": "Role-based selector for button with specific name is most semantic and stable"
}

Gherkin: "When the user enters 'john@example.com' in the email field"
Response: {
  "selector": "page.getByRole('textbox', { name: 'Email' })",
  "action": "fill",
  "value": "john@example.com",
  "confidence": 0.90,
  "reasoning": "Role-based textbox selector with email label matches the intent"
}
`;
  }

  static buildBatchMappingPrompt(steps: string[], uiModel: UIModel): string {
    return `
You are an expert at mapping multiple Gherkin test steps to UI selectors for Playwright tests.

TASK: Map each Gherkin step to the most appropriate UI selector from the available elements.

GHERKIN STEPS:
${steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

AVAILABLE UI ELEMENTS:
${uiModel.elements.map((el, index) => 
  `${index + 1}. Selector: ${el.selector} | Type: ${el.type} | Text: "${el.text}" | Role: "${el.role}"`
).join('\n')}

Return a JSON array with mappings for each step:
[
  {
    "stepIndex": 0,
    "selector": "appropriate selector",
    "action": "action type",
    "value": "value if needed",
    "confidence": 0.95
  },
  ...
]
`;
  }
}
```

### Test Generation Prompts

```typescript
// prompts/test-generation.ts
export class TestGenerationPrompts {
  static buildTestStructurePrompt(feature: GherkinFeature): string {
    return `
You are an expert Playwright test developer. Generate a complete TypeScript test file structure for this Gherkin feature.

GHERKIN FEATURE:
${feature.content}

REQUIREMENTS:
1. Use @playwright/test framework
2. Follow Page Object Model pattern
3. Use TypeScript with proper typing
4. Include proper imports and setup
5. Create descriptive test names based on scenarios
6. Add proper beforeEach/afterEach hooks
7. Use async/await throughout
8. Include proper error handling
9. Follow Playwright best practices

STRUCTURE TEMPLATE:
- Import statements
- Page object imports
- Test describe block with feature name
- beforeEach setup
- Individual test methods for each scenario
- Helper methods if needed

DO NOT INCLUDE:
- Actual step implementations (leave as comments)
- Specific selectors or actions
- Page object class definitions

RETURN:
Complete TypeScript test file structure with placeholder comments for step implementations.

EXAMPLE OUTPUT FORMAT:
\`\`\`typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

test.describe('User Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    // Setup code here
  });

  test('valid user login', async ({ page }) => {
    // Given the user is on the login page
    // When the user enters valid credentials
    // Then the user should be redirected to dashboard
  });
});
\`\`\`
`;
  }

  static buildStepImplementationPrompt(
    step: GherkinStep, 
    mapping: SelectorMapping,
    context: TestContext
  ): string {
    return `
You are an expert Playwright test developer. Generate the implementation for this Gherkin step.

GHERKIN STEP: "${step.text}"
STEP TYPE: ${step.type} (Given/When/Then)

SELECTOR MAPPING:
- Selector: ${mapping.selector}
- Action: ${mapping.action}
- Value: ${mapping.value || 'N/A'}

CONTEXT:
- Page Object: ${context.pageObjectName}
- Test Method: ${context.testMethodName}
- Previous Steps: ${context.previousSteps.join(', ')}

REQUIREMENTS:
1. Use the provided selector and action
2. Include proper error handling
3. Add meaningful assertions for Then steps
4. Use async/await
5. Follow Playwright best practices
6. Add descriptive comments
7. Handle edge cases appropriately

STEP TYPE GUIDELINES:
- Given: Setup state, navigate, prepare data
- When: Perform actions, interactions
- Then: Verify outcomes, assert results

RETURN:
Only the TypeScript code implementation for this step, properly formatted.

EXAMPLES:

For "Given the user is on the login page":
\`\`\`typescript
// Given the user is on the login page
await loginPage.navigate();
await expect(loginPage.loginForm).toBeVisible();
\`\`\`

For "When the user clicks the login button":
\`\`\`typescript
// When the user clicks the login button
await loginPage.loginButton.click();
\`\`\`

For "Then the user should see an error message":
\`\`\`typescript
// Then the user should see an error message
await expect(loginPage.errorMessage).toBeVisible();
await expect(loginPage.errorMessage).toContainText('Invalid credentials');
\`\`\`
`;
  }

  static buildPageObjectPrompt(uiModel: UIModel, pageName: string): string {
    return `
You are an expert Playwright developer. Generate a Page Object Model class for this UI page.

PAGE NAME: ${pageName}
PAGE URL: ${uiModel.url}

UI ELEMENTS:
${uiModel.elements.map((el, index) => 
  `${index + 1}. ${el.selector} - ${el.type} - "${el.text || el.ariaLabel}"`
).join('\n')}

REQUIREMENTS:
1. Use TypeScript with proper typing
2. Import Page and Locator from @playwright/test
3. Initialize all locators in constructor
4. Use semantic selector methods (getByRole, getByLabel, etc.)
5. Include navigation methods
6. Add action methods for common interactions
7. Include verification/getter methods
8. Follow naming conventions (camelCase)
9. Add JSDoc comments for complex methods
10. Group related functionality

PAGE OBJECT STRUCTURE:
- Class declaration with proper typing
- Readonly properties for page and locators
- Constructor with locator initialization
- Navigation methods
- Action methods (click, fill, select, etc.)
- Verification methods (getText, isVisible, etc.)
- Helper methods as needed

RETURN:
Complete TypeScript Page Object class.

EXAMPLE:
\`\`\`typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
\`\`\`
`;
  }
}
```

### Validation Prompts

```typescript
// prompts/validation.ts
export class ValidationPrompts {
  static buildCodeValidationPrompt(code: string, context: string): string {
    return `
You are a senior TypeScript/Playwright code reviewer. Analyze this generated test code for quality and correctness.

CONTEXT: ${context}

CODE TO REVIEW:
\`\`\`typescript
${code}
\`\`\`

VALIDATION CRITERIA:
1. TypeScript syntax correctness
2. Playwright API usage
3. Async/await patterns
4. Error handling
5. Best practices compliance
6. Code readability
7. Potential runtime issues

RETURN JSON:
{
  "isValid": true/false,
  "errors": ["list of errors"],
  "warnings": ["list of warnings"],
  "suggestions": ["list of improvements"],
  "score": 0-100
}

FOCUS ON:
- Syntax errors that would prevent compilation
- Incorrect Playwright API usage
- Missing await keywords
- Improper error handling
- Performance issues
- Maintainability concerns
`;
  }

  static buildGherkinValidationPrompt(gherkin: string): string {
    return `
You are a BDD expert. Validate this Gherkin feature for quality and best practices.

GHERKIN CONTENT:
${gherkin}

VALIDATION CRITERIA:
1. Proper Gherkin syntax
2. Clear business language
3. Scenario independence
4. Step reusability
5. Appropriate use of Given/When/Then
6. Tag usage
7. Background appropriateness

RETURN JSON:
{
  "isValid": true/false,
  "syntaxErrors": ["syntax issues"],
  "bestPracticeViolations": ["BDD violations"],
  "suggestions": ["improvements"],
  "score": 0-100
}
`;
  }
}
```

## AI Response Processing

### Response Parsers

```typescript
// parsers/ai-response-parser.ts
export class AIResponseParser {
  static parseCodeBlock(response: string, language: string = 'typescript'): string {
    const codeBlockRegex = new RegExp(`\`\`\`${language}\\s*([\\s\\S]*?)\`\`\``, 'i');
    const match = response.match(codeBlockRegex);
    
    if (match) {
      return match[1].trim();
    }
    
    // Fallback: try to extract any code block
    const anyCodeBlockRegex = /```[\s\S]*?([\s\S]*?)```/;
    const anyMatch = response.match(anyCodeBlockRegex);
    
    if (anyMatch) {
      return anyMatch[1].trim();
    }
    
    // Return original response if no code block found
    return response.trim();
  }

  static parseJSON<T>(response: string): T {
    // Try to extract JSON from response
    const jsonRegex = /\{[\s\S]*\}/;
    const match = response.match(jsonRegex);
    
    const jsonString = match ? match[0] : response;
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${jsonString}`);
    }
  }

  static cleanResponse(response: string): string {
    return response
      .replace(/^```[\w]*\n/, '') // Remove opening code block
      .replace(/\n```$/, '')      // Remove closing code block
      .replace(/^\s*\/\/.*$/gm, '') // Remove comment-only lines
      .trim();
  }

  static extractSelectors(code: string): string[] {
    const selectorPatterns = [
      /page\.getByRole\([^)]+\)/g,
      /page\.getByLabel\([^)]+\)/g,
      /page\.getByTestId\([^)]+\)/g,
      /page\.locator\([^)]+\)/g,
      /\.locator\([^)]+\)/g
    ];

    const selectors: string[] = [];
    
    selectorPatterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        selectors.push(...matches);
      }
    });

    return [...new Set(selectors)]; // Remove duplicates
  }
}
```

### Response Validation

```typescript
// validators/ai-response-validator.ts
export class AIResponseValidator {
  static validateSelectorMapping(mapping: any): SelectorMapping {
    const required = ['selector', 'action', 'confidence'];
    const missing = required.filter(field => !(field in mapping));
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (typeof mapping.confidence !== 'number' || mapping.confidence < 0 || mapping.confidence > 1) {
      throw new Error('Confidence must be a number between 0 and 1');
    }

    const validActions = ['click', 'fill', 'select', 'check', 'hover', 'press', 'clear'];
    if (!validActions.includes(mapping.action)) {
      throw new Error(`Invalid action: ${mapping.action}. Must be one of: ${validActions.join(', ')}`);
    }

    return {
      selector: mapping.selector,
      action: mapping.action,
      value: mapping.value || null,
      confidence: mapping.confidence,
      reasoning: mapping.reasoning || ''
    };
  }

  static validateGeneratedCode(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for basic TypeScript syntax
    if (!code.includes('async') && code.includes('await')) {
      errors.push('Using await without async function');
    }

    // Check for proper imports
    if (code.includes('@playwright/test') && !code.includes('import')) {
      warnings.push('Missing import statements');
    }

    // Check for proper error handling
    if (code.includes('click()') && !code.includes('expect')) {
      warnings.push('Consider adding assertions after actions');
    }

    // Check for hardcoded values
    const hardcodedRegex = /"[^"]*@[^"]*"/g; // Email patterns
    if (hardcodedRegex.test(code)) {
      warnings.push('Consider parameterizing hardcoded values');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5))
    };
  }

  static validatePageObject(code: string, expectedElements: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check class structure
    if (!code.includes('export class')) {
      errors.push('Missing class declaration');
    }

    if (!code.includes('constructor(page: Page)')) {
      errors.push('Missing proper constructor');
    }

    // Check for expected elements
    expectedElements.forEach(element => {
      if (!code.includes(element)) {
        warnings.push(`Missing element: ${element}`);
      }
    });

    // Check for proper typing
    if (!code.includes('readonly page: Page')) {
      errors.push('Missing page property with proper typing');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 15) - (warnings.length * 5))
    };
  }
}
```

## Error Handling and Retry Logic

### Retry Mechanisms

```typescript
// utils/retry-handler.ts
export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }

        console.warn(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        // Exponential backoff
        delayMs *= 2;
      }
    }

    throw lastError!;
  }

  static async withFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    try {
      return await primary();
    } catch (error) {
      console.warn('Primary operation failed, using fallback:', error.message);
      return await fallback();
    }
  }
}
```

### AI Service Error Handling

```typescript
// services/ai-service-manager.ts
export class AIServiceManager {
  private services: Map<string, AIService> = new Map();
  private currentService: string;

  constructor(config: AIConfig) {
    if (config.anthropic?.apiKey) {
      this.services.set('claude', new ClaudeService(config.anthropic.apiKey));
    }
    
    if (config.openai?.apiKey) {
      this.services.set('openai', new OpenAIService(config.openai.apiKey));
    }

    this.currentService = config.primary || 'claude';
  }

  async generateWithFallback(request: CompletionRequest): Promise<string> {
    const serviceNames = Array.from(this.services.keys());
    
    // Try primary service first
    if (this.services.has(this.currentService)) {
      try {
        return await RetryHandler.withRetry(
          () => this.services.get(this.currentService)!.generateCompletion(request),
          2
        );
      } catch (error) {
        console.warn(`Primary service ${this.currentService} failed:`, error.message);
      }
    }

    // Try fallback services
    for (const serviceName of serviceNames) {
      if (serviceName === this.currentService) continue;
      
      try {
        console.log(`Trying fallback service: ${serviceName}`);
        return await this.services.get(serviceName)!.generateCompletion(request);
      } catch (error) {
        console.warn(`Fallback service ${serviceName} failed:`, error.message);
      }
    }

    throw new Error('All AI services failed');
  }

  async generateStructuredWithFallback<T>(request: StructuredRequest<T>): Promise<T> {
    const serviceNames = Array.from(this.services.keys());
    
    for (const serviceName of serviceNames) {
      try {
        return await RetryHandler.withRetry(
          () => this.services.get(serviceName)!.generateStructuredOutput(request),
          2
        );
      } catch (error) {
        console.warn(`Service ${serviceName} failed for structured output:`, error.message);
      }
    }

    throw new Error('All AI services failed for structured output');
  }
}
```

## Performance Optimization

### Caching Strategies

```typescript
// cache/ai-cache.ts
export class AICache {
  private cache = new Map<string, CacheEntry>();
  private readonly ttl: number;

  constructor(ttlMinutes: number = 60) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  private generateKey(request: CompletionRequest): string {
    return Buffer.from(JSON.stringify({
      prompt: request.prompt,
      maxTokens: request.maxTokens,
      temperature: request.temperature
    })).toString('base64');
  }

  get(request: CompletionRequest): string | null {
    const key = this.generateKey(request);
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  set(request: CompletionRequest, response: string): void {
    const key = this.generateKey(request);
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

interface CacheEntry {
  response: string;
  timestamp: number;
}
```

### Batch Processing

```typescript
// processors/batch-processor.ts
export class BatchProcessor {
  constructor(
    private aiService: AIService,
    private batchSize: number = 5,
    private delayMs: number = 1000
  ) {}

  async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      
      const batchPromises = batch.map(item => 
        RetryHandler.withRetry(() => processor(item), 2)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Batch item ${i + index} failed:`, result.reason);
          throw new Error(`Batch processing failed for item ${i + index}`);
        }
      });

      // Rate limiting delay between batches
      if (i + this.batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, this.delayMs));
      }
    }

    return results;
  }

  async processStepsInBatches(
    steps: GherkinStep[],
    uiModel: UIModel
  ): Promise<SelectorMapping[]> {
    return this.processBatch(steps, async (step) => {
      const prompt = SelectorMappingPrompts.buildMappingPrompt(step.text, uiModel);
      const response = await this.aiService.generateCompletion({ prompt });
      return AIResponseParser.parseJSON<SelectorMapping>(response);
    });
  }
}
```

This comprehensive AI integration guide ensures robust, scalable, and maintainable AI-powered test generation with proper error handling, caching, and performance optimization.