/**
 * useSecureAction Hook
 * Provides debouncing and rate limiting for buttons and actions
 * Prevents double-taps, rapid clicking, and API abuse
 */

import { useState, useCallback, useRef } from 'react';
import { checkRateLimit, RateLimitType } from '../utils/security';

interface UseSecureActionOptions {
  /** Minimum milliseconds between action executions (default: 500ms) */
  debounceMs?: number;
  /** Rate limit type to apply (optional) */
  rateLimit?: RateLimitType;
  /** Unique key for rate limiting (defaults to action name) */
  rateLimitKey?: string;
}

interface UseSecureActionResult<T> {
  /** Execute the action with debouncing and rate limiting */
  execute: () => Promise<T | null>;
  /** Whether the action is currently executing */
  isExecuting: boolean;
  /** Whether the action is rate limited */
  isRateLimited: boolean;
  /** Milliseconds until rate limit resets (if limited) */
  retryAfterMs: number | undefined;
  /** Last error from action execution */
  error: Error | null;
}

/**
 * Hook for creating secure, debounced actions
 * Use this for payment buttons, API calls, and other expensive operations
 *
 * @example
 * const { execute, isExecuting, isRateLimited } = useSecureAction(
 *   async () => await purchasePackage(pkg),
 *   { debounceMs: 1000, rateLimit: 'PAYMENT' }
 * );
 *
 * <Button onPress={execute} disabled={isExecuting || isRateLimited}>
 *   {isRateLimited ? 'Please wait...' : 'Purchase'}
 * </Button>
 */
export function useSecureAction<T>(
  action: () => Promise<T>,
  options: UseSecureActionOptions = {}
): UseSecureActionResult<T> {
  const { debounceMs = 500, rateLimit, rateLimitKey = 'action' } = options;

  const [isExecuting, setIsExecuting] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfterMs, setRetryAfterMs] = useState<number | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);

  const lastExecutionRef = useRef<number>(0);

  const execute = useCallback(async (): Promise<T | null> => {
    const now = Date.now();

    // Debounce check - prevent rapid clicks
    if (now - lastExecutionRef.current < debounceMs) {
      if (__DEV__) {
        console.log('[SecureAction] Debounced - too soon since last execution');
      }
      return null;
    }

    // Rate limit check
    if (rateLimit) {
      const rateLimitResult = checkRateLimit(rateLimitKey, rateLimit);
      if (rateLimitResult.isLimited) {
        setIsRateLimited(true);
        setRetryAfterMs(rateLimitResult.retryAfterMs);
        if (__DEV__) {
          console.log(`[SecureAction] Rate limited. Retry after ${rateLimitResult.retryAfterMs}ms`);
        }

        // Auto-reset rate limit flag after the window
        if (rateLimitResult.retryAfterMs) {
          setTimeout(() => {
            setIsRateLimited(false);
            setRetryAfterMs(undefined);
          }, rateLimitResult.retryAfterMs);
        }

        return null;
      }
      setIsRateLimited(false);
      setRetryAfterMs(undefined);
    }

    // Execute action
    lastExecutionRef.current = now;
    setIsExecuting(true);
    setError(null);

    try {
      const result = await action();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (__DEV__) {
        console.error('[SecureAction] Error:', error);
      }
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [action, debounceMs, rateLimit, rateLimitKey]);

  return {
    execute,
    isExecuting,
    isRateLimited,
    retryAfterMs,
    error,
  };
}

/**
 * Simple debounce hook for button presses
 * Use when you just need to prevent double-taps without full rate limiting
 *
 * @example
 * const { execute, isDebounced } = useDebouncedAction(handlePayment, 1000);
 * <Button onPress={execute} disabled={isDebounced}>Pay</Button>
 */
export function useDebouncedAction<T>(
  action: () => Promise<T> | T,
  debounceMs: number = 500
): { execute: () => Promise<T | null>; isDebounced: boolean } {
  const [isDebounced, setIsDebounced] = useState(false);
  const lastExecutionRef = useRef<number>(0);

  const execute = useCallback(async (): Promise<T | null> => {
    const now = Date.now();

    if (now - lastExecutionRef.current < debounceMs) {
      return null;
    }

    lastExecutionRef.current = now;
    setIsDebounced(true);

    // Reset debounce flag after the window
    setTimeout(() => {
      setIsDebounced(false);
    }, debounceMs);

    try {
      const result = await action();
      return result;
    } catch (err) {
      if (__DEV__) {
        console.error('[DebouncedAction] Error:', err);
      }
      return null;
    }
  }, [action, debounceMs]);

  return { execute, isDebounced };
}
