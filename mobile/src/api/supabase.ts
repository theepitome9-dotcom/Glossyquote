import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Authentication API
 * Email/Password authentication with Supabase Auth
 */

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  error?: string;
}

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { name?: string; phone?: string }
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      console.error('[Auth] Sign up error:', error.message);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Failed to create account' };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
      },
    };
  } catch (error: any) {
    console.error('[Auth] Sign up exception:', error);
    return { success: false, error: error.message || 'Failed to create account' };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Auth] Sign in error:', error.message);
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Incorrect email or password' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { success: false, error: 'Please verify your email before logging in' };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Login failed' };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
      },
    };
  } catch (error: any) {
    console.error('[Auth] Sign in exception:', error);
    return { success: false, error: error.message || 'Login failed' };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'glossy://reset-password',
    });

    if (error) {
      console.error('[Auth] Password reset error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Auth] Password reset exception:', error);
    return { success: false, error: error.message || 'Failed to send reset email' };
  }
}

/**
 * Update user password (after reset or for logged-in users)
 */
export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('[Auth] Password update error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Auth] Password update exception:', error);
    return { success: false, error: error.message || 'Failed to update password' };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[Auth] Sign out error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Auth] Sign out exception:', error);
    return { success: false, error: error.message || 'Failed to sign out' };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Payment Verification API
 * Checks if an estimate has been paid
 */

export interface PaymentVerification {
  verified: boolean;
  estimateId?: string;
  paymentId?: string;
  amount?: number;
  error?: string;
}

/**
 * Create a pending estimate in the database
 * Returns the estimate ID to track payment
 */
export async function createEstimateRecord(estimateData: {
  estimate_data: any;
  total_min_price: number;
  total_max_price: number;
  customer_email?: string;
}): Promise<{ id: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('estimates')
      .insert([
        {
          estimate_data: estimateData.estimate_data,
          total_min_price: estimateData.total_min_price,
          total_max_price: estimateData.total_max_price,
          paid: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (error) {
      if (__DEV__) {
        console.error('Error creating estimate:', error);
      }
      return { id: '', error: error.message };
    }

    return { id: data.id };
  } catch (error: any) {
    if (__DEV__) {
      console.error('Error creating estimate:', error);
    }
    return { id: '', error: error.message };
  }
}

/**
 * Check if an estimate has been paid
 * This checks the database which is updated by payment webhooks
 */
export async function checkEstimatePaymentStatus(
  estimateId: string
): Promise<PaymentVerification> {
  try {
    const { data, error } = await supabase
      .from('estimates')
      .select('id, paid, payment_id, total_min_price, total_max_price')
      .eq('id', estimateId)
      .single();

    if (error) {
      if (__DEV__) {
        console.error('Error checking payment status:', error);
      }
      return {
        verified: false,
        error: 'Unable to verify payment. Please try again.',
      };
    }

    if (!data) {
      return {
        verified: false,
        error: 'Estimate not found.',
      };
    }

    if (data.paid) {
      return {
        verified: true,
        estimateId: data.id,
        paymentId: data.payment_id,
        amount: data.total_min_price,
      };
    }

    return {
      verified: false,
      error: 'Payment not yet received. Please complete payment first.',
    };
  } catch (error: any) {
    if (__DEV__) {
      console.error('Payment verification error:', error);
    }
    return {
      verified: false,
      error: 'Payment verification failed. Please try again.',
    };
  }
}

/**
 * Poll for payment confirmation
 * Checks database every few seconds to see if webhook has updated payment status
 */
export async function pollForPaymentConfirmation(
  estimateId: string,
  maxAttempts: number = 10,
  intervalMs: number = 3000
): Promise<PaymentVerification> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await checkEstimatePaymentStatus(estimateId);
    
    if (result.verified) {
      return result;
    }

    // Wait before next check
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return {
    verified: false,
    error: 'Payment verification timed out. If you completed payment, please contact support with your receipt.',
  };
}

/**
 * Get estimate details (only if paid)
 * Returns only necessary columns for bandwidth optimization
 */
export async function getPaidEstimate(estimateId: string): Promise<{
  estimate?: any;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('estimates')
      .select('id, paid, payment_id, total_min_price, total_max_price, estimate_data, created_at')
      .eq('id', estimateId)
      .eq('paid', true)
      .single();

    if (error) {
      if (__DEV__) {
        console.error('Error fetching estimate:', error);
      }
      return { error: 'Unable to fetch estimate.' };
    }

    if (!data) {
      return { error: 'Estimate not found or not paid.' };
    }

    return { estimate: data };
  } catch (error: any) {
    if (__DEV__) {
      console.error('Error fetching estimate:', error);
    }
    return { error: error.message };
  }
}

