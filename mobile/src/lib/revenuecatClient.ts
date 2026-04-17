import Purchases, { PurchasesOfferings, CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import { initializeWebRevenueCat } from './revenuecatWebClient';

// RevenueCat API Keys from environment variables
const REVENUECAT_APPLE_KEY = process.env.EXPO_PUBLIC_VIBECODE_REVENUECAT_APPLE_KEY || '';
const REVENUECAT_GOOGLE_KEY = process.env.EXPO_PUBLIC_VIBECODE_REVENUECAT_GOOGLE_KEY || '';
const REVENUECAT_TEST_KEY = process.env.EXPO_PUBLIC_VIBECODE_REVENUECAT_TEST_KEY || '';

let isConfigured = false;

/**
 * Initialize RevenueCat SDK
 * Call this once when your app starts
 */
export const initializeRevenueCat = async (userId?: string): Promise<void> => {
  try {
    // On web, use the RC Billing web SDK
    if (Platform.OS === 'web') {
      initializeWebRevenueCat(userId);
      if (__DEV__) {
        console.log('[RevenueCat] Initialized web SDK (RC Billing)');
      }
      return;
    }

    // Check if we have API keys
    if (!REVENUECAT_APPLE_KEY && !REVENUECAT_GOOGLE_KEY && !REVENUECAT_TEST_KEY) {
      if (__DEV__) {
        console.log('[RevenueCat] No API keys found - running without RevenueCat');
      }
      return;
    }

    // Choose the appropriate key based on platform and environment
    let apiKey: string;
    // Always use platform-specific key on iOS/Android (covers TestFlight and production)
    // Fall back to Test Store key only if no platform key is available
    if (Platform.OS === 'ios' && REVENUECAT_APPLE_KEY) {
      apiKey = REVENUECAT_APPLE_KEY;
      console.log('[RevenueCat] Configuring with Apple App Store key');
    } else if (Platform.OS === 'android' && REVENUECAT_GOOGLE_KEY) {
      apiKey = REVENUECAT_GOOGLE_KEY;
      console.log('[RevenueCat] Configuring with Google Play key');
    } else if (REVENUECAT_TEST_KEY) {
      apiKey = REVENUECAT_TEST_KEY;
      console.log('[RevenueCat] Configuring with Test Store key');
    } else {
      return;
    }

    if (!apiKey) {
      if (__DEV__) {
        console.log('[RevenueCat] No API key available for current platform/environment');
      }
      return;
    }

    // Configure RevenueCat
    Purchases.configure({ apiKey });

    // Silence SDK-level logs - offerings errors are non-fatal and handled gracefully
    Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR);

    isConfigured = true;
    if (__DEV__) {
      console.log('[RevenueCat] ✅ Initialized successfully');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Failed to initialize:', error);
    }
  }
};

/**
 * Check if RevenueCat is properly configured
 */
export const isRevenueCatEnabled = (): boolean => {
  return isConfigured && Platform.OS !== 'web';
};

/**
 * Get available offerings (subscription packages)
 */
export const getOfferings = async (): Promise<PurchasesOfferings | null> => {
  try {
    if (!isRevenueCatEnabled()) {
      if (__DEV__) {
        console.log('[RevenueCat] Not enabled, cannot get offerings');
      }
      return null;
    }

    const offerings = await Purchases.getOfferings();
    if (__DEV__) {
      console.log('[RevenueCat] Fetched offerings:', offerings.current?.availablePackages.length || 0, 'packages');
    }
    return offerings;
  } catch (error) {
    // Offerings may fail if Apple StoreKit cannot validate products (e.g. sandbox/TestFlight config).
    // This does not block one-time purchases which work independently.
    if (__DEV__) {
      console.warn('[RevenueCat] Offerings unavailable (purchases still work):', (error as any)?.message ?? error);
    }
    return null;
  }
};

/**
 * Get a specific offering by lookup key
 * @param lookupKey - Offering lookup key (e.g., "customer_estimates", "professional_credits")
 */
export const getOfferingByKey = async (lookupKey: string): Promise<PurchasesOfferings['all'][string] | null> => {
  try {
    const offerings = await getOfferings();
    if (!offerings) return null;

    const offering = offerings.all[lookupKey];
    if (!offering) {
      if (__DEV__) {
        console.log(`[RevenueCat] Offering "${lookupKey}" not found`);
      }
      return null;
    }

    if (__DEV__) {
      console.log(`[RevenueCat] Found offering "${lookupKey}" with ${offering.availablePackages.length} packages`);
    }
    return offering;
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error getting offering by key:', error);
    }
    return null;
  }
};

