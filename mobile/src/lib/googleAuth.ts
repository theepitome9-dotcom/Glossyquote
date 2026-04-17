import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../api/supabase';

// Required for web browser auth
WebBrowser.maybeCompleteAuthSession();

// Supabase auth redirect URI
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'glossy',
  path: 'auth/callback',
});

export interface GoogleAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  error?: string;
}

/**
 * Sign in with Google using Supabase OAuth
 * Returns user data if successful
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  try {
    console.log('[GoogleAuth] Starting Google sign-in with redirect:', redirectUri);

    // Check for an existing valid Supabase session first — avoids browser popup for returning users
    const { data: existingSessionData } = await supabase.auth.getSession();
    if (existingSessionData.session?.user) {
      const user = existingSessionData.session.user;
      console.log('[GoogleAuth] Reusing existing session for:', user.email);
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split('@')[0] || '',
          avatar: user.user_metadata?.avatar_url,
        },
      };
    }

    // Start OAuth flow with Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true, // We'll handle the browser ourselves
        queryParams: {
          access_type: 'offline',
          // Use 'select_account' instead of 'consent' so returning users skip the consent screen
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      console.error('[GoogleAuth] OAuth error:', error);
      return {
        success: false,
        error: `Google sign-in failed: ${error.message}`,
      };
    }

    if (!data.url) {
      return {
        success: false,
        error: 'Failed to get authentication URL. Please try again.',
      };
    }

    console.log('[GoogleAuth] Opening auth URL...');

    // Open the OAuth URL in browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUri,
      {
        showInRecents: true,
      }
    );

    console.log('[GoogleAuth] Browser result:', result.type);

    if (result.type === 'success' && result.url) {
      // Extract tokens from the callback URL
      const url = new URL(result.url);
      const params = new URLSearchParams(url.hash.substring(1)); // Remove # prefix

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken) {
        // Set the session with the tokens
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (sessionError) {
          console.error('[GoogleAuth] Session error:', sessionError);
          return {
            success: false,
            error: `Session error: ${sessionError.message}`,
          };
        }

        if (sessionData.user) {
          console.log('[GoogleAuth] Sign-in successful:', sessionData.user.email);
          return {
            success: true,
            user: {
              id: sessionData.user.id,
              email: sessionData.user.email || '',
              name: sessionData.user.user_metadata?.full_name ||
                    sessionData.user.user_metadata?.name ||
                    sessionData.user.email?.split('@')[0] || '',
              avatar: sessionData.user.user_metadata?.avatar_url,
            },
          };
        }
      }

      // Try to get existing session
      const { data: existingSession } = await supabase.auth.getSession();
      if (existingSession.session?.user) {
        const user = existingSession.session.user;
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  user.email?.split('@')[0] || '',
            avatar: user.user_metadata?.avatar_url,
          },
        };
      }
    }

    if (result.type === 'cancel') {
      return {
        success: false,
        error: 'Sign-in was cancelled',
      };
    }

    return {
      success: false,
      error: 'Authentication failed. Please try again.',
    };
  } catch (error: any) {
    console.error('[GoogleAuth] Error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Sign out of Google/Supabase
 */
export async function signOutGoogle(): Promise<void> {
  try {
    await supabase.auth.signOut();
    if (__DEV__) {
      console.log('[GoogleAuth] Signed out successfully');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[GoogleAuth] Sign out error:', error);
    }
  }
}

/**
 * Get current Google user if signed in
 */
export async function getCurrentGoogleUser(): Promise<GoogleAuthResult['user'] | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      const user = data.session.user;
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] || '',
        avatar: user.user_metadata?.avatar_url,
      };
    }
    return null;
  } catch (error) {
    if (__DEV__) {
      console.error('[GoogleAuth] Get user error:', error);
    }
    return null;
  }
}