/**
 * Create a Stripe Checkout Session for an estimate
 * This generates a checkout URL with the estimateId in metadata
 */
export async function createPaymentCheckout(
  estimateId: string,
  amount: number,
  userId?: string
): Promise<{
  checkoutUrl?: string;
  sessionId?: string;
  error?: string;
}> {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    
    if (!apiUrl) {
      return { error: 'API configuration missing' };
    }

    if (__DEV__) {
      console.log('Creating checkout for estimate:', estimateId, 'Amount:', amount);
    }

    const response = await fetch(`${apiUrl}/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        estimateId,
        amount,
        userId: userId || 'anonymous',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (__DEV__) {
        console.error('Checkout creation failed:', errorData);
      }
      return { error: errorData.error || 'Failed to create checkout' };
    }

    const data = await response.json();
    
    if (__DEV__) {
      console.log('Checkout created:', data.sessionId);
    }
    
    return {
      checkoutUrl: data.checkoutUrl,
      sessionId: data.sessionId,
    };
  } catch (error: any) {
    if (__DEV__) {
      console.error('Error creating checkout:', error);
    }
    return { error: error.message || 'Failed to create checkout' };
  }
}

/**
 * @deprecated This function has been disabled for security reasons.
 * Payment verification should only occur through secure webhook callbacks.
 * Keeping the function signature for backward compatibility but it now
 * always returns an error.
 */
export async function manuallyMarkEstimateAsPaid(_estimateId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  // SECURITY: Manual payment marking has been disabled to prevent fraud
  // All payment verification must go through the webhook system
  if (__DEV__) {
    console.warn('[SECURITY] manuallyMarkEstimateAsPaid has been disabled for security reasons');
  }
  return {
    success: false,
    error: 'Manual payment marking is not supported. Please complete payment through the app.',
  };
}

/**
 * @deprecated This function has been disabled for security reasons.
 * Payment verification should only occur through secure webhook callbacks.
 */
export async function findAndMarkRecentEstimateAsPaid(
  _totalMinPrice: number,
  _totalMaxPrice: number
): Promise<{
  success: boolean;
  estimateId?: string;
  error?: string;
}> {
  // SECURITY: Manual payment marking has been disabled to prevent fraud
  if (__DEV__) {
    console.warn('[SECURITY] findAndMarkRecentEstimateAsPaid has been disabled for security reasons');
  }
  return {
    success: false,
    error: 'Manual payment marking is not supported. Please complete payment through the app.',
  };
}

/**
 * Trial Eligibility API
 * Checks if a user is eligible for the 7-day premium trial.
 * Uses the Supabase database with RLS — no exposed internal secret needed.
 */

export interface TrialEligibility {
  eligible: boolean;
  reason?: string;
}

/**
 * Check if the currently authenticated user has already claimed a trial.
 * Unauthenticated users are considered eligible (they'll be prompted to sign up first).
 */
export async function checkTrialEligibility(userId?: string): Promise<TrialEligibility> {
  if (!userId) {
    // Not yet signed in — show the trial offer; claim happens after auth
    return { eligible: true };
  }

  try {
    const { data, error } = await supabase
      .from('trial_claims')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (__DEV__) {
        console.error('[Trial] Error checking eligibility:', error.message);
      }
      // Fail closed: if we can't confirm eligibility, assume not eligible
      return { eligible: false, reason: 'Unable to verify trial eligibility' };
    }

    if (data) {
      return { eligible: false, reason: 'Trial already claimed for this account' };
    }

    return { eligible: true };
  } catch (error: any) {
    if (__DEV__) {
      console.error('[Trial] Error checking eligibility:', error);
    }
    // Fail closed on unexpected errors
    return { eligible: false, reason: 'Unable to verify trial eligibility' };
  }
}

/**
 * Record that the currently authenticated user has claimed their free trial.
 * Uses Supabase RLS — the user's JWT ensures they can only claim for themselves.
 * The UNIQUE constraint on user_id prevents double-claiming.
 */
export async function claimTrial(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'Must be signed in to claim trial' };
  }

  try {
    const { error } = await supabase
      .from('trial_claims')
      .insert({ user_id: userId });

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation — already claimed
        return { success: false, error: 'Trial already claimed for this account' };
      }
      if (__DEV__) {
        console.error('[Trial] Error claiming trial:', error.message);
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    if (__DEV__) {
      console.error('[Trial] Error claiming trial:', error);
    }
    return { success: false, error: error.message };
  }
}
