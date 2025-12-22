# Agent Skills Specification Guide

Detailed guide to the Agent Skills specification based on agentskills.io standards.

## Overview

The Agent Skills specification defines a standardized format for creating, sharing, and using skills across different AI coding agents. This ensures interoperability, discoverability, and consistent user experience.

## Core Components

### 1. File Structure Requirements

**Mandatory Files**:
- `SKILL.md` - Main skill file with frontmatter and instructions

**Recommended Files**:
- `README.md` - General documentation and overview
- `EXAMPLES.md` - Usage examples and scenarios

**Optional Files**:
- `references/` - Supporting documentation
- `assets/` - Images, diagrams, media files
- `scripts/` - Helper scripts and tools

### 2. Frontmatter Specification

The frontmatter section uses YAML format and must be enclosed in triple dashes:

```yaml
---
# Required Fields
name: skill-identifier           # kebab-case, unique identifier
description: Brief description   # 1-2 sentences, clear purpose

# Recommended Fields
version: 1.0.0                  # Semantic versioning
license: MIT                    # Open source license
author: Author Name             # Creator information

# Optional Fields
tags: [tag1, tag2, tag3]       # Searchable keywords
allowed-tools: [Write, Read]    # Tool permissions
dependencies: [other-skill]     # Required skills
extends: base-skill            # Skill inheritance
specialization: domain         # Specialized focus
---
```

### 3. Content Structure Standards

**Required Sections**:

1. **Title**: Clear, descriptive skill name
2. **Purpose**: What the skill does and when to use it
3. **Instructions**: Step-by-step guidance
4. **Examples**: Real-world usage scenarios

**Recommended Sections**:

5. **Best Practices**: Do's and don'ts
6. **Quality Standards**: Success criteria
7. **Troubleshooting**: Common issues and solutions

**Optional Sections**:

8. **Core Concepts**: Fundamental principles
9. **Advanced Patterns**: Complex use cases
10. **References**: External resources

## Naming Conventions

### Skill Names

- Use kebab-case: `skill-name`
- Be descriptive: `code-review-checklist` not `review`
- Avoid abbreviations: `user-interface-design` not `ui-design`
- Use domain prefixes for specialized skills: `react-component-generator`

### File Names

- `SKILL.md` - Always uppercase
- `README.md` - Always uppercase
- `EXAMPLES.md` - Always uppercase
- `references/` - Lowercase directory
- `assets/` - Lowercase directory
- `scripts/` - Lowercase directory

### Directory Structure

```
skill-name/
├── SKILL.md                    # Main skill (required)
├── README.md                   # Documentation (recommended)
├── EXAMPLES.md                 # Usage examples (recommended)
├── references/                 # Supporting docs (optional)
│   ├── api-reference.md
│   ├── best-practices.md
│   └── troubleshooting.md
├── assets/                     # Media files (optional)
│   ├── diagrams/
│   │   ├── workflow.svg
│   │   └── architecture.png
│   └── screenshots/
│       ├── before.png
│       └── after.png
└── scripts/                    # Helper tools (optional)
    ├── setup.sh
    ├── validate.py
    └── generate.js
```

## Content Guidelines

### Writing Style

**Clarity**:
- Use simple, direct language
- Avoid jargon without explanation
- Write for your target audience level
- Provide context and rationale

**Structure**:
- Use consistent heading hierarchy
- Break content into digestible sections
- Use lists and formatting effectively
- Include code examples with syntax highlighting

**Actionability**:
- Provide specific, executable steps
- Include expected outcomes
- Define success criteria
- Handle error cases

### Instruction Format

**Phase-Based Structure**:
```markdown
## Phase 1: [Phase Name]

**Objective**: Clear goal for this phase

**Steps**:
1. Specific action with expected outcome
2. Another action with validation criteria
3. Final step with quality check

**Expected Output**:
- Deliverable 1 with acceptance criteria
- Deliverable 2 with quality standards

**Quality Checks**:
- [ ] Criterion 1 met
- [ ] Criterion 2 validated
- [ ] Output quality acceptable
```

