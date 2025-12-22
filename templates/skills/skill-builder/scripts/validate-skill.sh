#!/bin/bash

# Agent Skills Validation Script
# Validates skill structure and content according to agentskills.io specification

set -e

SKILL_DIR="${1:-.}"
ERRORS=0

echo "🔍 Validating Agent Skill in: $SKILL_DIR"
echo "================================================"

# Check if directory exists
if [ ! -d "$SKILL_DIR" ]; then
    echo "❌ Directory not found: $SKILL_DIR"
    exit 1
fi

cd "$SKILL_DIR"

# 1. Check required files
echo "📁 Checking file structure..."

if [ ! -f "SKILL.md" ]; then
    echo "❌ Missing required file: SKILL.md"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ SKILL.md found"
fi

# 2. Validate frontmatter
echo ""
echo "📋 Validating frontmatter..."

if [ -f "SKILL.md" ]; then
    # Check if frontmatter exists
    if ! grep -q "^---$" SKILL.md; then
        echo "❌ Missing frontmatter delimiters (---)"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Frontmatter delimiters found"
        
        # Extract frontmatter
        FRONTMATTER=$(sed -n '/^---$/,/^---$/p' SKILL.md | sed '1d;$d')
        
        # Check required fields
        if ! echo "$FRONTMATTER" | grep -q "^name:"; then
            echo "❌ Missing required field: name"
            ERRORS=$((ERRORS + 1))
        else
            NAME=$(echo "$FRONTMATTER" | grep "^name:" | cut -d':' -f2 | xargs)
            echo "✅ Name: $NAME"
            
            # Validate name format (kebab-case)
            if ! echo "$NAME" | grep -qE '^[a-z][a-z0-9-]*[a-z0-9]$'; then
                echo "⚠️  Name should be in kebab-case format"
            fi
        fi
        
        if ! echo "$FRONTMATTER" | grep -q "^description:"; then
            echo "❌ Missing required field: description"
            ERRORS=$((ERRORS + 1))
        else
            DESCRIPTION=$(echo "$FRONTMATTER" | grep "^description:" | cut -d':' -f2- | xargs)
            echo "✅ Description: ${DESCRIPTION:0:50}..."
            
            # Check description length
            if [ ${#DESCRIPTION} -lt 20 ]; then
                echo "⚠️  Description is quite short (${#DESCRIPTION} chars)"
            fi
        fi
        
        # Check recommended fields
        if echo "$FRONTMATTER" | grep -q "^version:"; then
            VERSION=$(echo "$FRONTMATTER" | grep "^version:" | cut -d':' -f2 | xargs)
            echo "✅ Version: $VERSION"
        else
            echo "⚠️  Recommended field missing: version"
        fi
        
        if echo "$FRONTMATTER" | grep -q "^license:"; then
            LICENSE=$(echo "$FRONTMATTER" | grep "^license:" | cut -d':' -f2 | xargs)
            echo "✅ License: $LICENSE"
        else
            echo "⚠️  Recommended field missing: license"
        fi
    fi
fi

# 3. Check content structure
echo ""
echo "📝 Validating content structure..."

if [ -f "SKILL.md" ]; then
    # Check content length
    WORD_COUNT=$(wc -w < SKILL.md)
    if [ $WORD_COUNT -lt 500 ]; then
        echo "❌ Content too short ($WORD_COUNT words, minimum 500 recommended)"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Content length: $WORD_COUNT words"
    fi
    
    # Check required sections
    if grep -q "^## Purpose" SKILL.md; then
        echo "✅ Purpose section found"
    else
        echo "❌ Missing required section: ## Purpose"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "^## Instructions" SKILL.md; then
        echo "✅ Instructions section found"
    else
        echo "❌ Missing required section: ## Instructions"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check recommended sections
    if grep -q "^## Examples" SKILL.md; then
        echo "✅ Examples section found"
    else
        echo "⚠️  Recommended section missing: ## Examples"
    fi
    
    if grep -q "^## Best Practices" SKILL.md; then
        echo "✅ Best Practices section found"
    else
        echo "⚠️  Recommended section missing: ## Best Practices"
    fi
fi

# 4. Check optional files
echo ""
echo "📚 Checking optional files..."

if [ -f "README.md" ]; then
    echo "✅ README.md found"
else
    echo "⚠️  Optional file missing: README.md (recommended for documentation)"
fi

if [ -f "EXAMPLES.md" ]; then
    echo "✅ EXAMPLES.md found"
else
    echo "⚠️  Optional file missing: EXAMPLES.md (recommended for usage examples)"
fi

if [ -d "references" ]; then
    REF_COUNT=$(find references -name "*.md" | wc -l)
    echo "✅ References directory found ($REF_COUNT files)"
else
    echo "ℹ️  Optional directory missing: references/"
fi

if [ -d "assets" ]; then
    ASSET_COUNT=$(find assets -type f | wc -l)
    echo "✅ Assets directory found ($ASSET_COUNT files)"
else
    echo "ℹ️  Optional directory missing: assets/"
fi

if [ -d "scripts" ]; then
    SCRIPT_COUNT=$(find scripts -type f | wc -l)
    echo "✅ Scripts directory found ($SCRIPT_COUNT files)"
else
    echo "ℹ️  Optional directory missing: scripts/"
fi

# 5. Summary
echo ""
echo "📊 Validation Summary"
echo "================================================"

if [ $ERRORS -eq 0 ]; then
    echo "🎉 Skill validation passed! No critical errors found."
    echo ""
    echo "💡 Tips for improvement:"
    echo "   - Add missing recommended sections"
    echo "   - Include usage examples"
    echo "   - Add supporting documentation"
    echo "   - Consider adding validation scripts"
    exit 0
else
    echo "❌ Skill validation failed with $ERRORS error(s)."
    echo ""
    echo "🔧 Please fix the errors above and run validation again."
    exit 1
fi