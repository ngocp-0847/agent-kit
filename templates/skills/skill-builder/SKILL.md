---
name: skill-builder
description: Comprehensive guide for building Agent Skills according to agentskills.io specification. Use when developers need to create, structure, or validate skills that follow the Agent Skills standard format and best practices.
allowed-tools: Write, Read
---

# Skill Builder - Agent Skills Specification Guide

Build Agent Skills that follow the agentskills.io specification and industry best practices.

## Purpose

This skill helps developers create professional, standardized Agent Skills that:

1. **Follow Agent Skills Specification** - Comply with agentskills.io standards
2. **Provide Clear Structure** - Organized, discoverable, and maintainable
3. **Enable AI Agent Integration** - Optimized for AI coding agents (Cursor, Copilot, etc.)
4. **Support Team Collaboration** - Shareable, version-controlled, and documented

Perfect for developers building skills for AI coding agents, teams standardizing workflows, and organizations creating skill libraries.

---

## 📋 Agent Skills Specification Overview

### Core Principles

The Agent Skills specification (agentskills.io) defines standards for:

1. **Skill Structure** - File organization and naming conventions
2. **Metadata Format** - Frontmatter with required fields
3. **Content Guidelines** - Documentation and instruction patterns
4. **Discovery Mechanism** - How AI agents find and load skills
5. **Interoperability** - Cross-platform compatibility

### Required Components

Every Agent Skill must include:

- **SKILL.md** - Main skill file with frontmatter metadata
- **Structured Content** - Clear instructions and examples
- **Proper Metadata** - Name, description, version, license
- **Documentation** - Usage examples and best practices

---

## 🏗️ Skill Structure Standards

### Directory Layout

```
skill-name/
├── SKILL.md              # Main skill file (required)
├── README.md             # Documentation (recommended)
├── EXAMPLES.md           # Usage examples (recommended)
├── references/           # Supporting materials (optional)
│   ├── api-docs.md
│   ├── best-practices.md
│   └── troubleshooting.md
├── assets/              # Images, diagrams (optional)
│   ├── architecture.png
│   └── workflow.svg
└── scripts/             # Helper scripts (optional)
    ├── setup.sh
    └── validate.py
```

### File Naming Conventions

