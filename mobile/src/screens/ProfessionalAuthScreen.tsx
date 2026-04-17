import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Professional, TradeCategory } from '../types/glossy';
import { useAppStore } from '../state/appStore';
import { TRADE_CATEGORIES, PREMIUM_PRICING } from '../config/trades-pricing';

const OWNER_EMAIL = 'rods320@yahoo.com';
const OWNER_PASSWORD = 'Glossy2026!';

function isOwnerEmail(email: string) {
  return email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
}
import { signInWithApple, isAppleSignInAvailable } from '../lib/appleAuth';
import { signInWithGoogle } from '../lib/googleAuth';
import { useAlert } from '../components/modals/CustomAlert';
import {
  checkTrialEligibility,
  claimTrial,
  signUpWithEmail,
  signInWithEmail,
  sendPasswordResetEmail
} from '../api/supabase';
import { getOfferings, purchasePackage, isRevenueCatEnabled } from '../lib/revenuecatClient';
import {
  DEMO_ACCOUNT_EMAIL,
  DEMO_ACCOUNT_PASSWORD,
  createDemoProfessional,
  isDemoAccountExists
} from '../utils/demoAccount';

// Legal URLs - required by Apple for subscription flows
const PRIVACY_POLICY_URL = 'https://glossyquote.com/privacy.html';
const TERMS_OF_SERVICE_URL = 'https://glossyquote.com/terms.html';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfessionalAuth'>;

