# RevenueCat Setup Guide for Glossy App

## ✅ Current Status

Your app is now fully configured to use RevenueCat for **all** payment flows:
- ✅ Customer estimate purchases (painting, plastering, flooring)
- ✅ Professional credit packages
- ✅ Premium subscriptions (already working!)

## 🎯 What You Need to Do

You need to create products in RevenueCat dashboard for all your payment types. The app is already coded to use these products - you just need to configure them in RevenueCat.

---

## 📦 Products to Create

### 1. Customer Estimate Products (35 products)

#### Painting & Decorating (11 products)
Create these as **Non-Consumable** products in RevenueCat:

| Product ID | Price | Description |
|------------|-------|-------------|
| `painting-single-room` | £2 | Single room estimate |
| `painting-studio-flat` | £4 | Studio flat estimate |
| `painting-1bed-flat-single-level` | £6 | 1 Bedroom flat estimate |
| `painting-2bed-flat-single-level` | £8 | 2 Bedroom flat estimate |
| `painting-3bed-single-level` | £10 | 3 Bedroom property estimate |
| `painting-1bed-with-stairs` | £12 | 1 Bed with stairs estimate |
| `painting-2bed-with-stairs` | £14 | 2 Bed with stairs estimate |
| `painting-3bed-with-stairs` | £16 | 3 Bed with stairs estimate |
| `painting-4bed-with-stairs` | £18 | 4 Bed with stairs estimate |
| `painting-5bed-with-stairs` | £20 | 5 Bed with stairs estimate |
| `painting-exterior-1-side` | £8 | Exterior (1 side) estimate |

#### Plastering (21 products)

**Skimming (8 products):**
| Product ID | Price | Description |
|------------|-------|-------------|
| `plastering-small-repair` | £2 | Small plaster repair estimate |
| `plastering-skim-1-wall` | £4 | Skimming 1 wall estimate |
| `plastering-skim-small-ceiling` | £6 | Small ceiling skim estimate |
| `plastering-skim-medium-ceiling` | £8 | Medium ceiling skim estimate |
| `plastering-skim-large-ceiling` | £10 | Large ceiling skim estimate |
| `plastering-skim-small-room` | £9 | Small room skim estimate |
| `plastering-skim-medium-room` | £11 | Medium room skim estimate |
| `plastering-skim-large-room` | £13 | Large room skim estimate |

**Dry Lining (3 products):**
| Product ID | Price | Description |
|------------|-------|-------------|
| `plastering-board-small-ceiling` | £3 | Small ceiling board estimate |
| `plastering-board-medium-ceiling` | £4 | Medium ceiling board estimate |
| `plastering-board-large-ceiling` | £5 | Large ceiling board estimate |

**Board & Skim (6 products):**
| Product ID | Price | Description |
|------------|-------|-------------|
| `plastering-board-skim-small-ceiling` | £5 | Small ceiling board & skim estimate |
| `plastering-board-skim-medium-ceiling` | £7 | Medium ceiling board & skim estimate |
| `plastering-board-skim-large-ceiling` | £9 | Large ceiling board & skim estimate |
| `plastering-board-skim-small-room` | £11 | Small room board & skim estimate |
| `plastering-board-skim-medium-room` | £13 | Medium room board & skim estimate |
| `plastering-board-skim-large-room` | £15 | Large room board & skim estimate |

#### Flooring (3 products)
| Product ID | Price | Description |
|------------|-------|-------------|
| `flooring-laminate-small-room` | £4 | Small room laminate estimate |
| `flooring-laminate-medium-room` | £6 | Medium room laminate estimate |
| `flooring-laminate-large-room` | £8 | Large room laminate estimate |

---

### 2. Professional Credit Packages (6 products)

Create these as **Consumable** products in RevenueCat:

| Product ID | Price | Credits | Description |
|------------|-------|---------|-------------|
| `credits_trial` | £30 | 15 | Trial credit pack |
| `credits_starter` | £50 | 28 | Starter credit pack |
| `credits_professional` | £80 | 48 | Professional credit pack |
| `credits_business` | £120 | 75 | Business credit pack |
| `credits_premium` | £170 | 110 | Premium credit pack |
| `credits_premium-pro` | £230 | 153 | Premium Pro credit pack |

---

### 3. Premium Subscriptions (Already Created! ✅)

You already have these set up:
- Monthly: £49/month
- Annual: £490/year

---

## 🛠️ How to Create Products in RevenueCat

### Step 1: Go to RevenueCat Dashboard
1. Visit https://app.revenuecat.com
2. Select your "Glossy Quotes" project

### Step 2: Create Products in Test Store (for development)

