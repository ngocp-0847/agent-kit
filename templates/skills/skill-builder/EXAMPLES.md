# Skill Builder Examples

Real-world examples of building Agent Skills using the skill-builder guide.

## Example 1: Simple Process Skill - Code Review Checklist

### Scenario
Team needs a standardized code review process to ensure consistent quality and knowledge sharing.

### Planning Phase

**Problem Definition**:
- Code reviews are inconsistent across team members
- Important checks are sometimes missed
- New team members don't know what to look for
- Reviews take too long or are too superficial

**Target Users**:
- Software developers (all levels)
- Code reviewers
- Team leads

**Success Criteria**:
- Consistent review quality across team
- Faster review process
- Better knowledge sharing
- Fewer bugs reaching production

### Implementation

**File Structure**:
```
code-review-checklist/
├── SKILL.md
├── README.md
├── references/
│   ├── security-checklist.md
│   └── performance-guidelines.md
└── assets/
    └── review-workflow.png
```

**Frontmatter**:
```yaml
---
name: code-review-checklist
description: Systematic code review process with quality gates and security checks
version: 1.0.0
license: MIT
author: Development Team
tags: [code-review, quality, process, security]
allowed-tools: [Read, Write]
---
```

**Content Structure**:
```markdown
# Code Review Checklist

Systematic approach to conducting thorough, constructive code reviews.

## Purpose

Provides a structured checklist for code reviews that ensures:
- Code quality and maintainability
- Security and performance considerations
- Team knowledge sharing
- Consistent review standards

## Instructions

### Phase 1: Initial Assessment (2-3 minutes)

**Objective**: Quick overview and scope understanding

**Steps**:
1. Read PR description and linked issues
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

### Phase 3: Security & Performance (5-10 minutes)

**Objective**: Check for security vulnerabilities and performance issues

**Security Checklist**:
- [ ] Input validation present
- [ ] No hardcoded secrets
- [ ] Authentication/authorization correct
- [ ] SQL injection prevention
- [ ] XSS prevention measures

**Performance Checklist**:
- [ ] No N+1 queries
- [ ] Efficient algorithms used
- [ ] Appropriate caching
- [ ] Database indexes considered
- [ ] Memory usage reasonable

### Phase 4: Documentation & Feedback (5 minutes)

**Objective**: Provide constructive feedback and ensure documentation

**Steps**:
1. Check if documentation is updated
2. Verify commit messages are clear
3. Write constructive feedback comments
4. Suggest improvements, not just problems
5. Approve or request changes

**Feedback Guidelines**:
- Be specific and actionable
- Explain the "why" behind suggestions
- Acknowledge good practices
- Offer to pair program on complex issues

## Examples

### Example 1: API Endpoint Review

**Code Change**: New REST API endpoint for user registration

**Review Process**:
1. **Initial Assessment**: Medium complexity, security-critical
2. **Quality Review**: Check input validation, error responses
3. **Security Review**: Verify password hashing, rate limiting
4. **Documentation**: Ensure API docs are updated

**Sample Feedback**:
```
✅ Good: Proper input validation on email format
🔧 Suggestion: Add rate limiting to prevent abuse
📚 Note: Please update API documentation with new endpoint
```

### Example 2: Frontend Component Review

**Code Change**: New React component for data visualization

**Review Process**:
1. **Initial Assessment**: Simple complexity, UI-focused
2. **Quality Review**: Check component structure, props validation
3. **Performance Review**: Verify memoization, re-render optimization
4. **Accessibility**: Check ARIA labels, keyboard navigation

## Best Practices

### For Reviewers
- ✅ Focus on code, not the person
- ✅ Provide specific, actionable feedback
- ✅ Acknowledge good practices
- ✅ Suggest alternatives, don't just criticize
- ✅ Be timely with reviews

### For Authors
- ✅ Keep PRs small and focused
- ✅ Write clear descriptions
- ✅ Respond to feedback constructively
- ✅ Test thoroughly before requesting review
- ✅ Update documentation as needed

## Quality Standards

A good code review should:
- Complete within 24 hours
- Provide at least 2 constructive comments
- Check all items in relevant checklists
- Result in improved code quality
- Share knowledge with the team
```

### Results

**Metrics After Implementation**:
- Review time reduced from 45 minutes to 25 minutes average
- 40% fewer bugs found in production
- 100% of reviews now check security items
- New team members onboard 60% faster

---

## Example 2: Knowledge Skill - API Design Principles

### Scenario
Development team needs consistent API design standards to ensure all services follow best practices.

### Planning Phase

