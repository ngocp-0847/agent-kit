# Getting Started with NestJS Swagger Power

This guide will help you use the NestJS Swagger Power to scan your NestJS applications and generate comprehensive Swagger documentation.

## Prerequisites

- NestJS project with TypeScript
- Controllers using NestJS decorators (@Controller, @Get, @Post, etc.)
- DTOs with class-validator decorators (optional but recommended)

## Quick Start

### 1. Scan Entire Project

Use the main scanning tool to analyze your entire NestJS project:

```typescript
// This will scan the current directory and generate swagger.json
await scanNestJSProject({
  projectPath: ".",
  outputPath: "./api-docs/swagger.json",
  format: "json",
  includeExamples: true
});
```

### 2. Extract Controllers Only

If you want to analyze just the controllers:

```typescript
await extractControllers({
  projectPath: "./src",
  controllerPattern: "**/*.controller.ts"
});
```

### 3. Extract DTOs Only

To analyze Data Transfer Objects:

```typescript
await extractDTOs({
  projectPath: "./src",
  dtoPattern: "**/*.dto.ts"
});
```

### 4. Generate Custom Swagger Spec

Create a custom Swagger specification from extracted data:

```typescript
await generateSwaggerSpec({
  apiData: {
    controllers: extractedControllers,
    dtos: extractedDTOs
  },
  projectInfo: {
    title: "My NestJS API",
    version: "2.0.0",
    description: "Custom API documentation"
  },
  format: "yaml"
});
```

## Supported NestJS Patterns

### Controllers

The power recognizes these NestJS controller patterns:

```typescript
@Controller('users')
export class UsersController {
  @Get()
  findAll() { }

  @Get(':id')
  findOne(@Param('id') id: string) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) { }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) { }

  @Delete(':id')
  remove(@Param('id') id: string) { }
}
```

### DTOs

Recognizes DTO patterns with validation decorators:

```typescript
export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
```

## Output Examples

### JSON Format

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "NestJS API",
    "version": "1.0.0",
    "description": "API documentation"
  },
  "paths": {
    "/users": {
      "get": {
        "tags": ["Users"],
        "summary": "GET /users",
        "operationId": "UsersController_findAll",
        "responses": {
          "200": {
            "description": "Successful response"
          }
        }
      }
    }
  }
}
```

### YAML Format

```yaml
openapi: "3.0.0"
info:
  title: "NestJS API"
  version: "1.0.0"
  description: "API documentation"
paths:
  /users:
    get:
      tags:
        - "Users"
      summary: "GET /users"
      operationId: "UsersController_findAll"
```

## Best Practices

1. **Organize Your Code**: Keep controllers and DTOs in separate directories
2. **Use Descriptive Names**: Controller and DTO names should be clear and consistent
3. **Add Swagger Decorators**: Use @ApiTags, @ApiOperation for better documentation
4. **Validate DTOs**: Use class-validator decorators for automatic schema generation
5. **Regular Updates**: Re-run the scanner when you add new endpoints

## Troubleshooting

### Common Issues

1. **No Controllers Found**: Check your controller pattern and file naming
2. **Missing DTOs**: Ensure DTO files follow the `*.dto.ts` naming convention
3. **Invalid TypeScript**: The scanner requires valid TypeScript syntax
4. **Missing Decorators**: Controllers must use NestJS decorators to be detected

### Debug Tips

- Use verbose logging to see which files are being processed
- Check the extracted data before generating Swagger specs
- Validate your TypeScript syntax before scanning
- Ensure all imports are properly resolved