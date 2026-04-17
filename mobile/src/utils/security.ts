/**
 * Security Utilities
 * Centralized security helpers for data protection and privacy
 */

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

// Keys for secure storage
const SECURE_KEYS = {
  SESSION_TOKEN: 'session_token',
  USER_ID: 'user_id',
  PRIVACY_CONSENT: 'privacy_consent',
  CONSENT_TIMESTAMP: 'consent_timestamp',
} as const;

/**
 * Secure logging - only logs in development mode
 * NEVER logs sensitive data like tokens, passwords, payment info
 */
export function secureLog(message: string, data?: unknown): void {
  if (__DEV__) {
    console.log(`[DEBUG] ${message}`, data ?? '');
  }
}

/**
 * Secure error logging - sanitizes error messages
 */
export function secureErrorLog(context: string, error: unknown): void {
  if (__DEV__) {
    console.error(`[ERROR] ${context}:`, error);
  } else {
    // In production, log only the context without sensitive details
    console.error(`[ERROR] ${context}: An error occurred`);
  }
}

/**
 * Check if SecureStore is available (not on web)
 */
export function isSecureStoreAvailable(): boolean {
  return Platform.OS !== 'web';
}

/**
 * Securely store sensitive data
 */
export async function secureSet(key: string, value: string): Promise<boolean> {
  if (!isSecureStoreAvailable()) {
    secureLog('SecureStore not available on web platform');
    return false;
  }

  try {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
    return true;
  } catch (error) {
    secureErrorLog('SecureStore set failed', error);
    return false;
  }
}

/**
 * Securely retrieve sensitive data
 */
export async function secureGet(key: string): Promise<string | null> {
  if (!isSecureStoreAvailable()) {
    return null;
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    secureErrorLog('SecureStore get failed', error);
    return null;
  }
}

/**
 * Securely delete sensitive data
 */
export async function secureDelete(key: string): Promise<boolean> {
  if (!isSecureStoreAvailable()) {
    return false;
  }

  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    secureErrorLog('SecureStore delete failed', error);
    return false;
  }
}

/**
 * Generate a secure random token
 */
export async function generateSecureToken(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash sensitive data (one-way)
 */
export async function hashData(data: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data
  );
}

/**
 * Store session token securely
 */
export async function storeSessionToken(token: string): Promise<boolean> {
  return secureSet(SECURE_KEYS.SESSION_TOKEN, token);
}

/**
 * Get session token
 */
export async function getSessionToken(): Promise<string | null> {
  return secureGet(SECURE_KEYS.SESSION_TOKEN);
}

/**
 * Clear session (logout)
 */
export async function clearSession(): Promise<void> {
  await secureDelete(SECURE_KEYS.SESSION_TOKEN);
  await secureDelete(SECURE_KEYS.USER_ID);
}

/**
 * Store privacy consent
 */
export async function storePrivacyConsent(consented: boolean): Promise<boolean> {
  const timestamp = new Date().toISOString();
  await secureSet(SECURE_KEYS.CONSENT_TIMESTAMP, timestamp);
  return secureSet(SECURE_KEYS.PRIVACY_CONSENT, consented ? 'true' : 'false');
}

/**
 * Check if user has given privacy consent
 */
export async function hasPrivacyConsent(): Promise<boolean> {
  const consent = await secureGet(SECURE_KEYS.PRIVACY_CONSENT);
  return consent === 'true';
}

/**
 * Get privacy consent timestamp
 */
export async function getConsentTimestamp(): Promise<string | null> {
  return secureGet(SECURE_KEYS.CONSENT_TIMESTAMP);
}

// Export secure keys for reference
export { SECURE_KEYS };

/**
 * Rate Limiting & Debouncing Utilities
 * Prevents abuse of expensive operations like AI calls and payments
 */

// Store for tracking rate limits
const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

// Store for debounce timers
const debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

// Store for last execution time (for throttling)
const lastExecutionTime: Map<string, number> = new Map();