/**
 * Get a specific package by identifier from a specific offering
 * @param offeringKey - Offering lookup key (e.g., "customer_estimates", "professional_credits")
 * @param packageIdentifier - Package lookup_key (e.g., "$rc_custom_painting", "$rc_custom_credits_trial")
 */
export const getPackageFromOffering = async (offeringKey: string, packageIdentifier: string): Promise<PurchasesPackage | null> => {
  try {
    const offering = await getOfferingByKey(offeringKey);
    if (!offering) return null;

    const pkg = offering.availablePackages.find(
      p => p.identifier === packageIdentifier
    );

    if (!pkg) {
      if (__DEV__) {
        console.log(`[RevenueCat] Package "${packageIdentifier}" not found in offering "${offeringKey}"`);
      }
    }

    return pkg || null;
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error getting package from offering:', error);
    }
    return null;
  }
};

/**
 * Get a specific package by identifier (legacy - searches current offering only)
 * @param packageIdentifier - Package identifier (e.g., "$rc_monthly", "painting-single-room", "credits_trial")
 */
export const getPackage = async (packageIdentifier: string): Promise<PurchasesPackage | null> => {
  try {
    const offerings = await getOfferings();
    if (!offerings?.current) return null;

    const pkg = offerings.current.availablePackages.find(
      p => p.identifier === packageIdentifier
    );

    return pkg || null;
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error getting package:', error);
    }
    return null;
  }
};

/**
 * Purchase a one-time product (non-subscription) from a specific offering
 * @param offeringKey - Offering lookup key (e.g., "customer_estimates", "professional_credits")
 * @param packageIdentifier - Package lookup_key (e.g., "$rc_custom_painting", "$rc_custom_credits_trial")
 */
export const purchaseProductFromOffering = async (offeringKey: string, packageIdentifier: string): Promise<CustomerInfo | null> => {
  try {
    const pkg = await getPackageFromOffering(offeringKey, packageIdentifier);
    if (!pkg) {
      if (__DEV__) {
        console.error('[RevenueCat] Package not found:', packageIdentifier, 'in offering:', offeringKey);
      }
      return null;
    }

    return await purchasePackage(pkg);
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error purchasing product from offering:', error);
    }
    return null;
  }
};

/**
 * Purchase a one-time product (non-subscription) - legacy method
 * @param packageIdentifier - Package identifier (e.g., "painting-single-room", "credits_trial")
 */
export const purchaseOneTimeProduct = async (packageIdentifier: string): Promise<CustomerInfo | null> => {
  try {
    const pkg = await getPackage(packageIdentifier);
    if (!pkg) {
      if (__DEV__) {
        console.error('[RevenueCat] Package not found:', packageIdentifier);
      }
      return null;
    }

    return await purchasePackage(pkg);
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error purchasing one-time product:', error);
    }
    return null;
  }
};

/**
 * Purchase a package
 */
export const purchasePackage = async (pkg: PurchasesPackage): Promise<CustomerInfo | null> => {
  try {
    if (!isRevenueCatEnabled()) {
      if (__DEV__) {
        console.log('[RevenueCat] Not enabled, cannot purchase');
      }
      return null;
    }

    if (__DEV__) {
      console.log('[RevenueCat] Purchasing package:', pkg.identifier);
      console.log('[RevenueCat] Package details:', JSON.stringify(pkg, null, 2));
    }
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    if (__DEV__) {
      console.log('[RevenueCat] ✅ Purchase successful');
    }
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      if (__DEV__) {
        console.log('[RevenueCat] User cancelled purchase');
      }
    } else {
      if (__DEV__) {
        console.error('[RevenueCat] Purchase error:', error);
        console.error('[RevenueCat] Error code:', error.code);
        console.error('[RevenueCat] Error message:', error.message);
        console.error('[RevenueCat] Error details:', JSON.stringify(error, null, 2));
      }
    }
    return null;
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  try {
    if (!isRevenueCatEnabled()) {
      if (__DEV__) {
        console.log('[RevenueCat] Not enabled, cannot restore');
      }
      return null;
    }

    if (__DEV__) {
      console.log('[RevenueCat] Restoring purchases...');
    }
    const customerInfo = await Purchases.restorePurchases();
    if (__DEV__) {
      console.log('[RevenueCat] ✅ Purchases restored');
    }
    return customerInfo;
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Restore error:', error);
    }
    return null;
  }
};

