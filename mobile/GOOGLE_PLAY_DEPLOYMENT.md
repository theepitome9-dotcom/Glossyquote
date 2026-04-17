# Google Play Store Deployment Guide for GLOSSY

## 📱 Complete Step-by-Step Guide

Congratulations on setting up your Google Play Developer account! This guide will walk you through deploying your GLOSSY app to the Google Play Store.

---

## 📋 Prerequisites Checklist

Before you start, make sure you have:
- ✅ Google Play Developer account (£25 paid)
- ✅ Google account with access to Play Console
- ✅ Your app is working correctly in Vibecode
- ✅ RevenueCat is set up for payments

---

## 🎯 Part 1: Google Play Console Setup

### Step 1: Create Your App in Play Console

1. **Go to Google Play Console:**
   - Visit: https://play.google.com/console
   - Sign in with your Google account

2. **Create a New App:**
   - Click "Create app" button
   - Fill in the details:
     - **App name:** GLOSSY
     - **Default language:** English (United Kingdom)
     - **App or game:** App
     - **Free or paid:** Free
   - Accept declarations and click "Create app"

3. **Note Your Package Name:**
   - Your package name is: `com.glossy.paintingestimator`
   - This must match exactly what's in your app.json file

---

## 🔑 Part 2: Set Up Service Account for Automated Deployment

This allows Expo/EAS to upload builds automatically to Google Play.

### Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com
   - Sign in with the same Google account

2. **Create a New Project:**
   - Click "Select a project" dropdown at the top
   - Click "NEW PROJECT"
   - **Project name:** GLOSSY App
   - Click "Create"

3. **Enable Google Play Developer API:**
   - In the search bar, type "Google Play Android Developer API"
   - Click on it and click "Enable"

### Step 2: Create a Service Account

1. **Navigate to Service Accounts:**
   - In Google Cloud Console, go to: "IAM & Admin" > "Service Accounts"
   - Or visit: https://console.cloud.google.com/iam-admin/serviceaccounts

2. **Create Service Account:**
   - Click "CREATE SERVICE ACCOUNT"
   - **Service account name:** GLOSSY Deployment
   - **Service account ID:** glossy-deployment (auto-filled)
   - Click "Create and Continue"

3. **Grant Permissions:**
   - Click "Continue" (no roles needed here)
   - Click "Done"

4. **Create JSON Key:**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "ADD KEY" > "Create new key"
   - Select "JSON"
   - Click "Create"
   - **IMPORTANT:** A JSON file will download - keep this safe!

### Step 3: Link Service Account to Play Console

1. **Back in Google Play Console:**
   - Go to: Settings (gear icon) > API access
   - Scroll to "Service accounts"

2. **Grant Access:**
   - You should see your service account listed
   - Click "Grant access"
   - Under "App permissions", select "GLOSSY"
   - Under "Account permissions", grant:
     - ✅ View app information and download bulk reports
     - ✅ Create and edit draft apps
     - ✅ Release apps to testing tracks
     - ✅ Release to production, exclude devices, and use Play App Signing
   - Click "Invite user"
   - Click "Send invite"

---

## 📦 Part 3: Prepare App Assets

You'll need specific images for the Play Store listing.

### Required Assets:

1. **App Icon** (already have: `glossy-icon.jpg`)
   - 512 x 512 px PNG (with transparency) or JPEG
   - We'll use your existing icon

2. **Feature Graphic** (required)
   - 1024 x 500 px PNG or JPEG
   - This is the banner shown at the top of your store listing
   - **Action needed:** You need to create this or I can help design it

3. **Screenshots** (minimum 2, up to 8)
   - Phone screenshots:
     - Minimum dimension: 320px
     - Maximum dimension: 3840px
     - Aspect ratio: 16:9 or 9:16
   - **Action needed:** Take screenshots of your app from Vibecode

---

## 🚀 Part 4: Build Your App with EAS

Now let's build your Android app!

### Step 1: Set Up EAS Project ID

In the Vibecode app, I'll need to set your EAS project ID. Tell me to continue when you're ready, and I'll guide you through linking your Expo account.

### Step 2: Configure Google Service Account

1. **Upload the JSON Key:**
   - You need to upload the JSON file you downloaded earlier
   - You can't do this directly in Vibecode, so we'll use EAS CLI

2. **In Vibecode, you'll run:**
   ```bash
   # This tells me to publish the app (I'll handle the build setup)
   ```

---

## 🏗️ Part 5: Build Process

### For Internal Testing (Start Here):

1. **Build APK for Testing:**
   - Tell me: "Build Android APK for testing"
   - I'll run: `eas build --profile preview --platform android`
   - Build takes 15-20 minutes
   - You'll get a download link for the APK

2. **Test the APK:**
   - Install the APK on your Android device
   - Test all features, especially payments
   - Make sure everything works

### For Production Release:

1. **Build AAB (App Bundle):**
   - Tell me: "Build Android for production"
   - I'll run: `eas build --profile production --platform android`
   - Build takes 15-20 minutes
   - AAB file is automatically uploaded to Google Play

---

## 🎯 Part 6: Create Store Listing

While the build is processing, set up your store listing.

### Step 1: App Content

1. **In Play Console, go to "App content"**
2. **Complete all required sections:**

   **Privacy Policy:**
   - You need a privacy policy URL
   - Use a generator if needed: https://www.privacypolicygenerator.info/
   - Enter the URL

   **App Access:**
   - Select "All functionality is available without special access"
   - Or explain if login is required

   **Ads:**
   - Does your app contain ads? No
   - Click "Save"

   **Content Ratings:**
   - Click "Start questionnaire"
   - Answer questions about your app content
   - Get your rating

   **Target Audience:**
   - Select age groups: 18+
   - Click "Save"

   **News Apps:**
   - Is this a news app? No

   **COVID-19 Contact Tracing:**
   - No

   **Data Safety:**
   - Complete the data safety section
   - Specify what data you collect
   - Click "Save"

### Step 2: Store Settings

1. **Go to "Store settings" > "Main store listing"**

2. **Fill in Required Information:**

   **App Details:**
   - **App name:** GLOSSY - Painting & Trade Estimator
   - **Short description:** Get instant quotes for painting, plastering & flooring jobs
   - **Full description:**
     ```
     GLOSSY is the UK's premier painting and decorating estimator app. Get instant, accurate quotes for:

     ✨ Painting & Decorating
     - Interior and exterior painting
     - Single rooms to entire houses
     - Professional breakdown of costs

     🏗️ Plastering Services
     - Skimming walls and ceilings
     - Dry lining
     - Board and skim

     🏡 Flooring Installation
     - Laminate flooring
     - Room-specific quotes
     - Material and labour costs included

     For Customers:
     - Instant detailed estimates
     - Professional job listings
     - Browse qualified tradespeople
     - Post jobs and get quotes

     For Trade Professionals:
     - Generate estimates in seconds
     - Win more jobs with accurate pricing
     - Professional portfolio
     - Connect with customers

     Download GLOSSY today and transform the way you estimate trade jobs!
     ```

3. **Upload Assets:**
   - **App icon:** Upload your 512x512 icon
   - **Feature graphic:** Upload 1024x500 banner (create if needed)
   - **Phone screenshots:** Upload at least 2 screenshots

4. **Categorization:**
   - **App category:** Business
   - **Tags:** Business, Tools, Productivity

5. **Contact Details:**
   - **Email:** Your support email
   - **Website:** (optional)
   - **Phone:** (optional)

6. **Click "Save"**

---

## 🎮 Part 7: Testing Track Setup

### Step 1: Create Internal Testing Track

1. **Go to "Testing" > "Internal testing"**
2. **Create a new release:**
   - Click "Create new release"
   - **Release name:** 1.0.0 (Internal Test)

3. **Add Your Build:**
   - After your AAB is uploaded (from EAS), select it
   - Or upload the AAB manually if needed