1. Go to **Products** in the sidebar
2. Click **"+ New"** to create a product
3. For each product:
   - **Store**: Select "Test Store"
   - **Product ID**: Use exact ID from tables above (e.g., `painting-single-room`)
   - **Type**:
     - **Non-Consumable** for estimate products
     - **Consumable** for credit packages
     - **Subscription** for premium (already done)
   - **Duration**: Only for subscriptions (skip for others)
   - **Title**: User-facing name (e.g., "Single Room Painting Estimate")
   - **Price**: Set the price from table

4. Click **"Save"**

### Step 3: Configure Prices for Test Store Products

After creating each product:
1. Click on the product
2. Go to **Pricing** tab
3. Add price for GBP (£)
4. Save

### Step 4: Create Products in App Store (for production)

Repeat the same process but select **"App Store"** instead of "Test Store". You'll need to:
1. Create the product in App Store Connect first
2. Then link it in RevenueCat

---

## 📋 Creating an Offering

Once all products are created, organize them into an offering:

### Option A: Single "Current" Offering (Recommended)
1. Go to **Offerings** in RevenueCat
2. Your "current" offering should contain ALL products
3. Click **"Add Package"**
4. For each product, create a package:
   - **Package ID**: Same as product ID
   - **Product**: Select the corresponding product
   - Click **"Save"**

### Option B: Multiple Offerings (Advanced)
You could organize by category:
- "estimates" offering → All estimate products
- "credits" offering → All credit packages
- "premium" offering → Premium subscriptions (already done)

---

## 🚀 Quick Bulk Setup Script

For faster setup, you can use the RevenueCat API. Here's a reference of all product IDs:

```javascript
// Estimate products (Non-Consumable)
const estimateProducts = [
  // Painting
  "painting-single-room", "painting-studio-flat", "painting-1bed-flat-single-level",
  "painting-2bed-flat-single-level", "painting-3bed-single-level", "painting-1bed-with-stairs",
  "painting-2bed-with-stairs", "painting-3bed-with-stairs", "painting-4bed-with-stairs",
  "painting-5bed-with-stairs", "painting-exterior-1-side",

  // Plastering
  "plastering-small-repair", "plastering-skim-1-wall", "plastering-skim-small-ceiling",
  "plastering-skim-medium-ceiling", "plastering-skim-large-ceiling", "plastering-skim-small-room",
  "plastering-skim-medium-room", "plastering-skim-large-room",
  "plastering-board-small-ceiling", "plastering-board-medium-ceiling", "plastering-board-large-ceiling",
  "plastering-board-skim-small-ceiling", "plastering-board-skim-medium-ceiling",
  "plastering-board-skim-large-ceiling", "plastering-board-skim-small-room",
  "plastering-board-skim-medium-room", "plastering-board-skim-large-room",

  // Flooring
  "flooring-laminate-small-room", "flooring-laminate-medium-room", "flooring-laminate-large-room"
];

// Credit products (Consumable)
const creditProducts = [
  "credits_trial", "credits_starter", "credits_professional",
  "credits_business", "credits_premium", "credits_premium-pro"
];
```

---

## 🧪 Testing Your Setup

### Test in Development (Test Store)
1. Run your app in development mode
2. Try purchasing an estimate: Select a room type → Pay for estimate
3. Try purchasing credits: Go to Professional Credits → Buy a package
4. Use test payment methods (no real money charged)

### Verify Products Load
1. Open the app
2. Check the Expo logs (in `expo.log` file)
3. Look for RevenueCat messages like:
   ```
   [RevenueCat] Fetched offerings: X packages
   ```

---

## ✅ What Happens After Setup

Once products are configured:

### Customer Flow:
1. Customer selects estimate type (e.g., "2 Bedroom Flat")
2. Taps "Pay £8 for Detailed Estimate"
3. **Native iOS payment sheet appears** (no redirect!)
4. Face ID / Touch ID / Password
5. Payment completes instantly
6. Estimate unlocked immediately

### Professional Flow:
1. Professional needs credits
2. Taps "Professional Pack - £80"
3. **Native iOS payment sheet appears**
4. Payment completes
5. 48 credits added to account instantly

### Premium Flow (Already Working):
1. Professional taps "Upgrade to Premium"
2. Selects Monthly or Annual
3. Native payment sheet
4. Subscription activated

---

## 📞 Need Help?

If you encounter issues:
1. Check the RevenueCat dashboard for product status
2. View logs in `expo.log` file
3. Ensure product IDs match exactly (case-sensitive!)
4. Verify prices are set in GBP (£)

---

## 🎉 Benefits of This Setup

✅ **No external redirects** - All purchases happen in-app
✅ **Smooth UX** - Native iOS payment experience
✅ **Instant fulfillment** - Credits/estimates unlock immediately
✅ **Subscription management** - Handled by Apple/RevenueCat
✅ **Receipt validation** - Automatic via RevenueCat
✅ **No Stripe confusion** - Single payment provider

Your app is now ready for a premium in-app purchase experience! 🚀
