import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import { getPackageById, TRADE_INFO } from '../utils/trades-pricing';
import { MapPin, Calendar, ShoppingBag, ChevronRight, Inbox } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'MyLeads'>;

export default function MyLeadsScreen({ navigation }: Props) {
  const currentProfessional = useAppStore((s) => s.currentProfessional);
  const jobListings = useAppStore((s) => s.jobListings);
  const purchasedLeadContacts = useAppStore((s) => s.purchasedLeadContacts);

  if (!currentProfessional) return null;

  // Get all leads this professional has purchased, with their purchase timestamp
  const myLeads = jobListings
    .filter((job) => job.interestedProfessionals.includes(currentProfessional.id))
    .map((job) => {
      const contactKey = `${job.id}:${currentProfessional.id}`;
      const contact = purchasedLeadContacts[contactKey] ?? null;
      return { job, contact };
    })
    // Sort by purchase date descending (most recent first)
    .sort((a, b) => {
      const dateA = a.contact?.purchasedAt ?? a.job.postedAt;
      const dateB = b.contact?.purchasedAt ?? b.job.postedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const getJobTitle = (job: typeof myLeads[0]['job']) => {
    const pkgId = job.estimate?.request.packageId;
    const pkg = pkgId ? getPackageById(pkgId) : null;
    if (pkgId) return pkg?.name || TRADE_INFO[job.tradeCategory]?.name || 'Job';
    const tradeName = TRADE_INFO[job.tradeCategory]?.name || 'Job';
    if (job.estimate) return `${job.estimate.request.rooms.length} Room ${tradeName}`;
    return tradeName;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {myLeads.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-24">
            <View className="bg-white rounded-3xl p-8 items-center shadow-sm" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}>
              <View className="bg-blue-50 rounded-full p-5 mb-4">
                <Inbox size={36} color="#2563eb" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">No leads yet</Text>
              <Text className="text-gray-500 text-center text-sm leading-5">
                Leads you purchase will appear here, sorted by purchase date.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('ProfessionalJobBoard')}
                className="mt-5 bg-blue-600 rounded-xl px-6 py-3 active:opacity-80"
              >
                <Text className="text-white font-semibold">Browse Available Leads</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Text className="text-sm text-gray-500 mb-4 font-medium">
              {myLeads.length} lead{myLeads.length !== 1 ? 's' : ''} purchased
            </Text>
            {myLeads.map(({ job, contact }) => {
              const title = getJobTitle(job);
              const tradeName = TRADE_INFO[job.tradeCategory]?.name || job.tradeCategory;
              return (
                <Pressable
                  key={job.id}
                  onPress={() => navigation.navigate('JobDetails', { job })}
                  className="bg-white rounded-2xl mb-3 active:opacity-90"
                  style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }}
                >
                  {/* Colour bar by trade */}
                  <View className="h-1 rounded-t-2xl bg-blue-600" />

                  <View className="p-4">
                    {/* Title row */}
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1 mr-3">
                        <Text className="text-base font-bold text-gray-900 mb-0.5">{title}</Text>
                        <Text className="text-xs text-blue-600 font-medium">{tradeName}</Text>
                      </View>
                      <ChevronRight size={18} color="#9ca3af" />
                    </View>

                    {/* Date pills */}
                    <View className="flex-row flex-wrap gap-2">
                      <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-1.5">
                        <MapPin size={12} color="#6b7280" />
                        <Text className="text-xs text-gray-600 ml-1.5 font-medium">
                          {job.postcode ? job.postcode.toUpperCase() : 'No postcode'}
                        </Text>
                      </View>

                      <View className="flex-row items-center bg-green-50 rounded-full px-3 py-1.5">
                        <Calendar size={12} color="#16a34a" />
                        <Text className="text-xs text-green-700 ml-1.5 font-medium">
                          Posted {formatDate(job.postedAt)}
                        </Text>
                      </View>

                      {contact?.purchasedAt && (
                        <View className="flex-row items-center bg-blue-50 rounded-full px-3 py-1.5">
                          <ShoppingBag size={12} color="#2563eb" />
                          <Text className="text-xs text-blue-700 ml-1.5 font-medium">
                            Purchased {formatDate(contact.purchasedAt)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Estimate value if available */}
                    {job.estimate?.paid && (
                      <View className="mt-3 pt-3 border-t border-gray-100">
                        <Text className="text-sm font-semibold text-gray-900">
                          £{job.estimate.totalMinPrice} – £{job.estimate.totalMaxPrice}
                          <Text className="text-xs font-normal text-gray-400"> estimated value</Text>
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
