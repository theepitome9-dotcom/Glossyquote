import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PurchasesPackage } from 'react-native-purchases';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import { getEstimatePriceTier, formatCurrency, ESTIMATE_PRICE } from '../utils/estimate-calculator';
import { TRADE_DISCLAIMERS, TRADE_INFO } from '../utils/trades-pricing';
import { TradeCategory } from '../types/glossy';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/common/InfoBanner';
import { useAlert } from '../components/modals/CustomAlert';
import { t } from '../config/translations';
import { getOfferings, purchasePackage, isRevenueCatEnabled, restorePurchases } from '../lib/revenuecatClient';
import { useSecureAction } from '../hooks/useSecureAction';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSelection'>;

export default function PaymentSelectionScreen({ navigation, route }: Props) {
  const { estimate } = route.params;
  const markEstimateAsPaid = useAppStore((s) => s.markEstimateAsPaid);
  const locale = useAppStore((s) => s.locale);
  const { showAlert, AlertComponent } = useAlert();

  const [processing, setProcessing] = useState(false);
  const cachedPkgRef = useRef<PurchasesPackage | null>(null);

  // Pre-load the package when the screen mounts so Pay button fires instantly
  useEffect(() => {
    if (!isRevenueCatEnabled()) return;
    getOfferings().then((offerings) => {
      if (!offerings) return;
      let pkg: PurchasesPackage | undefined;
      const estimatesOffering = offerings.all?.['estimates'];
      if (estimatesOffering) {
        pkg = estimatesOffering.availablePackages.find(
          (p: PurchasesPackage) => p.identifier === '$rc_custom_estimate'
        );
      }
      if (!pkg && offerings.current) {
        pkg = offerings.current.availablePackages.find(
          (p: PurchasesPackage) => p.identifier === '$rc_custom_estimate'
        );
      }
      if (pkg) {
        cachedPkgRef.current = pkg;
        if (__DEV__) console.log('[PaymentSelection] Package pre-loaded:', pkg.identifier);
      }
    }).catch(() => {});
  }, []);

  const priceTier = getEstimatePriceTier(estimate.request);

  // Get trade category from estimate (stored when estimate was created)
  const tradeCategory: TradeCategory = estimate.request.tradeCategory || 'painting-decorating';
  const tradeInfo = TRADE_INFO[tradeCategory];
  const disclaimerText = TRADE_DISCLAIMERS[tradeCategory];
  const isPaintingTrade = tradeCategory === 'painting-decorating';

  const performPayment = useCallback(async () => {
    if (!isRevenueCatEnabled()) {
      showAlert(
        'Payment Unavailable',
        'In-app purchases are only available on iOS. Please use the mobile app to purchase estimates.',
        [{ text: 'OK' }],
        'error'
      );
      return null;
    }

    // Use pre-loaded package or fetch if not ready yet
    let pkg: PurchasesPackage | null = cachedPkgRef.current;

    if (!pkg) {
      const offerings = await getOfferings();
      if (!offerings) {
        showAlert('Error', 'Unable to load payment options. Please try again.', [{ text: 'OK' }], 'error');
        return null;
      }
      const estimatesOffering = offerings.all?.['estimates'];
      if (estimatesOffering) {
        pkg = estimatesOffering.availablePackages.find(
          (p: PurchasesPackage) => p.identifier === '$rc_custom_estimate'
        ) ?? null;
      }
      if (!pkg && offerings.current) {
        pkg = offerings.current.availablePackages.find(
          (p: PurchasesPackage) => p.identifier === '$rc_custom_estimate'
        ) ?? null;
      }
    }

    if (!pkg) {
      showAlert('Error', 'Unable to find payment option. Please try again later.', [{ text: 'OK' }], 'error');
      return null;
    }

    // Purchase - this opens Apple's payment sheet immediately
    const customerInfo = await purchasePackage(pkg);

    if (customerInfo) {
      markEstimateAsPaid(estimate.id);
      showAlert(
        'Payment Successful!',
        'Your estimate is ready to view.',
        [
          {
            text: 'View Estimate',
            onPress: () => navigation.replace('EstimateResult', { estimate: { ...estimate, paid: true } }),
          },
        ],
        'success'
      );
      return customerInfo;
    } else {
      showAlert(
        'Payment Not Completed',
        'Your payment was not completed. Please try again.',
        [{ text: 'OK' }],
        'info'
      );
      return null;
    }
  }, [estimate, markEstimateAsPaid, navigation, showAlert]);

  // Debounce only - no rate limit so customers can retry freely after Face ID/cancel
  const { execute: executePayment, isExecuting: isPaymentExecuting } = useSecureAction(
    performPayment,
    { debounceMs: 800 }
  );

  const handlePayment = useCallback(async () => {
    try {
      setProcessing(true);
      await executePayment();
    } catch (error: unknown) {
      if (__DEV__) {
        console.error('Payment error:', error);
      }
      const err = error as { userCancelled?: boolean };
      if (!err?.userCancelled) {
        showAlert(
          'Payment Error',
          'Unable to process payment. Please try again.',
          [{ text: 'OK' }],
          'error'
        );
      }
    } finally {
      setProcessing(false);
    }
  }, [executePayment, showAlert]);

  const handleSkipToJobPosting = useCallback(() => {
    showAlert(
      'Skip Payment & Post Job Free',
      "You can post your job for free without purchasing the detailed estimate. Professionals will still see your project details and can contact you.",
      [
        {
          text: 'Go Back',
          style: 'cancel',
        },
        {
          text: 'Post Job Free',
          onPress: () => {
            // Navigate directly to job posting without paying
            navigation.navigate('JobPosting', { estimate });
          },
        },
      ],
      'info'
    );
  }, [estimate, navigation, showAlert]);

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
    } catch (error) {
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-blue-100 rounded-full p-6 mb-4">
              <Ionicons name="receipt-outline" size={48} color="#2563eb" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Your Estimate</Text>
            <Text className="text-base text-gray-600 text-center">
              Get your detailed {tradeInfo.name.toLowerCase()} estimate
            </Text>
          </View>

          {/* Estimate Summary */}
          <Card variant="elevated" padding="lg" className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <Text className="text-sm font-medium text-blue-800 mb-2">ESTIMATE SUMMARY</Text>
            
            <View className="border-b border-blue-200 pb-4 mb-4">
              {/* Only show room count for detailed entry mode */}
              {!estimate.request.packageId && (
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-700">Number of rooms</Text>
                  <Text className="font-semibold text-gray-900">
                    {estimate.request.rooms.length}
                  </Text>
                </View>
              )}
              
              {/* Only show total area for detailed entry mode */}
              {!estimate.request.packageId && (
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-700">Total area</Text>
                  <Text className="font-semibold text-gray-900">
                    {estimate.request.rooms.reduce((sum, r) => sum + r.squareMeters, 0)} m²
                  </Text>
                </View>
              )}
              
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-700">Property type</Text>
                <Text className="font-semibold text-gray-900 capitalize">
                  {estimate.request.propertyType}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Postcode</Text>
                <Text className="font-semibold text-gray-900 uppercase">
                  {estimate.request.postcode}
                </Text>
              </View>
            </View>

            {/* Extras - Only show for painting trade */}
            {isPaintingTrade && (estimate.request.extras.doors > 0 ||
              estimate.request.extras.windows > 0 ||
              estimate.request.extras.skirtingBoardRooms > 0 ||
              estimate.request.extras.bannister) && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-blue-800 mb-2">ADDITIONAL ITEMS</Text>
                {estimate.request.extras.doors > 0 && (
                  <Text className="text-gray-700 mb-1">
                    • {estimate.request.extras.doors} door(s) & frame(s)
                  </Text>
                )}
                {estimate.request.extras.windows > 0 && (
                  <Text className="text-gray-700 mb-1">
                    • {estimate.request.extras.windows} window(s)
                  </Text>
                )}
                {estimate.request.extras.skirtingBoardRooms > 0 && (
                  <Text className="text-gray-700 mb-1">
                    • Skirting boards in {estimate.request.extras.skirtingBoardRooms} room(s)
                  </Text>
                )}
                {estimate.request.extras.bannister && (
                  <Text className="text-gray-700 mb-1">• Bannister</Text>
                )}
              </View>
            )}

            {/* Price */}
            <Card variant="elevated" padding="md" className="bg-white">
              <Text className="text-sm text-gray-600 mb-1 text-center">{t('payment.cost', locale)}</Text>
              <Text className="text-3xl font-bold text-blue-600 text-center">
                {formatCurrency(priceTier.price, locale)}
              </Text>
            </Card>
          </Card>

          {/* What's Included */}
          <Card variant="default" padding="lg" className="mb-6 bg-blue-50 border-2 border-blue-300">
            <View className="flex-row items-center mb-4">
              <View className="bg-blue-600 rounded-full p-2 mr-3">
                <Ionicons name="lock-closed" size={20} color="white" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 flex-1">
                {"Unlock Your Detailed Estimate"}
              </Text>
            </View>
            <Text className="text-sm text-gray-600 mb-4">
              {t('payment.pay', locale, { amount: formatCurrency(priceTier.price, locale) })}
            </Text>
            {tradeCategory === 'painting-decorating' ? (
              <>
                <IncludedItem text="Detailed price range for painting ceilings and walls" />
                <IncludedItem text="FREE woodwork estimates (doors, windows, skirting)" />
                <IncludedItem text="Location-based pricing adjustments" />
                <IncludedItem text="Professional-grade estimate report" />
              </>
            ) : tradeCategory === 'plastering' ? (
              <>
                <IncludedItem text="Detailed price range for plastering work" />
                <IncludedItem text="Skimming, boarding, and dry lining costs" />
                <IncludedItem text="Location-based pricing adjustments" />
                <IncludedItem text="Professional-grade estimate report" />
              </>
            ) : tradeCategory === 'flooring' ? (
              <>
                <IncludedItem text="Detailed price range for flooring installation" />
                <IncludedItem text="Laminate fitting with underlay and trim" />
                <IncludedItem text="Location-based pricing adjustments" />
                <IncludedItem text="Professional-grade estimate report" />
              </>
            ) : tradeCategory === 'tiling' ? (
              <>
                <IncludedItem text="Detailed price range for tiling work" />
                <IncludedItem text="Floor and wall tiling labour costs" />
                <IncludedItem text="Location-based pricing adjustments" />
                <IncludedItem text="Professional-grade estimate report" />
              </>
            ) : tradeCategory === 'kitchen-fitting' ? (
              <>
                <IncludedItem text="Detailed price range for kitchen fitting" />
                <IncludedItem text="Unit installation and worktop fitting" />
                <IncludedItem text="Location-based pricing adjustments" />
                <IncludedItem text="Professional-grade estimate report" />
              </>
            ) : (
              <>
                <IncludedItem text={`Detailed price range for ${tradeInfo.name.toLowerCase()}`} />
                <IncludedItem text="Labour cost breakdown" />
                <IncludedItem text="Location-based pricing adjustments" />
                <IncludedItem text="Professional-grade estimate report" />
              </>
            )}
          </Card>

          {/* FREE Option Highlight */}
          <Card variant="outlined" padding="lg" className="mb-6 border-blue-300 border-2">
            <View className="flex-row items-center mb-3">
              <Badge variant="info" size="md">FREE</Badge>
              <Text className="text-xl font-bold text-gray-900 ml-2">No Payment Required!</Text>
            </View>
            <Text className="text-gray-700 mb-4 leading-5">
              You can skip the estimate payment and post your job for FREE. Up to 4 verified {tradeInfo.name.toLowerCase()} professionals can still view and contact you about your project.
            </Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text className="text-gray-700 ml-2 flex-1">Post your job details</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text className="text-gray-700 ml-2 flex-1">Connect with professionals</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text className="text-gray-700 ml-2 flex-1">Get quotes from up to 4 tradespeople</Text>
            </View>
          </Card>

          {/* Disclaimer */}
          <InfoBanner
            type="warning"
            message={disclaimerText}
          />
        </View>
      </ScrollView>

      {/* Payment Buttons */}
      <View className="px-6 py-4 border-t border-gray-200 bg-white">
        <Button
          onPress={handlePayment}
          loading={processing || isPaymentExecuting}
          fullWidth
          className="mb-3"
        >
          <Ionicons name="card-outline" size={24} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white text-lg font-semibold">
            {t('payment.pay', locale, { amount: formatCurrency(priceTier.price, locale) })}
          </Text>
        </Button>

        {/* FREE Job Posting Button */}
        <Button
          onPress={handleSkipToJobPosting}
          variant="success"
          fullWidth
          className="mb-2"
        >
          <Ionicons name="megaphone" size={24} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white text-lg font-semibold">
            {t('payment.skipFree', locale)}
          </Text>
        </Button>

        <Text className="text-center text-sm text-gray-500 mt-2">
          {t('payment.secure', locale)}
        </Text>

        {/* Restore Purchases */}
        <Pressable
          onPress={handleRestorePurchases}
          disabled={processing}
          className="py-3 items-center active:opacity-70"
        >
          <Text className="text-blue-600 font-semibold text-sm">Restore Purchases</Text>
        </Pressable>
      </View>

      <AlertComponent />
    </SafeAreaView>
  );
}

const IncludedItem = React.memo<{ text: string }>(({ text }) => (
  <View className="flex-row items-center mb-2">
    <View className="bg-green-600 rounded-full p-1 mr-3">
      <Ionicons name="checkmark" size={16} color="white" />
    </View>
    <Text className="text-gray-700 flex-1">{text}</Text>
  </View>
));