- **SKILL.md** - Always uppercase, main entry point
- **README.md** - Uppercase, general documentation
- **EXAMPLES.md** - Uppercase, usage examples
- **references/** - Lowercase directory, supporting docs
- **assets/** - Lowercase directory, media files
- **scripts/** - Lowercase directory, executable files

---

## 📝 SKILL.md Format Specification

### Required Frontmatter

```yaml
---
name: skill-name                    # Required: kebab-case identifier
description: Brief skill description # Required: 1-2 sentences
version: 1.0.0                     # Recommended: semantic versioning
license: MIT                       # Recommended: open source license
author: Your Name                  # Optional: skill creator
tags: [tag1, tag2, tag3]          # Optional: searchable keywords
allowed-tools: [Write, Read]       # Optional: tool permissions
dependencies: [other-skill]        # Optional: skill dependencies
---
```

### Content Structure Template

```markdown
# Skill Name

Brief description of what this skill does and when to use it.

## Purpose

Detailed explanation of:
- What problems this skill solves
- When developers should use it
- What outcomes it provides
- Who benefits from it

## Core Concepts

### Concept 1: [Name]
Explanation of key concept with examples.

### Concept 2: [Name]
Another important concept.

## Instructions

### Phase 1: [Phase Name]

**Objective**: Clear goal for this phase

**Steps**:
1. Step 1 with specific actions
2. Step 2 with expected outcomes
3. Step 3 with validation criteria

**Expected Output**:
- Deliverable 1
- Deliverable 2

### Phase 2: [Phase Name]

[Continue with additional phases...]

## Examples

### Example 1: [Scenario Name]

**Input**:
```
User request or scenario description
```

**Process**:
1. How the skill handles this input
2. What steps are taken
3. What decisions are made

**Output**:
```
Expected result or deliverable
```

### Example 2: [Scenario Name]

[Additional examples...]

## Best Practices

### Do's
- ✅ Specific guideline with rationale
- ✅ Another best practice
- ✅ Quality standard

### Don'ts
- ❌ What to avoid and why
- ❌ Common mistakes
- ❌ Anti-patterns

## Quality Standards

Define what constitutes success:
- Measurable criteria
- Quality checkpoints
- Validation methods

## Troubleshooting

### Common Issue 1
**Problem**: Description of issue
**Cause**: Why it happens
**Solution**: How to fix it

### Common Issue 2
[Additional troubleshooting...]

## References

- [Link 1](url) - Description
- [Link 2](url) - Description
- [Documentation](url) - Official docs
```

---

## 🎯 Skill Development Process

### Phase 1: Planning & Research

**Objective**: Define skill scope and requirements

**Steps**:
1. **Identify the Problem**
   - What specific challenge does this skill address?
   - Who is the target user (developers, PMs, designers)?
   - What existing solutions are inadequate?

2. **Research Existing Skills**
   - Check if similar skills already exist
   - Identify gaps or improvement opportunities
   - Study successful skill patterns

3. **Define Scope**
   - What will the skill do (and not do)?
   - What are the input/output formats?
   - What tools or dependencies are needed?

**Expected Output**:
- Skill requirements document
- Scope definition
- Success criteria

### Phase 2: Structure Design

**Objective**: Create skill architecture and file structure

**Steps**:
1. **Choose Skill Type**
   - **Process Skill**: Step-by-step workflows
   - **Knowledge Skill**: Information and best practices
   - **Template Skill**: Code/document generation
   - **Analysis Skill**: Evaluation and assessment

2. **Design File Structure**
   - Determine required files (SKILL.md always required)
   - Plan supporting documentation
   - Identify assets and references needed

3. **Plan Content Organization**
   - Break down into logical phases/sections
   - Define instruction hierarchy
   - Plan examples and use cases

**Expected Output**:
- Directory structure plan
- Content outline
- File organization strategy

### Phase 3: Content Creation

**Objective**: Write comprehensive skill content

**Steps**:
1. **Write Frontmatter**
   - Choose descriptive name (kebab-case)
   - Write clear, concise description
   - Set appropriate metadata

2. **Create Core Instructions**
   - Write clear, actionable steps
   - Include decision points and branching logic
   - Provide specific examples

3. **Add Supporting Content**
   - Create usage examples
   - Document best practices
   - Add troubleshooting guide

**Expected Output**:
- Complete SKILL.md file
- Supporting documentation
- Usage examples

### Phase 4: Testing & Validation

**Objective**: Ensure skill works correctly and meets standards

**Steps**:
1. **Test with AI Agents**
   - Test with Cursor IDE
   - Test with GitHub Copilot
   - Test with other supported agents

2. **Validate Against Specification**
   - Check frontmatter format
   - Verify file structure
   - Ensure content quality

3. **User Testing**
   - Test with target users
   - Gather feedback on clarity
   - Iterate based on results

**Expected Output**:
- Tested, working skill
- Validation report
- User feedback incorporated

---

## 🔧 Skill Types & Patterns

### Process Skills

**Purpose**: Guide users through step-by-step workflows

**Structure Pattern**:
```markdown
## Phase 1: [Name]
### Objective
### Steps
### Expected Output
### Quality Checks

## Phase 2: [Name]
[Continue pattern...]
```

**Examples**: Code review, deployment, testing workflows

### Knowledge Skills

**Purpose**: Provide information, best practices, and guidelines

**Structure Pattern**:
```markdown
## Core Concepts
### Concept 1
### Concept 2

## Best Practices
### Category 1
### Category 2

## Reference Materials
```

**Examples**: Security guidelines, architecture patterns, coding standards

### Template Skills

**Purpose**: Generate code, documents, or configurations

**Structure Pattern**:
```markdown
## Template Types
### Template 1: [Name]
#### When to Use
#### Template Content
#### Customization Options

### Template 2: [Name]
[Continue pattern...]
```

**Examples**: Project scaffolding, document generation, configuration creation

### Analysis Skills

**Purpose**: Evaluate, assess, or analyze existing work

**Structure Pattern**:
```markdown
## Analysis Framework
### Criteria 1
### Criteria 2

## Evaluation Process
### Step 1: Data Collection
### Step 2: Analysis
### Step 3: Reporting

## Output Format
```

**Examples**: Code quality assessment, performance analysis, security audits

---

## 📊 Quality Standards & Validation

### Content Quality Checklist

- ✅ **Clear Purpose**: Skill purpose is immediately obvious
- ✅ **Actionable Instructions**: Steps are specific and executable
- ✅ **Complete Examples**: Real-world usage scenarios included
- ✅ **Error Handling**: Common issues and solutions documented
- ✅ **Consistent Format**: Follows specification standards
- ✅ **Proper Metadata**: All required frontmatter fields present
- ✅ **Logical Flow**: Information organized intuitively
- ✅ **Measurable Outcomes**: Success criteria clearly defined

### Technical Validation

```bash
# Validate frontmatter format
grep -A 10 "^---$" SKILL.md | head -20

# Check required fields
grep -E "^(name|description):" SKILL.md

# Verify file structure
ls -la skill-name/

# Test with AI agent
# (Manual testing required)
```

### User Experience Standards

- **Discoverability**: Easy to find and understand purpose
- **Usability**: Clear instructions that work on first try
- **Reliability**: Consistent results across different scenarios
- **Maintainability**: Easy to update and extend
- **Accessibility**: Works for users with different skill levels

---

## 🚀 Deployment & Distribution

### Local Installation

```bash
# Copy to skills directory
cp -r skill-name/ .cursor/skills/
# or
cp -r skill-name/ .claude/skills/
# or
cp -r skill-name/ .kiro/steering/skills/
```

### Git-Based Distribution

```bash
# Add to repository
git add .cursor/skills/skill-name/
git commit -m "Add skill-name skill"
git push origin main

# Team members get automatically
git pull
```

### Package Distribution

```json
// package.json for npm distribution
{
  "name": "@company/agent-skills",
  "version": "1.0.0",
  "description": "Company agent skills collection",
  "files": ["skills/"],
  "keywords": ["agent-skills", "ai", "automation"]
}
```

---

## 💡 Advanced Patterns

### Skill Composition

**Combining Multiple Skills**:
```yaml
---
name: full-stack-development
dependencies: [frontend-development, backend-development, testing]
---
```

**Skill Inheritance**:
```yaml
---
name: react-testing
extends: testing
specialization: react-components
---
```

### Dynamic Content

**Conditional Instructions**:
```markdown
## Framework-Specific Steps

### If using React:
1. Install React Testing Library
2. Create component tests

### If using Vue:
1. Install Vue Test Utils
2. Create component tests
```

**Variable Substitution**:
```markdown
## Setup for {{FRAMEWORK}}

Replace {{FRAMEWORK}} with your chosen framework:
- React
- Vue
- Angular
```

### Integration Patterns

**Tool Integration**:
```yaml
---
allowed-tools: [Write, Read, Execute, Search]
tool-configs:
  linter: eslint
  formatter: prettier
  bundler: webpack
---
```

**External Dependencies**:
```yaml
---
dependencies:
  skills: [base-development]
  tools: [node, npm, git]
  services: [github, vercel]
---
```

---

## 🧪 Testing Strategies

### Manual Testing

1. **Clarity Test**: Can a new user follow instructions successfully?
2. **Completeness Test**: Does the skill handle all stated use cases?
3. **Error Test**: How does it handle edge cases and errors?
4. **Integration Test**: Does it work with target AI agents?

### Automated Testing

```python
# Example validation script
def validate_skill(skill_path):
    # Check file structure
    assert os.path.exists(f"{skill_path}/SKILL.md")
    
    # Validate frontmatter
    with open(f"{skill_path}/SKILL.md") as f:
        content = f.read()
        assert "name:" in content
        assert "description:" in content
    
    # Check content quality
    assert len(content) > 1000  # Minimum content length
    assert "## Purpose" in content
    assert "## Instructions" in content
```

### User Acceptance Testing

```markdown
## Test Scenarios

### Scenario 1: New Developer
- **User**: Junior developer, first time using skills
- **Task**: Follow skill instructions to complete workflow
- **Success**: Completes task without external help

### Scenario 2: Experienced Developer
- **User**: Senior developer, familiar with domain
- **Task**: Use skill for complex scenario
- **Success**: Achieves better results than manual approach

### Scenario 3: AI Agent Integration
- **User**: AI coding agent (Cursor, Copilot)
- **Task**: Parse and execute skill instructions
- **Success**: Produces expected output automatically
```

---

## 📚 Examples & Templates

### Example 1: Simple Process Skill

```yaml
---
name: code-review-checklist
description: Systematic code review process with quality gates and best practices
version: 1.0.0
license: MIT
tags: [code-review, quality, process]
---
```

```markdown
# Code Review Checklist

Systematic approach to conducting thorough, constructive code reviews.

## Purpose

This skill provides a structured checklist for code reviews that ensures:
- Code quality and maintainability
- Security and performance considerations
- Team knowledge sharing
- Consistent review standards

## Instructions

### Phase 1: Initial Assessment

**Objective**: Quick overview and scope understanding

**Steps**:
1. Read the PR description and linked issues
2. Understand the business context and requirements
3. Identify the scope and complexity of changes
4. Check if automated tests pass

**Expected Output**:
- Understanding of what the code should accomplish
- Assessment of review complexity (simple/medium/complex)

### Phase 2: Code Quality Review

**Objective**: Evaluate code structure and implementation

**Checklist**:
- [ ] Code follows team style guidelines
- [ ] Functions are single-purpose and well-named
- [ ] Complex logic is commented and explained
- [ ] No obvious bugs or logic errors
- [ ] Error handling is appropriate
- [ ] No code duplication (DRY principle)

[Continue with additional phases...]
```

### Example 2: Knowledge Skill Template

```yaml
---
name: api-design-principles
description: REST API design guidelines and best practices for scalable, maintainable APIs
version: 1.0.0
license: MIT
tags: [api, rest, design, backend]
---
```

```markdown
# API Design Principles

Comprehensive guidelines for designing REST APIs that are intuitive, scalable, and maintainable.

## Core Principles

### 1. Resource-Oriented Design
APIs should model business entities as resources with clear hierarchies.

**Good**:
```
GET /users/123/orders/456
POST /users/123/orders
```

**Bad**:
```
GET /getUserOrder?userId=123&orderId=456
POST /createOrderForUser
```

### 2. HTTP Methods Semantics
Use HTTP methods according to their intended semantics.

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Update/replace resource | Yes | No |
| PATCH | Partial update | No | No |
| DELETE | Remove resource | Yes | No |

[Continue with additional principles...]
```

---

## 🔍 Troubleshooting Guide

### Common Issues

#### Issue 1: Skill Not Recognized by AI Agent

**Symptoms**:
- Agent doesn't activate skill automatically
- Skill not found in available skills list

**Causes**:
- Incorrect file location
- Missing or malformed frontmatter
- Agent not configured to scan skills directory

**Solutions**:
1. Verify file is in correct location (`.cursor/skills/`, `.claude/skills/`, etc.)
2. Check frontmatter syntax and required fields
3. Restart AI agent to refresh skill cache
4. Explicitly mention skill name in prompt

#### Issue 2: Instructions Too Vague

**Symptoms**:
- Users can't follow instructions successfully
- AI agent produces inconsistent results
- Frequent clarification requests

**Causes**:
- Steps lack specific details
- Missing examples or context
- Assumptions about user knowledge

**Solutions**:
1. Add specific, actionable steps
2. Include concrete examples
3. Define technical terms and concepts
4. Test with users unfamiliar with the domain

#### Issue 3: Skill Too Complex

**Symptoms**:
- Users abandon skill partway through
- Instructions feel overwhelming
- Poor adoption rates

**Causes**:
- Trying to solve too many problems
- Lack of clear phases or milestones
- Missing quick-start options

**Solutions**:
1. Break into smaller, focused skills
2. Add progressive complexity levels
3. Provide quick-start and comprehensive paths
4. Include progress indicators

---

## 📈 Skill Metrics & Analytics

### Usage Metrics

Track skill effectiveness:
- **Activation Rate**: How often is the skill used?
- **Completion Rate**: Do users finish the workflow?
- **Success Rate**: Do users achieve intended outcomes?
- **Time to Value**: How quickly do users see benefits?

### Quality Metrics

Measure skill quality:
- **Clarity Score**: User feedback on instruction clarity
- **Completeness Score**: Coverage of use cases
- **Accuracy Score**: Correctness of information
- **Maintainability Score**: Ease of updates and changes

### Collection Methods

```markdown
## Feedback Collection

### In-Skill Feedback
Add feedback prompts in skill content:
"Was this step clear? (Y/N)"
"Did you encounter any issues? (describe)"

### Post-Usage Survey
"Rate this skill's usefulness (1-5)"
"What would you improve?"
"Would you recommend to others?"

### Analytics Integration
Track usage patterns:
- Which sections are accessed most?
- Where do users typically stop?
- What errors are most common?
```

---

## 🎯 Success Patterns

### High-Impact Skills

Characteristics of successful skills:
- **Solve Real Problems**: Address actual pain points
- **Save Significant Time**: Provide clear efficiency gains
- **Reduce Errors**: Prevent common mistakes
- **Enable Consistency**: Standardize approaches
- **Facilitate Learning**: Help users improve skills

### Adoption Strategies

- **Start Small**: Begin with simple, high-value skills
- **Get Early Feedback**: Test with small group first
- **Iterate Quickly**: Improve based on usage data
- **Provide Training**: Help users understand benefits
- **Measure Impact**: Track and communicate value

### Community Building

- **Share Openly**: Contribute to skill libraries
- **Document Learnings**: Share what works and what doesn't
- **Collaborate**: Work with others on skill development
- **Standardize**: Follow and promote specifications
- **Evangelize**: Help others adopt skill-based workflows

---

## 📋 Skill Builder Checklist

### Planning Phase
- [ ] Problem clearly defined and scoped
- [ ] Target users identified
- [ ] Success criteria established
- [ ] Existing solutions researched
- [ ] Skill type determined (process/knowledge/template/analysis)

### Development Phase
- [ ] File structure planned and created
- [ ] Frontmatter completed with all required fields
- [ ] Core instructions written and tested
- [ ] Examples created and validated
- [ ] Best practices documented
- [ ] Troubleshooting guide included

### Quality Assurance Phase
- [ ] Content reviewed for clarity and completeness
- [ ] Instructions tested by target users
- [ ] AI agent compatibility verified
- [ ] Specification compliance checked
- [ ] Performance and usability validated

### Deployment Phase
- [ ] Skill installed in target environment
- [ ] Documentation updated
- [ ] Team training provided (if applicable)
- [ ] Usage metrics collection set up
- [ ] Feedback mechanisms established

### Maintenance Phase
- [ ] Regular usage review scheduled
- [ ] Update process defined
- [ ] Version control strategy implemented
- [ ] Community feedback incorporated
- [ ] Continuous improvement plan active

---

## 🆘 Getting Help

### Resources

- **Agent Skills Specification**: https://agentskills.io/specification
- **Community Forums**: Platform-specific communities
- **Example Skills**: Study existing high-quality skills
- **Documentation**: AI agent documentation for skill integration

### Support Channels

- **GitHub Issues**: For specification questions
- **Community Discord**: Real-time help and discussion
- **Stack Overflow**: Technical implementation questions
- **Documentation**: Official guides and tutorials

### Contributing

- **Report Issues**: Help improve the specification
- **Share Skills**: Contribute to community libraries
- **Provide Feedback**: Help refine best practices
- **Write Documentation**: Improve guides and examples

---

## 📊 Version History

- **v1.0.0** (2025-12-22): Initial release with comprehensive skill building guide
- **v1.1.0** (TBD): Enhanced templates and validation tools
- **v1.2.0** (TBD): Advanced patterns and integration examples

---

## 🎉 Next Steps

1. **Study the Specification**: Read agentskills.io thoroughly
2. **Analyze Existing Skills**: Learn from successful examples
3. **Start Small**: Create a simple skill for immediate need
4. **Test Thoroughly**: Validate with real users and AI agents
5. **Iterate and Improve**: Refine based on feedback and usage
6. **Share and Collaborate**: Contribute to the community

---

**Remember**: Great skills solve real problems, provide clear value, and make developers more productive. Focus on user needs, follow standards, and iterate based on feedback.