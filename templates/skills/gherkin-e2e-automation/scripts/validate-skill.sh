#!/bin/bash

# Gherkin E2E Automation Skill Validation Script
# Validates the skill structure and content according to Agent Skills specification

set -e

SKILL_DIR="${1:-$(pwd)}"
ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((ERRORS++))
}

# Validation functions
validate_file_structure() {
    log_info "Validating file structure..."
    
    # Check required files
    if [[ ! -f "$SKILL_DIR/SKILL.md" ]]; then
        log_error "Missing required file: SKILL.md"
    else
        log_success "Found SKILL.md"
    fi
    
    # Check recommended files
    if [[ ! -f "$SKILL_DIR/README.md" ]]; then
        log_warning "Missing recommended file: README.md"
    else
        log_success "Found README.md"
    fi
    
    if [[ ! -f "$SKILL_DIR/EXAMPLES.md" ]]; then
        log_warning "Missing recommended file: EXAMPLES.md"
    else
        log_success "Found EXAMPLES.md"
    fi
    
    # Check optional directories
    if [[ -d "$SKILL_DIR/references" ]]; then
        log_success "Found references directory"
        
        # Check reference files
        local ref_files=("gherkin-best-practices.md" "playwright-patterns.md" "ai-integration-guide.md")
        for file in "${ref_files[@]}"; do
            if [[ -f "$SKILL_DIR/references/$file" ]]; then
                log_success "Found references/$file"
            else
                log_warning "Missing reference file: $file"
            fi
        done
    else
        log_warning "Missing references directory"
    fi
    
    if [[ -d "$SKILL_DIR/scripts" ]]; then
        log_success "Found scripts directory"
    else
        log_warning "Missing scripts directory"
    fi
}

