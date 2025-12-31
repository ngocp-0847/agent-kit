#!/bin/bash

echo "🚀 Installing NestJS Swagger Power for Kiro..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js >= 18.0.0"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to >= 18.0.0"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ NestJS Swagger Power installed successfully!"
    echo ""
    echo "📖 Usage:"
    echo "   1. Activate the power in Kiro"
    echo "   2. Use scan_nestjs_project to analyze your NestJS codebase"
    echo "   3. Check the generated Swagger documentation"
    echo ""
    echo "📚 Documentation:"
    echo "   - README.md - Overview and quick start"
    echo "   - steering/getting-started.md - Detailed usage guide"
    echo "   - steering/advanced-usage.md - Advanced features"
else
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi