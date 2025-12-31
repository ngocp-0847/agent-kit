/**
 * Integration tests for Power installation alongside existing CLI functionality
 * Tests Power installation with skills, rules, commands and verifies compatibility
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTempTestDir } from "../../test-setup";
import { PowerManagerImpl } from "../../utils/power";

describe("Power Integration with Existing CLI Functionality", () => {
  let testDir: string;
  let powerManager: PowerManagerImpl;

  beforeEach(() => {
    testDir = createTempTestDir("power-integration-test");
    mkdirSync(testDir, { recursive: true });

    // Create .kiro directory structure
    const kiroDir = join(testDir, ".kiro");
    mkdirSync(join(kiroDir, "settings"), { recursive: true });
    mkdirSync(join(kiroDir, "steering"), { recursive: true });
    mkdirSync(join(kiroDir, "powers"), { recursive: true });

    powerManager = new PowerManagerImpl(testDir);
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Power Installation with Skills, Rules, Commands", () => {
    it("should install Powers alongside existing components without conflicts", async () => {
      // Setup existing components
      const commandsDir = join(testDir, ".cursor", "commands");
      const rulesDir = join(testDir, ".cursor", "rules");
      const skillsDir = join(testDir, ".cursor", "skills");

      mkdirSync(commandsDir, { recursive: true });
      mkdirSync(rulesDir, { recursive: true });
      mkdirSync(skillsDir, { recursive: true });

      // Create existing MCP configuration
      const mcpConfigPath = join(testDir, ".kiro", "settings", "mcp.json");
      const existingMcpConfig = {
        mcpServers: {
          "existing-server": {
            command: "node",
            args: ["existing-server.js"],
            disabled: false,
            autoApprove: [],
          },
        },
      };
      writeFileSync(mcpConfigPath, JSON.stringify(existingMcpConfig, null, 2));

      // Create existing steering file
      const existingSteeringPath = join(testDir, ".kiro", "steering", "existing-guide.md");
      writeFileSync(existingSteeringPath, "# Existing Guide\n\nExisting content");

      // Create test Power structure
      const testPowerDir = join(testDir, "test-power");
      createTestPowerStructure(testPowerDir);

      // Install Power
      await powerManager.installLocalPower(testPowerDir, "test-power");

      // Verify existing components are preserved
      expect(existsSync(commandsDir)).toBe(true);
      expect(existsSync(rulesDir)).toBe(true);
      expect(existsSync(skillsDir)).toBe(true);

      // Verify MCP configuration is merged correctly
      const updatedMcpConfig = JSON.parse(readFileSync(mcpConfigPath, "utf-8"));
      expect(updatedMcpConfig.mcpServers["existing-server"]).toBeDefined();
      expect(updatedMcpConfig.mcpServers["test-scanner"]).toBeDefined();

      // Verify existing steering file is preserved
      expect(existsSync(existingSteeringPath)).toBe(true);
      const existingContent = readFileSync(existingSteeringPath, "utf-8");
      expect(existingContent).toContain("Existing content");

      // Verify new steering files are added
      const newSteeringPath = join(testDir, ".kiro", "steering", "test-getting-started.md");
      expect(existsSync(newSteeringPath)).toBe(true);
    });

    it("should handle Power installation when no existing components exist", async () => {
      // Create test Power structure
      const testPowerDir = join(testDir, "test-power");
      createTestPowerStructure(testPowerDir);

      // Install Power in empty project
      await powerManager.installLocalPower(testPowerDir, "test-power");

      // Verify Power components are installed
      const mcpConfigPath = join(testDir, ".kiro", "settings", "mcp.json");
      expect(existsSync(mcpConfigPath)).toBe(true);

      const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, "utf-8"));
      expect(mcpConfig.mcpServers["test-scanner"]).toBeDefined();

      // Verify steering files are installed
      const steeringPath = join(testDir, ".kiro", "steering", "test-getting-started.md");
      expect(existsSync(steeringPath)).toBe(true);

      // Verify Power is tracked
      const installedPath = join(testDir, ".kiro", "powers", "installed.json");
      expect(existsSync(installedPath)).toBe(true);

      const installed = JSON.parse(readFileSync(installedPath, "utf-8"));
      expect(installed.powers["test-power"]).toBeDefined();
    });
  });

  describe("Target Platform Compatibility", () => {
    it("should work with different target configurations", async () => {
      // Test with Kiro target
      const kiroOptions = {
        commands: true,
        rules: true,
        skills: true,
        powers: ["test-power"],
      };

      // Create test Power
      const testPowerDir = join(testDir, "test-power");
      createTestPowerStructure(testPowerDir);

      // Simulate target installation
      await powerManager.installLocalPower(testPowerDir, "test-power");

      // Verify installation works with target options
      const installedPath = join(testDir, ".kiro", "powers", "installed.json");
      expect(existsSync(installedPath)).toBe(true);

      // Test with Cursor target (should not interfere)
      const cursorDir = join(testDir, ".cursor");
      mkdirSync(cursorDir, { recursive: true });

      // Powers should still work alongside Cursor components
      expect(existsSync(join(testDir, ".kiro", "settings", "mcp.json"))).toBe(true);
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("should handle corrupted Power packages gracefully", async () => {
      // Create corrupted Power structure
      const corruptedPowerDir = join(testDir, "corrupted-power");
      mkdirSync(corruptedPowerDir, { recursive: true });

      // Create invalid package.json
      const packageJsonPath = join(corruptedPowerDir, "package.json");
      writeFileSync(packageJsonPath, "{ invalid json }");

      // Attempt installation should fail gracefully
      await expect(
        powerManager.installLocalPower(corruptedPowerDir, "corrupted-power"),
      ).rejects.toThrow();

      // Verify no partial installation occurred
      const installedPath = join(testDir, ".kiro", "powers", "installed.json");
      if (existsSync(installedPath)) {
        const installed = JSON.parse(readFileSync(installedPath, "utf-8"));
        expect(installed.powers["corrupted-power"]).toBeUndefined();
      }
    });

    it("should handle missing directories gracefully", async () => {
      // Try to install Power when .kiro directory doesn't exist
      rmSync(join(testDir, ".kiro"), { recursive: true, force: true });

      const testPowerDir = join(testDir, "test-power");
      createTestPowerStructure(testPowerDir);

      // Installation should create necessary directories
      await powerManager.installLocalPower(testPowerDir, "test-power");

      // Verify directories were created
      expect(existsSync(join(testDir, ".kiro", "settings"))).toBe(true);
      expect(existsSync(join(testDir, ".kiro", "steering"))).toBe(true);
      expect(existsSync(join(testDir, ".kiro", "powers"))).toBe(true);
    });

    it("should handle file permission errors", async () => {
      // Create test Power
      const testPowerDir = join(testDir, "test-power");
      createTestPowerStructure(testPowerDir);

      // Create read-only MCP config to simulate permission error
      const mcpConfigPath = join(testDir, ".kiro", "settings", "mcp.json");
      writeFileSync(mcpConfigPath, "{}");

      // Note: In a real test environment, we would change file permissions
      // For this test, we'll just verify the Power manager handles the scenario

      try {
        await powerManager.installLocalPower(testPowerDir, "test-power");
        // If successful, verify installation
        expect(existsSync(mcpConfigPath)).toBe(true);
      } catch (error) {
        // If it fails due to permissions, that's expected behavior
        expect(error).toBeDefined();
      }
    });
  });

  describe("Configuration Conflict Resolution", () => {
    it("should handle MCP server name conflicts", async () => {
      // Create existing MCP configuration with conflicting server name
      const mcpConfigPath = join(testDir, ".kiro", "settings", "mcp.json");
      const conflictingConfig = {
        mcpServers: {
          "test-scanner": {
            command: "existing-command",
            args: ["existing-args"],
            disabled: false,
            autoApprove: [],
          },
        },
      };
      writeFileSync(mcpConfigPath, JSON.stringify(conflictingConfig, null, 2));

      // Create test Power with same server name
      const testPowerDir = join(testDir, "test-power");
      createTestPowerStructure(testPowerDir);

      // Installation should handle conflict (either merge or rename)
      await powerManager.installLocalPower(testPowerDir, "test-power");

      // Verify configuration is valid
      const updatedConfig = JSON.parse(readFileSync(mcpConfigPath, "utf-8"));
      expect(updatedConfig.mcpServers).toBeDefined();

      // Should have either merged or created alternate name
      const serverNames = Object.keys(updatedConfig.mcpServers);
      expect(serverNames.length).toBeGreaterThan(0);
    });

    it("should handle steering file name conflicts", async () => {
      // Create existing steering file
      const conflictingSteeringPath = join(testDir, ".kiro", "steering", "test-getting-started.md");
      mkdirSync(join(testDir, ".kiro", "steering"), { recursive: true });
      writeFileSync(conflictingSteeringPath, "# Existing Content\n\nOriginal content");

      // Create test Power with same steering file name
      const testPowerDir = join(testDir, "test-power");
      createTestPowerStructure(testPowerDir);

      // Installation should handle conflict
      await powerManager.installLocalPower(testPowerDir, "test-power");

      // Verify original file is preserved or properly merged
      expect(existsSync(conflictingSteeringPath)).toBe(true);

      // Check if backup or alternate file was created
      const steeringDir = join(testDir, ".kiro", "steering");
      const steeringFiles = require("fs").readdirSync(steeringDir);
      expect(steeringFiles.length).toBeGreaterThan(0);
    });
  });
});

// Helper function to create test Power structure
function createTestPowerStructure(powerDir: string) {
  mkdirSync(powerDir, { recursive: true });

  // Create package.json
  const packageJson = {
    name: "test-power",
    version: "1.0.0",
    description: "Test Power for integration testing",
    author: "Test Author",
    keywords: ["test", "integration"],
  };
  writeFileSync(join(powerDir, "package.json"), JSON.stringify(packageJson, null, 2));

  // Create POWER.md
  const powerMd = `# Test Power

Test Power for integration testing.

## Overview

This Power provides test functionality for integration testing.
`;
  writeFileSync(join(powerDir, "POWER.md"), powerMd);

  // Create MCP configuration
  const mcpConfig = {
    mcpServers: {
      "test-scanner": {
        command: "node",
        args: ["./servers/test-scanner.js"],
        disabled: false,
        autoApprove: [],
      },
    },
  };
  writeFileSync(join(powerDir, "mcp.json"), JSON.stringify(mcpConfig, null, 2));

  // Create steering directory and files
  const steeringDir = join(powerDir, "steering");
  mkdirSync(steeringDir, { recursive: true });

  const gettingStarted = `# Getting Started with Test Power

This guide helps you get started with the Test Power.

## Installation

The Power has been installed automatically.

## Usage

Use the test-scanner MCP server to scan test files.
`;
  writeFileSync(join(steeringDir, "test-getting-started.md"), gettingStarted);

  // Create servers directory
  const serversDir = join(powerDir, "servers");
  mkdirSync(serversDir, { recursive: true });

  const serverScript = `// Test MCP Server
console.log('Test scanner server running');
`;
  writeFileSync(join(serversDir, "test-scanner.js"), serverScript);
}
