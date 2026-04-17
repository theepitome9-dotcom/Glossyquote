# 🚀 DEPLOY NOW - Copy and Paste These Commands

## You need to run these commands in YOUR terminal (I cannot login for you)

Open your terminal in the project directory and copy-paste these commands one by one:

---

## Option 1: Automated Script (Recommended)

```bash
./deploy-now.sh
```

This script will:
1. Prompt you to login to Expo
2. Configure your project
3. Start the build for iPhone
4. Show you the build status

---

## Option 2: Manual Commands (If script doesn't work)

Run these commands one at a time:

### Command 1: Login to Expo
```bash
bunx eas-cli login
```
- If you don't have an account, create one at: https://expo.dev/signup
- Enter your email and password when prompted

### Command 2: Configure Project
```bash
bunx eas-cli build:configure
```
- Press ENTER to accept defaults
- EAS will set up your project automatically

### Command 3: Build for iPhone
```bash
bunx eas-cli build --profile development --platform ios
```
- Answer "Yes" to any prompts about credentials
- Build will start on Expo's servers
- Takes 15-20 minutes

### Command 4: Check Build Status (Optional)
```bash
bunx eas-cli build:list
```

---

## What Happens Next?

1. ⏱️  **Build starts** - Takes 15-20 minutes
2. 📧 **Email notification** - You'll get a link when done
3. 📱 **Install on iPhone** - Open link on your iPhone
4. ✅ **Trust certificate** - Settings → General → VPN & Device Management
5. 🎉 **App installed** - Open GLOSSY on your iPhone!

---

## Alternative: Build for Both iPhone AND Android

```bash
bunx eas-cli build --profile development --platform all
```

---

## I'm Ready! Which Command Should I Run?

**Easiest way:**
```bash
./deploy-now.sh
```

**Or run manually:**
```bash
bunx eas-cli login
bunx eas-cli build:configure
bunx eas-cli build --profile development --platform ios
```

---

## Important Notes

- You MUST run these in YOUR terminal (not in this chat)
- I cannot run the login command for you (requires your credentials)
- The build happens on Expo's servers (not your computer)
- You can close terminal after build starts - it will continue
- You'll get an email with download link when done

---

## Need Help?

If you get stuck:
1. Check https://expo.dev for build status
2. Run: `bunx eas-cli build:list` to see all builds
3. The build will email you when complete - be patient!

**Your app will be on your iPhone in ~20 minutes!** 🚀
