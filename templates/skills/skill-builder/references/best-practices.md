# Agent Skills Best Practices

Comprehensive guide to creating high-quality Agent Skills that provide maximum value to users.

## Content Creation Best Practices

### 1. Problem-Focused Design

**Start with Real Problems**:
- Identify actual pain points in development workflows
- Talk to developers about their daily challenges
- Observe where teams spend excessive time
- Look for repetitive, error-prone tasks

**Validate Problem Significance**:
- Ensure the problem affects multiple people
- Confirm it's worth the effort to solve
- Check if existing solutions are inadequate
- Measure potential time savings

**Example Problem Identification**:
```
❌ Bad: "Create a skill for React"
✅ Good: "Developers spend 30 minutes setting up each new React component with proper TypeScript, tests, and Storybook stories. They often forget important patterns and make inconsistent choices."
```

### 2. User-Centered Writing

**Know Your Audience**:
- **Beginners**: Need more context and explanation
- **Intermediate**: Want efficient workflows and best practices
- **Experts**: Seek advanced patterns and customization options

**Write for Clarity**:
- Use simple, direct language
- Define technical terms when first used
- Provide context for decisions and recommendations
- Explain the "why" behind instructions

**Structure for Scanning**:
- Use descriptive headings and subheadings
- Break content into digestible chunks
- Use bullet points and numbered lists
- Highlight key information with formatting

### 3. Actionable Instructions

**Be Specific**:
```markdown
❌ Bad: "Set up the database"
✅ Good: "Create a PostgreSQL database named 'myapp_dev' with UTF-8 encoding"
```

**Include Expected Outcomes**:
```markdown
## Step 3: Run Database Migration

**Command**:
```bash
npm run migrate
```

**Expected Output**:
```
✓ Migration 001_create_users completed
✓ Migration 002_add_indexes completed
Database is up to date
```

**If you see errors**: Check the troubleshooting section below
```

**Provide Validation Steps**:
```markdown
**Validation**:
1. Check that the server starts without errors
2. Verify the API responds at http://localhost:3000/health
3. Confirm database connection is established
```

### 4. Comprehensive Examples

**Use Real-World Scenarios**:
- Base examples on actual use cases
- Include context and background
- Show complete workflows, not just fragments
- Demonstrate variations and edge cases

**Progressive Complexity**:
```markdown
## Examples

### Example 1: Simple Component (Beginner)
Basic button component with props

### Example 2: Interactive Component (Intermediate)  
Form component with validation and state

### Example 3: Complex Component (Advanced)
Data table with sorting, filtering, and pagination
```

**Show Before and After**:
```markdown
### Before Using This Skill
```typescript
// Inconsistent component structure
const Button = (props) => {
  return <button onClick={props.onClick}>{props.children}</button>
}
```

### After Using This Skill
```typescript
// Standardized component with TypeScript, tests, and documentation
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
  onClick: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ ... }) => {
  // Implementation with proper patterns
}
```

## Technical Implementation Best Practices

### 1. Metadata Excellence

**Choose Descriptive Names**:
```yaml
❌ Bad: name: helper
✅ Good: name: react-component-generator
```

**Write Clear Descriptions**:
```yaml
❌ Bad: description: Helps with React stuff
✅ Good: description: Generate React components with TypeScript, tests, and Storybook stories following team conventions
```

**Use Effective Tags**:
```yaml
# Good tagging strategy
tags: [react, typescript, testing, storybook, frontend, component-generation]
```

### 2. File Organization

**Logical Structure**:
```
skill-name/
├── SKILL.md              # Core instructions
├── README.md             # Overview and quick start
├── EXAMPLES.md           # Detailed usage examples
├── references/           # Supporting documentation
│   ├── api-reference.md  # Technical specifications
│   ├── troubleshooting.md # Common issues
│   └── advanced-usage.md # Complex scenarios
├── assets/               # Visual aids
│   ├── workflow.png      # Process diagrams
│   └── screenshots/      # UI examples
└── scripts/              # Automation tools
    ├── validate.sh       # Quality checks
    └── setup.py          # Environment setup
