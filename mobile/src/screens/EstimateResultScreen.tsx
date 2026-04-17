import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { formatPriceRange, findNearestPricing, getPropertyMultiplier, getPostcodeMultiplier } from '../utils/estimate-calculator';
import { TRADE_INFO, TRADE_DISCLAIMERS, getPackageById } from '../utils/trades-pricing';
import { useAppStore } from '../state/appStore';
import { TradeCategory } from '../types/glossy';

type Props = NativeStackScreenProps<RootStackParamList, 'EstimateResult'>;

// High-end cities disclaimer - applies to all trades
const HIGH_END_CITIES_DISCLAIMER = 'Note: High-end cities like London, NYC, or Sydney may exceed the high-range estimates due to parking fees, congestion charges, and logistics.';

// Trade-specific estimate labels
const getEstimateLabel = (tradeCategory: TradeCategory): string => {
  switch (tradeCategory) {
    case 'painting-decorating':
      return 'CEILING & WALLS ESTIMATE';
    case 'plastering':
      return 'PLASTERING ESTIMATE';
    case 'flooring':
      return 'FLOORING ESTIMATE';
    case 'tiling':
      return 'TILING ESTIMATE';
    case 'kitchen-fitting':
      return 'KITCHEN FITTING ESTIMATE';
    default:
      return 'JOB ESTIMATE';
  }
};