**Problem Definition**:
- APIs are designed inconsistently across services
- New developers don't know API best practices
- Integration between services is difficult
- API documentation is inconsistent

**Target Users**:
- Backend developers
- API designers
- System architects
- Frontend developers (API consumers)

### Implementation

**File Structure**:
```
api-design-principles/
├── SKILL.md
├── README.md
├── references/
│   ├── rest-standards.md
│   ├── graphql-guidelines.md
│   └── versioning-strategy.md
└── assets/
    ├── api-hierarchy.png
    └── response-format.json
```

**Content Highlights**:
```markdown
# API Design Principles

## Core Principles

### 1. Resource-Oriented Design
Model business entities as resources with clear hierarchies.

**Good Examples**:
```
GET /users/123/orders/456
POST /users/123/orders
PUT /users/123/orders/456
DELETE /users/123/orders/456
```

**Bad Examples**:
```
GET /getUserOrder?userId=123&orderId=456
POST /createOrderForUser
PUT /updateUserOrder
DELETE /removeOrderFromUser
```

### 2. Consistent Response Format

**Standard Success Response**:
```json
{
  "status": "success",
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2025-12-22T10:00:00Z",
    "version": "1.0"
  }
}
```

**Standard Error Response**:
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  },
  "meta": {
    "timestamp": "2025-12-22T10:00:00Z",
    "request_id": "req_123456"
  }
}
```

## Implementation Checklist

### Planning Phase
- [ ] Define resource hierarchy
- [ ] Plan URL structure
- [ ] Design response formats
- [ ] Plan error handling
- [ ] Consider versioning strategy

### Development Phase
- [ ] Implement consistent endpoints
- [ ] Add proper HTTP status codes
- [ ] Include comprehensive error handling
- [ ] Add request/response validation
- [ ] Implement rate limiting

### Documentation Phase
- [ ] Create OpenAPI specification
- [ ] Write usage examples
- [ ] Document error codes
- [ ] Provide SDK/client examples
- [ ] Create integration guides
```

---

## Example 3: Template Skill - React Component Generator

### Scenario
Frontend team needs consistent React component structure and wants to automate boilerplate creation.

### Planning Phase

**Problem Definition**:
- Developers create components with different structures
- Boilerplate code is repetitive and error-prone
- Testing setup is inconsistent
- Documentation is often missing

**Target Users**:
- React developers
- Frontend team leads
- New team members

### Implementation

**File Structure**:
```
react-component-generator/
├── SKILL.md
├── README.md
├── templates/
│   ├── functional-component.tsx
│   ├── class-component.tsx
│   ├── component.test.tsx
│   └── component.stories.tsx
└── scripts/
    └── generate-component.js
```

**Content Structure**:
```markdown
# React Component Generator

## Template Types

### 1. Functional Component Template

**When to Use**: Most React components (default choice)

**Template**:
```typescript
import React from 'react';
import { {{ComponentName}}Props } from './{{ComponentName}}.types';
import styles from './{{ComponentName}}.module.css';

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.container} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

export default {{ComponentName}};
```

**Generated Files**:
- `{{ComponentName}}.tsx` - Main component
- `{{ComponentName}}.types.ts` - TypeScript interfaces
- `{{ComponentName}}.module.css` - Scoped styles
- `{{ComponentName}}.test.tsx` - Unit tests
- `{{ComponentName}}.stories.tsx` - Storybook stories

### 2. Hook Component Template

**When to Use**: Components that need custom hooks or complex state

**Template**:
```typescript
import React, { useState, useEffect } from 'react';
import { use{{ComponentName}} } from './use{{ComponentName}}';
import { {{ComponentName}}Props } from './{{ComponentName}}.types';

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = (props) => {
  const { state, actions } = use{{ComponentName}}(props);
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

## Usage Instructions

### Step 1: Choose Template Type
Determine which template fits your needs:
- **Functional**: Simple, presentational components
- **Hook**: Components with complex state logic
- **Class**: Legacy components (rare)

### Step 2: Provide Component Details
```
Component Name: UserProfile
Props: { userId: string, showAvatar?: boolean }
Features: [state, effects, custom-hook]
```

### Step 3: Generate Files
The skill will create:
1. Component file with proper structure
2. TypeScript types and interfaces
3. CSS module with base styles
4. Unit test with basic test cases
5. Storybook story with examples

### Step 4: Customize Generated Code
1. Implement component logic
2. Add specific styles
3. Write comprehensive tests
4. Update Storybook stories
5. Add documentation
```

---

## Example 4: Analysis Skill - Performance Audit

### Scenario
Team needs to regularly audit application performance and identify optimization opportunities.

### Planning Phase

