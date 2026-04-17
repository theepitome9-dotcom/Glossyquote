# 📱 Quick Command Reference

## First Time Setup (Do Once)
```bash
eas login                    # Login to Expo account
eas build:configure          # Configure project
```

## Development Builds (For Testing on Your Phone)
```bash
eas build --profile development --platform ios      # iPhone only
eas build --profile development --platform android  # Android only
eas build --profile development --platform all      # Both platforms
```

## Production Builds (For App Stores)
```bash
eas build --profile production --platform ios       # iPhone App Store
eas build --profile production --platform android   # Google Play Store
eas build --profile production --platform all       # Both stores
```

## Submit to Stores
```bash
eas submit --platform ios --profile production      # Submit to App Store
eas submit --platform android --profile production  # Submit to Play Store
```

## Check Status
```bash
eas build:list              # List all builds
eas build:view [build-id]   # View specific build
```

## Push Updates (After Initial Release)
```bash
eas update --branch production --message "Bug fixes"
```

## Account Management
```bash
eas whoami                  # Check logged in user
eas logout                  # Logout
eas login                   # Login
```

---

## What To Run RIGHT NOW

To get your app on your iPhone **today**:

```bash
eas login
eas build --profile development --platform ios
```

Wait 15-20 minutes, then install from the link you receive!

---

## Files Created for You

✅ `app.json` - App configuration (updated with GLOSSY settings)
✅ `eas.json` - Build configurations for development & production
✅ `deploy-setup.sh` - Automated deployment script
✅ `DEPLOYMENT_GUIDE.md` - Full deployment documentation
✅ `QUICK_START_DEPLOY.md` - Quick start guide
✅ `DEPLOY_NOW.md` - Step-by-step instructions
✅ This file - Command reference

You're ready to deploy! 🚀