**Step-by-Step Format**:
```markdown
### Step 1: [Action Name]

**Description**: What to do and why

**Commands/Code**:
```bash
# Example command
command --option value
```

**Expected Result**: What should happen

**Troubleshooting**: Common issues and solutions
```

### Example Format

```markdown
## Examples

### Example 1: [Scenario Name]

**Context**: Situation description

**Input**:
```
User request or starting condition
```

**Process**:
1. How the skill handles this input
2. What steps are taken
3. What decisions are made

**Output**:
```
Expected result or deliverable
```

**Notes**: Additional context or variations
```

## Metadata Standards

### Version Management

Use semantic versioning (semver):
- `1.0.0` - Initial release
- `1.0.1` - Bug fixes and minor improvements
- `1.1.0` - New features, backward compatible
- `2.0.0` - Breaking changes

### Tagging Strategy

**Functional Tags**:
- `process` - Step-by-step workflows
- `knowledge` - Information and guidelines
- `template` - Code/document generation
- `analysis` - Evaluation and assessment

**Domain Tags**:
- `frontend`, `backend`, `fullstack`
- `testing`, `deployment`, `security`
- `documentation`, `code-review`
- `react`, `node`, `python`, `typescript`

**Complexity Tags**:
- `beginner`, `intermediate`, `advanced`
- `quick-start`, `comprehensive`
- `simple`, `complex`

### License Guidelines

**Recommended Licenses**:
- `MIT` - Most permissive, good for open source
- `Apache-2.0` - Includes patent protection
- `CC-BY-4.0` - For documentation-focused skills
- `Proprietary` - For internal/commercial skills

## Tool Integration

### Allowed Tools

Specify what tools the skill can use:

```yaml
allowed-tools:
  - Read          # Read files and directories
  - Write         # Create and modify files
  - Execute       # Run commands and scripts
  - Search        # Search code and documentation
  - Network       # Make HTTP requests
  - Terminal      # Interactive terminal access
```

### Tool Permissions

**Read Permission**:
- Access existing files and directories
- View code and documentation
- Analyze project structure

**Write Permission**:
- Create new files and directories
- Modify existing files
- Generate code and documentation

**Execute Permission**:
- Run build commands
- Execute tests
- Run deployment scripts

### Security Considerations

**Safe Practices**:
- Request minimal necessary permissions
- Validate all inputs and outputs
- Avoid executing untrusted code
- Log security-relevant actions

**Risk Mitigation**:
- Sandbox execution environments
- Limit network access scope
- Validate file system operations
- Monitor resource usage

## Discovery and Loading

### Agent Discovery

AI agents discover skills through:

1. **Directory Scanning**: Look for `SKILL.md` files in known locations
2. **Metadata Parsing**: Extract frontmatter for indexing
3. **Tag Matching**: Match user requests to skill tags
4. **Dependency Resolution**: Load required skills automatically

### Loading Mechanism

```
User Request → Tag Matching → Skill Selection → Dependency Loading → Execution
```

**Tag Matching Algorithm**:
1. Extract keywords from user request
2. Match against skill tags and descriptions
3. Rank by relevance and recency
4. Present top matches to user or auto-select

### Skill Activation

**Automatic Activation**:
- Agent detects relevant keywords
- Matches user intent to skill purpose
- Loads skill and begins execution

**Manual Activation**:
- User explicitly requests skill by name
- Agent presents skill options for selection
- User chooses from available skills

## Quality Assurance

### Validation Checklist

**Structure Validation**:
- [ ] Required files present (`SKILL.md`)
- [ ] Frontmatter properly formatted
- [ ] Required metadata fields included
- [ ] File naming conventions followed

**Content Validation**:
- [ ] Clear purpose statement
- [ ] Actionable instructions
- [ ] Complete examples
- [ ] Quality standards defined

**Technical Validation**:
- [ ] Syntax highlighting correct
- [ ] Code examples functional
- [ ] Links and references valid
- [ ] Tool permissions appropriate

