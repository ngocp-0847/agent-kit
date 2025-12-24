/**
 * Unit tests for Power utility functions
 * Tests template directory resolution and registry building
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, existsSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createTempTestDir } from '../../test-setup';
import {
  getLocalPowersTemplateDir,
  getPowerRegistry,
  listAvailablePowers,
  scaffoldPowerToProject,
  checkPowerScaffoldConflicts,
  getProjectPowerTargetDir,
} from '../power';

describe('Power Template Directory Resolution', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTempTestDir('power-template-test');
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('getLocalPowersTemplateDir', () => {
    it('should return project-local templates/powers when it exists', () => {
      const localTemplates = join(testDir, 'templates', 'powers');
      mkdirSync(localTemplates, { recursive: true });

      const result = getLocalPowersTemplateDir(testDir);
      expect(result).toBe(localTemplates);
    });

    it('should return node_modules path when project-local does not exist', () => {
      const nodeModulesPath = join(testDir, 'node_modules', 'agent-kit-cli', 'templates', 'powers');
      mkdirSync(nodeModulesPath, { recursive: true });

      const result = getLocalPowersTemplateDir(testDir);
      expect(result).toBe(nodeModulesPath);
    });

    it('should fallback to CLI package templates when no local templates exist', () => {
      // testDir has no templates/powers and no node_modules
      const result = getLocalPowersTemplateDir(testDir);
      
      // Should return CLI package's templates (which exists in the repo)
      expect(existsSync(result)).toBe(true);
      expect(result).toContain('templates/powers');
    });

    it('should prioritize project-local over node_modules', () => {
      const localTemplates = join(testDir, 'templates', 'powers');
      const nodeModulesPath = join(testDir, 'node_modules', 'agent-kit-cli', 'templates', 'powers');
      mkdirSync(localTemplates, { recursive: true });
      mkdirSync(nodeModulesPath, { recursive: true });

      const result = getLocalPowersTemplateDir(testDir);
      expect(result).toBe(localTemplates);
    });
  });

  describe('listAvailablePowers', () => {
    it('should return bundled powers when no local templates exist', () => {
      // testDir is empty - should fallback to CLI package templates
      const powers = listAvailablePowers(testDir);
      
      // Should find the bundled powers (example-power, nestjs-swagger-power)
      expect(powers.length).toBeGreaterThan(0);
      
      const powerNames = powers.map(p => p.name);
      expect(powerNames).toContain('example-power');
      expect(powerNames).toContain('nestjs-swagger-power');
    });

    it('should return local powers when templates/powers exists', () => {
      const localTemplates = join(testDir, 'templates', 'powers', 'my-custom-power');
      mkdirSync(localTemplates, { recursive: true });
      
      // Create minimal package.json for the power
      writeFileSync(
        join(localTemplates, 'package.json'),
        JSON.stringify({
          name: 'my-custom-power',
          version: '1.0.0',
          description: 'A custom power'
        })
      );
      
      // Create POWER.md
      writeFileSync(join(localTemplates, 'POWER.md'), '# My Custom Power');

      const powers = listAvailablePowers(testDir);
      const powerNames = powers.map(p => p.name);
      
      expect(powerNames).toContain('my-custom-power');
    });
  });

  describe('getPowerRegistry', () => {
    it('should return registry with bundled powers for empty project', async () => {
      const registry = await getPowerRegistry(testDir);
      
      expect(registry.version).toBe('1.0.0');
      expect(registry.powers.length).toBeGreaterThan(0);
      
      const powerNames = registry.powers.map(p => p.name);
      expect(powerNames).toContain('example-power');
      expect(powerNames).toContain('nestjs-swagger-power');
    });

    it('should include power metadata in registry', async () => {
      const registry = await getPowerRegistry(testDir);
      
      const examplePower = registry.powers.find(p => p.name === 'example-power');
      expect(examplePower).toBeDefined();
      expect(examplePower?.version).toBeDefined();
      expect(examplePower?.description).toBeDefined();
    });
  });
});

describe('Power Scaffolding to Project Root', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTempTestDir('power-scaffold-test');
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('getProjectPowerTargetDir', () => {
    it('should return <cwd>/<power-name>', () => {
      const result = getProjectPowerTargetDir('my-power', testDir);
      expect(result).toBe(join(testDir, 'my-power'));
    });
  });

  describe('checkPowerScaffoldConflicts', () => {
    it('should return valid when target does not exist', () => {
      const result = checkPowerScaffoldConflicts('new-power', testDir);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error when target has power files', () => {
      const powerDir = join(testDir, 'existing-power');
      mkdirSync(powerDir, { recursive: true });
      writeFileSync(join(powerDir, 'POWER.md'), '# Existing');
      writeFileSync(join(powerDir, 'package.json'), '{}');

      const result = checkPowerScaffoldConflicts('existing-power', testDir);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('already exists');
    });

    it('should return warning when target exists but has no power files', () => {
      const powerDir = join(testDir, 'some-dir');
      mkdirSync(powerDir, { recursive: true });
      writeFileSync(join(powerDir, 'random.txt'), 'content');

      const result = checkPowerScaffoldConflicts('some-dir', testDir);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('scaffoldPowerToProject', () => {
    it('should copy power template to project root', () => {
      const result = scaffoldPowerToProject('example-power', testDir);

      expect(result.errors).toHaveLength(0);
      expect(result.added.length).toBeGreaterThan(0);

      const targetDir = join(testDir, 'example-power');
      expect(existsSync(targetDir)).toBe(true);
      expect(existsSync(join(targetDir, 'POWER.md'))).toBe(true);
      expect(existsSync(join(targetDir, 'package.json'))).toBe(true);
    });

    it('should fail when power template does not exist', () => {
      const result = scaffoldPowerToProject('non-existent-power', testDir);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('not found');
    });

    it('should fail when target has conflicts and force is false', () => {
      // Create existing power
      const powerDir = join(testDir, 'example-power');
      mkdirSync(powerDir, { recursive: true });
      writeFileSync(join(powerDir, 'POWER.md'), '# Existing');
      writeFileSync(join(powerDir, 'package.json'), '{}');

      const result = scaffoldPowerToProject('example-power', testDir, false);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('already exists');
    });

    it('should overwrite when force is true', () => {
      // Create existing power
      const powerDir = join(testDir, 'example-power');
      mkdirSync(powerDir, { recursive: true });
      writeFileSync(join(powerDir, 'POWER.md'), '# Old Content');

      const result = scaffoldPowerToProject('example-power', testDir, true);

      expect(result.errors).toHaveLength(0);
      
      // Verify content was overwritten
      const content = readFileSync(join(powerDir, 'POWER.md'), 'utf-8');
      expect(content).not.toBe('# Old Content');
      expect(content).toContain('Example Power');
    });

    it('should preserve Kiro power layout structure', () => {
      const result = scaffoldPowerToProject('example-power', testDir);

      expect(result.errors).toHaveLength(0);

      const targetDir = join(testDir, 'example-power');
      
      // Check required files
      expect(existsSync(join(targetDir, 'POWER.md'))).toBe(true);
      expect(existsSync(join(targetDir, 'package.json'))).toBe(true);
      
      // Check optional directories that should exist in example-power
      expect(existsSync(join(targetDir, 'mcp.json'))).toBe(true);
      expect(existsSync(join(targetDir, 'steering'))).toBe(true);
      expect(existsSync(join(targetDir, 'examples'))).toBe(true);
      expect(existsSync(join(targetDir, 'servers'))).toBe(true);
    });
  });
});
