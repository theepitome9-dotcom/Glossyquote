import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import { JobListing, TradeCategory } from '../types/glossy';
import { LEAD_COST_STANDARD, LEAD_COST_PREMIUM, TRADE_CATEGORIES, getTradeInfo } from '../config/trades-pricing';
import { getPackageById } from '../utils/trades-pricing';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfessionalJobBoard'>;

export default function ProfessionalJobBoardScreen({ navigation }: Props) {
  const currentProfessional = useAppStore((s) => s.currentProfessional);
  const jobListings = useAppStore((s) => s.jobListings);
  const purchaseLead = useAppStore((s) => s.purchaseLead);
  const [selectedFilter, setSelectedFilter] = useState<TradeCategory | 'all'>('all');

  if (!currentProfessional) {
    navigation.replace('ProfessionalAuth');
    return null;
  }

  const leadCost = currentProfessional.isPremium ? LEAD_COST_PREMIUM : LEAD_COST_STANDARD;

  // Filter available jobs (not full and not already purchased), newest first
  let availableJobs = jobListings
    .filter(
      (job) =>
        job.interestedProfessionals.length < job.maxProfessionals &&
        !job.interestedProfessionals.includes(currentProfessional.id)
    )
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  // Apply trade category filter
  if (selectedFilter !== 'all') {
    availableJobs = availableJobs.filter(job => job.tradeCategory === selectedFilter);
  }

  const handlePurchase = (job: JobListing) => {
    if (currentProfessional.credits < leadCost) {
      Alert.alert(
        'Insufficient Credits',
        `You need ${leadCost} credits to purchase this lead. You currently have ${currentProfessional.credits} credits.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Buy Credits',
            onPress: () => navigation.navigate('ProfessionalCredits'),
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Purchase Lead',
      `This will cost ${leadCost} credits. You will receive the customer's contact details immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: () => {
            const success = purchaseLead(job.id, currentProfessional.id);
            if (success) {
              Alert.alert(
                'Lead Purchased!',
                "You can now view the customer's contact details.",
                [{ text: 'OK', onPress: () => navigation.navigate('JobDetails', { job }) }]
              );
            } else {
              Alert.alert('Error', 'Unable to purchase lead. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Available Leads</Text>
            <Text className="text-gray-600">{availableJobs.length} jobs available</Text>
          </View>
          <View className="bg-blue-100 rounded-xl px-4 py-2">
            <Text className="text-blue-600 font-semibold">{currentProfessional.credits} credits</Text>
          </View>
        </View>

        {/* Trade Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mt-4"
        >
          <Pressable
            onPress={() => setSelectedFilter('all')}
            className={`mr-2 px-4 py-2 rounded-xl ${
              selectedFilter === 'all' ? 'bg-blue-600' : 'bg-gray-100'
            }`}
          >
            <Text className={`font-medium ${selectedFilter === 'all' ? 'text-white' : 'text-gray-700'}`}>
              All Trades
            </Text>
          </Pressable>
          {TRADE_CATEGORIES.map((trade) => (
            <Pressable
              key={trade.id}
              onPress={() => setSelectedFilter(trade.id)}
              className={`mr-2 px-4 py-2 rounded-xl flex-row items-center ${
                selectedFilter === trade.id ? 'bg-blue-600' : 'bg-gray-100'
              }`}
            >
              <Ionicons 
                name={trade.icon as any} 
                size={16} 
                color={selectedFilter === trade.id ? 'white' : '#6B7280'} 
              />
              <Text className={`ml-2 font-medium ${selectedFilter === trade.id ? 'text-white' : 'text-gray-700'}`}>
                {trade.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {availableJobs.length === 0 ? (
            <View className="items-center py-12">
              <View className="bg-gray-100 rounded-full p-8 mb-4">
                <Ionicons name="briefcase-outline" size={64} color="#9ca3af" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">No Jobs Available</Text>
              <Text className="text-gray-600 text-center">
                Check back soon for new leads in your selected category
              </Text>
            </View>
          ) : (
            availableJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPurchase={() => handlePurchase(job)}
                leadCost={leadCost}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function JobCard({ job, onPurchase, leadCost }: { job: JobListing; onPurchase: () => void; leadCost: number }) {
  const spotsLeft = job.maxProfessionals - job.interestedProfessionals.length;
  const tradeInfo = getTradeInfo(job.tradeCategory);
  const pkgId = job.estimate?.request.packageId;
  const pkg = pkgId ? getPackageById(pkgId) : null;
  // Only show total area for manually-measured rooms (not package-based estimates)
  const totalArea = !pkgId && job.estimate?.request.rooms.reduce((sum, r) => sum + r.squareMeters, 0);

  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          {/* Trade Category Badge */}
          <View className="flex-row items-center mb-2">
            <View className="bg-blue-100 rounded-lg px-3 py-1 flex-row items-center">
              <Ionicons name={tradeInfo?.icon as any} size={14} color="#2563eb" />
              <Text className="text-blue-700 text-xs font-bold ml-1">
                {tradeInfo?.name}
              </Text>
            </View>
            {tradeInfo?.hasEstimator && (
              <View className="bg-green-100 rounded-lg px-2 py-1 ml-2">
                <Text className="text-green-700 text-xs font-semibold">Instant Estimate</Text>
              </View>
            )}
          </View>

          <Text className="text-xl font-bold text-gray-900 mb-1">
            {job.estimate
              ? (() => {
                  if (pkgId) return pkg?.name || tradeInfo?.name || 'Job';
                  return `${job.estimate.request.rooms.length} Room ${tradeInfo?.name || 'Job'}`;
                })()
              : tradeInfo?.name || 'Job'}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text className="text-gray-600 ml-1 font-medium">
              {job.postcode ? job.postcode.toUpperCase() : 'Location not specified'}
            </Text>
          </View>
        </View>
        {spotsLeft <= 2 && (
          <View className="bg-orange-100 rounded-lg px-3 py-1">
            <Text className="text-orange-700 text-xs font-bold">
              {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
            </Text>
          </View>
        )}
      </View>

      {/* Estimate Range (if available) */}
      {job.estimate && (
        <View className="bg-green-50 rounded-xl p-4 mb-4">
          <Text className="text-sm text-green-800 mb-1">ESTIMATED VALUE</Text>
          <Text className="text-2xl font-bold text-green-600">
            £{job.estimate.totalMinPrice} - £{job.estimate.totalMaxPrice}
          </Text>
        </View>
      )}

      {/* Details */}
      <View className="space-y-2 mb-4">
        {totalArea && (
          <DetailRow
            icon="resize"
            label="Total Area"
            value={`${totalArea} m²`}
          />
        )}
        {job.estimate && (
          <DetailRow
            icon="home"
            label="Property Type"
            value={job.estimate.request.propertyType.charAt(0).toUpperCase() + 
                   job.estimate.request.propertyType.slice(1)}
          />
        )}
        <DetailRow
          icon="calendar"
          label="Posted"
          value={new Date(job.postedAt).toLocaleDateString()}
        />
        {job.images && job.images.length > 0 && (
          <DetailRow
            icon="camera"
            label="Photos"
            value={`${job.images.length} photo(s)`}
          />
        )}
      </View>

      {/* Extras (if painting job with estimate) */}
      {job.estimate && (job.estimate.request.extras.doors > 0 ||
        job.estimate.request.extras.windows > 0 ||
        job.estimate.request.extras.skirtingBoardRooms > 0) && (
        <View className="bg-gray-50 rounded-xl p-3 mb-4">
          <Text className="text-xs font-semibold text-gray-700 mb-2">ADDITIONAL ITEMS</Text>
          <View className="flex-row flex-wrap">
            {job.estimate.request.extras.doors > 0 && (
              <Text className="text-xs text-gray-600 mr-3">
                🚪 {job.estimate.request.extras.doors} door(s)
              </Text>
            )}
            {job.estimate.request.extras.windows > 0 && (
              <Text className="text-xs text-gray-600 mr-3">
                🪟 {job.estimate.request.extras.windows} window(s)
              </Text>
            )}
            {job.estimate.request.extras.skirtingBoardRooms > 0 && (
              <Text className="text-xs text-gray-600">
                📏 Skirting in {job.estimate.request.extras.skirtingBoardRooms} room(s)
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Description */}
      {job.description && (
        <View className="mb-4">
          <Text className="text-gray-700 leading-5">{job.description}</Text>
        </View>
      )}

      {/* Purchase Button */}
      <Pressable
        onPress={onPurchase}
        className="bg-blue-600 py-4 rounded-xl active:opacity-80 flex-row items-center justify-center"
      >
        <Ionicons name="card" size={20} color="white" />
        <Text className="text-white font-semibold ml-2">
          Purchase for {leadCost} Credits
        </Text>
      </Pressable>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View className="flex-row items-center">
      <Ionicons name={icon} size={16} color="#6b7280" />
      <Text className="text-gray-600 ml-2 flex-1">{label}</Text>
      <Text className="text-gray-900 font-medium">{value}</Text>
    </View>
  );
}