**Problem Definition**:
- Performance issues are discovered too late
- No systematic approach to performance analysis
- Optimization efforts are ad-hoc
- Performance metrics are not tracked consistently

### Implementation

**Content Structure**:
```markdown
# Performance Audit

## Analysis Framework

### 1. Frontend Performance Metrics

**Core Web Vitals**:
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

**Additional Metrics**:
- Time to First Byte (TTFB): < 600ms
- First Contentful Paint (FCP): < 1.8s
- Speed Index: < 3.4s

### 2. Backend Performance Metrics

**Response Times**:
- API endpoints: < 200ms (95th percentile)
- Database queries: < 50ms (average)
- Cache hit ratio: > 90%

**Throughput**:
- Requests per second: Monitor baseline
- Concurrent users: Load test regularly
- Error rate: < 0.1%

## Audit Process

### Phase 1: Data Collection (30 minutes)

**Tools Setup**:
1. Configure Lighthouse CI
2. Set up performance monitoring
3. Enable database query logging
4. Install performance profilers

**Metrics Collection**:
1. Run Lighthouse audits on key pages
2. Collect Core Web Vitals data
3. Analyze server response times
4. Review database performance
5. Check CDN and caching effectiveness

### Phase 2: Analysis (45 minutes)

**Frontend Analysis**:
- Identify render-blocking resources
- Analyze bundle sizes and code splitting
- Check image optimization
- Review third-party script impact
- Assess CSS and JavaScript efficiency

**Backend Analysis**:
- Identify slow database queries
- Analyze API endpoint performance
- Review caching strategies
- Check server resource utilization
- Assess third-party service dependencies

### Phase 3: Recommendations (30 minutes)

**Prioritization Matrix**:
| Impact | Effort | Priority |
|--------|--------|----------|
| High   | Low    | P0       |
| High   | Medium | P1       |
| Medium | Low    | P2       |
| High   | High   | P3       |

**Report Format**:
```markdown
## Performance Audit Report

### Executive Summary
- Overall performance score: X/100
- Critical issues found: X
- Estimated improvement potential: X%

### Critical Issues (P0)
1. **Issue**: Large bundle size (2.5MB)
   **Impact**: 3s slower load time
   **Solution**: Implement code splitting
   **Effort**: 2 days

### Recommendations by Category

#### Frontend Optimizations
- [ ] Optimize images (WebP format, lazy loading)
- [ ] Implement code splitting
- [ ] Remove unused CSS/JS
- [ ] Enable compression (Gzip/Brotli)

#### Backend Optimizations
- [ ] Add database indexes
- [ ] Implement query optimization
- [ ] Enable response caching
- [ ] Optimize API payload sizes
```

## Quality Standards

A thorough performance audit should:
- Cover both frontend and backend
- Use standardized metrics
- Provide actionable recommendations
- Include effort estimates
- Track improvements over time
```

---

## Key Takeaways from Examples

### Success Patterns

1. **Clear Problem Definition**: Each skill solves a specific, well-defined problem
2. **Structured Approach**: Logical phases with clear objectives
3. **Actionable Content**: Specific steps that can be executed immediately
4. **Real Examples**: Concrete scenarios that users can relate to
5. **Quality Standards**: Clear criteria for success

### Content Organization

1. **Progressive Disclosure**: Start simple, add complexity gradually
2. **Scannable Format**: Use headers, lists, and formatting effectively
3. **Multiple Examples**: Show different scenarios and use cases
4. **Reference Materials**: Link to additional resources
5. **Troubleshooting**: Address common issues proactively

### Technical Implementation

1. **Proper Metadata**: Complete frontmatter with all relevant fields
2. **File Organization**: Logical structure with supporting materials
3. **Template Consistency**: Follow established patterns
4. **Version Control**: Track changes and improvements
5. **Testing Strategy**: Validate with real users and scenarios

### User Experience

1. **Clear Purpose**: Users immediately understand when to use the skill
2. **Quick Wins**: Provide immediate value in early steps
3. **Comprehensive Coverage**: Handle edge cases and variations
4. **Learning Support**: Help users improve their skills over time
5. **Community Building**: Enable sharing and collaboration

---

## Building Your Own Skills

Use these examples as templates for your own skill development:

1. **Start with a Real Problem**: Identify something your team struggles with
2. **Study Similar Skills**: Learn from existing implementations
3. **Follow the Patterns**: Use proven structures and formats
4. **Test Early and Often**: Validate with real users
5. **Iterate Based on Feedback**: Continuously improve based on usage

Remember: Great skills solve real problems, provide clear value, and make developers more productive. Focus on user needs, follow standards, and iterate based on feedback.