export default function EstimateResultScreen({ navigation, route }: Props) {
  const { estimate } = route.params;
  const locale = useAppStore((s) => s.locale);

  // Get trade category from estimate or default to painting
  const tradeCategory: TradeCategory = estimate.request.tradeCategory || 'painting-decorating';
  const tradeInfo = TRADE_INFO[tradeCategory];
  const tradeDisclaimer = TRADE_DISCLAIMERS[tradeCategory];
  const isPaintingTrade = tradeCategory === 'painting-decorating';

  // Get package name if using quick quote
  const packageInfo = estimate.request.packageId ? getPackageById(estimate.request.packageId) : null;

  // DEBUG: Log estimate data only in development
  useEffect(() => {
    if (__DEV__) {
      console.log('[EstimateResult] Loaded estimate for trade:', tradeCategory);
    }
  }, [estimate, tradeCategory]);

  // CRITICAL SECURITY CHECK: Block access if estimate not paid
  useEffect(() => {
    if (!estimate.paid) {
      if (__DEV__) {
        console.warn('⚠️ Attempted access to unpaid estimate:', estimate.id);
      }
      // Redirect back to payment screen
      navigation.replace('PaymentSelection', { estimate });
    }
  }, [estimate, navigation]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My GLOSSY ${tradeInfo.name.toLowerCase()} estimate: ${formatPriceRange(
          estimate.totalMinPrice,
          estimate.totalMaxPrice,
          locale
        )}. Get yours at GLOSSY!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostJob = () => {
    navigation.navigate('JobPosting', { estimate });
  };

  const totalDoors = estimate.request.extras.doors;
  const totalWindows = estimate.request.extras.windows;
  const totalSkirtingRooms = estimate.request.extras.skirtingBoardRooms;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Success Header */}
          <View className="items-center mb-8">
            <View className="bg-green-100 rounded-full p-6 mb-4">
              <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Your Estimate</Text>
            <Text className="text-base text-gray-600 text-center">
              Here is your detailed {tradeInfo.name.toLowerCase()} cost estimate
            </Text>
          </View>

          {/* Main Estimate Card */}
          <LinearGradient
            colors={['#2563eb', '#1e40af']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 24, marginBottom: 24 }}
          >
            <Text className="text-white text-opacity-90 text-sm font-medium mb-2 text-center">
              {getEstimateLabel(tradeCategory)}
            </Text>
            <Text className="text-white text-4xl font-bold text-center mb-4">
              {formatPriceRange(estimate.totalMinPrice, estimate.totalMaxPrice, locale)}
            </Text>
            <View className="bg-white bg-opacity-20 rounded-xl p-3">
              {/* Only show room count for detailed entry mode */}
              {!estimate.request.packageId && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white text-opacity-90">Rooms:</Text>
                  <Text className="text-white font-semibold">
                    {estimate.request.rooms.length}
                  </Text>
                </View>
              )}

              {/* Only show total area for detailed entry mode */}
              {!estimate.request.packageId && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white text-opacity-90">Total area:</Text>
                  <Text className="text-white font-semibold">
                    {estimate.request.rooms.reduce((sum, r) => sum + r.squareMeters, 0)} m²
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between">
                <Text className="text-white text-opacity-90">Property:</Text>
                <Text className="text-white font-semibold capitalize">
                  {estimate.request.propertyType}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Room Breakdown - Only show for detailed entry mode (painting only) */}
          {!estimate.request.packageId && isPaintingTrade && (
            <View className="bg-gray-50 rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">Room Breakdown</Text>
              {estimate.request.rooms.map((room, index) => {
                const pricing = findNearestPricing(room.squareMeters);
                const propertyMult = getPropertyMultiplier(estimate.request.propertyType);
                const postcodeMult = getPostcodeMultiplier(estimate.request.postcode);
                const minPrice = Math.round((pricing.minPrice * propertyMult * postcodeMult) / 10) * 10;
                const maxPrice = Math.round((pricing.maxPrice * propertyMult * postcodeMult) / 10) * 10;

                return (
                  <View
                    key={index}
                    className="py-3 border-b border-gray-200"
                  >
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-gray-900 font-medium">Room {index + 1}</Text>
                      <Text className="text-gray-900 font-semibold">{room.squareMeters} m²</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-500 text-sm">
                        {room.length}m × {room.width}m
                      </Text>
                      <Text className="text-green-600 font-semibold text-sm">
                        {formatPriceRange(minPrice, maxPrice, locale)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Package Info - Show for quick quote mode */}
          {estimate.request.packageId && (
            <View className="bg-gray-50 rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">Project Details</Text>
              <View className="py-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-600">Trade</Text>
                  <Text className="text-gray-900 font-semibold">
                    {tradeInfo.icon} {tradeInfo.name}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-600">Property Type</Text>
                  <Text className="text-gray-900 font-semibold capitalize">
                    {estimate.request.propertyType}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-600">Package</Text>
                  <Text className="text-gray-900 font-semibold">
                    {packageInfo?.name || estimate.request.packageId.replace(/-/g, ' ')}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600">Postcode</Text>
                  <Text className="text-gray-900 font-semibold uppercase">
                    {estimate.request.postcode}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* FREE Woodwork Estimates - ONLY for painting-decorating trade */}
          {isPaintingTrade && (
            <View className="bg-green-50 rounded-2xl p-6 mb-6">
              <View className="flex-row items-center mb-4">
                <View className="bg-green-600 rounded-full px-3 py-1 mr-3">
                  <Text className="text-white text-xs font-bold">FREE</Text>
                </View>
                <Text className="text-lg font-semibold text-gray-900">Woodwork Estimates</Text>
              </View>

              {totalDoors > 0 && (
                <WoodworkItem
                  icon="exit-outline"
                  label={`${totalDoors} Door(s) & Frame(s)`}
                  priceRange={formatPriceRange(
                    estimate.woodworkPricing.doorFrame.min * totalDoors,
                    estimate.woodworkPricing.doorFrame.max * totalDoors,
                    locale
                  )}
                />
              )}

              {totalWindows > 0 && (
                <WoodworkItem
                  icon="square-outline"
                  label={`${totalWindows} Window(s)`}
                  priceRange={formatPriceRange(
                    estimate.woodworkPricing.window.min * totalWindows,
                    estimate.woodworkPricing.window.max * totalWindows,
                    locale
                  )}
                />
              )}

              {totalSkirtingRooms > 0 && (
                <WoodworkItem
                  icon="remove-outline"
                  label={`Skirting Boards (${totalSkirtingRooms} room(s))`}
                  priceRange={formatPriceRange(
                    estimate.woodworkPricing.skirtingBoards.min * totalSkirtingRooms,
                    estimate.woodworkPricing.skirtingBoards.max * totalSkirtingRooms,
                    locale
                  )}
                />
              )}

              {totalDoors === 0 && totalWindows === 0 && totalSkirtingRooms === 0 && (
                <View className="bg-white rounded-xl p-4">
                  <Text className="text-gray-600 text-center">
                    No additional woodwork items specified
                  </Text>
                  <Text className="text-gray-500 text-sm text-center mt-2">
                    Standard woodwork pricing:
                  </Text>
                  <Text className="text-gray-600 text-xs text-center mt-1">
                    Doors: {formatPriceRange(35, 90, locale)} • Windows: {formatPriceRange(40, 70, locale)}
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Skirting: {formatPriceRange(40, 80, locale)} per room
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Trade-specific disclaimer */}
          <View className="bg-yellow-50 rounded-xl p-4 mb-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#f59e0b" />
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-gray-900 mb-1">Important Notice</Text>
                <Text className="text-sm text-gray-700 leading-5">{tradeDisclaimer}</Text>
              </View>
            </View>
          </View>

          {/* High-end cities disclaimer */}
          <View className="bg-amber-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="warning" size={20} color="#d97706" />
              <View className="flex-1 ml-3">
                <Text className="text-sm text-amber-800 leading-5">{HIGH_END_CITIES_DISCLAIMER}</Text>
              </View>
            </View>
          </View>

          {/* CTA Section */}
          <View className="bg-blue-50 rounded-2xl p-6 mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
              Ready to get started?
            </Text>
            <Text className="text-gray-600 text-center mb-4">
              Post your job and connect with up to 4 verified {tradeInfo.name.toLowerCase()} professionals in your area
            </Text>
            <Pressable
              onPress={handlePostJob}
              className="bg-blue-600 py-4 rounded-xl active:opacity-80 flex-row items-center justify-center"
            >
              <Ionicons name="megaphone" size={24} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">Post Your Job</Text>
            </Pressable>
            <Text className="text-xs text-gray-500 text-center mt-3">
              {"Free to post • Your contact details won't be visible until purchased"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 py-4 border-t border-gray-200 bg-white flex-row space-x-3">
        <Pressable
          onPress={handleShare}
          className="flex-1 bg-gray-100 py-4 rounded-xl active:opacity-80 flex-row items-center justify-center"
        >
          <Ionicons name="share-social" size={20} color="#374151" />
          <Text className="text-gray-800 font-semibold ml-2">Share</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Welcome')}
          className="flex-1 bg-blue-600 py-4 rounded-xl active:opacity-80 flex-row items-center justify-center"
        >
          <Ionicons name="home" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function WoodworkItem({
  icon,
  label,
  priceRange,
}: {
  icon: any;
  label: string;
  priceRange: string;
}) {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center">
      <View className="bg-green-100 rounded-full p-2 mr-3">
        <Ionicons name={icon} size={20} color="#16a34a" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-medium">{label}</Text>
        <Text className="text-green-600 font-semibold">{priceRange}</Text>
      </View>
    </View>
  );
}
