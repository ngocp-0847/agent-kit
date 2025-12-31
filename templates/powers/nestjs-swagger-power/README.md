# NestJS Swagger Power for Kiro

A powerful Kiro extension that automatically scans NestJS source code to extract API definitions and generate comprehensive Swagger/OpenAPI documentation.

## Features

🔍 **Smart Code Analysis**
- Scans NestJS controllers and decorators
- Extracts DTOs and validation rules
- Parses TypeScript types and interfaces
- Recognizes custom decorators

📝 **Comprehensive Documentation**
- Generates OpenAPI 3.0 compliant specs
- Creates detailed API endpoint documentation
- Includes request/response schemas
- Supports both JSON and YAML output

🚀 **Easy Integration**
- Works with any NestJS project structure
- Supports monorepos and complex architectures
- Integrates with CI/CD pipelines
- Provides multiple output formats

## Installation

This power is designed to work with Kiro. To install:

1. Copy the `nestjs-swagger-power` directory to your Kiro powers location
2. Install dependencies:
   ```bash
   cd nestjs-swagger-power
   npm install
   ```

## Quick Start

### Basic Usage

```typescript
// Scan entire NestJS project
await scanNestJSProject({
  projectPath: ".",
  outputPath: "./swagger.json",
  format: "json",
  includeExamples: true
});
```

### Extract Specific Components

```typescript
// Extract only controllers
const controllers = await extractControllers({
  projectPath: "./src",
  controllerPattern: "**/*.controller.ts"
});

// Extract only DTOs
const dtos = await extractDTOs({
  projectPath: "./src", 
  dtoPattern: "**/*.dto.ts"
});
```

## Supported NestJS Patterns

### Controllers
```typescript
@Controller('users')
export class UsersController {
  @Get()
  findAll(@Query() query: FindUsersDto) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {}

  @Get(':id')
  findOne(@Param('id') id: string) {}
}
```

### DTOs
```typescript
export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  age?: number;
}
```

## Available Tools

### `scan_nestjs_project`
Complete project analysis and Swagger generation
- **projectPath**: Path to NestJS project root
- **outputPath**: Where to save generated Swagger file
- **format**: Output format (json/yaml)
- **includeExamples**: Include example values

### `extract_controllers`
Extract controller information only
- **projectPath**: Path to project root
- **controllerPattern**: Glob pattern for controller files

### `extract_dtos`
Extract DTO definitions only
- **projectPath**: Path to project root  
- **dtoPattern**: Glob pattern for DTO files

### `generate_swagger_spec`
Generate Swagger spec from extracted data
- **apiData**: Previously extracted API data
- **projectInfo**: Project metadata (title, version, etc.)
- **format**: Output format (json/yaml)

## Output Example

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "NestJS API",
    "version": "1.0.0",
    "description": "Generated API documentation"
  },
  "paths": {
    "/users": {
      "get": {
        "tags": ["Users"],
        "summary": "GET /users",
        "parameters": [
          {
            "name": "limit",
            "in": "query",
            "schema": { "type": "number" }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/UserDto" }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "UserDto": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "email": { "type": "string", "format": "email" }
        },
        "required": ["id", "name", "email"]
      }
    }
  }
}
```

## Advanced Usage

See the steering files for detailed guides:
- `getting-started.md` - Basic usage and setup
- `advanced-usage.md` - Complex scenarios and customization

## Requirements

- Node.js >= 18.0.0
- NestJS project with TypeScript
- Kiro IDE

## License

MIT