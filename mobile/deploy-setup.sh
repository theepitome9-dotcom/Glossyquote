#!/bin/bash
# GLOSSY App - Deployment Setup Script
# Run this script to configure and build your app

echo "================================================"
echo "GLOSSY App - Deployment Setup"
echo "================================================"
echo ""

# Step 1: Check if EAS CLI is installed
echo "Step 1: Checking EAS CLI installation..."
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    bun add -g eas-cli
    export PATH="/tmp/opencode/cache/.bun/bin:$PATH"
else
    echo "✓ EAS CLI is already installed"
fi

echo ""
echo "Step 2: You need to login to your Expo account"
echo "If you don't have one, create a free account at: https://expo.dev/signup"
echo ""
read -p "Press ENTER to login to Expo..."
eas login

echo ""
echo "Step 3: Configuring EAS Build..."
eas build:configure

echo ""
echo "================================================"
echo "Setup Complete! Now you can build your app."
echo "================================================"
echo ""
echo "Choose an option:"
echo ""
echo "1. Build for iPhone (Development) - Test on your device"
echo "   Command: eas build --profile development --platform ios"
echo ""
echo "2. Build for Android (Development) - Test on your device"
echo "   Command: eas build --profile development --platform android"
echo ""
echo "3. Build for BOTH platforms (Development)"
echo "   Command: eas build --profile development --platform all"
echo ""
echo "4. Build for Production (App Store/Play Store)"
echo "   Command: eas build --profile production --platform all"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Building for iPhone (Development)..."
        eas build --profile development --platform ios
        ;;
    2)
        echo ""
        echo "Building for Android (Development)..."
        eas build --profile development --platform android
        ;;
    3)
        echo ""
        echo "Building for BOTH platforms (Development)..."
        eas build --profile development --platform all
        ;;
    4)
        echo ""
        echo "Building for Production..."
        eas build --profile production --platform all
        ;;
    *)
        echo ""
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "================================================"
echo "Build started! This will take 15-30 minutes."
echo "================================================"
echo ""
echo "You'll receive an email when the build is complete."
echo "Check build status at: https://expo.dev"
echo ""
echo "To check build status from terminal:"
echo "  eas build:list"
echo ""
echo "To view specific build details:"
echo "  eas build:view [build-id]"
echo ""
