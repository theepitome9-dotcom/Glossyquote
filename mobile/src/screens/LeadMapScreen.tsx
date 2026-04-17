import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import { useTheme } from '../utils/theme';
import { JobListing } from '../types/glossy';

type Props = NativeStackScreenProps<RootStackParamList, 'LeadMap'>;

// UK postcode to approximate coordinates mapping
const POSTCODE_COORDINATES: Record<string, { lat: number; lng: number; area: string }> = {
  'SW': { lat: 51.47, lng: -0.17, area: 'South West London' },
  'SE': { lat: 51.45, lng: -0.05, area: 'South East London' },
  'NW': { lat: 51.55, lng: -0.20, area: 'North West London' },
  'NE': { lat: 51.55, lng: -0.05, area: 'North East London' },
  'N': { lat: 51.56, lng: -0.10, area: 'North London' },
  'E': { lat: 51.52, lng: 0.05, area: 'East London' },
  'W': { lat: 51.51, lng: -0.20, area: 'West London' },
  'EC': { lat: 51.52, lng: -0.09, area: 'Central London' },
  'WC': { lat: 51.52, lng: -0.12, area: 'Central London' },
  'B': { lat: 52.48, lng: -1.90, area: 'Birmingham' },
  'M': { lat: 53.48, lng: -2.24, area: 'Manchester' },
  'L': { lat: 53.41, lng: -2.98, area: 'Liverpool' },
  'LS': { lat: 53.80, lng: -1.55, area: 'Leeds' },
  'SH': { lat: 53.38, lng: -1.47, area: 'Sheffield' },
  'BS': { lat: 51.45, lng: -2.58, area: 'Bristol' },
  'NG': { lat: 52.95, lng: -1.15, area: 'Nottingham' },
  'CB': { lat: 52.20, lng: 0.12, area: 'Cambridge' },
  'OX': { lat: 51.75, lng: -1.25, area: 'Oxford' },
  'BN': { lat: 50.82, lng: -0.14, area: 'Brighton' },
};

const getPostcodeArea = (postcode: string): string => {
  const cleaned = postcode.toUpperCase().replace(/\s/g, '');
  // Extract letters from start
  const match = cleaned.match(/^([A-Z]{1,2})/);
  return match ? match[1] : 'EC';
};

const getCoordinates = (postcode: string) => {
  const area = getPostcodeArea(postcode);
  return POSTCODE_COORDINATES[area] || POSTCODE_COORDINATES['EC'];
};

interface LeadCluster {
  area: string;
  postcode: string;
  count: number;
  jobs: JobListing[];
  coords: { lat: number; lng: number };
}

