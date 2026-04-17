import { Purchases, type Offerings, type Offering, type Package, type PurchaseResult } from '@revenuecat/purchases-js';

const WEB_KEY = process.env.EXPO_PUBLIC_REVENUECAT_WEB_KEY || 'rcb_ULNEtHMzQKTkNeZYVyCSXaHeHKTw';

let instance: Purchases | null = null;

export const initializeWebRevenueCat = (userId?: string): void => {
  if (!WEB_KEY) return;
  instance = Purchases.configure(WEB_KEY, userId ?? '');
};

export const isWebRevenueCatEnabled = (): boolean => instance !== null;

export const getWebOfferings = async (): Promise<Offerings | null> => {
  if (!instance) return null;
  try {
    return await instance.getOfferings();
  } catch (e) {
    if (__DEV__) console.warn('[RC Web] getOfferings error:', e);
    return null;
  }
};

export const purchaseWebPackage = async (pkg: Package): Promise<PurchaseResult | null> => {
  if (!instance) return null;
  try {
    return await instance.purchasePackage(pkg);
  } catch (e: any) {
    if (e?.errorCode === 'USER_CANCELLED') return null;
    if (__DEV__) console.error('[RC Web] purchasePackage error:', e);
    return null;
  }
};

export const getWebCustomerInfo = async () => {
  if (!instance) return null;
  try {
    return await instance.getCustomerInfo();
  } catch (e) {
    if (__DEV__) console.warn('[RC Web] getCustomerInfo error:', e);
    return null;
  }
};

export const identifyWebUser = (userId: string): void => {
  if (WEB_KEY) instance = Purchases.configure(WEB_KEY, userId);
};

export type { Package as WebPackage, Offering as WebOffering, Offerings as WebOfferings };
