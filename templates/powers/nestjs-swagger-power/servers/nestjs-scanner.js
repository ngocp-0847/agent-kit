#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

class NestJSScanner {
  constructor() {
    this.server = new Server(
      {
        name: 'nestjs-scanner',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'scan_nestjs_project',
            description: 'Scan NestJS project to extract API definitions and generate Swagger documentation',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Path to the NestJS project root directory',
                  default: '.'
                },
                outputPath: {
                  type: 'string',
                  description: 'Path where to save the generated Swagger file',
                  default: './swagger.json'
                },
                format: {
                  type: 'string',
                  enum: ['json', 'yaml'],
                  description: 'Output format for the Swagger file',
                  default: 'json'
                },
                includeExamples: {
                  type: 'boolean',
                  description: 'Include example values in the generated Swagger',
                  default: true
                }
              },
              required: ['projectPath']
            }
          },
          {
            name: 'extract_controllers',
            description: 'Extract controller information from NestJS project',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Path to the NestJS project root directory',
                  default: '.'
                },
                controllerPattern: {
                  type: 'string',
                  description: 'Glob pattern to match controller files',
                  default: '**/*.controller.ts'
                }
              },
              required: ['projectPath']
            }
          },
          {
            name: 'extract_dtos',
            description: 'Extract DTO (Data Transfer Object) definitions from NestJS project',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Path to the NestJS project root directory',
                  default: '.'
                },
                dtoPattern: {
                  type: 'string',
                  description: 'Glob pattern to match DTO files',
                  default: '**/*.dto.ts'
                }
              },
              required: ['projectPath']
            }
          },
          {
            name: 'generate_swagger_spec',
            description: 'Generate OpenAPI/Swagger specification from extracted API data',
            inputSchema: {
              type: 'object',
              properties: {
                apiData: {
                  type: 'object',
                  description: 'Extracted API data from controllers and DTOs'
                },
                projectInfo: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                      description: 'API title',
                      default: 'NestJS API'
                    },
                    version: {
                      type: 'string',
                      description: 'API version',
                      default: '1.0.0'
                    },
                    description: {
                      type: 'string',
                      description: 'API description'
                    }
                  }
                },
                format: {
                  type: 'string',
                  enum: ['json', 'yaml'],
                  description: 'Output format',
                  default: 'json'
                }
              },
              required: ['apiData']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'scan_nestjs_project':
            return await this.scanNestJSProject(args);
          case 'extract_controllers':
            return await this.extractControllers(args);
          case 'extract_dtos':
            return await this.extractDTOs(args);
          case 'generate_swagger_spec':
            return await this.generateSwaggerSpec(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async scanNestJSProject(args) {
    const { projectPath = '.', outputPath = './swagger.json', format = 'json', includeExamples = true } = args;

    try {
      // Extract controllers and DTOs
      const controllers = await this.extractControllers({ projectPath });
      const dtos = await this.extractDTOs({ projectPath });

      // Read package.json for project info
      let projectInfo = {
        title: 'NestJS API',
        version: '1.0.0',
        description: 'API documentation generated from NestJS source code'
      };

      try {
        const packageJsonPath = path.join(projectPath, 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        projectInfo = {
          title: packageJson.name || 'NestJS API',
          version: packageJson.version || '1.0.0',
          description: packageJson.description || 'API documentation generated from NestJS source code'
        };
      } catch (error) {
        // Use default values if package.json is not found
      }

      // Combine extracted data
      const apiData = {
        controllers: controllers.content[0].text,
        dtos: dtos.content[0].text
      };

      // Generate Swagger specification
      const swaggerSpec = await this.generateSwaggerSpec({
        apiData,
        projectInfo,
        format,
        includeExamples
      });

      // Save to file
      await fs.writeFile(outputPath, swaggerSpec.content[0].text);

      return {
        content: [
          {
            type: 'text',
            text: `Successfully scanned NestJS project and generated Swagger documentation at: ${outputPath}\n\nSummary:\n- Controllers analyzed: ${JSON.parse(apiData.controllers).length}\n- DTOs processed: ${JSON.parse(apiData.dtos).length}\n- Output format: ${format.toUpperCase()}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to scan NestJS project: ${error.message}`);
    }
  }

  async extractControllers(args) {
    const { projectPath = '.', controllerPattern = '**/*.controller.ts' } = args;

    try {
      const controllerFiles = await glob(controllerPattern, { cwd: projectPath });
      const controllers = [];

      for (const file of controllerFiles) {
        const filePath = path.join(projectPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        const controllerInfo = this.parseController(content, file);
        if (controllerInfo) {
          controllers.push(controllerInfo);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(controllers, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to extract controllers: ${error.message}`);
    }
  }

  async extractDTOs(args) {
    const { projectPath = '.', dtoPattern = '**/*.dto.ts' } = args;

    try {
      const dtoFiles = await glob(dtoPattern, { cwd: projectPath });
      const dtos = [];

      for (const file of dtoFiles) {
        const filePath = path.join(projectPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        const dtoInfo = this.parseDTO(content, file);
        if (dtoInfo) {
          dtos.push(dtoInfo);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(dtos, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to extract DTOs: ${error.message}`);
    }
  }

  parseController(content, filename) {
    const controller = {
      filename,
      className: '',
      basePath: '',
      routes: []
    };

    // Extract controller class name
    const classMatch = content.match(/export\s+class\s+(\w+Controller)/);
    if (classMatch) {
      controller.className = classMatch[1];
    }

    // Extract controller decorator and base path
    const controllerMatch = content.match(/@Controller\(['"`]([^'"`]*?)['"`]\)/);
    if (controllerMatch) {
      controller.basePath = controllerMatch[1];
    }

    // Extract routes
    const routeRegex = /@(Get|Post|Put|Delete|Patch)\(['"`]?([^'"`\)]*?)['"`]?\)\s*(?:@\w+(?:\([^)]*\))?\s*)*\s*(?:async\s+)?(\w+)\s*\([^)]*\)/g;
    let match;
    
    while ((match = routeRegex.exec(content)) !== null) {
      const [, method, path, functionName] = match;
      
      // Extract function parameters and decorators
      const functionStart = content.indexOf(match[0]);
      const functionEnd = this.findFunctionEnd(content, functionStart);
      const functionContent = content.substring(functionStart, functionEnd);
      
      const route = {
        method: method.toLowerCase(),
        path: path || '',
        functionName,
        parameters: this.extractParameters(functionContent),
        decorators: this.extractDecorators(functionContent)
      };
      
      controller.routes.push(route);
    }

    return controller.routes.length > 0 ? controller : null;
  }

  parseDTO(content, filename) {
    const dto = {
      filename,
      className: '',
      properties: []
    };

    // Extract DTO class name
    const classMatch = content.match(/export\s+class\s+(\w+(?:Dto|DTO))/);
    if (classMatch) {
      dto.className = classMatch[1];
    }

    // Extract properties with decorators
    const propertyRegex = /@(\w+)(?:\([^)]*\))?\s*(\w+)(?:\?)?:\s*([^;]+);/g;
    let match;
    
    while ((match = propertyRegex.exec(content)) !== null) {
      const [, decorator, name, type] = match;
      
      const property = {
        name,
        type: type.trim(),
        decorators: [decorator],
        optional: match[0].includes('?')
      };
      
      dto.properties.push(property);
    }

    return dto.properties.length > 0 ? dto : null;
  }

  extractParameters(functionContent) {
    const parameters = [];
    const paramRegex = /@(Body|Query|Param|Headers?)\(['"`]?([^'"`\)]*?)['"`]?\)\s+(\w+):\s*([^,\)]+)/g;
    let match;
    
    while ((match = paramRegex.exec(functionContent)) !== null) {
      const [, decorator, name, paramName, type] = match;
      parameters.push({
        decorator,
        name: name || paramName,
        paramName,
        type: type.trim()
      });
    }
    
    return parameters;
  }

  extractDecorators(functionContent) {
    const decorators = [];
    const decoratorRegex = /@(\w+)(?:\([^)]*\))?/g;
    let match;
    
    while ((match = decoratorRegex.exec(functionContent)) !== null) {
      decorators.push(match[1]);
    }
    
    return decorators;
  }

  findFunctionEnd(content, start) {
    let braceCount = 0;
    let inFunction = false;
    
    for (let i = start; i < content.length; i++) {
      const char = content[i];
      
      if (char === '{') {
        braceCount++;
        inFunction = true;
      } else if (char === '}') {
        braceCount--;
        if (inFunction && braceCount === 0) {
          return i + 1;
        }
      }
    }
    
    return content.length;
  }

  async generateSwaggerSpec(args) {
    const { apiData, projectInfo = {}, format = 'json', includeExamples = true } = args;

    try {
      const controllers = typeof apiData.controllers === 'string' 
        ? JSON.parse(apiData.controllers) 
        : apiData.controllers || [];
      
      const dtos = typeof apiData.dtos === 'string' 
        ? JSON.parse(apiData.dtos) 
        : apiData.dtos || [];

      const swaggerSpec = {
        openapi: '3.0.0',
        info: {
          title: projectInfo.title || 'NestJS API',
          version: projectInfo.version || '1.0.0',
          description: projectInfo.description || 'API documentation generated from NestJS source code'
        },
        paths: {},
        components: {
          schemas: {}
        }
      };

      // Generate schemas from DTOs
      for (const dto of dtos) {
        const schema = this.dtoToSchema(dto, includeExamples);
        swaggerSpec.components.schemas[dto.className] = schema;
      }

      // Generate paths from controllers
      for (const controller of controllers) {
        for (const route of controller.routes) {
          const fullPath = `/${controller.basePath}${route.path}`.replace(/\/+/g, '/');
          const pathKey = fullPath.replace(/:(\w+)/g, '{$1}');
          
          if (!swaggerSpec.paths[pathKey]) {
            swaggerSpec.paths[pathKey] = {};
          }
          
          swaggerSpec.paths[pathKey][route.method] = this.routeToOperation(route, controller, dtos, includeExamples);
        }
      }

      let output;
      if (format === 'yaml') {
        // Simple YAML conversion (for basic cases)
        output = this.jsonToYaml(swaggerSpec);
      } else {
        output = JSON.stringify(swaggerSpec, null, 2);
      }

      return {
        content: [
          {
            type: 'text',
            text: output
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to generate Swagger spec: ${error.message}`);
    }
  }

  dtoToSchema(dto, includeExamples) {
    const schema = {
      type: 'object',
      properties: {},
      required: []
    };

    for (const prop of dto.properties) {
      const propSchema = this.typeToSchema(prop.type);
      
      if (includeExamples) {
        propSchema.example = this.generateExample(prop.type);
      }
      
      schema.properties[prop.name] = propSchema;
      
      if (!prop.optional) {
        schema.required.push(prop.name);
      }
    }

    return schema;
  }

  typeToSchema(type) {
    const typeMap = {
      'string': { type: 'string' },
      'number': { type: 'number' },
      'boolean': { type: 'boolean' },
      'Date': { type: 'string', format: 'date-time' },
      'object': { type: 'object' }
    };

    // Handle array types
    if (type.includes('[]')) {
      const itemType = type.replace('[]', '');
      return {
        type: 'array',
        items: this.typeToSchema(itemType)
      };
    }

    return typeMap[type] || { type: 'string' };
  }

  generateExample(type) {
    const examples = {
      'string': 'example string',
      'number': 123,
      'boolean': true,
      'Date': '2023-12-01T00:00:00Z',
      'object': {}
    };

    if (type.includes('[]')) {
      const itemType = type.replace('[]', '');
      return [this.generateExample(itemType)];
    }

    return examples[type] || 'example';
  }

  routeToOperation(route, controller, dtos, includeExamples) {
    const operation = {
      tags: [controller.className.replace('Controller', '')],
      summary: `${route.method.toUpperCase()} ${route.path}`,
      operationId: `${controller.className}_${route.functionName}`,
      parameters: [],
      responses: {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        }
      }
    };

    // Add parameters
    for (const param of route.parameters) {
      const parameter = {
        name: param.name,
        in: this.getParameterLocation(param.decorator),
        required: param.decorator !== 'Query',
        schema: this.typeToSchema(param.type)
      };

      if (includeExamples) {
        parameter.example = this.generateExample(param.type);
      }

      operation.parameters.push(parameter);
    }

    // Add request body for POST/PUT/PATCH
    if (['post', 'put', 'patch'].includes(route.method)) {
      const bodyParam = route.parameters.find(p => p.decorator === 'Body');
      if (bodyParam) {
        operation.requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: this.typeToSchema(bodyParam.type)
            }
          }
        };
      }
    }

    return operation;
  }

  getParameterLocation(decorator) {
    const locationMap = {
      'Param': 'path',
      'Query': 'query',
      'Header': 'header',
      'Headers': 'header'
    };
    
    return locationMap[decorator] || 'query';
  }

  jsonToYaml(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        yaml += `${spaces}${key}: null\n`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.jsonToYaml(value, indent + 1);
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        for (const item of value) {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n`;
            yaml += this.jsonToYaml(item, indent + 2);
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        }
      } else if (typeof value === 'string') {
        yaml += `${spaces}${key}: "${value}"\n`;
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }

    return yaml;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('NestJS Scanner MCP server running on stdio');
  }
}

const server = new NestJSScanner();
server.run().catch(console.error);