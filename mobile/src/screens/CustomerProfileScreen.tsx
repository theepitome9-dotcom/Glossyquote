import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Share, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import { PortfolioManager } from '../components/common/PortfolioManager';
import { PortfolioItem } from '../types/glossy';
import { useTheme } from '../utils/theme';
import { LOCALES, SupportedLocale, getLocaleConfig } from '../config/i18n';
import { FeedbackModal } from '../components/feedback/FeedbackModal';
import { getPackageById, TRADE_INFO } from '../utils/trades-pricing';

// Helper function to get flag emoji for each region
function getRegionFlag(locale: SupportedLocale): string {
  const flags: Record<SupportedLocale, string> = {
    'en-GB': '🇬🇧',
    'en-US': '🇺🇸',
    'en-CA': '🇨🇦',
    'en-AU': '🇦🇺',
    'de-DE': '🇩🇪',
    'fr-FR': '🇫🇷',
    'es-ES': '🇪🇸',
    'it-IT': '🇮🇹',
    'nl-NL': '🇳🇱',
    'pl-PL': '🇵🇱',
    'pt-PT': '🇵🇹',
  };
  return flags[locale] || '🌍';
}

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerProfile'>;

export default function CustomerProfileScreen({ navigation }: Props) {
  const currentCustomer = useAppStore((s) => s.currentCustomer);
  const setCurrentCustomer = useAppStore((s) => s.setCurrentCustomer);
  const addCustomerPortfolioItem = useAppStore((s) => s.addCustomerPortfolioItem);
  const removeCustomerPortfolioItem = useAppStore((s) => s.removeCustomerPortfolioItem);
  const jobListings = useAppStore((s) => s.jobListings);
  const removeJobListing = useAppStore((s) => s.removeJobListing);
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const currentLocaleConfig = getLocaleConfig(locale);

  // Region selector component
  const RegionSelector = () => (
    <Modal
      visible={showRegionModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowRegionModal(false)}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text style={{ color: colors.text }} className="text-xl font-bold">Select Your Region</Text>
            <Pressable onPress={() => setShowRegionModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* Region list */}
          <ScrollView className="flex-1 px-6 py-4">
            <Text style={{ color: colors.textSecondary }} className="text-sm mb-4">
              Select your region to see prices in your local currency with accurate market rates.
            </Text>
            {(Object.keys(LOCALES) as SupportedLocale[]).map((localeKey) => {
              const config = LOCALES[localeKey];
              const isSelected = locale === localeKey;
              return (
                <Pressable
                  key={localeKey}
                  onPress={() => {
                    setLocale(localeKey);
                    setShowRegionModal(false);
                  }}
                  style={{
                    backgroundColor: isSelected
                      ? (isDarkMode ? '#1e3a8a' : '#eff6ff')
                      : colors.surface
                  }}
                  className={`flex-row items-center justify-between p-4 rounded-xl mb-3 ${
                    isSelected ? 'border-2 border-blue-500' : ''
                  }`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">{getRegionFlag(localeKey)}</Text>
                    <View>
                      <Text style={{ color: colors.text }} className="font-semibold">
                        {config.region}
                      </Text>
                      <Text style={{ color: colors.textSecondary }} className="text-sm">
                        {config.currencySymbol} {config.currency}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // If no customer, show a simplified settings screen
  if (!currentCustomer) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView className="flex-1">
          <View className="px-6 py-6">
            {/* Header with Back Button */}
            <View className="flex-row items-center mb-6">
              <Pressable
                onPress={() => navigation.goBack()}
                className="mr-4 active:opacity-70"
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </Pressable>
              <Text style={{ color: colors.text }} className="text-2xl font-bold">Settings</Text>
            </View>

            {/* App Settings */}
            <View style={{ backgroundColor: colors.surface }} className="rounded-2xl p-5 mb-6">
              <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">App Settings</Text>

              {/* Region Selector */}
              <Pressable
                onPress={() => setShowRegionModal(true)}
                className="flex-row items-center justify-between py-3 border-b border-gray-200"
              >
                <View className="flex-row items-center">
                  <View style={{ backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe' }} className="rounded-full p-2 mr-3">
                    <Text className="text-lg">{getRegionFlag(locale)}</Text>
                  </View>
                  <View>
                    <Text style={{ color: colors.text }} className="font-medium">Region</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm">
                      {currentLocaleConfig.region} ({currentLocaleConfig.currencySymbol})
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>

              {/* Dark Mode Toggle */}
              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <View className="bg-gray-800 rounded-full p-2 mr-3">
                    <Ionicons name="moon" size={18} color="white" />
                  </View>
                  <View>
                    <Text style={{ color: colors.text }} className="font-medium">Dark Mode</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm">
                      {isDarkMode ? 'On' : 'Off'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: colors.border, true: '#3b82f6' }}
                  thumbColor="white"
                />
              </View>
            </View>

            {/* All Trades Info Box - Clickable to post a job */}
            <Pressable
              onPress={() => navigation.navigate('CustomerEstimate')}
              style={{ backgroundColor: isDarkMode ? '#1a3d2e' : '#ecfdf5' }}
              className="rounded-2xl p-4 mb-6 flex-row active:opacity-80"
            >
              <Ionicons name="construct" size={24} color={isDarkMode ? '#4ade80' : '#16a34a'} />
              <View className="ml-3 flex-1">
                <Text style={{ color: isDarkMode ? '#bbf7d0' : '#166534' }} className="font-semibold mb-1">
                  List Any Project
                </Text>
                <Text style={{ color: isDarkMode ? '#a7f3d0' : '#15803d' }} className="leading-5">
                  You can list projects for any trade — carpentry, electrical, plumbing, and more. Quick quotes (£3) are available for selected trades.
                </Text>
                <View className="flex-row items-center mt-2">
                  <Text style={{ color: isDarkMode ? '#4ade80' : '#16a34a' }} className="font-semibold">
                    Post Your Job Free
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={isDarkMode ? '#4ade80' : '#16a34a'} style={{ marginLeft: 4 }} />
                </View>
              </View>
            </Pressable>

            {/* Contact Support */}
            <Pressable
              onPress={() => navigation.navigate('Contact')}
              style={{ backgroundColor: isDarkMode ? '#1e3a5f' : '#eff6ff' }}
              className="py-4 rounded-xl active:opacity-80 flex-row items-center justify-center mb-4"
            >
              <Ionicons name="mail" size={20} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
              <Text style={{ color: isDarkMode ? '#60a5fa' : '#2563eb' }} className="font-semibold ml-2">Contact Support</Text>
            </Pressable>

            {/* Share Feedback */}
            <Pressable
              onPress={() => setShowFeedbackModal(true)}
              style={{ backgroundColor: isDarkMode ? '#1a3d2e' : '#ecfdf5' }}
              className="py-4 rounded-xl active:opacity-80 flex-row items-center justify-center mb-4"
            >
              <Ionicons name="chatbubbles" size={20} color={isDarkMode ? '#4ade80' : '#16a34a'} />
              <Text style={{ color: isDarkMode ? '#4ade80' : '#16a34a' }} className="font-semibold ml-2">Share Feedback</Text>
            </Pressable>

            {/* Legal / Privacy */}
            <Pressable
              onPress={() => navigation.navigate('Legal')}
              style={{ backgroundColor: colors.surface }}
              className="py-4 rounded-xl active:opacity-80 flex-row items-center justify-center"
            >
              <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.text }} className="font-semibold ml-2">Privacy Policy & Terms</Text>
            </Pressable>
          </View>
        </ScrollView>
        <RegionSelector />
        <FeedbackModal
          visible={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          userType="customer"
          userId="guest"
          userName="Guest User"
          userEmail="guest@glossy.app"
          userPhone=""
        />
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    setCurrentCustomer(null);
    navigation.navigate('Welcome');
  };

  const handleCloseAccount = () => {
    Alert.alert(
      'Close Account',
      'Are you sure you want to close your account? This will permanently delete all your data including estimates, job postings, and inspiration photos. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Account',
          style: 'destructive',
          onPress: () => {
            setCurrentCustomer(null);
            navigation.navigate('Welcome');
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      profile: {
        name: currentCustomer.name,
        email: currentCustomer.email,
        phone: currentCustomer.phone,
        createdAt: currentCustomer.createdAt,
      },
      estimates: currentCustomer.estimates,
      jobListings: currentCustomer.jobListings,
      portfolioItemsCount: currentCustomer.portfolio.length,
    };

    try {
      await Share.share({
        message: JSON.stringify(exportData, null, 2),
        title: 'My GLOSSY Data Export',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export your data. Please try again.');
    }
  };

  const handleAddPortfolioItem = (item: PortfolioItem) => {
    addCustomerPortfolioItem(currentCustomer.id, item);
  };

  const handleRemovePortfolioItem = (itemId: string) => {
    removeCustomerPortfolioItem(currentCustomer.id, itemId);
  };

  const myActiveJobs = jobListings.filter((j) => j.customerId === currentCustomer.id);

  const getJobTitle = (job: typeof myActiveJobs[0]) => {
    const pkgId = job.estimate?.request.packageId;
    const pkg = pkgId ? getPackageById(pkgId) : null;
    if (pkgId) return pkg?.name || TRADE_INFO[job.tradeCategory]?.name || 'Job';
    const tradeName = TRADE_INFO[job.tradeCategory]?.name || 'Job';
    if (job.estimate) return `${job.estimate.request.rooms.length} Room ${tradeName}`;
    return tradeName;
  };

  const handleRemoveJob = (jobId: string) => {
    Alert.alert(
      'Remove Job Posting',
      'Are you sure you want to remove this job? Professionals who have already purchased the lead will retain access.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeJobListing(jobId),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Header with Back Button */}
          <View className="flex-row items-center mb-6">
            <Pressable
              onPress={() => navigation.goBack()}
              className="mr-4 active:opacity-70"
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <Text style={{ color: colors.text }} className="text-2xl font-bold">My Profile</Text>
          </View>

          {/* Profile Header */}
          <View className="items-center mb-8">
            <View style={{ backgroundColor: colors.primary }} className="rounded-full p-8 mb-4">
              <Ionicons name="person" size={48} color="white" />
            </View>
            <Text style={{ color: colors.text }} className="text-2xl font-bold mb-1">
              {currentCustomer.name}
            </Text>
            <Text style={{ color: colors.textSecondary }}>{currentCustomer.email}</Text>
          </View>

          {/* App Settings */}
          <View style={{ backgroundColor: colors.surface }} className="rounded-2xl p-5 mb-6">
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">App Settings</Text>

            {/* Region Selector */}
            <Pressable
              onPress={() => setShowRegionModal(true)}
              className="flex-row items-center justify-between py-3 border-b border-gray-200"
            >
              <View className="flex-row items-center">
                <View style={{ backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe' }} className="rounded-full p-2 mr-3">
                  <Text className="text-lg">{getRegionFlag(locale)}</Text>
                </View>
                <View>
                  <Text style={{ color: colors.text }} className="font-medium">Region</Text>
                  <Text style={{ color: colors.textSecondary }} className="text-sm">
                    {currentLocaleConfig.region} ({currentLocaleConfig.currencySymbol})
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>

            {/* Dark Mode Toggle */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="bg-gray-800 rounded-full p-2 mr-3">
                  <Ionicons name="moon" size={18} color="white" />
                </View>
                <View>
                  <Text style={{ color: colors.text }} className="font-medium">Dark Mode</Text>
                  <Text style={{ color: colors.textSecondary }} className="text-sm">
                    {isDarkMode ? 'On' : 'Off'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: '#3b82f6' }}
                thumbColor="white"
              />
            </View>
          </View>

          {/* Account Stats */}
          <View style={{ backgroundColor: colors.surface }} className="rounded-2xl p-6 mb-6">
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">Account Info</Text>
            <View className="space-y-3">
              <StatRow label="Name" value={currentCustomer.name} colors={colors} />
              <StatRow label="Email" value={currentCustomer.email} colors={colors} />
              <StatRow label="Phone" value={currentCustomer.phone} colors={colors} />
              <StatRow
                label="Estimates"
                value={currentCustomer.estimates.length.toString()}
                colors={colors}
              />
              <StatRow
                label="Job Postings"
                value={currentCustomer.jobListings.length.toString()}
                colors={colors}
              />
              <StatRow
                label="Member Since"
                value={new Date(currentCustomer.createdAt).toLocaleDateString('en-GB', {
                  month: 'long',
                  year: 'numeric',
                })}
                colors={colors}
              />
            </View>
          </View>

          {/* Active Job Postings */}
          {myActiveJobs.length > 0 && (
            <View style={{ backgroundColor: colors.surface }} className="rounded-2xl p-6 mb-6">
              <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">
                My Active Job Postings
              </Text>
              {myActiveJobs.map((job) => (
                <View
                  key={job.id}
                  style={{ backgroundColor: isDarkMode ? '#1a2a1a' : '#f0fdf4', borderColor: isDarkMode ? '#2d4a2d' : '#bbf7d0' }}
                  className="rounded-xl p-4 mb-3 border"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                      <Text style={{ color: colors.text }} className="font-semibold text-base mb-0.5">
                        {getJobTitle(job)}
                      </Text>
                      <Text className="text-xs text-gray-500 mb-1">
                        {job.postcode ? job.postcode.toUpperCase() : 'No postcode'} · Posted {new Date(job.postedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Text>
                      <Text className="text-xs text-gray-400">
                        {job.interestedProfessionals.length} of {job.maxProfessionals} professionals interested
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleRemoveJob(job.id)}
                      className="active:opacity-60 p-1"
                    >
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Portfolio Section */}
          <View style={{ backgroundColor: colors.surface }} className="rounded-2xl p-6 mb-6">
            <PortfolioManager
              items={currentCustomer.portfolio}
              onAddItem={handleAddPortfolioItem}
              onRemoveItem={handleRemovePortfolioItem}
              title="Inspiration Photos"
              emptyMessage="Add photos or videos of work you would like done. Share these with professionals to help them understand your vision."
            />
          </View>

          {/* Info Box */}
          <View style={{ backgroundColor: isDarkMode ? '#1e3a5f' : '#eff6ff' }} className="rounded-2xl p-4 mb-6 flex-row">
            <Ionicons name="information-circle" size={24} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
            <Text style={{ color: isDarkMode ? '#bfdbfe' : '#1e40af' }} className="ml-3 flex-1 leading-5">
              Your inspiration photos can help professionals better understand what you are looking for. Share examples of completed work you admire.
            </Text>
          </View>

          {/* All Trades Info Box - Clickable to post a job */}
          <Pressable
            onPress={() => navigation.navigate('CustomerEstimate')}
            style={{ backgroundColor: isDarkMode ? '#1a3d2e' : '#ecfdf5' }}
            className="rounded-2xl p-4 mb-6 flex-row active:opacity-80"
          >
            <Ionicons name="construct" size={24} color={isDarkMode ? '#4ade80' : '#16a34a'} />
            <View className="ml-3 flex-1">
              <Text style={{ color: isDarkMode ? '#bbf7d0' : '#166534' }} className="font-semibold mb-1">
                List Any Project
              </Text>
              <Text style={{ color: isDarkMode ? '#a7f3d0' : '#15803d' }} className="leading-5">
                You can list projects for any trade — carpentry, electrical, plumbing, and more. Quick quotes (£3) are available for selected trades.
              </Text>
              <View className="flex-row items-center mt-2">
                <Text style={{ color: isDarkMode ? '#4ade80' : '#16a34a' }} className="font-semibold">
                  Post Your Job Free
                </Text>
                <Ionicons name="arrow-forward" size={16} color={isDarkMode ? '#4ade80' : '#16a34a'} style={{ marginLeft: 4 }} />
              </View>
            </View>
          </Pressable>

          {/* Contact Support */}
          <Pressable
            onPress={() => navigation.navigate('Contact')}
            style={{ backgroundColor: isDarkMode ? '#1e3a5f' : '#eff6ff' }}
            className="py-4 rounded-xl active:opacity-80 flex-row items-center justify-center mb-4"
          >
            <Ionicons name="mail" size={20} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
            <Text style={{ color: isDarkMode ? '#60a5fa' : '#2563eb' }} className="font-semibold ml-2">Contact Support</Text>
          </Pressable>

          {/* Share Feedback */}
          <Pressable
            onPress={() => setShowFeedbackModal(true)}
            style={{ backgroundColor: isDarkMode ? '#1a3d2e' : '#ecfdf5' }}
            className="py-4 rounded-xl active:opacity-80 flex-row items-center justify-center mb-4"
          >
            <Ionicons name="chatbubbles" size={20} color={isDarkMode ? '#4ade80' : '#16a34a'} />
            <Text style={{ color: isDarkMode ? '#4ade80' : '#16a34a' }} className="font-semibold ml-2">Share Feedback</Text>
          </Pressable>

          {/* Legal / Privacy */}
          <Pressable
            onPress={() => navigation.navigate('Legal')}
            style={{ backgroundColor: colors.surface }}
            className="py-4 rounded-xl active:opacity-80 flex-row items-center justify-center mb-4"
          >
            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.text }} className="font-semibold ml-2">Privacy Policy & Terms</Text>
          </Pressable>

          {/* Export Data */}
          <Pressable
            onPress={handleExportData}
            style={{ backgroundColor: colors.surface }}
            className="py-4 rounded-xl active:opacity-80 flex-row items-center justify-center mb-4"
          >
            <Ionicons name="download-outline" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.text }} className="font-semibold ml-2">Export My Data</Text>
          </Pressable>

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            style={{ backgroundColor: isDarkMode ? '#3f1d1d' : '#fef2f2' }}
            className="py-4 rounded-xl active:opacity-80 flex-row items-center justify-center mb-4"
          >
            <Ionicons name="log-out" size={20} color={isDarkMode ? '#f87171' : '#dc2626'} />
            <Text style={{ color: isDarkMode ? '#f87171' : '#dc2626' }} className="font-semibold ml-2">Logout</Text>
          </Pressable>

          {/* Close Account */}
          <Pressable
            onPress={handleCloseAccount}
            style={{ backgroundColor: colors.surface }}
            className="py-4 rounded-xl active:opacity-80 flex-row items-center justify-center"
          >
            <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted }} className="font-semibold ml-2">Close Account</Text>
          </Pressable>
        </View>
      </ScrollView>
      <RegionSelector />
      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userType="customer"
        userId={currentCustomer.id}
        userName={currentCustomer.name}
        userEmail={currentCustomer.email}
        userPhone={currentCustomer.phone}
      />
    </SafeAreaView>
  );
}

function StatRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text style={{ color: colors.textSecondary }}>{label}</Text>
      <Text style={{ color: colors.text }} className="font-semibold">{value}</Text>
    </View>
  );
}
