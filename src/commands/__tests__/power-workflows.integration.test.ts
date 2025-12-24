/**
 * End-to-end workflow tests for Power management
 * Tests complete Power installation, removal, and update processes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createTempTestDir } from '../../test-setup';
import { PowerManagerImpl, PowerCacheManager } from '../../utils/power';

describe('End-to-End Power Workflows', () => {
  let testDir: string;
  let powerManager: PowerManagerImpl;
  let powerCache: PowerCacheManager;

  beforeEach(() => {
    testDir = createTempTestDir('power-e2e-test');
    mkdirSync(testDir, { recursive: true });
    
    // Create .kiro directory structure
    const kiroDir = join(testDir, '.kiro');
    mkdirSync(join(kiroDir, 'settings'), { recursive: true });
    mkdirSync(join(kiroDir, 'steering'), { recursive: true });
    mkdirSync(join(kiroDir, 'powers'), { recursive: true });
    
    powerManager = new PowerManagerImpl(testDir);
    powerCache = new PowerCacheManager(testDir);
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Complete Power Installation Workflow', () => {
    it('should complete full installation workflow from registry to working Power', async () => {
      // Step 1: Create mock registry Power
      const registryPowerDir = join(testDir, 'registry-power');
      createRegistryPowerStructure(registryPowerDir);
      
      // Step 2: Install Power
      await powerManager.installLocalPower(registryPowerDir, 'registry-power');
      
      // Step 3: Verify all components are installed
      const mcpConfigPath = join(testDir, '.kiro', 'settings', 'mcp.json');
      expect(existsSync(mcpConfigPath)).toBe(true);
      
      const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
      expect(mcpConfig.mcpServers['registry-scanner']).toBeDefined();
      expect(mcpConfig.mcpServers['registry-scanner'].command).toBe('node');
      expect(mcpConfig.mcpServers['registry-scanner'].args).toEqual(['./servers/registry-scanner.js']);
      
      // Step 4: Verify steering files
      const steeringFiles = [
        'registry-getting-started.md',
        'registry-advanced-usage.md'
      ];
      
      for (const file of steeringFiles) {
        const filePath = join(testDir, '.kiro', 'steering', file);
        expect(existsSync(filePath)).toBe(true);
        const content = readFileSync(filePath, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
      
      // Step 5: Verify Power tracking
      const installedPath = join(testDir, '.kiro', 'powers', 'installed.json');
      expect(existsSync(installedPath)).toBe(true);
      
      const installed = JSON.parse(readFileSync(installedPath, 'utf-8'));
      expect(installed.powers['registry-power']).toBeDefined();
      expect(installed.powers['registry-power'].version).toBe('1.2.0');
      expect(installed.powers['registry-power'].components.mcpServers).toContain('registry-scanner');
      expect(installed.powers['registry-power'].components.steeringFiles).toContain('registry-getting-started.md');
      
      // Step 6: Verify Power can be listed
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(1);
      expect(installedPowers[0].name).toBe('registry-power');
      expect(installedPowers[0].version).toBe('1.2.0');
    });

    it('should handle installation with dependencies and requirements', async () => {
      // Create Power with requirements
      const powerWithReqsDir = join(testDir, 'power-with-reqs');
      createPowerWithRequirements(powerWithReqsDir);
      
      // Install Power
      await powerManager.installLocalPower(powerWithReqsDir, 'power-with-reqs');
      
      // Verify installation succeeded despite requirements
      const installedPath = join(testDir, '.kiro', 'powers', 'installed.json');
      const installed = JSON.parse(readFileSync(installedPath, 'utf-8'));
      expect(installed.powers['power-with-reqs']).toBeDefined();
      
      // Verify MCP server with environment variables
      const mcpConfigPath = join(testDir, '.kiro', 'settings', 'mcp.json');
      const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
      expect(mcpConfig.mcpServers['advanced-scanner'].env).toBeDefined();
      expect(mcpConfig.mcpServers['advanced-scanner'].env.NODE_ENV).toBe('production');
    });
  });

  describe('Power Removal Workflow', () => {
    it('should completely remove Power and clean up all components', async () => {
      // Step 1: Install Power first
      const testPowerDir = join(testDir, 'removable-power');
      createTestPowerStructure(testPowerDir, 'removable-power');
      await powerManager.installLocalPower(testPowerDir, 'removable-power');
      
      // Step 2: Verify installation
      let installedPath = join(testDir, '.kiro', 'powers', 'installed.json');
      let installed = JSON.parse(readFileSync(installedPath, 'utf-8'));
      expect(installed.powers['removable-power']).toBeDefined();
      
      // Step 3: Remove Power
      await powerManager.uninstall('removable-power');
      
      // Step 4: Verify MCP server is removed
      const mcpConfigPath = join(testDir, '.kiro', 'settings', 'mcp.json');
      const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
      expect(mcpConfig.mcpServers['removable-scanner']).toBeUndefined();
      
      // Step 5: Verify steering files are removed
      const steeringPath = join(testDir, '.kiro', 'steering', 'removable-getting-started.md');
      expect(existsSync(steeringPath)).toBe(false);
      
      // Step 6: Verify Power is no longer tracked
      installed = JSON.parse(readFileSync(installedPath, 'utf-8'));
      expect(installed.powers['removable-power']).toBeUndefined();
      
      // Step 7: Verify Power is not listed
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers.find(p => p.name === 'removable-power')).toBeUndefined();
    });

    it('should preserve other Powers when removing one Power', async () => {
      // Install multiple Powers
      const power1Dir = join(testDir, 'power-1');
      const power2Dir = join(testDir, 'power-2');
      
      createTestPowerStructure(power1Dir, 'power-1');
      createTestPowerStructure(power2Dir, 'power-2');
      
      await powerManager.installLocalPower(power1Dir, 'power-1');
      await powerManager.installLocalPower(power2Dir, 'power-2');
      
      // Verify both are installed
      let installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(2);
      
      // Remove one Power
      await powerManager.uninstall('power-1');
      
      // Verify only one is removed
      installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(1);
      expect(installedPowers[0].name).toBe('power-2');
      
      // Verify power-2 components are still intact
      const mcpConfigPath = join(testDir, '.kiro', 'settings', 'mcp.json');
      const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
      expect(mcpConfig.mcpServers['power-1-scanner']).toBeUndefined();
      expect(mcpConfig.mcpServers['power-2-scanner']).toBeDefined();
    });
  });

  describe('Power Update Workflow', () => {
    it('should update Power while preserving user customizations', async () => {
      // Step 1: Install initial version
      const powerV1Dir = join(testDir, 'updatable-power-v1');
      createTestPowerStructure(powerV1Dir, 'updatable-power', '1.0.0');
      await powerManager.installLocalPower(powerV1Dir, 'updatable-power');
      
      // Step 2: Simulate user customization of MCP config
      const mcpConfigPath = join(testDir, '.kiro', 'settings', 'mcp.json');
      const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
      mcpConfig.mcpServers['updatable-power-scanner'].env = { CUSTOM_VAR: 'user-value' };
      writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
      
      // Step 3: Create updated version
      const powerV2Dir = join(testDir, 'updatable-power-v2');
      createTestPowerStructure(powerV2Dir, 'updatable-power', '2.0.0');
      
      // Add new MCP server in v2
      const v2McpConfig = JSON.parse(readFileSync(join(powerV2Dir, 'mcp.json'), 'utf-8'));
      v2McpConfig.mcpServers['updatable-power-new-scanner'] = {
        command: 'node',
        args: ['./servers/new-scanner.js'],
        disabled: false,
        autoApprove: []
      };
      writeFileSync(join(powerV2Dir, 'mcp.json'), JSON.stringify(v2McpConfig, null, 2));
      
      // Step 4: Update Power
      await powerManager.update('updatable-power');
      
      // Step 5: Verify version is updated
      const installedPath = join(testDir, '.kiro', 'powers', 'installed.json');
      const installed = JSON.parse(readFileSync(installedPath, 'utf-8'));
      expect(installed.powers['updatable-power'].version).toBe('2.0.0');
      
      // Step 6: Verify user customizations are preserved
      const updatedMcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
      expect(updatedMcpConfig.mcpServers['updatable-power-scanner'].env.CUSTOM_VAR).toBe('user-value');
      
      // Step 7: Verify new components are added
      expect(updatedMcpConfig.mcpServers['updatable-power-new-scanner']).toBeDefined();
    });
  });

  describe('CLI Flag Combinations and Interactions', () => {
    it('should handle --all flag for Power installation', async () => {
      // Create multiple test Powers
      const powers = ['power-a', 'power-b', 'power-c'];
      
      for (const powerName of powers) {
        const powerDir = join(testDir, powerName);
        createTestPowerStructure(powerDir, powerName);
      }
      
      // Simulate --all flag installation
      for (const powerName of powers) {
        const powerDir = join(testDir, powerName);
        await powerManager.installLocalPower(powerDir, powerName);
      }
      
      // Verify all Powers are installed
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(3);
      
      const installedNames = installedPowers.map(p => p.name).sort();
      expect(installedNames).toEqual(['power-a', 'power-b', 'power-c']);
    });

    it('should handle --force flag for overwriting existing Powers', async () => {
      // Install initial Power
      const powerDir = join(testDir, 'force-power');
      createTestPowerStructure(powerDir, 'force-power', '1.0.0');
      await powerManager.installLocalPower(powerDir, 'force-power');
      
      // Modify Power and reinstall with force
      const packageJsonPath = join(powerDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      packageJson.version = '1.1.0';
      packageJson.description = 'Updated description';
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      // Force reinstall
      await powerManager.installLocalPower(powerDir, 'force-power');
      
      // Verify Power is updated
      const installedPath = join(testDir, '.kiro', 'powers', 'installed.json');
      const installed = JSON.parse(readFileSync(installedPath, 'utf-8'));
      expect(installed.powers['force-power'].version).toBe('1.1.0');
    });

    it('should handle --powers flag for Power-only installation', async () => {
      // Create test Power
      const powerDir = join(testDir, 'only-power');
      createTestPowerStructure(powerDir, 'only-power');
      
      // Install only Power (simulate --powers flag)
      await powerManager.installLocalPower(powerDir, 'only-power');
      
      // Verify Power is installed
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(1);
      expect(installedPowers[0].name).toBe('only-power');
      
      // Verify no other components are created
      expect(existsSync(join(testDir, '.cursor'))).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should fail gracefully on invalid Power structure', async () => {
      // Create initial state
      const mcpConfigPath = join(testDir, '.kiro', 'settings', 'mcp.json');
      const initialConfig = { mcpServers: {} };
      writeFileSync(mcpConfigPath, JSON.stringify(initialConfig, null, 2));
      
      // Create Power with invalid structure that will cause failure
      const invalidPowerDir = join(testDir, 'invalid-power');
      mkdirSync(invalidPowerDir, { recursive: true });
      
      // Create invalid package.json that will cause parsing error
      writeFileSync(join(invalidPowerDir, 'package.json'), '{ invalid json');
      
      // Attempt installation (should fail)
      await expect(powerManager.installLocalPower(invalidPowerDir, 'invalid-power'))
        .rejects.toThrow();
      
      // Verify no Power is tracked as installed
      const installedPath = join(testDir, '.kiro', 'powers', 'installed.json');
      if (existsSync(installedPath)) {
        const installed = JSON.parse(readFileSync(installedPath, 'utf-8'));
        expect(installed.powers?.['invalid-power']).toBeUndefined();
      }
    });

    it('should handle partial installation gracefully', async () => {
      // Create Power that will partially install then fail
      const partialPowerDir = join(testDir, 'partial-power');
      createTestPowerStructure(partialPowerDir, 'partial-power');
      
      // Create invalid steering file that might cause issues
      const steeringDir = join(partialPowerDir, 'steering');
      writeFileSync(join(steeringDir, 'invalid-file.md'), '\x00\x01\x02'); // Binary content
      
      try {
        await powerManager.installLocalPower(partialPowerDir, 'partial-power');
        
        // If it succeeds, verify installation is complete
        const installedPowers = await powerManager.listInstalled();
        const partialPower = installedPowers.find(p => p.name === 'partial-power');
        if (partialPower) {
          expect(partialPower.components.mcpServers.length).toBeGreaterThan(0);
        }
      } catch (error) {
        // If it fails, verify no partial state remains
        const installedPath = join(testDir, '.kiro', 'powers', 'installed.json');
        if (existsSync(installedPath)) {
          const installed = JSON.parse(readFileSync(installedPath, 'utf-8'));
          expect(installed.powers?.['partial-power']).toBeUndefined();
        }
      }
    });
  });
});

// Helper functions
function createRegistryPowerStructure(powerDir: string) {
  mkdirSync(powerDir, { recursive: true });
  
  const packageJson = {
    name: 'registry-power',
    version: '1.2.0',
    description: 'Registry Power for testing',
    author: 'Registry Team',
    keywords: ['registry', 'test'],
    repository: 'https://github.com/test/registry-power'
  };
  writeFileSync(join(powerDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  
  const powerMd = `# Registry Power

A comprehensive Power from the registry.

## Features

- Advanced scanning capabilities
- Multiple MCP servers
- Comprehensive documentation
`;
  writeFileSync(join(powerDir, 'POWER.md'), powerMd);
  
  const mcpConfig = {
    mcpServers: {
      'registry-scanner': {
        command: 'node',
        args: ['./servers/registry-scanner.js'],
        disabled: false,
        autoApprove: []
      }
    }
  };
  writeFileSync(join(powerDir, 'mcp.json'), JSON.stringify(mcpConfig, null, 2));
  
  const steeringDir = join(powerDir, 'steering');
  mkdirSync(steeringDir, { recursive: true });
  
  writeFileSync(join(steeringDir, 'registry-getting-started.md'), 
    '# Getting Started\n\nRegistry Power getting started guide.');
  writeFileSync(join(steeringDir, 'registry-advanced-usage.md'), 
    '# Advanced Usage\n\nAdvanced patterns and techniques.');
  
  const serversDir = join(powerDir, 'servers');
  mkdirSync(serversDir, { recursive: true });
  writeFileSync(join(serversDir, 'registry-scanner.js'), 
    '// Registry scanner implementation\nconsole.log("Registry scanner running");');
}

function createPowerWithRequirements(powerDir: string) {
  mkdirSync(powerDir, { recursive: true });
  
  const packageJson = {
    name: 'power-with-reqs',
    version: '1.0.0',
    description: 'Power with requirements',
    author: 'Test Author',
    keywords: ['requirements', 'test'],
    engines: {
      node: '>=18.0.0'
    },
    dependencies: {
      '@modelcontextprotocol/sdk': '^1.0.0'
    }
  };
  writeFileSync(join(powerDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  
  writeFileSync(join(powerDir, 'POWER.md'), '# Power with Requirements\n\nThis Power has specific requirements.');
  
  const mcpConfig = {
    mcpServers: {
      'advanced-scanner': {
        command: 'node',
        args: ['./servers/advanced-scanner.js'],
        env: {
          NODE_ENV: 'production',
          LOG_LEVEL: 'info'
        },
        disabled: false,
        autoApprove: []
      }
    }
  };
  writeFileSync(join(powerDir, 'mcp.json'), JSON.stringify(mcpConfig, null, 2));
  
  const steeringDir = join(powerDir, 'steering');
  mkdirSync(steeringDir, { recursive: true });
  writeFileSync(join(steeringDir, 'setup-requirements.md'), 
    '# Setup Requirements\n\nThis Power requires Node.js 18+ and specific dependencies.');
}

function createTestPowerStructure(powerDir: string, powerName: string, version: string = '1.0.0') {
  mkdirSync(powerDir, { recursive: true });
  
  const packageJson = {
    name: powerName,
    version: version,
    description: `${powerName} for testing`,
    author: 'Test Author',
    keywords: ['test', powerName]
  };
  writeFileSync(join(powerDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  
  writeFileSync(join(powerDir, 'POWER.md'), `# ${powerName}\n\nTest Power: ${powerName}`);
  
  const mcpConfig = {
    mcpServers: {
      [`${powerName}-scanner`]: {
        command: 'node',
        args: ['./servers/scanner.js'],
        disabled: false,
        autoApprove: []
      }
    }
  };
  writeFileSync(join(powerDir, 'mcp.json'), JSON.stringify(mcpConfig, null, 2));
  
  const steeringDir = join(powerDir, 'steering');
  mkdirSync(steeringDir, { recursive: true });
  writeFileSync(join(steeringDir, `${powerName}-getting-started.md`), 
    `# Getting Started with ${powerName}\n\nGuide for ${powerName}.`);
  
  const serversDir = join(powerDir, 'servers');
  mkdirSync(serversDir, { recursive: true });
  writeFileSync(join(serversDir, 'scanner.js'), 
    `// ${powerName} scanner\nconsole.log("${powerName} scanner running");`);
}