4. **Add Testers:**
   - Create an email list with your testers
   - Add your own email for testing

5. **Click "Save" and "Review release"**
6. **Click "Start rollout to Internal testing"**

### Step 2: Test the Internal Build

1. **Get the Testing Link:**
   - You'll get a link to join the internal test
   - Open it on your Android device

2. **Download and Test:**
   - Install from Play Store
   - Test all features thoroughly
   - Test payments with test cards

---

## 🚢 Part 8: Production Release

Once internal testing is successful:

### Step 1: Create Production Release

1. **Go to "Production" in Play Console**
2. **Create new release:**
   - Click "Create new release"
   - Select your tested build
   - **Release name:** 1.0.0
   - **Release notes:**
     ```
     🎉 Welcome to GLOSSY!

     Get instant, accurate quotes for painting, plastering & flooring jobs.

     Features:
     - Quick estimate calculator
     - Professional job listings
     - Portfolio showcase
     - Secure payments
     ```

3. **Click "Save" > "Review release"**
4. **Click "Start rollout to Production"**

### Step 2: Wait for Review

- Google typically reviews apps within 1-3 days
- You'll receive an email when approved
- Once approved, your app is live!

---

## 💰 Part 9: RevenueCat Setup for Android

You need to connect Google Play to RevenueCat for in-app purchases.

### Step 1: Get Google Play Credentials

1. **Go to Play Console:**
   - Settings > API access
   - Under "Google Play Android Developer API", note your credentials

2. **Service Account Email:**
   - You'll need the service account email

### Step 2: Link to RevenueCat

In Vibecode, tell me to set up RevenueCat for Android, and I'll:
1. Create a Google Play app in your RevenueCat project
2. Configure the products for Android
3. Set up the proper entitlements

---

## 📱 Part 10: Update Your App

For future updates:

1. **Update version in app.json:**
   - Increment `android.versionCode` (e.g., 1 → 2)
   - Update `version` (e.g., 1.0.0 → 1.0.1)

2. **Build new version:**
   - Tell me: "Build Android for production"

3. **In Play Console:**
   - Go to Production
   - Create new release
   - Upload new AAB
   - Add release notes
   - Rollout to production

---

## 🎯 Quick Command Reference

**In Vibecode, tell me:**
- "Build Android APK for testing" - Creates installable APK
- "Build Android for production" - Creates production AAB
- "Set up RevenueCat for Android" - Configures Android payments
- "Update Android app to v1.0.1" - Builds new version

---

## ✅ Deployment Checklist

Use this to track your progress:

- [ ] Created app in Google Play Console
- [ ] Created Google Cloud project
- [ ] Enabled Google Play Developer API
- [ ] Created service account and downloaded JSON key
- [ ] Linked service account to Play Console
- [ ] Created feature graphic (1024x500)
- [ ] Took app screenshots
- [ ] Completed app content sections
- [ ] Created store listing
- [ ] Built APK for testing (via EAS)
- [ ] Tested APK on Android device
- [ ] Set up internal testing track
- [ ] Tested internal build from Play Store
- [ ] Built production AAB (via EAS)
- [ ] Created production release
- [ ] Submitted for review
- [ ] Set up RevenueCat for Android
- [ ] App approved and live! 🎉

---

## 🆘 Troubleshooting

### Build Failed?
- Check your EAS account is properly set up
- Make sure service account has correct permissions
- Verify package name matches Play Console

### Can't Upload AAB?
- Make sure you've completed all store listing requirements
- Check that content rating is done
- Verify data safety section is complete

### Payments Not Working?
- Ensure RevenueCat is set up for Google Play
- Verify products exist in Play Console
- Check that app is using the correct API key

---

## 🎉 Next Steps

Once your app is live:
1. Share the Play Store link with customers
2. Monitor ratings and reviews
3. Respond to user feedback
4. Plan updates based on user requests

---

**Need help?** Just tell me what step you're on, and I'll guide you through it!
