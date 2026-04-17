import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import { useTheme } from '../utils/theme';
import { LEAD_COST_STANDARD, LEAD_COST_PREMIUM } from '../config/trades-pricing';

type Props = NativeStackScreenProps<RootStackParamList, 'PerformanceDashboard'>;

const { width } = Dimensions.get('window');

export default function PerformanceDashboardScreen({ navigation }: Props) {
  const currentProfessional = useAppStore((s) => s.currentProfessional);
  const jobListings = useAppStore((s) => s.jobListings);
  const { colors } = useTheme();

  const stats = useMemo(() => {
    if (!currentProfessional) {
      return {
        totalLeadsPurchased: 0,
        activeLeads: 0,
        responseRate: 0,
        avgResponseTime: 0,
        conversionRate: 0,
        totalSpent: 0,
        estimatedRevenue: 0,
        roi: 0,
        monthlyTrend: [],
        topAreas: [],
      };
    }

    const myLeads = jobListings.filter((job) =>
      job.interestedProfessionals.includes(currentProfessional.id)
    );

    const leadCost = currentProfessional.isPremium ? LEAD_COST_PREMIUM : LEAD_COST_STANDARD;
    const totalLeadsPurchased = myLeads.length;
    const totalCreditsSpent = totalLeadsPurchased * leadCost;

    // Estimate £1.50 per credit average cost
    const totalSpent = totalCreditsSpent * 1.5;

    // Estimate 25% conversion rate and £1200 avg job value
    const estimatedJobsWon = Math.round(totalLeadsPurchased * 0.25);
    const estimatedRevenue = estimatedJobsWon * 1200;
    const roi = totalSpent > 0 ? ((estimatedRevenue - totalSpent) / totalSpent) * 100 : 0;

    // Group leads by month for trend
    const monthlyData: Record<string, number> = {};
    myLeads.forEach((lead) => {
      const month = new Date(lead.postedAt).toLocaleString('en-GB', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    // Group by area
    const areaData: Record<string, number> = {};
    myLeads.forEach((lead) => {
      const area = lead.postcode.substring(0, 2).toUpperCase();
      areaData[area] = (areaData[area] || 0) + 1;
    });

    const topAreas = Object.entries(areaData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area, count]) => ({ area, count }));

    return {
      totalLeadsPurchased,
      activeLeads: myLeads.length,
      responseRate: 85, // Placeholder - would come from actual tracking
      avgResponseTime: 2.5, // Placeholder hours
      conversionRate: 25, // Placeholder %
      totalSpent,
      estimatedRevenue,
      roi,
      monthlyTrend: Object.entries(monthlyData).map(([month, count]) => ({ month, count })),
      topAreas,
    };
  }, [currentProfessional, jobListings]);

  if (!currentProfessional) {
    navigation.replace('ProfessionalAuth');
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          {/* Header */}
          <View className="mb-6">
            <Text style={{ color: colors.text }} className="text-2xl font-bold">
              Performance
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
              Track your lead performance and ROI
            </Text>
          </View>

          {/* Key Metrics */}
          <View className="flex-row flex-wrap mb-4">
            <MetricCard
              title="Leads Purchased"
              value={stats.totalLeadsPurchased.toString()}
              icon="briefcase"
              color="#3b82f6"
              colors={colors}
            />
            <MetricCard
              title="Est. Jobs Won"
              value={Math.round(stats.totalLeadsPurchased * 0.25).toString()}
              icon="checkmark-circle"
              color="#22c55e"
              colors={colors}
            />
            <MetricCard
              title="Conversion Rate"
              value={`${stats.conversionRate}%`}
              icon="trending-up"
              color="#8b5cf6"
              colors={colors}
            />
            <MetricCard
              title="Response Time"
              value={`${stats.avgResponseTime}h`}
              icon="time"
              color="#f59e0b"
              colors={colors}
            />
          </View>

          {/* ROI Card */}
          <View
            style={{ backgroundColor: colors.surface }}
            className="rounded-2xl p-5 mb-4"
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-green-100 rounded-full p-2 mr-3">
                <Ionicons name="analytics" size={24} color="#16a34a" />
              </View>
              <Text style={{ color: colors.text }} className="font-bold text-lg">
                Return on Investment
              </Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2">
                <Text style={{ color: colors.textSecondary }} className="text-sm mb-1">
                  Total Spent
                </Text>
                <Text style={{ color: colors.text }} className="text-xl font-bold">
                  £{stats.totalSpent.toFixed(0)}
                </Text>
              </View>
              <View className="flex-1 mx-2">
                <Text style={{ color: colors.textSecondary }} className="text-sm mb-1">
                  Est. Revenue
                </Text>
                <Text className="text-xl font-bold text-green-600">
                  £{stats.estimatedRevenue.toLocaleString()}
                </Text>
              </View>
              <View className="flex-1 ml-2">
                <Text style={{ color: colors.textSecondary }} className="text-sm mb-1">
                  ROI
                </Text>
                <Text className={`text-xl font-bold ${stats.roi > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {stats.roi > 0 ? '+' : ''}{stats.roi.toFixed(0)}%
                </Text>
              </View>
            </View>

            <View className="bg-green-50 rounded-xl p-3">
              <Text className="text-green-800 text-sm">
                Based on industry average 25% conversion rate and £1,200 average job value.
                Your actual results may vary.
              </Text>
            </View>
          </View>

          {/* Rating & Reviews */}
          <View
            style={{ backgroundColor: colors.surface }}
            className="rounded-2xl p-5 mb-4"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: colors.text }} className="font-bold text-lg">
                Rating & Reviews
              </Text>
              <View className="flex-row items-center bg-yellow-100 rounded-full px-3 py-1">
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text className="text-yellow-800 font-bold ml-1">
                  {currentProfessional.rating > 0 ? currentProfessional.rating.toFixed(1) : '-'}
                </Text>
              </View>
            </View>

            <View className="flex-row">
              <View className="flex-1 items-center">
                <Text style={{ color: colors.text }} className="text-3xl font-bold">
                  {currentProfessional.totalReviews}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  Total Reviews
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text style={{ color: colors.text }} className="text-3xl font-bold">
                  {currentProfessional.rating > 0 ? currentProfessional.rating.toFixed(1) : '-'}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  Avg Rating
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-3xl font-bold text-green-600">
                  {stats.responseRate}%
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  Response Rate
                </Text>
              </View>
            </View>
          </View>

          {/* Top Areas */}
          {stats.topAreas.length > 0 && (
            <View
              style={{ backgroundColor: colors.surface }}
              className="rounded-2xl p-5 mb-4"
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-blue-100 rounded-full p-2 mr-3">
                  <Ionicons name="location" size={20} color="#2563eb" />
                </View>
                <Text style={{ color: colors.text }} className="font-bold text-lg">
                  Top Areas
                </Text>
              </View>

              {stats.topAreas.map((area, index) => {
                const maxCount = stats.topAreas[0]?.count || 1;
                const percentage = (area.count / maxCount) * 100;
                return (
                  <View key={area.area} className="mb-3">
                    <View className="flex-row justify-between mb-1">
                      <Text style={{ color: colors.text }} className="font-medium">
                        {area.area}
                      </Text>
                      <Text style={{ color: colors.textSecondary }}>
                        {area.count} leads
                      </Text>
                    </View>
                    <View
                      className="h-2 rounded-full"
                      style={{ backgroundColor: colors.border }}
                    >
                      <View
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Credits Summary */}
          <View
            style={{ backgroundColor: colors.surface }}
            className="rounded-2xl p-5 mb-4"
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-purple-100 rounded-full p-2 mr-3">
                <Ionicons name="wallet" size={20} color="#9333ea" />
              </View>
              <Text style={{ color: colors.text }} className="font-bold text-lg">
                Credits Summary
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3 border-b" style={{ borderColor: colors.border }}>
              <Text style={{ color: colors.textSecondary }}>Current Balance</Text>
              <Text style={{ color: colors.text }} className="font-bold text-lg">
                {currentProfessional.credits} credits
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3 border-b" style={{ borderColor: colors.border }}>
              <Text style={{ color: colors.textSecondary }}>Cost per Lead</Text>
              <Text style={{ color: colors.text }} className="font-medium">
                {currentProfessional.isPremium ? LEAD_COST_PREMIUM : LEAD_COST_STANDARD} credits
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3">
              <Text style={{ color: colors.textSecondary }}>Leads Available</Text>
              <Text className="font-bold text-green-600">
                {Math.floor(currentProfessional.credits / (currentProfessional.isPremium ? LEAD_COST_PREMIUM : LEAD_COST_STANDARD))} leads
              </Text>
            </View>

            <Pressable
              onPress={() => navigation.navigate('ProfessionalCredits')}
              className="bg-blue-600 py-3 rounded-xl mt-4 active:opacity-80"
            >
              <Text className="text-white text-center font-semibold">
                Buy More Credits
              </Text>
            </Pressable>
          </View>

          {/* Tips */}
          <View
            style={{ backgroundColor: colors.surface }}
            className="rounded-2xl p-5 mb-6"
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-orange-100 rounded-full p-2 mr-3">
                <Ionicons name="bulb" size={20} color="#ea580c" />
              </View>
              <Text style={{ color: colors.text }} className="font-bold text-lg">
                Tips to Improve
              </Text>
            </View>

            <View className="space-y-3">
              <TipItem
                icon="flash"
                title="Respond Faster"
                description="Professionals who respond within 1 hour win 40% more jobs"
                colors={colors}
              />
              <TipItem
                icon="camera"
                title="Add Portfolio Photos"
                description="Profiles with photos get 3x more customer interest"
                colors={colors}
              />
              <TipItem
                icon="star"
                title="Collect Reviews"
                description="Ask satisfied customers to leave reviews"
                colors={colors}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color,
  colors,
}: {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View
      style={{ backgroundColor: colors.surface, width: (width - 48 - 8) / 2 }}
      className="rounded-xl p-4 mb-2 mr-2"
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: color + '20' }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={{ color: colors.text }} className="text-2xl font-bold">
        {value}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="text-sm">
        {title}
      </Text>
    </View>
  );
}

function TipItem({
  icon,
  title,
  description,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View className="flex-row items-start">
      <View className="bg-orange-50 rounded-full p-2 mr-3">
        <Ionicons name={icon} size={16} color="#ea580c" />
      </View>
      <View className="flex-1">
        <Text style={{ color: colors.text }} className="font-medium">
          {title}
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {description}
        </Text>
      </View>
    </View>
  );
}
