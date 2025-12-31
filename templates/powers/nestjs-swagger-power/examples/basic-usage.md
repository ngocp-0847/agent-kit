# Basic Usage Examples

This file contains practical examples of using the NestJS Swagger Power.

## Example 1: Simple Project Scan

```typescript
// Scan a basic NestJS project
const result = await scanNestJSProject({
  projectPath: "./my-nestjs-app",
  outputPath: "./docs/api.json",
  format: "json",
  includeExamples: true
});

console.log(result.content[0].text);
// Output: "Successfully scanned NestJS project and generated Swagger documentation at: ./docs/api.json"
```

## Example 2: Monorepo Structure

```typescript
// For a monorepo with multiple NestJS apps
const apps = ['user-service', 'order-service', 'payment-service'];

for (const app of apps) {
  await scanNestJSProject({
    projectPath: `./apps/${app}`,
    outputPath: `./docs/${app}-api.json`,
    format: "json"
  });
}
```

## Example 3: Custom Patterns

```typescript
// Scan specific controller patterns
const controllers = await extractControllers({
  projectPath: "./src",
  controllerPattern: "modules/**/controllers/*.controller.ts"
});

// Scan DTOs in specific directories
const dtos = await extractDTOs({
  projectPath: "./src", 
  dtoPattern: "modules/**/dto/*.dto.ts"
});
```

## Example 4: YAML Output

```typescript
// Generate YAML format for documentation sites
await scanNestJSProject({
  projectPath: ".",
  outputPath: "./openapi.yaml",
  format: "yaml",
  includeExamples: false
});
```

## Example 5: Custom Project Info

```typescript
// Extract data first
const controllers = await extractControllers({ projectPath: "./src" });
const dtos = await extractDTOs({ projectPath: "./src" });

// Generate custom Swagger spec
await generateSwaggerSpec({
  apiData: {
    controllers: controllers.content[0].text,
    dtos: dtos.content[0].text
  },
  projectInfo: {
    title: "E-commerce API",
    version: "2.0.0",
    description: "Comprehensive e-commerce platform API with user management, orders, and payments"
  },
  format: "json"
});
```

## Sample NestJS Code Structure

Here's an example of the NestJS code patterns that the power can analyze:

### Controller Example
```typescript
// users.controller.ts
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CreateUserDto, FindUsersDto, UserResponseDto } from './dto';

@Controller('users')
export class UsersController {
  @Get()
  async findAll(@Query() query: FindUsersDto): Promise<UserResponseDto[]> {
    // Implementation
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    // Implementation  
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Implementation
  }
}
```

### DTO Example
```typescript
// create-user.dto.ts
import { IsString, IsEmail, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsString()
  bio?: string;
}

// find-users.dto.ts
export class FindUsersDto {
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  offset?: number = 0;

  @IsOptional()
  @IsString()
  search?: string;
}

// user-response.dto.ts
export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  age?: number;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Expected Output

The power will generate a Swagger specification like this:

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "NestJS API",
    "version": "1.0.0",
    "description": "API documentation generated from NestJS source code"
  },
  "paths": {
    "/users": {
      "get": {
        "tags": ["Users"],
        "summary": "GET ",
        "operationId": "UsersController_findAll",
        "parameters": [
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": { "type": "number" },
            "example": 123
          },
          {
            "name": "offset", 
            "in": "query",
            "required": false,
            "schema": { "type": "number" },
            "example": 123
          },
          {
            "name": "search",
            "in": "query", 
            "required": false,
            "schema": { "type": "string" },
            "example": "example string"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": { "type": "object" }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Users"],
        "summary": "POST ",
        "operationId": "UsersController_create",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "type": "string" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": { "type": "object" }
              }
            }
          }
        }
      }
    },
    "/users/{id}": {
      "get": {
        "tags": ["Users"],
        "summary": "GET :id",
        "operationId": "UsersController_findOne",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "string" },
            "example": "example string"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": { "type": "object" }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "CreateUserDto": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "example": "example string"
          },
          "email": {
            "type": "string", 
            "example": "example string"
          },
          "age": {
            "type": "number",
            "example": 123
          },
          "bio": {
            "type": "string",
            "example": "example string"
          }
        },
        "required": ["name", "email"]
      }
    }
  }
}
```