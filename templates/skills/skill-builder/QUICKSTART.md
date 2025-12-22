# Quick Start: Building Your First Agent Skill

Get started building Agent Skills in 15 minutes.

## What You'll Build

A simple code review checklist skill that helps developers conduct consistent, thorough code reviews.

## Prerequisites

- Text editor or IDE
- Basic understanding of Markdown
- Familiarity with your AI coding agent (Cursor, Copilot, etc.)

## Step 1: Create Skill Directory (2 minutes)

```bash
# Create skill directory
mkdir -p my-skills/code-review-checklist

# Navigate to directory
cd my-skills/code-review-checklist
```

## Step 2: Create SKILL.md with Frontmatter (3 minutes)

Create `SKILL.md` with the following content:

```markdown
---
name: code-review-checklist
description: Systematic code review process with quality gates and best practices
version: 1.0.0
license: MIT
tags: [code-review, quality, process]
---

# Code Review Checklist

Systematic approach to conducting thorough, constructive code reviews.

## Purpose

This skill provides a structured checklist for code reviews that ensures:
- Code quality and maintainability
- Security and performance considerations
- Team knowledge sharing
- Consistent review standards

## Instructions

### Phase 1: Initial Assessment (2-3 minutes)

**Objective**: Quick overview and scope understanding

**Steps**:
1. Read the PR description and linked issues
2. Check if automated tests pass
3. Assess complexity (simple/medium/complex)
4. Estimate review time needed

**Expected Output**:
- Understanding of code purpose
- Review complexity assessment
- Time allocation plan

### Phase 2: Code Quality Review (10-15 minutes)

**Objective**: Evaluate code structure and implementation

**Checklist**:
- [ ] Code follows team style guidelines
- [ ] Functions are single-purpose and well-named
- [ ] Complex logic is commented
- [ ] No obvious bugs or logic errors
- [ ] Error handling is appropriate
- [ ] No code duplication (DRY principle)
- [ ] Tests cover new functionality

### Phase 3: Provide Feedback (5 minutes)

**Objective**: Give constructive, actionable feedback

**Steps**:
1. Write specific, actionable comments
2. Explain the "why" behind suggestions
3. Acknowledge good practices
4. Approve or request changes

**Feedback Guidelines**:
- Be specific and actionable
- Focus on code, not the person
- Suggest improvements, not just problems
- Offer to pair program on complex issues

## Examples

### Example 1: API Endpoint Review

**Code Change**: New REST API endpoint for user registration

**Review Process**:
1. **Initial Assessment**: Medium complexity, security-critical
2. **Quality Review**: Check input validation, error responses
3. **Security Review**: Verify password hashing, rate limiting
4. **Feedback**: Provide specific suggestions for improvements

**Sample Feedback**:
```
✅ Good: Proper input validation on email format
🔧 Suggestion: Add rate limiting to prevent abuse
📚 Note: Please update API documentation with new endpoint
```

## Best Practices

### For Reviewers
- ✅ Focus on code, not the person
- ✅ Provide specific, actionable feedback
- ✅ Acknowledge good practices
- ✅ Be timely with reviews

### For Authors
- ✅ Keep PRs small and focused
- ✅ Write clear descriptions
- ✅ Respond to feedback constructively
- ✅ Test thoroughly before requesting review

## Quality Standards

A good code review should:
- Complete within 24 hours
- Provide at least 2 constructive comments
- Check all items in relevant checklists
- Result in improved code quality
```

## Step 3: Test Your Skill (5 minutes)

### Option A: Manual Test

1. Read through your skill as if you're a new user
2. Check if instructions are clear and actionable
3. Verify examples make sense
4. Ensure all sections are complete

### Option B: Automated Validation

If you have the validation script:

```bash
# From the skill-builder directory
./scripts/validate-skill.sh /path/to/code-review-checklist
```

## Step 4: Install in Your AI Agent (2 minutes)

### For Cursor IDE

```bash
cp -r code-review-checklist ~/.cursor/skills/
# or
cp -r code-review-checklist /path/to/your/project/.cursor/skills/
```

### For GitHub Copilot

```bash
cp -r code-review-checklist ~/.claude/skills/
# or
cp -r code-review-checklist /path/to/your/project/.claude/skills/
```

### For Windsurf

```bash
cp -r code-review-checklist ~/.windsurf/skills/
# or
cp -r code-review-checklist /path/to/your/project/.windsurf/skills/
```

### For Kiro

```bash
cp -r code-review-checklist ~/.kiro/steering/skills/
# or
cp -r code-review-checklist /path/to/your/project/.kiro/steering/skills/
```

## Step 5: Try It Out (3 minutes)

### Test with Your AI Agent

1. Open your AI coding agent
2. Start a new conversation
3. Try one of these prompts:

```
Use code-review-checklist to review this pull request
```

or

```
I need to review some code. Can you help me with the code-review-checklist?
```

### Expected Behavior

Your AI agent should:
1. Recognize the skill by name or tags
2. Load the skill instructions
3. Guide you through the review process
4. Follow the phases and checklists you defined

## Next Steps

### Enhance Your Skill

1. **Add More Examples**: Include different code review scenarios
2. **Create README.md**: Add overview and documentation
3. **Add References**: Create supporting documentation
4. **Include Assets**: Add diagrams or screenshots
5. **Write Scripts**: Automate repetitive tasks

### Build More Skills

Now that you've built your first skill, try creating:

- **Template Skills**: Generate boilerplate code
- **Analysis Skills**: Evaluate code quality or performance
- **Knowledge Skills**: Document best practices and guidelines
- **Process Skills**: Define workflows and procedures

### Share Your Skill

1. **Add to Git**: Commit your skill to version control
2. **Share with Team**: Push to shared repository
3. **Contribute**: Share with the community
4. **Get Feedback**: Iterate based on usage

## Common Issues

### Skill Not Recognized

**Problem**: AI agent doesn't find your skill

**Solutions**:
- Check file location and naming (SKILL.md must be uppercase)
- Verify frontmatter syntax (must have `---` delimiters)
- Restart your AI agent
- Explicitly mention skill name in prompt

### Instructions Unclear

**Problem**: Users can't follow your instructions

**Solutions**:
- Add more specific details and examples
- Test with someone unfamiliar with the topic
- Break down complex steps into smaller ones
- Provide context and rationale

### Poor Results

**Problem**: Skill doesn't produce expected outcomes

**Solutions**:
- Review and refine instructions
- Add more examples and edge cases
- Include validation steps
- Get feedback from actual users

## Resources

### Documentation
- **Full Guide**: See SKILL.md for comprehensive instructions
- **Examples**: Check EXAMPLES.md for detailed scenarios
- **Best Practices**: Read references/best-practices.md
- **Specification**: Review references/specification-guide.md

### Community
- **GitHub**: Share and discover skills
- **Forums**: Ask questions and get help
- **Discord**: Real-time community support

### Tools
- **Validation Script**: `scripts/validate-skill.sh`
- **Templates**: Use existing skills as templates
- **Examples**: Study high-quality skills

## Congratulations! 🎉

You've built your first Agent Skill! You now know how to:

- ✅ Create skill directory structure
- ✅ Write frontmatter metadata
- ✅ Organize content with phases and steps
- ✅ Include examples and best practices
- ✅ Install skills in AI agents
- ✅ Test and validate skills

Keep building, keep improving, and share your skills with the community!

---

**Time to complete**: ~15 minutes
**Difficulty**: Beginner
**Next**: Build more complex skills or enhance this one