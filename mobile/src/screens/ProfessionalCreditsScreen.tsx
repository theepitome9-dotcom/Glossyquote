import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/common/InfoBanner';
import { ContextualHelp } from '../components/common/ContextualHelp';
import { useAlert } from '../components/modals/CustomAlert';
import { formatCurrency } from '../utils/estimate-calculator';
import {
  CREDIT_PACKAGES,
  getAvailablePackages,
  LEAD_COST_STANDARD,
  LEAD_COST_PREMIUM,
  PREMIUM_PRICING
} from '../config/trades-pricing';
import { purchaseProductFromOffering, isRevenueCatEnabled, restorePurchases, verifyPremiumStatus } from '../lib/revenuecatClient';
import { openStripeCheckout } from '../lib/stripeWebCheckout';
import { Platform } from 'react-native';
import { checkRateLimit } from '../utils/security';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfessionalCredits'>;

export default function ProfessionalCreditsScreen({ navigation }: Props) {
  const currentProfessional = useAppStore((s) => s.currentProfessional);
  const updateProfessionalCredits = useAppStore((s) => s.updateProfessionalCredits);
  const updateProfessionalPremium = useAppStore((s) => s.updateProfessionalPremium);
  const locale = useAppStore((s) => s.locale);
  const [processing, setProcessing] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const { showAlert, AlertComponent } = useAlert();

  // SECURITY: Verify premium status from RevenueCat, not just local state
  // This prevents users from modifying local state to get premium benefits
  const [verifiedPremium, setVerifiedPremium] = useState<boolean | null>(null);

  // Track last purchase time for debouncing
  const lastPurchaseTime = useRef<number>(0);
  const DEBOUNCE_MS = 1000; // 1 second debounce

  useEffect(() => {
    const verifyPremium = async () => {
      const { isPremium: rcPremium } = await verifyPremiumStatus();
      setVerifiedPremium(rcPremium);

      // Sync local state with RevenueCat as source of truth
      if (currentProfessional && currentProfessional.isPremium !== rcPremium) {
        if (__DEV__) {
          console.warn('[Security] Premium status mismatch - local:', currentProfessional.isPremium, 'RevenueCat:', rcPremium, '- syncing local state');
        }
        updateProfessionalPremium(currentProfessional.id, rcPremium);
      }
    };

    if (currentProfessional) {
      verifyPremium();
    }
  }, [currentProfessional?.isPremium, currentProfessional]);

  const handlePurchase = useCallback(async (packageId: string) => {
    if (!currentProfessional) return;

    // Debounce check - prevent rapid clicks
    const now = Date.now();
    if (now - lastPurchaseTime.current < DEBOUNCE_MS) {
      if (__DEV__) {
        console.log('[ProfessionalCredits] Debounced - too soon since last purchase attempt');
      }
      return;
    }
    lastPurchaseTime.current = now;

    // Rate limit check
    const rateLimitResult = checkRateLimit(`credits_${currentProfessional.id}`, 'PAYMENT');
    if (rateLimitResult.isLimited) {
      setRateLimited(true);
      showAlert(
        'Please Wait',
        `Too many purchase attempts. Please try again in ${Math.ceil((rateLimitResult.retryAfterMs || 30000) / 1000)} seconds.`,
        [{ text: 'OK' }],
        'warning'
      );
      // Auto-reset rate limit flag
      setTimeout(() => setRateLimited(false), rateLimitResult.retryAfterMs || 30000);
      return;
    }

    const selectedPackage = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!selectedPackage) return;

    try {
      setProcessing(true);

      // Web: use Stripe checkout
      if (Platform.OS === 'web') {
        const stripeProductMap: Record<string, string> = {
          trial: 'trial_pack',
          starter: 'starter_pack',
          professional: 'professional_pack',
          business: 'business_pack',
          premium: 'premium_pack',
          'premium-pro': 'premium_pack',
        };
        const stripeProductId = stripeProductMap[packageId] ?? 'trial_pack';
        await openStripeCheckout({
          productId: stripeProductId,
          customerEmail: currentProfessional.email ?? undefined,
          professionalId: currentProfessional.id,
        });
        setProcessing(false);
        return;
      }

      // Native: use RevenueCat
      if (!isRevenueCatEnabled()) {
        showAlert(
          'Purchase Unavailable',
          'In-app purchases are only available on the mobile app.',
          [{ text: 'OK' }],
          'error'
        );
        setProcessing(false);
        return;
      }

      const rcPackageMap: Record<string, string> = {
        trial: '$rc_custom_trial_pack',
        starter: '$rc_custom_starter_pack',
        professional: '$rc_custom_professional_pack',
        business: '$rc_custom_business_pack',
        premium: '$rc_custom_premium_pack',
        'premium-pro': '$rc_custom_premium_pro_pack',
      };
      const rcPackageLookupKey = rcPackageMap[packageId] ?? '$rc_custom_trial_pack';

      if (__DEV__) console.log('[ProfessionalCredits] Purchasing RC package:', rcPackageLookupKey);

      const customerInfo = await purchaseProductFromOffering('credit_packs', rcPackageLookupKey);

      if (customerInfo) {
        // Purchase successful - add credits to professional's account
        const newCredits = currentProfessional.credits + selectedPackage.credits;
        updateProfessionalCredits(currentProfessional.id, newCredits);

        // Log to backend
        const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
        const INTERNAL_SECRET = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET || '';
        fetch(`${BACKEND_URL}/api/users/credit-purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-secret': INTERNAL_SECRET },
          body: JSON.stringify({
            professionalId: currentProfessional.id,
            professionalName: currentProfessional.name,
            professionalEmail: currentProfessional.email,
            packageId: packageId,
            packageName: selectedPackage.name,
            creditsGranted: selectedPackage.credits,
            isSubscription: false,
            amountGbp: selectedPackage.price ?? null,
            purchasedAt: new Date().toISOString(),
          }),
        }).catch(() => {});

        showAlert(
          'Credits Added!',
          `${selectedPackage.credits} credits have been added to your account. Your new balance is ${newCredits} credits.`,
          [{ text: 'Awesome!' }],
          'success'
        );
      } else {
        // Purchase was cancelled or failed
        showAlert(
          'Purchase Not Completed',
          'Your purchase was not completed. Please try again.',
          [{ text: 'OK' }],
          'info'
        );
      }
    } catch (error: unknown) {
      if (__DEV__) {
        console.error('Purchase error:', error);
      }
      const err = error as { userCancelled?: boolean };
      if (!err?.userCancelled) {
        showAlert(
          'Purchase Error',
          'Unable to complete purchase. Please try again.',
          [{ text: 'OK' }],
          'error'
        );
      }
    } finally {
      setProcessing(false);
    }
  }, [currentProfessional, updateProfessionalCredits, showAlert]);

  const handleUpgradeToPremium = useCallback(() => {
    // Navigate to Premium Paywall screen
    navigation.navigate('PremiumPaywall' as never);
  }, [navigation]);

  const handleRestorePurchases = useCallback(async () => {
    try {
      setProcessing(true);
      const customerInfo = await restorePurchases();

      if (customerInfo && Object.keys(customerInfo.entitlements.active).length > 0) {
        showAlert(
          'Restored!',
          'Your purchases have been restored successfully.',
          [{ text: 'OK' }],
          'success'
        );
      } else {
        showAlert(
          'No Purchases Found',
          'No previous purchases were found to restore.',
          [{ text: 'OK' }],
          'info'
        );
      }
    } catch {
      showAlert(
        'Restore Failed',
        'Failed to restore purchases. Please try again.',
        [{ text: 'OK' }],
        'error'
      );
    } finally {
      setProcessing(false);
    }
  }, [showAlert]);

  // Early return after all hooks
  if (!currentProfessional) {
    navigation.replace('ProfessionalAuth');
    return null;
  }

  // Use verified premium status if available, otherwise fall back to local (for loading state)
  const isPremium = verifiedPremium !== null ? verifiedPremium : currentProfessional.isPremium;
  const leadCost = isPremium ? LEAD_COST_PREMIUM : LEAD_COST_STANDARD;
  const availablePackages = getAvailablePackages(isPremium);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">Buy Credits</Text>
            <Text className="text-base text-gray-600">
              Purchase credits to access quality leads across multiple trades
            </Text>
          </View>

          {/* Current Balance */}
          <Card variant="elevated" padding="lg" className="mb-6 bg-gradient-to-br from-blue-600 to-blue-700">
            <Text className="text-white text-opacity-90 text-sm mb-2">CURRENT BALANCE</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-5xl font-bold">
                {currentProfessional.credits}
              </Text>
              <View className="bg-white bg-opacity-20 rounded-full p-4">
                <Ionicons name="wallet" size={32} color="white" />
              </View>
            </View>
            <Text className="text-white text-opacity-90 mt-2">
              credits available
            </Text>
          </Card>

          {/* Info Banner */}
          <InfoBanner 
            type="info"
            message={`Each lead costs ${leadCost} credits${isPremium ? ' (33% off with Premium!)' : '. Upgrade to Premium for 33% off!'}`}
          />

          <View className="h-4" />
          
          {/* Premium Upsell Card (for non-premium members) */}
          {!isPremium && (
            <Card variant="outlined" padding="lg" className="mb-6 border-purple-300 border-2 bg-gradient-to-br from-purple-50 to-blue-50">
              <View className="flex-row items-center mb-3">
                <Ionicons name="star" size={24} color="#9333ea" />
                <Text className="text-2xl font-bold text-gray-900 ml-2">Upgrade to Premium</Text>
              </View>
              
              <Text className="text-gray-700 mb-4">
                Save up to {formatCurrency(400, locale)}/year with cheaper leads and exclusive benefits
              </Text>

              {/* Benefits */}
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="text-gray-700 ml-2 flex-1">
                    33% cheaper leads (4 credits vs 6 credits)
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="text-gray-700 ml-2 flex-1">
                    Top priority placement in searches
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="text-gray-700 ml-2 flex-1">
                    Premium Pro badge on your profile
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="text-gray-700 ml-2 flex-1">
                    60 credits per month
                  </Text>
                </View>
              </View>

              {/* Pricing Options */}
              <Text className="text-sm font-semibold text-gray-700 mb-2">Choose Your Plan:</Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleUpgradeToPremium}
                  disabled={processing}
                  className="flex-1 bg-blue-600 py-4 rounded-xl active:opacity-80"
                >
                  <View className="items-center">
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="card" size={18} color="white" />
                      <Text className="text-white font-bold text-lg ml-2">
                        {formatCurrency(PREMIUM_PRICING.monthly.price, locale)}
                      </Text>
                    </View>
                    <Text className="text-white text-xs">per month</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={handleUpgradeToPremium}
                  disabled={processing}
                  className="flex-1 bg-green-600 py-4 rounded-xl active:opacity-80 border-2 border-yellow-400"
                >
                  <View className="items-center">
                    <View className="bg-yellow-400 px-2 py-0.5 rounded-full mb-1">
                      <Text className="text-green-900 text-xs font-bold">SAVE {formatCurrency(PREMIUM_PRICING.annual.savings, locale)}</Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="trophy" size={18} color="white" />
                      <Text className="text-white font-bold text-lg ml-2">
                        {formatCurrency(PREMIUM_PRICING.annual.price, locale)}
                      </Text>
                    </View>
                    <Text className="text-white text-xs">per year</Text>
                  </View>
                </Pressable>
              </View>
              <Text className="text-xs text-gray-500 text-center mt-2">
                Cancel anytime • No hidden fees • Instant activation
              </Text>
            </Card>
          )}

          {/* Premium Status (for premium members) */}
          {isPremium && (
            <Card variant="elevated" padding="md" className="mb-6 bg-purple-600">
              <View className="flex-row items-center">
                <Ionicons name="star" size={24} color="white" />
                <View className="ml-3 flex-1">
                  <Text className="text-white font-bold text-lg">Premium Member</Text>
                  <Text className="text-white text-opacity-90 text-sm">
                    Enjoying 33% cheaper leads at {LEAD_COST_PREMIUM} credits each
                  </Text>
                </View>
              </View>
            </Card>
          )}

          <ContextualHelp topic="credits" />

          {/* Package Cards */}
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Choose a Package
          </Text>

          {availablePackages.map((pkg) => (
            <CreditPackageCard
              key={pkg.id}
              package={pkg}
              onPurchase={() => handlePurchase(pkg.id)}
              recommended={pkg.featured}
              disabled={processing || rateLimited}
              isPremium={isPremium}
              leadCost={leadCost}
              locale={locale}
            />
          ))}

          {/* Restore Purchases */}
          <Pressable
            onPress={handleRestorePurchases}
            disabled={processing}
            className="py-4 items-center active:opacity-70"
          >
            <Text className="text-blue-600 font-semibold">Restore Purchases</Text>
          </Pressable>
        </View>
      </ScrollView>

      {processing && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <Card variant="elevated" padding="lg" className="items-center">
            <Text className="text-gray-900 font-semibold mt-4">Processing payment...</Text>
          </Card>
        </View>
      )}

      <AlertComponent />
    </SafeAreaView>
  );
}

const CreditPackageCard = React.memo<{
  package: {
    id: string;
    name: string;
    price: number;
    credits: number;
    pricePerCredit: number;
    estimatedLeads: number;
    estimatedLeadsPremium: number;
    savings: string;
    isPremiumOnly: boolean;
    featured?: boolean;
  };
  onPurchase: () => void;
  recommended?: boolean;
  disabled?: boolean;
  isPremium: boolean;
  leadCost: number;
  locale: any;
}>(({ package: pkg, onPurchase, recommended, disabled, isPremium, leadCost, locale }) => {
  const estimatedLeads = isPremium ? pkg.estimatedLeadsPremium : pkg.estimatedLeads;
  const costPerLead = (pkg.pricePerCredit * leadCost).toFixed(2);

  return (
    <Card
      variant={recommended ? 'outlined' : 'default'}
      padding="lg"
      className={`mb-4 ${recommended ? 'border-green-500 border-2' : ''} ${pkg.isPremiumOnly ? 'bg-purple-50 border-purple-300 border-2' : ''}`}
    >
      {recommended && (
        <View className="absolute -top-3 right-4">
          <Badge variant="success">BEST VALUE</Badge>
        </View>
      )}

      {pkg.isPremiumOnly && (
        <View className="absolute -top-3 left-4">
          <Badge variant="info">PREMIUM ONLY</Badge>
        </View>
      )}

      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-2xl font-bold text-gray-900">{pkg.name}</Text>
        {pkg.savings !== '-' && (
          <Badge variant="success" size="sm">{pkg.savings}</Badge>
        )}
      </View>
      
      <Text className="text-4xl font-bold text-blue-600 mb-2">{formatCurrency(pkg.price, locale)}</Text>

      <Card variant="elevated" padding="md" className="mb-4 bg-white">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-600">Credits</Text>
          <Text className="text-gray-900 font-bold text-lg">{pkg.credits}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-600">Estimated Leads</Text>
          <Text className="text-gray-900 font-bold text-lg">~{estimatedLeads.toFixed(1)}</Text>
        </View>
      </Card>

      <Button
        onPress={onPurchase}
        disabled={disabled}
        variant={recommended ? 'success' : 'primary'}
        fullWidth
      >
        <Ionicons name="card" size={20} color="white" style={{ marginRight: 8 }} />
        <Text className="text-white font-semibold">Purchase Package</Text>
      </Button>
    </Card>
  );
});