export default function LeadMapScreen({ navigation }: Props) {
  const currentProfessional = useAppStore((s) => s.currentProfessional);
  const jobListings = useAppStore((s) => s.jobListings);
  const { colors, isDarkMode } = useTheme();
  const [selectedCluster, setSelectedCluster] = useState<LeadCluster | null>(null);
  const [filterDistance, setFilterDistance] = useState<number>(25);

  const availableJobs = useMemo(() => {
    if (!currentProfessional) return [];
    return jobListings.filter(
      (job) =>
        job.interestedProfessionals.length < job.maxProfessionals &&
        !job.interestedProfessionals.includes(currentProfessional.id)
    );
  }, [jobListings, currentProfessional]);

  const clusters = useMemo(() => {
    const clusterMap = new Map<string, LeadCluster>();

    availableJobs.forEach((job) => {
      const area = getPostcodeArea(job.postcode);
      const coords = getCoordinates(job.postcode);

      if (clusterMap.has(area)) {
        const cluster = clusterMap.get(area)!;
        cluster.count++;
        cluster.jobs.push(job);
      } else {
        clusterMap.set(area, {
          area: coords.area,
          postcode: area,
          count: 1,
          jobs: [job],
          coords,
        });
      }
    });

    return Array.from(clusterMap.values()).sort((a, b) => b.count - a.count);
  }, [availableJobs]);

  // Calculate heat intensity based on job count
  const getHeatColor = (count: number, maxCount: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.7) return '#ef4444'; // Red - high demand
    if (intensity > 0.4) return '#f97316'; // Orange - medium demand
    if (intensity > 0.2) return '#eab308'; // Yellow - some demand
    return '#22c55e'; // Green - low demand
  };

  const maxCount = Math.max(...clusters.map((c) => c.count), 1);

  if (!currentProfessional) {
    navigation.replace('ProfessionalAuth');
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-6 py-4">
        <Text style={{ color: colors.text }} className="text-2xl font-bold">
          Lead Locations
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
          {availableJobs.length} available leads in {clusters.length} areas
        </Text>
      </View>

      {/* Map Visualization */}
      <View
        style={{ backgroundColor: colors.surface }}
        className="mx-4 rounded-2xl p-4 mb-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text style={{ color: colors.text }} className="font-semibold">
            Heat Map Overview
          </Text>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
            <Text style={{ color: colors.textMuted }} className="text-xs mr-3">Low</Text>
            <View className="w-3 h-3 rounded-full bg-yellow-500 mr-1" />
            <Text style={{ color: colors.textMuted }} className="text-xs mr-3">Med</Text>
            <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
            <Text style={{ color: colors.textMuted }} className="text-xs">High</Text>
          </View>
        </View>

        {/* Visual Grid Map */}
        <View className="flex-row flex-wrap justify-center">
          {clusters.slice(0, 12).map((cluster) => (
            <Pressable
              key={cluster.postcode}
              onPress={() => setSelectedCluster(cluster)}
              className="m-1 rounded-xl items-center justify-center active:opacity-80"
              style={{
                backgroundColor: getHeatColor(cluster.count, maxCount),
                width: 70,
                height: 70,
              }}
            >
              <Text className="text-white font-bold text-lg">{cluster.count}</Text>
              <Text className="text-white text-xs opacity-90">{cluster.postcode}</Text>
            </Pressable>
          ))}
        </View>

        {clusters.length === 0 && (
          <View className="items-center py-8">
            <Ionicons name="location-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textSecondary }} className="mt-2">
              No leads available in your area
            </Text>
          </View>
        )}
      </View>

      {/* Selected Cluster Details */}
      {selectedCluster && (
        <View
          style={{ backgroundColor: colors.surface }}
          className="mx-4 rounded-2xl p-4 mb-4"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: getHeatColor(selectedCluster.count, maxCount) }}
              >
                <Text className="text-white font-bold">{selectedCluster.count}</Text>
              </View>
              <View>
                <Text style={{ color: colors.text }} className="font-bold text-lg">
                  {selectedCluster.area}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  {selectedCluster.postcode} area
                </Text>
              </View>
            </View>
            <Pressable onPress={() => setSelectedCluster(null)}>
              <Ionicons name="close-circle" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Jobs in this area */}
          <ScrollView style={{ maxHeight: 200 }}>
            {selectedCluster.jobs.slice(0, 5).map((job) => (
              <Pressable
                key={job.id}
                onPress={() => navigation.navigate('JobDetails', { job })}
                className="py-3 border-b flex-row items-center justify-between"
                style={{ borderColor: colors.border }}
              >
                <View className="flex-1">
                  <Text style={{ color: colors.text }} className="font-medium">
                    {job.tradeCategory.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-sm">
                    {job.postcode.toUpperCase()} • {job.interestedProfessionals.length}/4 interested
                  </Text>
                </View>
                {job.estimate && (
                  <Text style={{ color: colors.primary }} className="font-bold">
                    £{job.estimate.totalMinPrice}-{job.estimate.totalMaxPrice}
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={() => navigation.navigate('ProfessionalJobBoard')}
            className="bg-blue-600 py-3 rounded-xl mt-3 active:opacity-80"
          >
            <Text className="text-white text-center font-semibold">
              View All {selectedCluster.count} Leads
            </Text>
          </Pressable>
        </View>
      )}

      {/* Area List */}
      <ScrollView className="flex-1 px-4">
        <Text style={{ color: colors.text }} className="font-semibold mb-3">
          All Areas ({clusters.length})
        </Text>
        {clusters.map((cluster) => (
          <Pressable
            key={cluster.postcode}
            onPress={() => setSelectedCluster(cluster)}
            style={{ backgroundColor: colors.surface }}
            className="rounded-xl p-4 mb-2 flex-row items-center justify-between active:opacity-80"
          >
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: getHeatColor(cluster.count, maxCount) + '20' }}
              >
                <Text style={{ color: getHeatColor(cluster.count, maxCount) }} className="font-bold text-lg">
                  {cluster.count}
                </Text>
              </View>
              <View>
                <Text style={{ color: colors.text }} className="font-semibold">
                  {cluster.area}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  {cluster.postcode} • {cluster.count} lead{cluster.count !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View
                className="px-3 py-1 rounded-full mr-2"
                style={{ backgroundColor: getHeatColor(cluster.count, maxCount) + '20' }}
              >
                <Text style={{ color: getHeatColor(cluster.count, maxCount) }} className="text-xs font-bold">
                  {cluster.count > maxCount * 0.7 ? 'HOT' : cluster.count > maxCount * 0.4 ? 'BUSY' : 'OPEN'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </Pressable>
        ))}

        {clusters.length === 0 && (
          <View className="items-center py-12">
            <Ionicons name="map-outline" size={64} color={colors.textMuted} />
            <Text style={{ color: colors.textSecondary }} className="mt-4 text-center">
              No leads available yet
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-sm mt-1 text-center">
              Check back soon for new opportunities
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