```

**File Naming Consistency**:
- Use kebab-case for directories: `api-reference/`
- Use PascalCase for main files: `SKILL.md`, `README.md`
- Use descriptive names: `troubleshooting.md` not `issues.md`

### 3. Content Structure

**Consistent Section Hierarchy**:
```markdown
# Skill Title

## Purpose
Brief description and when to use

## Core Concepts (optional)
Key ideas users need to understand

## Instructions
Step-by-step guidance organized in phases

### Phase 1: [Name]
#### Objective
#### Steps
#### Expected Output

## Examples
Real-world usage scenarios

## Best Practices
Do's and don'ts

## Quality Standards
Success criteria and validation

## Troubleshooting
Common issues and solutions

## References
Links to additional resources
```

**Phase-Based Organization**:
```markdown
## Phase 1: Planning (5-10 minutes)
**Objective**: Define requirements and scope
**Steps**: [Specific actions]
**Expected Output**: [Deliverables]

## Phase 2: Implementation (20-30 minutes)
**Objective**: Build the solution
**Steps**: [Specific actions]
**Expected Output**: [Deliverables]

## Phase 3: Validation (5-10 minutes)
**Objective**: Verify quality and completeness
**Steps**: [Specific actions]
**Expected Output**: [Deliverables]
```

## Quality Assurance Best Practices

### 1. Content Quality

**Clarity Checklist**:
- [ ] Purpose is immediately clear
- [ ] Instructions are specific and actionable
- [ ] Examples are complete and realistic
- [ ] Technical terms are defined
- [ ] Success criteria are measurable

**Completeness Checklist**:
- [ ] All common use cases covered
- [ ] Edge cases and error handling included
- [ ] Prerequisites clearly stated
- [ ] Dependencies documented
- [ ] Troubleshooting guide provided

**Accuracy Checklist**:
- [ ] Code examples are syntactically correct
- [ ] Commands have been tested
- [ ] Links and references are valid
- [ ] Information is current and relevant
- [ ] Best practices are up-to-date

### 2. User Testing

**Test with Different User Types**:
```markdown
## Testing Scenarios

### Scenario 1: New Team Member
- **Background**: Junior developer, unfamiliar with team practices
- **Task**: Follow skill to complete typical workflow
- **Success Criteria**: Completes task without asking for help

### Scenario 2: Experienced Developer
- **Background**: Senior developer, knows the domain well
- **Task**: Use skill for complex scenario
- **Success Criteria**: Achieves better results than manual approach

### Scenario 3: AI Agent
- **Background**: Cursor IDE or GitHub Copilot
- **Task**: Parse and execute skill instructions
- **Success Criteria**: Produces expected output automatically
```

**Feedback Collection**:
```markdown
## Post-Usage Survey

1. **Clarity**: Were the instructions clear? (1-5 scale)
2. **Completeness**: Did the skill cover your use case? (Y/N)
3. **Efficiency**: Did this save you time? (Y/N, how much?)
4. **Quality**: Are you satisfied with the results? (1-5 scale)
5. **Improvement**: What would you change or add?
```

### 3. Continuous Improvement

**Usage Analytics**:
- Track which sections are accessed most
- Identify where users typically stop
- Monitor error rates and common issues
- Measure time to completion

**Regular Reviews**:
```markdown
## Monthly Skill Review Checklist

### Content Review
- [ ] Information still accurate and current
- [ ] Examples work with latest tool versions
- [ ] Links and references still valid
- [ ] Best practices align with current standards

### Usage Review
- [ ] Adoption rates and trends
- [ ] User feedback and suggestions
- [ ] Common support requests
- [ ] Performance metrics

### Improvement Planning
- [ ] Identify top improvement opportunities
- [ ] Plan updates and enhancements
- [ ] Schedule content refresh
- [ ] Update version and changelog
```

## User Experience Best Practices

### 1. Discoverability

**Effective Naming**:
- Use domain-specific prefixes: `react-`, `api-`, `database-`
- Include action words: `generate`, `review`, `deploy`, `test`
- Be specific: `react-component-generator` not `react-helper`

**Rich Metadata**:
```yaml
---
name: api-security-audit
description: Comprehensive security review checklist for REST APIs including authentication, authorization, input validation, and vulnerability assessment
tags: [api, security, audit, rest, authentication, vulnerability, checklist]
author: Security Team
version: 2.1.0
license: MIT
---
```

**Clear Purpose Statements**:
```markdown
# API Security Audit

