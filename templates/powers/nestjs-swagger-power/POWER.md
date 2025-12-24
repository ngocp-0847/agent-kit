# NestJS Swagger Power

A Kiro power that scans NestJS source code to extract API definitions and generate comprehensive Swagger documentation.

## Overview

This power analyzes NestJS applications by:
- Scanning controllers, services, and DTOs
- Extracting API routes, decorators, and metadata
- Parsing TypeScript types and interfaces
- Generating OpenAPI/Swagger specifications
- Creating comprehensive API documentation

## Features

- **Controller Analysis**: Extracts routes, HTTP methods, and decorators
- **DTO Parsing**: Analyzes data transfer objects and validation rules
- **Type Extraction**: Converts TypeScript types to OpenAPI schemas
- **Decorator Processing**: Handles NestJS decorators (@Get, @Post, @Body, etc.)
- **Swagger Generation**: Creates complete OpenAPI 3.0 specifications
- **Documentation Export**: Outputs formatted Swagger JSON/YAML files

## Usage

1. **Scan Project**: Analyze entire NestJS codebase
2. **Extract APIs**: Identify controllers and routes
3. **Generate Swagger**: Create OpenAPI specification
4. **Export Documentation**: Save as JSON or YAML

## Supported NestJS Features

- Controllers and route handlers
- DTOs with class-validator decorators
- Guards, interceptors, and pipes
- Custom decorators
- Module structure
- Exception filters
- Swagger decorators (@ApiTags, @ApiOperation, etc.)

## Output Format

Generates OpenAPI 3.0 compliant Swagger documentation with:
- API endpoints and methods
- Request/response schemas
- Parameter definitions
- Authentication requirements
- Error responses
- Example values