#!/bin/bash
# GLOSSY Deployment - Execute Now
# This script will guide you through the deployment process

echo "╔════════════════════════════════════════════════╗"
echo "║   GLOSSY App - Instant Deployment Script      ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Step 1: Login
echo "📱 Step 1: Login to Expo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "If you don't have an account, you can create one now."
echo "Visit: https://expo.dev/signup (opens in browser)"
echo ""

bunx eas-cli login

# Check if login was successful
if bunx eas-cli whoami > /dev/null 2>&1; then
    echo ""
    echo "✅ Login successful!"
    echo ""
else
    echo ""
    echo "❌ Login failed. Please try again."
    exit 1
fi

# Step 2: Configure project
echo "⚙️  Step 2: Configuring project..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bunx eas-cli build:configure

echo ""
echo "🏗️  Step 3: Starting build for iPhone..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "This will take approximately 15-20 minutes."
echo "You'll receive an email when the build is complete."
echo ""
echo "Build starting..."
echo ""

bunx eas-cli build --profile development --platform ios --non-interactive

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║            Build Started! 🎉                   ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "⏱️  Estimated time: 15-20 minutes"
echo "📧 You'll receive an email when complete"
echo "🔗 Check status at: https://expo.dev"
echo ""
echo "To check build status from terminal:"
echo "  bunx eas-cli build:list"
echo ""
echo "When build completes:"
echo "1. Open the download link on your iPhone"
echo "2. Install the app"
echo "3. Trust certificate: Settings → General → VPN & Device Management"
echo ""
