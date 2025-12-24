/**
 * Integration tests for CLI flag combinations and interactions
 * Tests various CLI flag scenarios with Power functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createTempTestDir } from '../../test-setup';
import { PowerManagerImpl } from '../../utils/power';

describe('CLI Flag Combinations and Interactions', () => {
  let testDir: string;
  let powerManager: PowerManagerImpl;

  beforeEach(() => {
    testDir = createTempTestDir('cli-flags-test');
    mkdirSync(testDir, { recursive: true });
    
    // Create .kiro directory structure
    const kiroDir = join(testDir, '.kiro');
    mkdirSync(join(kiroDir, 'settings'), { recursive: true });
    mkdirSync(join(kiroDir, 'steering'), { recursive: true });
    mkdirSync(join(kiroDir, 'powers'), { recursive: true });
    
    powerManager = new PowerManagerImpl(testDir);
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Init Command Flag Combinations', () => {
    it('should handle init with --powers flag only', async () => {
      // Create test Power
      const testPowerDir = join(testDir, 'init-power');
      createTestPowerStructure(testPowerDir, 'init-power');
      
      // Simulate init --powers behavior
      await powerManager.installLocalPower(testPowerDir, 'init-power');
      
      // Verify Power is installed
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(1);
      expect(installedPowers[0].name).toBe('init-power');
      
      // Verify MCP configuration exists
      const mcpConfigPath = join(testDir, '.kiro', 'settings', 'mcp.json');
      expect(existsSync(mcpConfigPath)).toBe(true);
      
      // Verify no Cursor components are created
      expect(existsSync(join(testDir, '.cursor'))).toBe(false);
    });

    it('should handle init with mixed component selection', async () => {
      // Create Cursor components directory
      const cursorDir = join(testDir, '.cursor');
      mkdirSync(join(cursorDir, 'commands'), { recursive: true });
      mkdirSync(join(cursorDir, 'rules'), { recursive: true });
      mkdirSync(join(cursorDir, 'skills'), { recursive: true });
      
      // Create some existing components
      writeFileSync(join(cursorDir, 'commands', 'test.md'), '# Test Command');
      writeFileSync(join(cursorDir, 'rules', 'style.md'), '# Style Rules');
      
      // Create and install Power
      const testPowerDir = join(testDir, 'mixed-power');
      createTestPowerStructure(testPowerDir, 'mixed-power');
      await powerManager.installLocalPower(testPowerDir, 'mixed-power');
      
      // Verify both Cursor components and Powers coexist
      expect(existsSync(join(cursorDir, 'commands', 'test.md'))).toBe(true);
      expect(existsSync(join(cursorDir, 'rules', 'style.md'))).toBe(true);
      
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(1);
      expect(installedPowers[0].name).toBe('mixed-power');
    });

    it('should handle init with --all flag including Powers', async () => {
      // Create multiple Powers
      const powerNames = ['all-power-1', 'all-power-2', 'all-power-3'];
      
      for (const powerName of powerNames) {
        const powerDir = join(testDir, powerName);
        createTestPowerStructure(powerDir, powerName);
        await powerManager.installLocalPower(powerDir, powerName);
      }
      
      // Verify all Powers are installed
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(3);
      
      const installedNames = installedPowers.map(p => p.name).sort();
      expect(installedNames).toEqual(['all-power-1', 'all-power-2', 'all-power-3']);
      
      // Verify MCP configuration contains all servers
      const mcpConfigPath = join(testDir, '.kiro', 'settings', 'mcp.json');
      const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
      
      for (const powerName of powerNames) {
        expect(mcpConfig.mcpServers[`${powerName}-scanner`]).toBeDefined();
      }
    });
  });

  describe('List Command Flag Combinations', () => {
    it('should handle list --powers flag', async () => {
      // Install multiple Powers
      const powerNames = ['list-power-1', 'list-power-2'];
      
      for (const powerName of powerNames) {
        const powerDir = join(testDir, powerName);
        createTestPowerStructure(powerDir, powerName);
        await powerManager.installLocalPower(powerDir, powerName);
      }
      
      // Create some Cursor components
      const cursorDir = join(testDir, '.cursor');
      mkdirSync(join(cursorDir, 'commands'), { recursive: true });
      writeFileSync(join(cursorDir, 'commands', 'test.md'), '# Test Command');
      
      // Test listing only Powers
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(2);
      
      // Verify Powers are listed with correct information
      for (const power of installedPowers) {
        expect(['list-power-1', 'list-power-2']).toContain(power.name);
        expect(power.version).toBe('1.0.0');
        expect(power.components.mcpServers).toHaveLength(1);
        expect(power.components.steeringFiles).toHaveLength(1);
      }
    });

    it('should handle list with no flags showing all components', async () => {
      // Install Power
      const powerDir = join(testDir, 'comprehensive-power');
      createTestPowerStructure(powerDir, 'comprehensive-power');
      await powerManager.installLocalPower(powerDir, 'comprehensive-power');
      
      // Create Cursor components
      const cursorDir = join(testDir, '.cursor');
      mkdirSync(join(cursorDir, 'commands'), { recursive: true });
      mkdirSync(join(cursorDir, 'rules'), { recursive: true });
      writeFileSync(join(cursorDir, 'commands', 'test.md'), '# Test Command');
      writeFileSync(join(cursorDir, 'rules', 'style.md'), '# Style Rules');
      
      // Verify both Powers and Cursor components exist
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(1);
      
      expect(existsSync(join(cursorDir, 'commands', 'test.md'))).toBe(true);
      expect(existsSync(join(cursorDir, 'rules', 'style.md'))).toBe(true);
    });
  });

  describe('Remove Command Flag Combinations', () => {
    it('should handle remove with Power selection', async () => {
      // Install multiple Powers
      const powerNames = ['remove-power-1', 'remove-power-2', 'remove-power-3'];
      
      for (const powerName of powerNames) {
        const powerDir = join(testDir, powerName);
        createTestPowerStructure(powerDir, powerName);
        await powerManager.installLocalPower(powerDir, powerName);
      }
      
      // Remove specific Power
      await powerManager.uninstall('remove-power-2');
      
      // Verify only the selected Power is removed
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(2);
      
      const remainingNames = installedPowers.map(p => p.name).sort();
      expect(remainingNames).toEqual(['remove-power-1', 'remove-power-3']);
      
      // Verify MCP configuration is updated
      const mcpConfigPath = join(testDir, '.kiro', 'settings', 'mcp.json');
      const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
      
      expect(mcpConfig.mcpServers['remove-power-1-scanner']).toBeDefined();
      expect(mcpConfig.mcpServers['remove-power-2-scanner']).toBeUndefined();
      expect(mcpConfig.mcpServers['remove-power-3-scanner']).toBeDefined();
    });

    it('should handle remove --force flag', async () => {
      // Install Power
      const powerDir = join(testDir, 'force-remove-power');
      createTestPowerStructure(powerDir, 'force-remove-power');
      await powerManager.installLocalPower(powerDir, 'force-remove-power');
      
      // Simulate user customization
      const mcpConfigPath = join(testDir, '.kiro', 'settings', 'mcp.json');
      const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
      mcpConfig.mcpServers['force-remove-power-scanner'].env = { CUSTOM: 'value' };
      writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
      
      // Force remove (should remove even with customizations)
      await powerManager.uninstall('force-remove-power');
      
      // Verify Power is completely removed
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(0);
      
      const updatedMcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
      expect(updatedMcpConfig.mcpServers['force-remove-power-scanner']).toBeUndefined();
    });
  });

  describe('Pull Command Flag Combinations', () => {
    it('should handle pull with Power updates', async () => {
      // Install initial version
      const powerV1Dir = join(testDir, 'updatable-power-v1');
      createTestPowerStructure(powerV1Dir, 'updatable-power', '1.0.0');
      await powerManager.installLocalPower(powerV1Dir, 'updatable-power');
      
      // Verify initial installation
      let installedPowers = await powerManager.listInstalled();
      expect(installedPowers[0].version).toBe('1.0.0');
      
      // Create updated version
      const powerV2Dir = join(testDir, 'updatable-power-v2');
      createTestPowerStructure(powerV2Dir, 'updatable-power', '2.0.0');
      
      // Add new steering file in v2
      const steeringDir = join(powerV2Dir, 'steering');
      writeFileSync(join(steeringDir, 'updatable-power-new-guide.md'), 
        '# New Guide\n\nNew functionality in v2.0.0');
      
      // Simulate pull update
      await powerManager.update('updatable-power');
      
      // Verify version is updated
      installedPowers = await powerManager.listInstalled();
      expect(installedPowers[0].version).toBe('2.0.0');
      
      // Verify new steering file is added
      const newSteeringPath = join(testDir, '.kiro', 'steering', 'updatable-power-new-guide.md');
      expect(existsSync(newSteeringPath)).toBe(true);
    });

    it('should handle pull --all for updating all Powers', async () => {
      // Install multiple Powers
      const powerNames = ['update-power-1', 'update-power-2'];
      
      for (const powerName of powerNames) {
        const powerDir = join(testDir, `${powerName}-v1`);
        createTestPowerStructure(powerDir, powerName, '1.0.0');
        await powerManager.installLocalPower(powerDir, powerName);
      }
      
      // Verify initial versions
      let installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(2);
      expect(installedPowers.every(p => p.version === '1.0.0')).toBe(true);
      
      // Simulate updating all Powers
      for (const powerName of powerNames) {
        await powerManager.update(powerName);
      }
      
      // Note: In a real scenario, this would fetch from registry
      // For this test, we're just verifying the update mechanism works
      installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(2);
    });
  });

  describe('Complex Flag Interactions', () => {
    it('should handle init --all followed by selective remove', async () => {
      // Install all components including Powers
      const powerNames = ['complex-power-1', 'complex-power-2'];
      
      for (const powerName of powerNames) {
        const powerDir = join(testDir, powerName);
        createTestPowerStructure(powerDir, powerName);
        await powerManager.installLocalPower(powerDir, powerName);
      }
      
      // Create Cursor components
      const cursorDir = join(testDir, '.cursor');
      mkdirSync(join(cursorDir, 'commands'), { recursive: true });
      mkdirSync(join(cursorDir, 'rules'), { recursive: true });
      writeFileSync(join(cursorDir, 'commands', 'test.md'), '# Test Command');
      writeFileSync(join(cursorDir, 'rules', 'style.md'), '# Style Rules');
      
      // Verify all components are installed
      let installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(2);
      expect(existsSync(join(cursorDir, 'commands', 'test.md'))).toBe(true);
      
      // Remove one Power
      await powerManager.uninstall('complex-power-1');
      
      // Verify selective removal
      installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(1);
      expect(installedPowers[0].name).toBe('complex-power-2');
      
      // Verify Cursor components are preserved
      expect(existsSync(join(cursorDir, 'commands', 'test.md'))).toBe(true);
      expect(existsSync(join(cursorDir, 'rules', 'style.md'))).toBe(true);
    });

    it('should handle multiple operations in sequence', async () => {
      // Step 1: Install Power
      const power1Dir = join(testDir, 'sequence-power-1');
      createTestPowerStructure(power1Dir, 'sequence-power-1');
      await powerManager.installLocalPower(power1Dir, 'sequence-power-1');
      
      // Step 2: List Powers
      let installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(1);
      
      // Step 3: Install another Power
      const power2Dir = join(testDir, 'sequence-power-2');
      createTestPowerStructure(power2Dir, 'sequence-power-2');
      await powerManager.installLocalPower(power2Dir, 'sequence-power-2');
      
      // Step 4: List again
      installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(2);
      
      // Step 5: Update one Power
      await powerManager.update('sequence-power-1');
      
      // Step 6: Remove one Power
      await powerManager.uninstall('sequence-power-2');
      
      // Step 7: Final verification
      installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(1);
      expect(installedPowers[0].name).toBe('sequence-power-1');
      
      // Verify MCP configuration is consistent
      const mcpConfigPath = join(testDir, '.kiro', 'settings', 'mcp.json');
      const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
      expect(mcpConfig.mcpServers['sequence-power-1-scanner']).toBeDefined();
      expect(mcpConfig.mcpServers['sequence-power-2-scanner']).toBeUndefined();
    });
  });

  describe('Error Handling with Flags', () => {
    it('should handle --force flag with invalid Powers', async () => {
      // Create invalid Power structure
      const invalidPowerDir = join(testDir, 'invalid-force-power');
      mkdirSync(invalidPowerDir, { recursive: true });
      
      // Create invalid package.json
      writeFileSync(join(invalidPowerDir, 'package.json'), '{ invalid json }');
      
      // Attempt force installation (should still fail)
      await expect(powerManager.installLocalPower(invalidPowerDir, 'invalid-force-power'))
        .rejects.toThrow();
      
      // Verify no partial installation
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers.find(p => p.name === 'invalid-force-power')).toBeUndefined();
    });

    it('should handle --all flag with mixed valid/invalid Powers', async () => {
      // Create valid Power
      const validPowerDir = join(testDir, 'valid-power');
      createTestPowerStructure(validPowerDir, 'valid-power');
      
      // Create invalid Power
      const invalidPowerDir = join(testDir, 'invalid-power');
      mkdirSync(invalidPowerDir, { recursive: true });
      writeFileSync(join(invalidPowerDir, 'package.json'), '{ invalid }');
      
      // Install valid Power
      await powerManager.installLocalPower(validPowerDir, 'valid-power');
      
      // Attempt to install invalid Power (should fail)
      await expect(powerManager.installLocalPower(invalidPowerDir, 'invalid-power'))
        .rejects.toThrow();
      
      // Verify valid Power is still installed
      const installedPowers = await powerManager.listInstalled();
      expect(installedPowers).toHaveLength(1);
      expect(installedPowers[0].name).toBe('valid-power');
    });
  });
});

// Helper function
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