import { Linking, Platform } from "react-native";

const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || "http://localhost:3000";

export type StripeProduct = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  formattedPrice: string;
  mode: "payment" | "subscription";
  interval: "month" | "year" | null;
  trialDays: number | null;
};

export const getStripeProducts = async (): Promise<StripeProduct[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/stripe/products`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.products ?? [];
  } catch (e) {
    if (__DEV__) console.warn("[Stripe] getProducts error:", e);
    return [];
  }
};

export const createStripeCheckout = async (opts: {
  productId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  professionalId?: string;
}): Promise<string | null> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[Stripe] Checkout failed:", data.error);
      return null;
    }
    return data.url ?? null;
  } catch (e) {
    if (__DEV__) console.error("[Stripe] createCheckout error:", e);
    return null;
  }
};

// Opens Stripe hosted checkout in the browser, works on web, iOS, Android
export const openStripeCheckout = async (opts: {
  productId: string;
  customerEmail?: string;
  professionalId?: string;
  baseUrl?: string;
}): Promise<boolean> => {
  const base = opts.baseUrl ?? (Platform.OS === "web" ? window.location.origin : BACKEND_URL);
  const successUrl = `${base}/payment-success?product=${opts.productId}`;
  const cancelUrl = `${base}/payment-cancel`;

  const url = await createStripeCheckout({
    productId: opts.productId,
    successUrl,
    cancelUrl,
    customerEmail: opts.customerEmail,
    professionalId: opts.professionalId,
  });

  if (!url) return false;

  if (Platform.OS === "web") {
    window.location.href = url;
    return true;
  }

  const supported = await Linking.canOpenURL(url);
  if (supported) await Linking.openURL(url);
  return supported;
};