export default function ProfessionalAuthScreen({ navigation }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [selectedTrades, setSelectedTrades] = useState<TradeCategory[]>(['painting-decorating']);
  const [acceptPremiumTrial, setAcceptPremiumTrial] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [trialEligible, setTrialEligible] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  // Track OAuth sign-in to skip password requirement
  const [oauthProvider, setOauthProvider] = useState<'apple' | 'google' | null>(null);
  const [oauthUserId, setOauthUserId] = useState<string | null>(null);

  const addProfessional = useAppStore((s) => s.addProfessional);
  const setCurrentProfessional = useAppStore((s) => s.setCurrentProfessional);
  const professionals = useAppStore((s) => s.professionals);
  const { showAlert, AlertComponent } = useAlert();

  // Check if Apple Sign-In is available on this device
  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  // Check trial eligibility when switching to register mode
  useEffect(() => {
    if (mode === 'register') {
      checkTrialEligibility().then((result) => {
        setTrialEligible(result.eligible);
        if (!result.eligible) {
          setAcceptPremiumTrial(false);
        }
      });
    }
  }, [mode]);

  // Password validation
  const validatePassword = (pwd: string): { valid: boolean; error?: string } => {
    if (pwd.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(pwd)) {
      return { valid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(pwd)) {
      return { valid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(pwd)) {
      return { valid: false, error: 'Password must contain at least one number' };
    }
    return { valid: true };
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      showAlert('Missing Information', 'Please enter your email or username', [{ text: 'OK' }], 'error');
      return;
    }
    if (!password.trim()) {
      showAlert('Missing Information', 'Please enter your password', [{ text: 'OK' }], 'error');
      return;
    }

    setProcessing(true);

    try {
      // Determine if input is email or username (business name)
      const isEmail = email.includes('@');
      let emailToUse = email.trim();

      // If it's a username/business name, find the email from local professionals
      if (!isEmail) {
        const professional = professionals.find(
          (p) => p.name.toLowerCase() === email.toLowerCase().trim()
        );
        if (professional) {
          emailToUse = professional.email;
        } else {
          showAlert('Not Found', 'No account found with this username. Try using your email address.', [{ text: 'OK' }], 'error');
          setProcessing(false);
          return;
        }
      }

      // Check for demo account (Apple reviewer) - allow direct login without Supabase
      // This must be checked FIRST before any network calls
      const isDemoAccount = emailToUse.toLowerCase() === DEMO_ACCOUNT_EMAIL.toLowerCase();

      // Owner account — bypass Supabase, no registration needed
      if (isOwnerEmail(emailToUse)) {
        if (password !== OWNER_PASSWORD) {
          showAlert('Login Failed', 'Incorrect password', [{ text: 'OK' }], 'error');
          setProcessing(false);
          return;
        }
        let ownerProfile = professionals.find(
          (p) => p.email.toLowerCase() === OWNER_EMAIL.toLowerCase()
        );
        if (!ownerProfile) {
          ownerProfile = {
            id: 'owner-rods320',
            name: 'Owner',
            email: OWNER_EMAIL,
            phone: '',
            tradeCategories: [],
            credits: 0,
            isPremium: true,
            portfolio: [],
            profileImages: [],
            profileDescription: '',
            rating: 0,
            totalReviews: 0,
            reviews: [],
            referralCode: 'OWNER',
            referrals: [],
            referralEarnings: 0,
            createdAt: new Date().toISOString(),
          };
          addProfessional(ownerProfile);
        }
        setCurrentProfessional(ownerProfile!);
        navigation.replace('AdminDashboard');
        setProcessing(false);
        return;
      }

      if (isDemoAccount) {
        // Validate demo password
        if (password !== DEMO_ACCOUNT_PASSWORD) {
          showAlert('Login Failed', 'Incorrect password', [{ text: 'OK' }], 'error');
          setProcessing(false);
          return;
        }

        // Demo account login - create or retrieve the demo professional
        let demoProfessional = professionals.find(
          (p) => p.email.toLowerCase() === DEMO_ACCOUNT_EMAIL.toLowerCase()
        );

        if (!demoProfessional) {
          // Create the demo professional account
          demoProfessional = createDemoProfessional();
          addProfessional(demoProfessional);
        }

        setCurrentProfessional(demoProfessional);
        navigation.replace(isOwnerEmail(emailToUse) ? 'AdminDashboard' : 'ProfessionalDashboard');
        setProcessing(false);
        return;
      }

      // Authenticate with Supabase for non-demo accounts
      const authResult = await signInWithEmail(emailToUse, password);

      if (!authResult.success) {
        showAlert('Login Failed', authResult.error || 'Invalid credentials', [{ text: 'OK' }], 'error');
        setProcessing(false);
        return;
      }

      // Find existing professional profile
      const professional = professionals.find(
        (p) => p.email.toLowerCase() === emailToUse.toLowerCase()
      );

      if (professional) {
        setCurrentProfessional(professional);
        navigation.replace(isOwnerEmail(emailToUse) ? 'AdminDashboard' : 'ProfessionalDashboard');
      } else {
        // User authenticated but no local profile - switch to register to complete profile
        setEmail(emailToUse);
        setMode('register');
        showAlert(
          'Complete Your Profile',
          'Please complete your professional profile to continue.',
          [{ text: 'OK' }],
          'info'
        );
      }
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      showAlert('Error', 'An unexpected error occurred. Please try again.', [{ text: 'OK' }], 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showAlert('Email Required', 'Please enter your email address to reset your password.', [{ text: 'OK' }], 'error');
      return;
    }

    setProcessing(true);

    try {
      const result = await sendPasswordResetEmail(email.trim());

      if (result.success) {
        setResetEmailSent(true);
        showAlert(
          'Reset Email Sent',
          'Check your email for a link to reset your password. If you don\'t see it, check your spam folder.',
          [{ text: 'OK', onPress: () => setShowForgotPassword(false) }],
          'success'
        );
      } else {
        showAlert('Error', result.error || 'Failed to send reset email', [{ text: 'OK' }], 'error');
      }
    } catch (error: any) {
      showAlert('Error', 'Failed to send reset email. Please try again.', [{ text: 'OK' }], 'error');
    } finally {
      setProcessing(false);
    }
  };

  const lookupAndRestoreFromBackend = async (email: string, oauthId: string | null): Promise<boolean> => {
    try {
      const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const INTERNAL_SECRET = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET || '';
      const res = await fetch(`${BACKEND_URL}/api/users/lookup?email=${encodeURIComponent(email)}`, {
        headers: { 'x-internal-secret': INTERNAL_SECRET },
      });
      if (!res.ok) return false;
      const data = await res.json() as { found: boolean; user?: any };
      if (!data.found || !data.user) return false;

      const restored: Professional = {
        id: oauthId || data.user.id,
        name: data.user.name,
        email: data.user.email.toLowerCase(),
        phone: data.user.phone || '',
        profileDescription: '',
        profileImages: [],
        portfolio: [],
        tradeCategories: data.user.tradeCategories || [],
        credits: 0,
        isPremium: data.user.isPremium || false,
        subscription: undefined,
        rating: 0,
        totalReviews: 0,
        reviews: [],
        referralCode: `PRO${Date.now().toString().slice(-6)}`,
        referrals: [],
        referralEarnings: 0,
        createdAt: data.user.registeredAt || new Date().toISOString(),
      };

      addProfessional(restored);
      setCurrentProfessional(restored);
      console.log('[Auth] Restored account from backend for:', email);
      return true;
    } catch (err) {
      console.warn('[Auth] Backend lookup failed:', err);
      return false;
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.success && result.user) {
        // Check local state first
        const existingPro = professionals.find(
          (p) => p.email.toLowerCase() === result.user!.email.toLowerCase()
        );

        if (existingPro) {
          setCurrentProfessional(existingPro);
          setTimeout(() => {
            navigation.replace(isOwnerEmail(result.user!.email) ? 'AdminDashboard' : 'ProfessionalDashboard');
          }, 100);
        } else {
          // Not found locally — check backend (handles installs with no local data)
          const restored = await lookupAndRestoreFromBackend(result.user.email, result.user.id || null);
          if (restored) {
            setTimeout(() => {
              navigation.replace(isOwnerEmail(result.user!.email) ? 'AdminDashboard' : 'ProfessionalDashboard');
            }, 100);
          } else {
            // Genuinely new user - show profile completion form
            setOauthProvider('google');
            setOauthUserId(result.user.id || null);
            setName(result.user.name);
            setEmail(result.user.email);
            setMode('register');
            showAlert(
              'Complete Your Profile',
              'Please complete your profile to start receiving leads.',
              [{ text: 'OK' }],
              'info'
            );
          }
        }
      } else if (result.error && result.error !== 'Sign-in was cancelled') {
        showAlert('Sign-In Failed', result.error, [{ text: 'OK' }], 'error');
      }
    } catch (error: any) {
      console.error('[GoogleAuth] Sign-in error:', error);
      showAlert('Error', 'Failed to sign in with Google. Please try again.', [{ text: 'OK' }], 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      console.log('[Auth] Starting Apple Sign-In...');
      const result = await signInWithApple();
      console.log('[Auth] Apple Sign-In result:', result.success, result.error);

      if (result.success && result.user) {
        const existingPro = professionals.find(
          (p) => p.email.toLowerCase() === result.user!.email.toLowerCase()
        );

        if (existingPro) {
          setCurrentProfessional(existingPro);
          setTimeout(() => {
            navigation.replace(isOwnerEmail(result.user!.email) ? 'AdminDashboard' : 'ProfessionalDashboard');
          }, 100);
        } else {
          // Not found locally — check backend
          const restored = await lookupAndRestoreFromBackend(result.user.email, result.user.id || null);
          if (restored) {
            setTimeout(() => {
              navigation.replace(isOwnerEmail(result.user!.email) ? 'AdminDashboard' : 'ProfessionalDashboard');
            }, 100);
          } else {
            setOauthProvider('apple');
            setOauthUserId(result.user.id || null);
            if (result.user.name) setName(result.user.name);
            if (result.user.email) setEmail(result.user.email);
            setMode('register');
            showAlert(
              'Complete Your Profile',
              'Please complete your professional profile to start receiving leads.',
              [{ text: 'OK' }],
              'info'
            );
          }
        }
      } else if (result.error && result.error !== 'Sign-in was cancelled') {
        console.error('[Auth] Apple Sign-In error displayed to user:', result.error);
        showAlert('Sign-In Failed', result.error, [{ text: 'OK' }], 'error');
      }
    } catch (error: any) {
      console.error('[AppleAuth] Sign-in error:', error);
      console.error('[AppleAuth] Error details:', JSON.stringify(error, null, 2));
      showAlert(
        'Error',
        'Failed to sign in with Apple. Please try again or use email sign-in.',
        [{ text: 'OK' }],
        'error'
      );
    } finally {
      setAppleLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      showAlert('Missing Information', 'Please enter your name', [{ text: 'OK' }], 'error');
      return;
    }
    if (!email.trim()) {
      showAlert('Missing Information', 'Please enter your email', [{ text: 'OK' }], 'error');
      return;
    }

    // Only require password for email sign-up (not OAuth providers like Apple/Google)
    if (!oauthProvider) {
      if (!password.trim()) {
        showAlert('Missing Information', 'Please create a password', [{ text: 'OK' }], 'error');
        return;
      }

      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        showAlert('Weak Password', passwordValidation.error!, [{ text: 'OK' }], 'error');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Password Mismatch', 'Passwords do not match', [{ text: 'OK' }], 'error');
        return;
      }
    }

    if (!phone.trim()) {
      showAlert('Missing Information', 'Please enter your phone number', [{ text: 'OK' }], 'error');
      return;
    }
    if (!profileDescription.trim()) {
      showAlert('Missing Information', 'Please add a brief description of your services', [{ text: 'OK' }], 'error');
      return;
    }
    if (selectedTrades.length === 0) {
      showAlert('Missing Information', 'Please select at least one trade category', [{ text: 'OK' }], 'error');
      return;
    }

    // Check if email already exists locally
    const existingPro = professionals.find(
      (p) => p.email.toLowerCase() === email.toLowerCase().trim()
    );
    if (existingPro) {
      showAlert('Account Exists', 'An account with this email already exists. Please login.', [{ text: 'OK' }], 'error');
      return;
    }

    setProcessing(true);

    try {
      let authUserId = oauthUserId;

      // Only create Supabase auth account for email sign-ups (OAuth already has an account)
      if (!oauthProvider) {
        const authResult = await signUpWithEmail(email.trim(), password, {
          name: name.trim(),
          phone: phone.trim(),
        });

        if (!authResult.success) {
          showAlert('Registration Failed', authResult.error || 'Failed to create account', [{ text: 'OK' }], 'error');
          setProcessing(false);
          return;
        }

        authUserId = authResult.user?.id || null;
      }

      // If user wants premium trial, they must provide payment details first via App Store
      if (acceptPremiumTrial) {
        try {
          // Check if RevenueCat is available
          if (!isRevenueCatEnabled()) {
            showAlert(
              'Subscriptions Unavailable',
              'Subscriptions are only available on iOS. Please use the mobile app to subscribe.',
              [{ text: 'OK', onPress: () => setProcessing(false) }],
              'error'
            );
            return;
          }

          // Get the monthly subscription package (which has the 7-day free trial)
          // Use a timeout to prevent hanging if RevenueCat is slow/misconfigured
          const offerings = await Promise.race([
            getOfferings(),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
          ]);
          const subscriptionOffering = offerings?.all?.['subscription_plans'] ?? offerings?.current;
          const monthlyPackage = subscriptionOffering?.availablePackages.find(
            p => p.identifier === '$rc_monthly'
          );

          if (!monthlyPackage) {
            showAlert(
              'Error',
              'Unable to load subscription options. Please try again.',
              [{ text: 'OK', onPress: () => setProcessing(false) }],
              'error'
            );
            return;
          }

          // Initiate purchase - App Store will prompt for card details
          const customerInfo = await purchasePackage(monthlyPackage);

          if (customerInfo) {
            // Purchase successful - user entered valid card and started trial
            // Now create the account with trial benefits
            await createProfessionalAccount(true, authUserId || undefined);
          } else {
            // Purchase was cancelled or failed
            setProcessing(false);
          }
        } catch (error: any) {
          console.error('[Registration] Trial purchase error:', error);
          if (!error?.userCancelled) {
            showAlert(
              'Purchase Failed',
              'Unable to start trial. Please try again.',
              [{ text: 'OK' }],
              'error'
            );
          }
          setProcessing(false);
        }
      } else {
        // No premium trial - create account immediately
        await createProfessionalAccount(false, authUserId || undefined);
      }
    } catch (error: any) {
      console.error('[Registration] Error:', error);
      showAlert('Error', 'Failed to create account. Please try again.', [{ text: 'OK' }], 'error');
      setProcessing(false);
    }
  };

  const createProfessionalAccount = async (withPremiumTrial: boolean, authUserId?: string) => {
    // Calculate premium trial end date (7 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    // If starting trial, record the claim to prevent abuse
    if (withPremiumTrial) {
      const visitorId = authUserId || Date.now().toString();
      await claimTrial(visitorId);
    }

    // Create new professional with 12 credits if on trial (enough for 3 leads at 4 credits each)
    // Credits are ONLY granted after successful App Store purchase with valid card
    const newProfessional: Professional = {
      id: authUserId || Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      profileDescription: profileDescription.trim(),
      profileImages: [],
      portfolio: [],
      tradeCategories: selectedTrades,
      credits: withPremiumTrial ? 12 : 0, // 12 credits for trial (3 leads) - only after card verified
      isPremium: withPremiumTrial,
      subscription: withPremiumTrial ? {
        tier: 'premium',
        startDate: new Date().toISOString(),
        endDate: trialEndDate.toISOString(),
        autoRenew: true, // Auto-renew enabled for card-backed trial
      } : undefined,
      premiumSince: withPremiumTrial ? new Date().toISOString() : undefined,
      rating: 0,
      totalReviews: 0,
      reviews: [],
      referralCode: `PRO${Date.now().toString().slice(-6)}`, // Generate unique code
      referrals: [],
      referralEarnings: 0,
      createdAt: new Date().toISOString(),
    };

    addProfessional(newProfessional);
    setCurrentProfessional(newProfessional);
    setProcessing(false);

    // Register professional in backend for owner visibility (non-blocking)
    const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    const INTERNAL_SECRET = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET || '';
    fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': INTERNAL_SECRET },
      body: JSON.stringify({
        id: newProfessional.id,
        userType: 'professional',
        name: newProfessional.name,
        email: newProfessional.email,
        phone: newProfessional.phone,
        tradeCategories: newProfessional.tradeCategories,
        isPremium: newProfessional.isPremium,
        registeredAt: newProfessional.createdAt,
      }),
    }).catch((err) => console.warn('[Auth] Failed to register user in backend:', err));

    // Navigate immediately - don't rely on alert button to trigger navigation
    const destination = isOwnerEmail(newProfessional.email) ? 'AdminDashboard' : 'ProfessionalDashboard';
    navigation.replace(destination);

    const welcomeMessage = withPremiumTrial
      ? `Your 7-day Premium trial is active with 12 credits (3 leads) and 33% cheaper leads! Your card will be charged £${PREMIUM_PRICING.monthly.price}/month automatically after 7 days unless you cancel.`
      : 'Your professional account has been created. Purchase credits to start accessing leads.';

    showAlert('Welcome to GLOSSY!', welcomeMessage, [{ text: 'Get Started' }], 'success');
  };

  // Forgot Password Modal
  if (showForgotPassword) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6 py-6">
          {/* Header */}
          <Pressable
            onPress={() => setShowForgotPassword(false)}
            className="flex-row items-center mb-8"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
            <Text className="text-gray-700 text-lg ml-2">Back</Text>
          </Pressable>

          <View className="items-center mb-8">
            <View className="bg-blue-100 rounded-full p-6 mb-4">
              <Ionicons name="lock-open" size={48} color="#2563eb" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Reset Password
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Enter your email and we'll send you a link to reset your password
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable
            onPress={handleForgotPassword}
            disabled={processing}
            className={`py-4 rounded-2xl mb-4 ${processing ? 'bg-blue-400' : 'bg-blue-600 active:opacity-80'}`}
          >
            {processing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Send Reset Link
              </Text>
            )}
          </Pressable>

          {resetEmailSent && (
            <View className="bg-green-50 border border-green-200 rounded-xl p-4">
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="text-green-800 ml-2 flex-1">
                  Reset link sent! Check your email inbox and spam folder.
                </Text>
              </View>
            </View>
          )}
        </View>
        <AlertComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-6 py-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-blue-600 rounded-full p-6 mb-4">
              <Ionicons name="briefcase" size={48} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Professional Portal
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Access quality leads for multiple trades and grow your business
            </Text>
          </View>

          {/* Mode Toggle */}
          <View className="flex-row bg-gray-100 rounded-2xl p-1 mb-6">
            <Pressable
              onPress={() => setMode('login')}
              className={`flex-1 py-3 rounded-xl ${
                mode === 'login' ? 'bg-white' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  mode === 'login' ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                Login
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('register')}
              className={`flex-1 py-3 rounded-xl ${
                mode === 'register' ? 'bg-white' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  mode === 'register' ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                Register
              </Text>
            </Pressable>
          </View>

          {/* Google Sign-In Button */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            className={`flex-row items-center justify-center py-4 rounded-2xl mb-3 border border-gray-300 ${
              googleLoading ? 'bg-gray-100' : 'bg-white active:bg-gray-50'
            }`}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <>
                <View className="w-6 h-6 mr-3">
                  <GoogleIcon />
                </View>
                <Text className="text-gray-700 text-lg font-medium">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          {/* Apple Sign-In Button - only show on iOS */}
          {appleAvailable && (
            <Pressable
              onPress={handleAppleSignIn}
              disabled={appleLoading}
              className={`flex-row items-center justify-center py-4 rounded-2xl mb-4 ${
                appleLoading ? 'bg-gray-800' : 'bg-black active:bg-gray-900'
              }`}
            >
              {appleLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={22} color="white" style={{ marginRight: 10 }} />
                  <Text className="text-white text-lg font-medium">
                    Continue with Apple
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* Divider */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="px-4 text-gray-500 text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {mode === 'login' ? (
            /* Login Form */
            <View>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Email or Username</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com or Business Name"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base pr-12"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={22}
                      color="#9CA3AF"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Forgot Password Link */}
              <Pressable
                onPress={() => setShowForgotPassword(true)}
                className="mb-6"
              >
                <Text className="text-blue-600 text-sm font-medium text-right">
                  Forgot Password?
                </Text>
              </Pressable>

              <Pressable
                onPress={handleLogin}
                disabled={processing}
                className={`py-4 rounded-2xl ${processing ? 'bg-blue-400' : 'bg-blue-600 active:opacity-80'}`}
              >
                {processing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center text-lg font-semibold">Login</Text>
                )}
              </Pressable>
            </View>
          ) : (
            /* Register Form */
            <View>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Business Name *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="ABC Painting & Decorating"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                  autoCapitalize="words"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Email Address *</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!oauthProvider}
                />
              </View>

              {/* Show OAuth provider badge instead of password fields for social sign-ins */}
              {oauthProvider ? (
                <View className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex-row items-center">
                  <Ionicons
                    name={oauthProvider === 'apple' ? 'logo-apple' : 'logo-google'}
                    size={20}
                    color={oauthProvider === 'apple' ? '#000' : '#4285F4'}
                  />
                  <Text className="text-green-800 text-sm ml-2 flex-1">
                    Signed in with {oauthProvider === 'apple' ? 'Apple' : 'Google'}
                  </Text>
                </View>
              ) : (
                <>
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Password *</Text>
                    <View className="relative">
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Create a password"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base pr-12"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4"
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={22}
                          color="#9CA3AF"
                        />
                      </Pressable>
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">
                      Min 8 characters, 1 uppercase, 1 lowercase, 1 number
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password *</Text>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </>
              )}

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number *</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="07xxx xxxxxx"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                  keyboardType="phone-pad"
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Profile Description *
                </Text>
                <TextInput
                  value={profileDescription}
                  onChangeText={setProfileDescription}
                  placeholder="Tell customers about your experience, qualifications, and services..."
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{ minHeight: 100 }}
                />
              </View>

              {/* Trade Categories Selection */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Trade Categories * (Select all that apply)
                </Text>
                <View className="flex-row flex-wrap">
                  {TRADE_CATEGORIES.map((trade) => {
                    const isSelected = selectedTrades.includes(trade.id);
                    return (
                      <Pressable
                        key={trade.id}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedTrades(selectedTrades.filter(t => t !== trade.id));
                          } else {
                            setSelectedTrades([...selectedTrades, trade.id]);
                          }
                        }}
                        className={`mr-2 mb-2 px-4 py-2 rounded-xl flex-row items-center ${
                          isSelected ? 'bg-blue-600' : 'bg-gray-100'
                        }`}
                      >
                        <Ionicons
                          name={trade.icon as any}
                          size={16}
                          color={isSelected ? 'white' : '#6B7280'}
                        />
                        <Text className={`ml-2 text-sm ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                          {trade.name}
                        </Text>
                        {trade.comingSoon && !isSelected && (
                          <Text className="ml-1 text-xs text-gray-500"> (Soon)</Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Premium Trial Offer - only show if eligible */}
              {trialEligible && (
              <View className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-purple-300">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="star" size={24} color="#9333ea" />
                  <Text className="text-lg font-bold text-gray-900 ml-2">
                    Start 7-Day Premium Trial
                  </Text>
                </View>
                <Text className="text-sm text-gray-700 mb-3">
                  Try Premium FREE for 7 days. Card required upfront - no charge until trial ends.
                </Text>
                <View className="mb-3">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700 ml-2">12 credits included (3 leads)</Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700 ml-2">33% cheaper leads (4 vs 6 credits)</Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700 ml-2">Top priority placement</Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700 ml-2">Premium Pro badge</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700 ml-2">
                      Premium monthly £{PREMIUM_PRICING.monthly.price} a month after trial period.
                    </Text>
                  </View>
                </View>

                {/* Important auto-renewal notice - Apple required */}
                <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                  <View className="flex-row items-start">
                    <Ionicons name="alert-circle" size={18} color="#F59E0B" style={{ marginTop: 1 }} />
                    <Text className="text-xs text-gray-700 ml-2 flex-1">
                      <Text className="font-bold">Auto-Renewal Notice:</Text> After your 7-day free trial, your subscription will automatically renew at £{PREMIUM_PRICING.monthly.price}/month. You will be charged unless you cancel at least 24 hours before the trial ends.
                    </Text>
                  </View>
                </View>

                {/* Legal links - required by Apple */}
                <View className="flex-row justify-center items-center mb-3">
                  <Pressable onPress={() => WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL)}>
                    <Text className="text-blue-600 text-xs underline">Terms of Use</Text>
                  </Pressable>
                  <Text className="text-gray-400 text-xs mx-2">•</Text>
                  <Pressable onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}>
                    <Text className="text-blue-600 text-xs underline">Privacy Policy</Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => setAcceptPremiumTrial(!acceptPremiumTrial)}
                  className="flex-row items-center"
                >
                  <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
                    acceptPremiumTrial ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                  }`}>
                    {acceptPremiumTrial && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <Text className="text-sm text-gray-700 flex-1">
                    Start with 7-day Premium trial (auto-renews after trial)
                  </Text>
                </Pressable>
              </View>
              )}

              <Pressable
                onPress={handleRegister}
                disabled={processing}
                className={`py-4 rounded-2xl ${processing ? 'bg-blue-400' : 'bg-blue-600 active:opacity-80'}`}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {processing ? 'Processing...' : acceptPremiumTrial ? 'Start Trial & Create Account' : 'Create Account'}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Benefits */}
          <View className="mt-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Why Join GLOSSY?
            </Text>
            <BenefitItem icon="people" text="Access qualified leads across multiple trades" />
            <BenefitItem icon="cash" text="Flexible pricing - pay-as-you-go or premium" />
            <BenefitItem icon="star" text="Build your reputation with customer reviews" />
            <BenefitItem icon="trending-up" text="Grow your business with premium tools" />
          </View>
        </View>
      </ScrollView>

      {/* Processing Overlay */}
      {processing && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-2xl p-6 items-center mx-6">
            <View className="bg-purple-100 rounded-full p-4 mb-4">
              <Ionicons name="card" size={32} color="#9333ea" />
            </View>
            <Text className="text-gray-900 font-semibold text-lg mb-1">Opening Payment Page</Text>
            <Text className="text-gray-600 text-sm text-center">
              Please complete your card details to start your 7-day free trial
            </Text>
          </View>
        </View>
      )}

      <AlertComponent />
    </SafeAreaView>
  );
}

function BenefitItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View className="flex-row items-center mb-3">
      <View className="bg-blue-100 rounded-full p-2 mr-3">
        <Ionicons name={icon} size={20} color="#2563eb" />
      </View>
      <Text className="text-gray-700 flex-1">{text}</Text>
    </View>
  );
}

// Google Icon SVG Component
function GoogleIcon() {
  const Svg = require('react-native-svg').Svg;
  const Path = require('react-native-svg').Path;

  return (
    <Svg viewBox="0 0 24 24" width={24} height={24}>
      <Path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <Path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <Path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <Path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </Svg>
  );
}