Systematic security review process for REST APIs that identifies vulnerabilities, validates security controls, and ensures compliance with security standards.

## When to Use This Skill

- Before deploying APIs to production
- During security reviews and audits  
- When implementing new authentication methods
- After security incidents or vulnerability reports
- As part of regular security maintenance
```

### 2. Progressive Disclosure

**Layered Information Architecture**:
```markdown
# Quick Start (2 minutes)
Basic usage for common scenarios

# Complete Guide (15 minutes)  
Comprehensive instructions for all use cases

# Advanced Patterns (30 minutes)
Complex scenarios and customization options

# Reference Materials
Detailed technical specifications
```

**Contextual Help**:
```markdown
## Step 3: Configure Authentication

**Quick Option**: Use default JWT configuration
```bash
npm run setup:auth --default
```

**Custom Option**: Configure specific settings
```bash
npm run setup:auth --interactive
```

💡 **Tip**: Most teams can use the default option. Choose custom only if you have specific security requirements.

⚠️ **Warning**: Custom configuration requires understanding of JWT security implications.
```

### 3. Error Prevention and Recovery

**Proactive Error Prevention**:
```markdown
## Before You Start

### Prerequisites Check
- [ ] Node.js version 16 or higher installed
- [ ] Database server running and accessible
- [ ] Required environment variables set
- [ ] Sufficient disk space (minimum 1GB free)

### Common Setup Issues
If you encounter permission errors, run:
```bash
sudo chown -R $USER:$USER ~/.npm
```

If database connection fails, verify:
1. Database server is running
2. Connection string is correct
3. User has necessary permissions
```

**Clear Error Recovery**:
```markdown
## Troubleshooting

### Error: "Module not found"

**Cause**: Dependencies not installed or incorrect Node.js version

**Solution**:
1. Check Node.js version: `node --version` (should be 16+)
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules: `rm -rf node_modules package-lock.json`
4. Reinstall: `npm install`

**Prevention**: Always run `npm install` after pulling changes
```

## Performance and Scalability Best Practices

### 1. Efficient Content Organization

**Modular Structure**:
```markdown
# Main skill focuses on core workflow
# References provide detailed information
# Examples show specific scenarios
# Scripts automate repetitive tasks
```

**Lazy Loading Concepts**:
```markdown
## Core Workflow (Start Here)
Essential steps that most users need

## Advanced Configuration
[Link to references/advanced-config.md]

## Troubleshooting
[Link to references/troubleshooting.md]

## API Reference  
[Link to references/api-reference.md]
```

### 2. Scalable Skill Architecture

**Skill Composition**:
```yaml
---
name: full-stack-deployment
dependencies: 
  - frontend-build
  - backend-deployment
  - database-migration
description: Complete deployment workflow combining frontend, backend, and database skills
---
```

**Parameterized Skills**:
```markdown
## Configuration

Set these variables before starting:
- `FRAMEWORK`: react | vue | angular
- `DEPLOYMENT_TARGET`: aws | vercel | netlify
- `DATABASE_TYPE`: postgresql | mysql | mongodb

The skill will adapt instructions based on your choices.
```

### 3. Maintenance Efficiency

**Version Management Strategy**:
```markdown
## Changelog

### v2.1.0 (2025-12-22)
- Added support for TypeScript 5.0
- Updated React 18 patterns
- Fixed issue with Vite configuration

### v2.0.0 (2025-11-15)
- BREAKING: Changed API structure
- Added comprehensive testing guide
- Improved error handling
```

**Automated Quality Checks**:
```bash
#!/bin/bash
# validate-skill.sh

echo "Validating skill structure..."

# Check required files
if [ ! -f "SKILL.md" ]; then
    echo "❌ SKILL.md is required"
    exit 1
fi