validate_frontmatter() {
    log_info "Validating SKILL.md frontmatter..."
    
    if [[ ! -f "$SKILL_DIR/SKILL.md" ]]; then
        log_error "Cannot validate frontmatter: SKILL.md not found"
        return
    fi
    
    # Extract frontmatter
    local frontmatter=$(sed -n '/^---$/,/^---$/p' "$SKILL_DIR/SKILL.md")
    
    if [[ -z "$frontmatter" ]]; then
        log_error "No frontmatter found in SKILL.md"
        return
    fi
    
    # Check required fields
    local required_fields=("name" "description")
    for field in "${required_fields[@]}"; do
        if echo "$frontmatter" | grep -q "^$field:"; then
            log_success "Found required field: $field"
        else
            log_error "Missing required field: $field"
        fi
    done
    
    # Check recommended fields
    local recommended_fields=("version" "license" "author" "tags")
    for field in "${recommended_fields[@]}"; do
        if echo "$frontmatter" | grep -q "^$field:"; then
            log_success "Found recommended field: $field"
        else
            log_warning "Missing recommended field: $field"
        fi
    done
    
    # Validate name format (should be kebab-case)
    local name=$(echo "$frontmatter" | grep "^name:" | cut -d':' -f2 | xargs)
    if [[ "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
        log_success "Name follows kebab-case format: $name"
    else
        log_error "Name should be in kebab-case format: $name"
    fi
    
    # Check if name matches expected skill name
    if [[ "$name" == "gherkin-e2e-automation" ]]; then
        log_success "Name matches expected skill name"
    else
        log_warning "Name doesn't match expected: gherkin-e2e-automation (found: $name)"
    fi
}

validate_content_structure() {
    log_info "Validating content structure..."
    
    if [[ ! -f "$SKILL_DIR/SKILL.md" ]]; then
        log_error "Cannot validate content: SKILL.md not found"
        return
    fi
    
    local content=$(cat "$SKILL_DIR/SKILL.md")
    
    # Check required sections
    local required_sections=("# " "## Purpose" "## Instructions")
    for section in "${required_sections[@]}"; do
        if echo "$content" | grep -q "^$section"; then
            log_success "Found required section: $section"
        else
            log_error "Missing required section: $section"
        fi
    done
    
    # Check recommended sections
    local recommended_sections=("## Examples" "## Best Practices" "## Troubleshooting")
    for section in "${recommended_sections[@]}"; do
        if echo "$content" | grep -q "^$section"; then
            log_success "Found recommended section: $section"
        else
            log_warning "Missing recommended section: $section"
        fi
    done
    
    # Check for phase-based instructions
    if echo "$content" | grep -q "### Phase [0-9]"; then
        log_success "Found phase-based instruction structure"
    else
        log_warning "Consider using phase-based instruction structure"
    fi
    
    # Check content length
    local word_count=$(echo "$content" | wc -w)
    if [[ $word_count -gt 1000 ]]; then
        log_success "Content has adequate length ($word_count words)"
    else
        log_warning "Content might be too short ($word_count words, recommended: >1000)"
    fi
}

validate_gherkin_content() {
    log_info "Validating Gherkin-specific content..."
    
    if [[ ! -f "$SKILL_DIR/SKILL.md" ]]; then
        return
    fi
    
    local content=$(cat "$SKILL_DIR/SKILL.md")
    
    # Check for Gherkin-related keywords
    local gherkin_keywords=("Gherkin" "BDD" "Given" "When" "Then" "Feature" "Scenario")
    local found_keywords=0
    
    for keyword in "${gherkin_keywords[@]}"; do
        if echo "$content" | grep -qi "$keyword"; then
            ((found_keywords++))
        fi
    done
    
    if [[ $found_keywords -ge 5 ]]; then
        log_success "Found adequate Gherkin-related content ($found_keywords/7 keywords)"
    else
        log_warning "Limited Gherkin-related content ($found_keywords/7 keywords)"
    fi
    
    # Check for Playwright references
    if echo "$content" | grep -qi "playwright"; then
        log_success "Found Playwright references"
    else
        log_warning "Missing Playwright references"
    fi
    
    # Check for AI integration mentions
    if echo "$content" | grep -qi "AI\|artificial intelligence\|claude\|gpt"; then
        log_success "Found AI integration references"
    else
        log_warning "Missing AI integration references"
    fi
}

validate_examples() {
    log_info "Validating examples..."
    
    if [[ ! -f "$SKILL_DIR/EXAMPLES.md" ]]; then
        log_warning "No EXAMPLES.md file to validate"
        return
    fi
    
    local content=$(cat "$SKILL_DIR/EXAMPLES.md")
    
    # Check for code examples
    local code_blocks=$(echo "$content" | grep -c '```')
    if [[ $code_blocks -gt 10 ]]; then
        log_success "Found adequate code examples ($((code_blocks/2)) code blocks)"
    else
        log_warning "Limited code examples ($((code_blocks/2)) code blocks)"
    fi
    
    # Check for different example types
    local example_types=("Google Sheets" "Gherkin" "Playwright" "CLI" "TypeScript")
    local found_types=0
    
    for type in "${example_types[@]}"; do
        if echo "$content" | grep -qi "$type"; then
            ((found_types++))
        fi
    done
    
    if [[ $found_types -ge 4 ]]; then
        log_success "Found diverse example types ($found_types/5 types)"
    else
        log_warning "Limited example diversity ($found_types/5 types)"
    fi
}

validate_references() {
    log_info "Validating reference documentation..."
    
    if [[ ! -d "$SKILL_DIR/references" ]]; then
        log_warning "No references directory to validate"
        return
    fi
    
    # Check individual reference files
    local ref_files=(
        "gherkin-best-practices.md:Gherkin best practices guide"
        "playwright-patterns.md:Playwright patterns guide"
        "ai-integration-guide.md:AI integration guide"
    )
    
    for ref_file in "${ref_files[@]}"; do
        local file=$(echo "$ref_file" | cut -d':' -f1)
        local description=$(echo "$ref_file" | cut -d':' -f2)
        
        if [[ -f "$SKILL_DIR/references/$file" ]]; then
            log_success "Found $description"
            
            # Check file size
            local size=$(wc -w < "$SKILL_DIR/references/$file")
            if [[ $size -gt 500 ]]; then
                log_success "$file has adequate content ($size words)"
            else
                log_warning "$file might be too short ($size words)"
            fi
        else
            log_warning "Missing $description ($file)"
        fi
    done
}

validate_tags() {
    log_info "Validating skill tags..."
    
    if [[ ! -f "$SKILL_DIR/SKILL.md" ]]; then
        return
    fi
    
    local frontmatter=$(sed -n '/^---$/,/^---$/p' "$SKILL_DIR/SKILL.md")
    local tags=$(echo "$frontmatter" | grep "^tags:" | cut -d':' -f2)
    
    if [[ -n "$tags" ]]; then
        # Check for expected tags
        local expected_tags=("gherkin" "bdd" "playwright" "e2e-testing" "ai-generation")
        local found_tags=0
        
        for tag in "${expected_tags[@]}"; do
            if echo "$tags" | grep -q "$tag"; then
                ((found_tags++))
            fi
        done
        
        if [[ $found_tags -ge 3 ]]; then
            log_success "Found relevant tags ($found_tags/5 expected tags)"
        else
            log_warning "Limited relevant tags ($found_tags/5 expected tags)"
        fi
    else
        log_warning "No tags found in frontmatter"
    fi
}

check_file_permissions() {
    log_info "Checking file permissions..."
    
    # Check if script files are executable
    if [[ -d "$SKILL_DIR/scripts" ]]; then
        local script_files=$(find "$SKILL_DIR/scripts" -name "*.sh" -type f)
        
        if [[ -n "$script_files" ]]; then
            while IFS= read -r script; do
                if [[ -x "$script" ]]; then
                    log_success "Script is executable: $(basename "$script")"
                else
                    log_warning "Script is not executable: $(basename "$script")"
                fi
            done <<< "$script_files"
        fi
    fi
}

generate_report() {
    log_info "Generating validation report..."
    
    echo ""
    echo "=================================="
    echo "   SKILL VALIDATION REPORT"
    echo "=================================="
    echo "Skill Directory: $SKILL_DIR"
    echo "Validation Date: $(date)"
    echo ""
    
    if [[ $ERRORS -eq 0 && $WARNINGS -eq 0 ]]; then
        echo -e "${GREEN}✅ VALIDATION PASSED${NC}"
        echo "The skill meets all requirements and best practices."
    elif [[ $ERRORS -eq 0 ]]; then
        echo -e "${YELLOW}⚠️  VALIDATION PASSED WITH WARNINGS${NC}"
        echo "The skill meets requirements but has $WARNINGS warning(s)."
    else
        echo -e "${RED}❌ VALIDATION FAILED${NC}"
        echo "The skill has $ERRORS error(s) and $WARNINGS warning(s)."
    fi
    
    echo ""
    echo "Summary:"
    echo "- Errors: $ERRORS"
    echo "- Warnings: $WARNINGS"
    echo ""
    
    if [[ $ERRORS -gt 0 ]]; then
        echo "Please fix the errors before using this skill."
        exit 1
    elif [[ $WARNINGS -gt 0 ]]; then
        echo "Consider addressing the warnings to improve skill quality."
        exit 0
    else
        echo "Skill is ready for use!"
        exit 0
    fi
}

# Main validation flow
main() {
    echo "Gherkin E2E Automation Skill Validator"
    echo "======================================"
    echo ""
    
    if [[ ! -d "$SKILL_DIR" ]]; then
        log_error "Skill directory not found: $SKILL_DIR"
        exit 1
    fi
    
    log_info "Validating skill at: $SKILL_DIR"
    echo ""
    
    validate_file_structure
    echo ""
    
    validate_frontmatter
    echo ""
    
    validate_content_structure
    echo ""
    
    validate_gherkin_content
    echo ""
    
    validate_examples
    echo ""
    
    validate_references
    echo ""
    
    validate_tags
    echo ""
    
    check_file_permissions
    echo ""
    
    generate_report
}

# Show help if requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Gherkin E2E Automation Skill Validator"
    echo ""
    echo "Usage: $0 [SKILL_DIRECTORY]"
    echo ""
    echo "Validates the Gherkin E2E Automation skill structure and content"
    echo "according to the Agent Skills specification."
    echo ""
    echo "Arguments:"
    echo "  SKILL_DIRECTORY    Path to the skill directory (default: current directory)"
    echo ""
    echo "Options:"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Exit codes:"
    echo "  0    Validation passed (with or without warnings)"
    echo "  1    Validation failed (errors found)"
    echo ""
    exit 0
fi

# Run main validation
main "$@"