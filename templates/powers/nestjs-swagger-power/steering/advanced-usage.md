# Advanced Usage - NestJS Swagger Power

This guide covers advanced features and customization options for the NestJS Swagger Power.

## Advanced Scanning Patterns

### Custom File Patterns

You can customize which files to scan using glob patterns:

```typescript
// Scan specific modules only
await extractControllers({
  projectPath: "./src",
  controllerPattern: "modules/**/*.controller.ts"
});

// Include subdirectories
await extractDTOs({
  projectPath: "./src",
  dtoPattern: "**/dto/**/*.ts"
});

// Multiple patterns (scan separately and combine)
const userControllers = await extractControllers({
  controllerPattern: "users/**/*.controller.ts"
});

const adminControllers = await extractControllers({
  controllerPattern: "admin/**/*.controller.ts"
});
```

### Complex Project Structures

For monorepo or complex project structures:

```typescript
// Scan multiple applications
const apps = ['app1', 'app2', 'shared'];
const allControllers = [];

for (const app of apps) {
  const controllers = await extractControllers({
    projectPath: `./apps/${app}/src`,
    controllerPattern: "**/*.controller.ts"
  });
  allControllers.push(...JSON.parse(controllers.content[0].text));
}
```

## Advanced DTO Parsing

### Complex Type Handling

The power handles various TypeScript patterns:

```typescript
// Nested objects
export class CreateOrderDto {
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  // Union types
  status: 'pending' | 'confirmed' | 'shipped';

  // Optional with default
  @IsOptional()
  priority?: 'low' | 'medium' | 'high' = 'medium';
}
```

### Custom Decorators

Handle custom validation decorators:

```typescript
// The scanner will recognize these patterns
export class CustomDto {
  @IsCustomEmail() // Custom decorator
  email: string;

  @Transform(({ value }) => value.toLowerCase())
  @IsString()
  username: string;
}
```

## Swagger Specification Customization

### Enhanced Project Information

```typescript
await generateSwaggerSpec({
  apiData: extractedData,
  projectInfo: {
    title: "E-commerce API",
    version: "2.1.0",
    description: "Comprehensive e-commerce platform API",
    contact: {
      name: "API Support",
      email: "api-support@example.com",
      url: "https://example.com/support"
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT"
    },
    servers: [
      {
        url: "https://api.example.com/v2",
        description: "Production server"
      },
      {
        url: "https://staging-api.example.com/v2",
        description: "Staging server"
      }
    ]
  }
});
```

### Custom Schema Generation

Extend the schema generation for complex types:

```typescript
// Custom type mapping
const customTypeMap = {
  'ObjectId': { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
  'UUID': { type: 'string', format: 'uuid' },
  'BigInt': { type: 'string', format: 'int64' }
};

// Apply custom mappings in your schema generation
```

## Integration Patterns

### CI/CD Integration

Create automated documentation updates:

```bash
#!/bin/bash
# docs-update.sh

echo "Scanning NestJS project for API changes..."

# Use the power to generate updated docs
node -e "
const scanner = require('./nestjs-swagger-power/servers/nestjs-scanner.js');
// Run scanning logic
"

# Commit changes if any
if [ -n "$(git status --porcelain docs/)" ]; then
  git add docs/
  git commit -m "docs: update API documentation [skip ci]"
  git push origin main
fi
```

### Multiple Output Formats

Generate documentation in multiple formats:

```typescript
const apiData = await extractFullProject();

// Generate JSON for API tools
await generateSwaggerSpec({
  apiData,
  format: 'json',
  outputPath: './docs/api.json'
});

// Generate YAML for documentation sites
await generateSwaggerSpec({
  apiData,
  format: 'yaml',
  outputPath: './docs/api.yaml'
});

// Generate with examples for development
await generateSwaggerSpec({
  apiData,
  format: 'json',
  includeExamples: true,
  outputPath: './docs/api-with-examples.json'
});
```

## Performance Optimization

### Large Codebases

For large NestJS applications:

```typescript
// Process in chunks
const chunkSize = 50;
const controllerFiles = await glob('**/*.controller.ts');
const chunks = [];

for (let i = 0; i < controllerFiles.length; i += chunkSize) {
  chunks.push(controllerFiles.slice(i, i + chunkSize));
}

const allControllers = [];
for (const chunk of chunks) {
  // Process each chunk separately
  const controllers = await processControllerChunk(chunk);
  allControllers.push(...controllers);
}
```

### Caching Results

Implement caching for repeated scans:

```typescript
// Cache extracted data
const cacheKey = `${projectPath}-${lastModified}`;
const cachedData = await getFromCache(cacheKey);

if (cachedData) {
  return cachedData;
}

const freshData = await extractControllers(args);
await saveToCache(cacheKey, freshData);
return freshData;
```

## Error Handling and Validation

### Robust Error Handling

```typescript
try {
  const result = await scanNestJSProject({
    projectPath: './src',
    outputPath: './docs/swagger.json'
  });
  
  console.log('✅ Documentation generated successfully');
} catch (error) {
  if (error.message.includes('No controllers found')) {
    console.log('⚠️  No NestJS controllers detected in the project');
    console.log('   Make sure your controllers use @Controller decorator');
  } else if (error.message.includes('Invalid TypeScript')) {
    console.log('❌ TypeScript syntax errors detected');
    console.log('   Please fix compilation errors before scanning');
  } else {
    console.log('❌ Unexpected error:', error.message);
  }
}
```

### Validation and Quality Checks

```typescript
// Validate generated Swagger spec
function validateSwaggerSpec(spec) {
  const issues = [];
  
  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    issues.push('No API paths found');
  }
  
  if (!spec.components?.schemas || Object.keys(spec.components.schemas).length === 0) {
    issues.push('No schemas defined');
  }
  
  // Check for missing descriptions
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (!operation.summary && !operation.description) {
        issues.push(`Missing description for ${method.toUpperCase()} ${path}`);
      }
    }
  }
  
  return issues;
}
```

## Custom Extensions

### Adding Custom Metadata

Extend the scanner to capture custom metadata:

```typescript
// Custom decorator recognition
function parseCustomDecorators(content) {
  const customDecorators = [];
  
  // Look for @ApiVersion, @Deprecated, etc.
  const decoratorRegex = /@(ApiVersion|Deprecated|RateLimit)\(['"`]?([^'"`\)]*?)['"`]?\)/g;
  let match;
  
  while ((match = decoratorRegex.exec(content)) !== null) {
    customDecorators.push({
      name: match[1],
      value: match[2]
    });
  }
  
  return customDecorators;
}
```

This advanced usage guide provides comprehensive patterns for using the NestJS Swagger Power in complex scenarios and production environments.