/**
 * Get customer info (current subscription status)
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    if (!isRevenueCatEnabled()) {
      return null;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error getting customer info:', error);
    }
    return null;
  }
};

/**
 * Check if user has a specific entitlement active
 */
export const hasEntitlement = async (entitlementId: string): Promise<boolean> => {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return false;

    return customerInfo.entitlements.active[entitlementId] !== undefined;
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error checking entitlement:', error);
    }
    return false;
  }
};

/**
 * Check if user has any active subscription
 */
export const hasActiveSubscription = async (): Promise<boolean> => {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return false;

    return Object.keys(customerInfo.entitlements.active).length > 0;
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error checking subscription:', error);
    }
    return false;
  }
};

/**
 * Set user ID for tracking (optional)
 */
export const identifyUser = async (userId: string): Promise<void> => {
  try {
    if (!isRevenueCatEnabled()) return;

    await Purchases.logIn(userId);
    if (__DEV__) {
      console.log('[RevenueCat] User identified:', userId);
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error identifying user:', error);
    }
  }
};

/**
 * Log out current user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    if (!isRevenueCatEnabled()) return;

    await Purchases.logOut();
    if (__DEV__) {
      console.log('[RevenueCat] User logged out');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error logging out:', error);
    }
  }
};

// Export Purchases for advanced usage
export { Purchases };

/**
 * SECURITY: Server-side entitlement verification
 * Always verify entitlements from RevenueCat before granting premium access
 * This prevents users from modifying local state to bypass premium features
 */

/**
 * Verify premium status directly from RevenueCat (not cached)
 * Use this before granting access to premium features
 * @returns Object with premium status and customer info
 */
export const verifyPremiumStatus = async (): Promise<{
  isPremium: boolean;
  entitlements: string[];
  customerInfo: CustomerInfo | null;
}> => {
  try {
    if (!isRevenueCatEnabled()) {
      return { isPremium: false, entitlements: [], customerInfo: null };
    }

    // Force fetch fresh customer info from RevenueCat servers
    const customerInfo = await Purchases.getCustomerInfo();

    if (!customerInfo) {
      return { isPremium: false, entitlements: [], customerInfo: null };
    }

    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    const isPremium = activeEntitlements.includes('premium');

    if (__DEV__) {
      console.log('[RevenueCat] Verified premium status:', isPremium);
      console.log('[RevenueCat] Active entitlements:', activeEntitlements);
    }

    return {
      isPremium,
      entitlements: activeEntitlements,
      customerInfo,
    };
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error verifying premium status:', error);
    }
    return { isPremium: false, entitlements: [], customerInfo: null };
  }
};

/**
 * Check if user has made a specific one-time purchase
 * Useful for verifying credit purchases
 * @param productIdentifier - The product ID to check
 */
export const hasNonSubscriptionPurchase = async (productIdentifier: string): Promise<boolean> => {
  try {
    if (!isRevenueCatEnabled()) {
      return false;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    if (!customerInfo) return false;

    // Check non-subscription transactions
    const purchases = customerInfo.nonSubscriptionTransactions;
    return purchases.some(p => p.productIdentifier === productIdentifier);
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error checking purchase:', error);
    }
    return false;
  }
};

/**
 * Get all non-subscription purchases for the current user
 * Useful for tracking credit purchase history
 */
export const getNonSubscriptionPurchases = async (): Promise<Array<{
  productId: string;
  purchaseDate: string;
  transactionId: string;
}>> => {
  try {
    if (!isRevenueCatEnabled()) {
      return [];
    }

    const customerInfo = await Purchases.getCustomerInfo();
    if (!customerInfo) return [];

    return customerInfo.nonSubscriptionTransactions.map(t => ({
      productId: t.productIdentifier,
      purchaseDate: t.purchaseDate,
      transactionId: t.transactionIdentifier,
    }));
  } catch (error) {
    if (__DEV__) {
      console.error('[RevenueCat] Error getting purchases:', error);
    }
    return [];
  }
};
