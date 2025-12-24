# Power Troubleshooting Guide

This guide helps resolve common issues when working with Kiro Powers.

## Installation Issues

### Power Installation Fails

**Symptoms:**
- Error message during `agent-kit init -p`
- Power not appearing in installed list

**Solutions:**

1. **Check Network Connection**
   ```bash
   # Verify you can reach the registry
   curl -I https://raw.githubusercontent.com/duongductrong/agent-kit/main/powers/registry.json
   ```

2. **Verify Kiro Directory Structure**
   ```bash
   # Ensure .kiro directory exists
   mkdir -p .kiro/settings .kiro/steering .kiro/powers
   ```

3. **Check Permissions**
   ```bash
   # Ensure write permissions
   chmod -R u+w .kiro/
   ```

4. **Force Reinstall**
   ```bash
   agent-kit init -t kiro -p -f
   ```

### MCP Server Configuration Not Applied

**Symptoms:**
- MCP servers not appearing in Kiro
- Tools not available after Power installation

**Solutions:**

1. **Verify mcp.json**
   ```bash
   cat .kiro/settings/mcp.json
   ```

2. **Check Server Configuration**
   ```json
   {
     "mcpServers": {
       "server-name": {
         "command": "node",
         "args": ["./path/to/server.js"]
       }
     }
   }
   ```

3. **Restart Kiro**
   - Close and reopen Kiro to reload MCP configurations

4. **Check Server Path**
   - Ensure the server file path is correct relative to your project

### Steering Files Not Appearing

**Symptoms:**
- Steering files not in `.kiro/steering/`
- Power installed but no steering context

**Solutions:**

1. **Check Steering Directory**
   ```bash
   ls -la .kiro/steering/
   ```

2. **Verify Power Has Steering Files**
   - Not all Powers include steering files
   - Check the Power's documentation

3. **Manual Copy**
   ```bash
   # If needed, copy steering files manually
   cp -r power-name/steering/* .kiro/steering/
   ```

## Runtime Issues

### MCP Server Not Starting

**Symptoms:**
- "Server not found" errors
- Tools unavailable in Kiro

**Solutions:**

1. **Check Node.js Version**
   ```bash
   node --version  # Should be >= 18.0.0
   ```

2. **Install Dependencies**
   ```bash
   cd .kiro/powers/power-name
   npm install
   ```

3. **Test Server Manually**
   ```bash
   node .kiro/powers/power-name/servers/server.js
   ```

4. **Check Environment Variables**
   - Some Powers require environment variables
   - Check the Power's setup instructions

### Tool Execution Errors

**Symptoms:**
- Tool calls fail with errors
- Unexpected results from tools

**Solutions:**

1. **Check Tool Parameters**
   - Verify you're passing correct parameter types
   - Check required vs optional parameters

2. **Review Server Logs**
   ```bash
   # Run server with debug output
   NODE_DEBUG=* node server.js
   ```

3. **Validate Input Data**
   - Ensure input matches expected format
   - Check for special characters or encoding issues

## Update Issues

### Power Update Fails

**Symptoms:**
- `agent-kit pull -p` fails
- Version mismatch errors

**Solutions:**

1. **Check Current Version**
   ```bash
   agent-kit list -p -v
   ```

2. **Force Update**
   ```bash
   agent-kit pull -t kiro -p -f
   ```

3. **Manual Update**
   ```bash
   # Remove and reinstall
   agent-kit remove --target kiro -t power -n power-name -f
   agent-kit init -t kiro -p
   ```

### Configuration Conflicts

**Symptoms:**
- Existing MCP servers overwritten
- Custom configurations lost

**Solutions:**

1. **Backup Before Update**
   ```bash
   cp .kiro/settings/mcp.json .kiro/settings/mcp.json.backup
   ```

2. **Use Merge Mode**
   - During installation, choose "merge" when prompted about conflicts

3. **Manual Merge**
   ```bash
   # Compare and merge configurations
   diff .kiro/settings/mcp.json.backup .kiro/settings/mcp.json
   ```

## Removal Issues

### Power Removal Incomplete

**Symptoms:**
- Orphaned MCP server configurations
- Leftover steering files

**Solutions:**

1. **Verify Removal**
   ```bash
   agent-kit list -p
   ```

2. **Manual Cleanup**
   ```bash
   # Remove MCP server entry from mcp.json
   # Remove steering files
   rm .kiro/steering/power-specific-file.md
   ```

3. **Check installed.json**
   ```bash
   cat .kiro/powers/installed.json
   ```

### Cannot Remove Power

**Symptoms:**
- Removal command fails
- Power still appears in list

**Solutions:**

1. **Force Remove**
   ```bash
   agent-kit remove --target kiro -t power -n power-name -f
   ```

2. **Manual Removal**
   ```bash
   # Edit installed.json to remove entry
   # Remove MCP server from mcp.json
   # Delete steering files
   ```

## Validation Issues

### Invalid Power Structure

**Symptoms:**
- Power validation fails
- Missing required files errors

**Solutions:**

1. **Check Required Files**
   ```
   power-name/
   ├── POWER.md        # Required
   ├── package.json    # Required
   └── mcp.json        # Required if using MCP servers
   ```

2. **Validate package.json**
   ```bash
   cat power-name/package.json | jq .
   ```

3. **Validate mcp.json**
   ```bash
   cat power-name/mcp.json | jq .
   ```

### Version Compatibility

**Symptoms:**
- Node.js version errors
- Dependency conflicts

**Solutions:**

1. **Check Node.js Version**
   ```bash
   node --version
   # Upgrade if needed: nvm install 18
   ```

2. **Check Power Requirements**
   ```bash
   cat power-name/package.json | jq '.engines'
   ```

## Getting Help

If you're still experiencing issues:

1. **Check Documentation**
   - Review the Power's POWER.md and README.md
   - Check steering files for usage guidance

2. **Search Issues**
   - Look for similar issues in the agent-kit repository

3. **Report a Bug**
   - Open an issue with:
     - Power name and version
     - Error messages
     - Steps to reproduce
     - System information (OS, Node.js version)

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Power not found in registry" | Power doesn't exist or network issue | Check network, verify Power name |
| "Invalid Power structure" | Missing required files | Add POWER.md and package.json |
| "MCP server failed to start" | Server error or missing deps | Install dependencies, check logs |
| "Configuration conflict" | Existing MCP server with same name | Choose merge or overwrite |
| "Permission denied" | File system permissions | Check directory permissions |
| "Node.js version too old" | Node.js < 18.0.0 | Upgrade Node.js |