# Validate frontmatter
if ! grep -q "^name:" SKILL.md; then
    echo "❌ Missing 'name' in frontmatter"
    exit 1
fi

# Check content quality
word_count=$(wc -w < SKILL.md)
if [ $word_count -lt 500 ]; then
    echo "❌ Content too short (${word_count} words, minimum 500)"
    exit 1
fi

echo "✅ Skill validation passed"
```

## Security and Privacy Best Practices

### 1. Secure Content Guidelines

**Avoid Sensitive Information**:
```markdown
❌ Bad: Include actual API keys or passwords
✅ Good: Use placeholder values and reference secure storage

## Configuration

Set your API key in environment variables:
```bash
export API_KEY="your-api-key-here"
```

Never commit API keys to version control.
```

**Safe Code Examples**:
```typescript
// ❌ Bad: Hardcoded secrets
const config = {
  apiKey: "sk-1234567890abcdef",
  dbPassword: "mypassword123"
};

// ✅ Good: Environment variables
const config = {
  apiKey: process.env.API_KEY,
  dbPassword: process.env.DB_PASSWORD
};
```

### 2. Tool Permission Management

**Principle of Least Privilege**:
```yaml
---
# Only request necessary permissions
allowed-tools: [Read, Write]  # Don't include Execute unless needed
---
```

**Permission Documentation**:
```markdown
## Required Permissions

This skill needs the following permissions:
- **Read**: Access existing configuration files
- **Write**: Create new component files and tests
- **Execute**: Run build and test commands

## Security Notes
- No network access required
- No sensitive data is stored or transmitted
- All generated files are saved locally
```

### 3. Data Handling

**Privacy-Conscious Examples**:
```markdown
## Example User Data

Use placeholder data in examples:
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

Never use real user data in documentation.
```

## Community and Collaboration Best Practices

### 1. Open Source Principles

**Clear Licensing**:
```yaml
---
license: MIT
author: Development Team <dev@company.com>
contributors: [Alice Smith, Bob Johnson]
---
```

**Contribution Guidelines**:
```markdown
## Contributing

We welcome contributions! Please:

1. **Fork and Branch**: Create feature branches from main
2. **Follow Standards**: Use our coding and documentation standards  
3. **Test Thoroughly**: Validate changes with real users
4. **Document Changes**: Update README and examples as needed
5. **Submit PR**: Include clear description of changes and rationale

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.
```

### 2. Knowledge Sharing

**Attribution and Credits**:
```markdown
## Acknowledgments

This skill was inspired by:
- [React Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Component Testing Strategies](https://testing-library.com/docs/guiding-principles/)

Special thanks to the community members who provided feedback and suggestions.
```

**Learning Resources**:
```markdown
## Further Learning

### Beginner Resources
- [React Official Tutorial](https://react.dev/learn)
- [Testing Fundamentals](https://testingjavascript.com/)

### Advanced Topics  
- [Advanced React Patterns](https://kentcdodds.com/blog/advanced-react-component-patterns)
- [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)

### Community
- [React Discord](https://discord.gg/react)
- [Testing Library Discord](https://discord.gg/testing-library)
```

### 3. Feedback and Iteration

**Feedback Mechanisms**:
```markdown
## Feedback

Help us improve this skill:

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Share ideas and ask questions  
- **Surveys**: Periodic usage and satisfaction surveys
- **Direct Contact**: Email the maintainers

Your feedback shapes the future of this skill!
```

**Community Engagement**:
```markdown
## Community Showcase

Share your success stories:
- How did this skill help your team?
- What improvements did you make?
- What other skills would be valuable?

Tag us on social media or create a discussion post!
```

---

## Summary

Creating excellent Agent Skills requires:

1. **User Focus**: Solve real problems with clear, actionable guidance
2. **Quality Content**: Write clearly, test thoroughly, iterate based on feedback
3. **Technical Excellence**: Follow standards, organize logically, maintain actively
4. **Community Mindset**: Share openly, collaborate effectively, learn continuously

Remember: Great skills make developers more productive, reduce errors, and enable teams to work more effectively together. Focus on user value, follow best practices, and continuously improve based on real-world usage.