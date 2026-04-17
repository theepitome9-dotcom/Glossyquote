import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import { LEAD_COST_STANDARD, LEAD_COST_PREMIUM, PREMIUM_PRICING } from '../config/trades-pricing';
import { verifyPremiumStatus } from '../lib/revenuecatClient';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfessionalDashboard'>;

export default function ProfessionalDashboardScreen({ navigation }: Props) {
  const currentProfessional = useAppStore((s) => s.currentProfessional);
  const jobListings = useAppStore((s) => s.jobListings);
  const updateProfessionalPremium = useAppStore((s) => s.updateProfessionalPremium);

  // Sync premium status with RevenueCat on every dashboard load
  useEffect(() => {
    if (!currentProfessional) return;
    verifyPremiumStatus().then(({ isPremium }) => {
      // Always sync — RC is source of truth
      updateProfessionalPremium(currentProfessional.id, isPremium);
    }).catch(() => {/* non-blocking */});
  }, [currentProfessional?.id]);

  if (!currentProfessional) {
    navigation.replace('ProfessionalAuth');
    return null;
  }

  const availableJobs = jobListings.filter(
    (job) =>
      job.interestedProfessionals.length < job.maxProfessionals &&
      !job.interestedProfessionals.includes(currentProfessional.id)
  );

  const myLeads = jobListings.filter((job) =>
    job.interestedProfessionals.includes(currentProfessional.id)
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-1">Welcome back,</Text>
            <View className="flex-row items-center flex-wrap gap-2">
              <Text className="text-3xl font-bold text-gray-900">{currentProfessional.name}</Text>
              {currentProfessional.isPremium && (
                <View className="flex-row items-center bg-purple-600 rounded-full px-3 py-1">
                  <Ionicons name="star" size={12} color="white" />
                  <Text className="text-white text-xs font-bold ml-1">PREMIUM</Text>
                </View>
              )}
            </View>
          </View>

          {/* Premium Badge (for premium members) */}
          {currentProfessional.isPremium && (
            <View className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center">
                <Ionicons name="star" size={28} color="white" />
                <View className="ml-3 flex-1">
                  <Text className="text-white font-bold text-xl">Premium Member</Text>
                  <Text className="text-white text-opacity-90 text-sm">
                    Enjoying 33% cheaper leads at {LEAD_COST_PREMIUM} credits each
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Premium Upgrade CTA (for non-premium members) */}
          {!currentProfessional.isPremium && (
            <Pressable
              onPress={() => navigation.navigate('ProfessionalCredits')}
              className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-4 mb-6 border-2 border-purple-300 active:opacity-80"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="star" size={20} color="#9333ea" />
                    <Text className="text-purple-900 font-bold text-lg ml-2">Upgrade to Premium</Text>
                  </View>
                  <Text className="text-gray-700 text-sm mb-2">
                    Get 33% cheaper leads + priority placement
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-purple-700 font-semibold text-sm">
                      From £{PREMIUM_PRICING.monthly.price}/month
                    </Text>
                    <Text className="text-green-600 font-semibold text-xs ml-2">
                      (or save £{PREMIUM_PRICING.annual.savings} annually)
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9333ea" />
              </View>
            </Pressable>
          )}

          {/* Credits Card */}
          <View className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-white text-opacity-90 text-sm mb-1">Your Credits</Text>
                <Text className="text-white text-4xl font-bold">
                  {currentProfessional.credits}
                </Text>
              </View>
              <View className="bg-white bg-opacity-20 rounded-full p-4">
                <Ionicons name="wallet" size={32} color="white" />
              </View>
            </View>
            <Pressable
              onPress={() => navigation.navigate('ProfessionalCredits')}
              className="bg-white py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-blue-600 text-center font-semibold">Buy More Credits</Text>
            </Pressable>
          </View>

          {/* Stats */}
          <View className="flex-row mb-6 space-x-3">
            <Pressable onPress={() => navigation.navigate('MyLeads')} className="flex-1 bg-gray-50 rounded-2xl p-4 active:opacity-70">
              <Text className="text-gray-600 text-sm mb-1">Active Leads</Text>
              <Text className="text-gray-900 text-2xl font-bold">{myLeads.length}</Text>
            </Pressable>
            <View className="flex-1 bg-gray-50 rounded-2xl p-4">
              <Text className="text-gray-600 text-sm mb-1">Available Jobs</Text>
              <Text className="text-gray-900 text-2xl font-bold">{availableJobs.length}</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl p-4">
              <Text className="text-gray-600 text-sm mb-1">Rating</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-900 text-2xl font-bold">
                  {currentProfessional.rating > 0
                    ? currentProfessional.rating.toFixed(1)
                    : '-'}
                </Text>
                {currentProfessional.rating > 0 && (
                  <Ionicons name="star" size={16} color="#eab308" className="ml-1" />
                )}
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
            <View className="space-y-3">
              <ActionButton
                icon="briefcase"
                title="Browse Job Leads"
                subtitle={`${availableJobs.length} jobs available`}
                onPress={() => navigation.navigate('ProfessionalJobBoard')}
                color="blue"
              />
              <ActionButton
                icon="checkmark-circle"
                title="My Purchased Leads"
                subtitle={`${myLeads.length} lead${myLeads.length !== 1 ? 's' : ''} purchased`}
                onPress={() => navigation.navigate('MyLeads')}
                color="green"
              />
              <ActionButton
                icon="map"
                title="Lead Map"
                subtitle="View leads by location"
                onPress={() => navigation.navigate('LeadMap')}
                color="green"
              />
              <ActionButton
                icon="analytics"
                title="Performance Dashboard"
                subtitle="Track your stats & ROI"
                onPress={() => navigation.navigate('PerformanceDashboard')}
                color="blue"
              />
              <ActionButton
                icon="person"
                title="My Profile"
                subtitle="Update your information"
                onPress={() => navigation.navigate('ProfessionalProfile')}
                color="gray"
              />
              <ActionButton
                icon="gift"
                title="Refer & Earn £50"
                subtitle="Invite other professionals"
                onPress={() => navigation.navigate('Referral')}
                color="green"
              />
            </View>
          </View>

          {/* Referral Banner */}
          <Pressable
            onPress={() => navigation.navigate('Referral')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 mb-6 active:opacity-90"
          >
            <View className="flex-row items-center">
              <View className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                <Ionicons name="people" size={28} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-1">Refer a Friend, Earn £50</Text>
                <Text className="text-white text-opacity-90 text-sm">
                  They get £25 bonus credits • You get £50 when they buy leads
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </Pressable>

          {/* My Active Leads */}
          {myLeads.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">My Active Leads</Text>
              {myLeads.slice(0, 3).map((job) => (
                <Pressable
                  key={job.id}
                  onPress={() => navigation.navigate('JobDetails', { job })}
                  className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-3"
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold mb-1">
                        {job.estimate ? `${job.estimate.request.rooms.length} Room(s) - ` : ''}{job.postcode.toUpperCase()}
                      </Text>
                      {job.estimate && (
                        <Text className="text-green-600 font-bold">
                          £{job.estimate.totalMinPrice} - £{job.estimate.totalMaxPrice}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                  </View>
                  <Text className="text-gray-600 text-sm">
                    Tap to view customer contact details
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Info Card */}
          <View className="bg-blue-50 rounded-2xl p-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#2563eb" />
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-gray-900 mb-1">How It Works</Text>
                <Text className="text-sm text-gray-700">
                  Browse available leads, purchase with credits ({currentProfessional.isPremium ? `${LEAD_COST_PREMIUM} credits` : `${LEAD_COST_STANDARD} credits`} per lead), and contact
                  customers directly. Maximum 4 professionals per lead.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({
  icon,
  title,
  subtitle,
  onPress,
  color,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
  color: 'blue' | 'gray' | 'green';
}) {
  const bgColor = color === 'blue' ? 'bg-blue-50' : color === 'green' ? 'bg-green-50' : 'bg-gray-50';
  const iconColor = color === 'blue' ? '#2563eb' : color === 'green' ? '#16a34a' : '#6b7280';

  return (
    <Pressable onPress={onPress} className={`${bgColor} rounded-2xl p-4 active:opacity-80`}>
      <View className="flex-row items-center">
        <View className="bg-white rounded-full p-3 mr-4">
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold mb-1">{title}</Text>
          <Text className="text-gray-600 text-sm">{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </Pressable>
  );
}