### Testing Strategy

**Manual Testing**:
1. **Clarity Test**: New user can follow instructions
2. **Completeness Test**: All use cases covered
3. **Error Test**: Edge cases handled properly
4. **Integration Test**: Works with target agents

**Automated Testing**:
```python
def validate_skill(skill_path):
    """Validate skill structure and content."""
    
    # Check required files
    assert os.path.exists(f"{skill_path}/SKILL.md")
    
    # Validate frontmatter
    with open(f"{skill_path}/SKILL.md") as f:
        content = f.read()
        frontmatter = extract_frontmatter(content)
        assert "name" in frontmatter
        assert "description" in frontmatter
    
    # Check content quality
    assert len(content) > 1000  # Minimum length
    assert "## Purpose" in content
    assert "## Instructions" in content
    
    return True
```

## Platform Compatibility

### Supported Agents

**Cursor IDE**:
- Location: `.cursor/skills/`
- Format: Standard Agent Skills
- Features: Full tool integration

**GitHub Copilot**:
- Location: `.claude/skills/`
- Format: Agent Skills compatible
- Features: Auto-discovery, context integration

**Windsurf**:
- Location: `.windsurf/skills/`
- Format: Workflow-oriented skills
- Features: Visual workflow integration

**Kiro**:
- Location: `.kiro/steering/skills/`
- Format: Steering file compatible
- Features: Context-aware activation

### Cross-Platform Considerations

**File Format**:
- Use standard Markdown with YAML frontmatter
- Avoid platform-specific extensions
- Test on multiple agents

**Tool Dependencies**:
- Specify tool requirements clearly
- Provide fallback options
- Document platform limitations

**Content Adaptation**:
- Use generic examples when possible
- Provide platform-specific sections if needed
- Maintain core functionality across platforms

## Distribution Methods

### Git-Based Distribution

**Repository Structure**:
```
skills-repository/
├── README.md
├── LICENSE
├── skills/
│   ├── skill-1/
│   ├── skill-2/
│   └── skill-n/
└── tools/
    ├── validate.py
    └── install.sh
```

**Installation Process**:
```bash
# Clone repository
git clone https://github.com/company/agent-skills.git

# Install skills
./tools/install.sh --target cursor

# Update skills
git pull && ./tools/install.sh --update
```

### Package Distribution

**NPM Package**:
```json
{
  "name": "@company/agent-skills",
  "version": "1.0.0",
  "description": "Company agent skills collection",
  "main": "index.js",
  "files": ["skills/", "tools/"],
  "scripts": {
    "install-cursor": "node tools/install.js --target cursor",
    "install-copilot": "node tools/install.js --target copilot",
    "validate": "node tools/validate.js"
  },
  "keywords": ["agent-skills", "ai", "automation"],
  "license": "MIT"
}
```

### Registry Distribution

**Skill Registry**:
- Central repository of validated skills
- Version management and updates
- Dependency resolution
- Quality ratings and reviews

## Best Practices Summary

### Content Creation

1. **Start with User Needs**: Solve real problems
2. **Be Specific**: Provide actionable instructions
3. **Include Examples**: Show real-world usage
4. **Test Thoroughly**: Validate with actual users
5. **Iterate Often**: Improve based on feedback

### Technical Implementation

1. **Follow Standards**: Adhere to specification
2. **Validate Metadata**: Ensure correct frontmatter
3. **Organize Logically**: Structure content intuitively
4. **Document Dependencies**: List requirements clearly
5. **Version Properly**: Use semantic versioning

### Quality Assurance

1. **Review Content**: Check for clarity and completeness
2. **Test Integration**: Verify agent compatibility
3. **Validate Structure**: Ensure specification compliance
4. **Monitor Usage**: Track adoption and effectiveness
5. **Maintain Actively**: Keep skills current and relevant

---

This specification guide provides the foundation for creating high-quality Agent Skills that work across platforms and provide consistent value to users. Follow these guidelines to ensure your skills meet professional standards and integrate seamlessly with AI coding agents.