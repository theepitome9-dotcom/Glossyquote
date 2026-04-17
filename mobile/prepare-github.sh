#!/bin/bash
# Script to prepare project for GitHub

echo "Preparing GLOSSY project for GitHub..."

# Create .gitignore if it doesn't exist
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
bun.lockb

# Expo
.expo/
.expo-shared/
dist/
web-build/

# Environment
.env
.env.local
.env.*.local

# OS
.DS_Store
.DS_Store?
._*
Thumbs.db

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build
build/
*.apk
*.ipa
*.aab

# Misc
.cache/
EOF

echo "✓ Created .gitignore"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/new"
echo "2. Create a new repository (name it 'glossy-app')"
echo "3. Run these commands:"
echo ""
echo "git init"
echo "git add ."
echo "git commit -m 'Initial commit - GLOSSY app'"
echo "git branch -M main"
echo "git remote add origin https://github.com/YOUR-USERNAME/glossy-app.git"
echo "git push -u origin main"
echo ""
echo "Then clone on Windows: git clone https://github.com/YOUR-USERNAME/glossy-app.git"
