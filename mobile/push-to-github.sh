#!/bin/bash
# Script to push GLOSSY app to your GitHub repository

echo "╔═══════════════════════════════════════════════╗"
echo "║  Push GLOSSY App to Your GitHub Repository   ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

echo "Please enter your GitHub repository URL"
echo "It should look like: https://github.com/YOUR-USERNAME/glossy-app.git"
echo ""
read -p "Paste your repository URL here: " GITHUB_URL

if [ -z "$GITHUB_URL" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

echo ""
echo "Setting up GitHub remote..."

# Add your GitHub as a new remote
git remote add github "$GITHUB_URL"

echo ""
echo "Pushing code to GitHub..."
echo "You may be prompted for your GitHub username and password/token"
echo ""

# Push to GitHub
git push github main

if [ $? -eq 0 ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════╗"
    echo "║          ✅ Success! Code pushed!             ║"
    echo "╚═══════════════════════════════════════════════╝"
    echo ""
    echo "Your code is now on GitHub at:"
    echo "$GITHUB_URL"
    echo ""
    echo "Next steps:"
    echo "1. Go to your Windows computer"
    echo "2. Open PowerShell"
    echo "3. Run: git clone $GITHUB_URL"
    echo "4. Run: cd glossy-app"
    echo "5. Run: bun install"
    echo "6. Run: bunx eas-cli login"
    echo "7. Run: bunx eas-cli build --profile development --platform ios"
    echo ""
else
    echo ""
    echo "❌ Push failed. This might be because:"
    echo "1. Wrong repository URL"
    echo "2. Need GitHub authentication"
    echo "3. Repository already has content"
    echo ""
    echo "Try using a Personal Access Token instead:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Generate new token (classic)"
    echo "3. Give it 'repo' permissions"
    echo "4. Use token as password when prompted"
fi