/**
 * Rate limit configuration for different operation types
 */
export const RATE_LIMITS = {
  AI_CALL: { maxRequests: 10, windowMs: 60000 }, // 10 requests per minute
  PAYMENT: { maxRequests: 3, windowMs: 30000 }, // 3 attempts per 30 seconds
  IMAGE_GENERATION: { maxRequests: 5, windowMs: 60000 }, // 5 images per minute
  API_CALL: { maxRequests: 30, windowMs: 60000 }, // 30 API calls per minute
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Check if an operation is rate limited
 * @param key - Unique identifier for the rate limit (e.g., 'user_123_AI_CALL')
 * @param type - Type of rate limit to apply
 * @returns Object with isLimited flag and retryAfterMs if limited
 */
export function checkRateLimit(
  key: string,
  type: RateLimitType
): { isLimited: boolean; retryAfterMs?: number } {
  const config = RATE_LIMITS[type];
  const now = Date.now();
  const limitKey = `${key}_${type}`;

  const existing = rateLimitStore.get(limitKey);

  if (!existing || now >= existing.resetTime) {
    // Start new window
    rateLimitStore.set(limitKey, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { isLimited: false };
  }

  if (existing.count >= config.maxRequests) {
    return {
      isLimited: true,
      retryAfterMs: existing.resetTime - now,
    };
  }

  // Increment counter
  existing.count++;
  return { isLimited: false };
}

/**
 * Debounce a function - delays execution until after wait milliseconds
 * have elapsed since the last time the function was invoked
 * @param key - Unique identifier for the debounce
 * @param fn - Function to debounce
 * @param waitMs - Milliseconds to wait (default 500ms)
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  key: string,
  fn: T,
  waitMs: number = 500
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    const existingTimer = debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      debounceTimers.delete(key);
      fn(...args);
    }, waitMs);

    debounceTimers.set(key, timer);
  };
}

/**
 * Throttle a function - ensures function is called at most once per wait period
 * @param key - Unique identifier for the throttle
 * @param fn - Function to throttle
 * @param waitMs - Minimum milliseconds between calls (default 1000ms)
 * @returns Whether the function was allowed to execute
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  key: string,
  fn: T,
  waitMs: number = 1000
): (...args: Parameters<T>) => boolean {
  return (...args: Parameters<T>): boolean => {
    const now = Date.now();
    const lastTime = lastExecutionTime.get(key) || 0;

    if (now - lastTime >= waitMs) {
      lastExecutionTime.set(key, now);
      fn(...args);
      return true;
    }

    return false;
  };
}

/**
 * Clear all rate limits (useful for testing or logout)
 */
export function clearRateLimits(): void {
  rateLimitStore.clear();
  debounceTimers.forEach((timer) => clearTimeout(timer));
  debounceTimers.clear();
  lastExecutionTime.clear();
}

/**
 * Hook for using rate-limited operations in React components
 * Returns a wrapper function and loading/error states
 */
export function createRateLimitedAction<T extends (...args: unknown[]) => Promise<unknown>>(
  key: string,
  type: RateLimitType,
  action: T
): {
  execute: (...args: Parameters<T>) => Promise<ReturnType<T> | null>;
  isRateLimited: () => boolean;
  getRetryAfterMs: () => number | undefined;
} {
  let cachedResult: { isLimited: boolean; retryAfterMs?: number } = { isLimited: false };

  return {
    execute: async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
      cachedResult = checkRateLimit(key, type);

      if (cachedResult.isLimited) {
        if (__DEV__) {
          console.log(`[RateLimit] ${key} is rate limited. Retry after ${cachedResult.retryAfterMs}ms`);
        }
        return null;
      }

      return action(...args) as Promise<ReturnType<T>>;
    },
    isRateLimited: () => cachedResult.isLimited,
    getRetryAfterMs: () => cachedResult.retryAfterMs,
  };
}
