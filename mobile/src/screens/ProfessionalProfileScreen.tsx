import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Share, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import { PortfolioManager } from '../components/common/PortfolioManager';
import { PortfolioItem } from '../types/glossy';
import { useTheme } from '../utils/theme';
import { FeedbackModal } from '../components/feedback/FeedbackModal';
import { verifyPremiumStatus } from '../lib/revenuecatClient';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfessionalProfile'>;

export default function ProfessionalProfileScreen({ navigation }: Props) {
  const currentProfessional = useAppStore((s) => s.currentProfessional);
  const setCurrentProfessional = useAppStore((s) => s.setCurrentProfessional);
  const updateProfessionalPremium = useAppStore((s) => s.updateProfessionalPremium);
  const addProfessionalPortfolioItem = useAppStore((s) => s.addProfessionalPortfolioItem);
  const removeProfessionalPortfolioItem = useAppStore((s) => s.removeProfessionalPortfolioItem);
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Sync premium status with RevenueCat when profile loads
  useEffect(() => {
    if (!currentProfessional) return;
    verifyPremiumStatus().then(({ isPremium }) => {
      updateProfessionalPremium(currentProfessional.id, isPremium);
    }).catch(() => {});
  }, [currentProfessional?.id]);

  if (!currentProfessional) {
    navigation.replace('ProfessionalAuth');
    return null;
  }

  const handleLogout = () => {
    setCurrentProfessional(null);
    navigation.navigate('Welcome');
  };

  const handleCloseAccount = () => {
    Alert.alert(
      'Close Account',
      'Are you sure you want to close your account? This will permanently delete all your data including credits, portfolio, and reviews. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Account',
          style: 'destructive',
          onPress: () => {
            setCurrentProfessional(null);
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
        name: currentProfessional.name,
        email: currentProfessional.email,
        phone: currentProfessional.phone,
        profileDescription: currentProfessional.profileDescription,
        isPremium: currentProfessional.isPremium,
        createdAt: currentProfessional.createdAt,
      },
      stats: {
        credits: currentProfessional.credits,
        rating: currentProfessional.rating,
        totalReviews: currentProfessional.totalReviews,
      },
      reviews: currentProfessional.reviews,
      portfolioItemsCount: currentProfessional.portfolio.length,
    };

    try {
      await Share.share({
        message: JSON.stringify(exportData, null, 2),
        title: 'My GLOSSY Professional Data Export',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export your data. Please try again.');
    }
  };

  const handleAddPortfolioItem = (item: PortfolioItem) => {
    addProfessionalPortfolioItem(currentProfessional.id, item);
  };

  const handleRemovePortfolioItem = (itemId: string) => {
    removeProfessionalPortfolioItem(currentProfessional.id, itemId);
  };

  const handleShareProfile = async () => {
    const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    const secret = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET;

    try {
      // Push latest profile snapshot to backend
      await fetch(`${BACKEND_URL}/api/professionals/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': secret || '',
        },
        body: JSON.stringify({
          id: currentProfessional.id,
          name: currentProfessional.name,
          tradeCategories: currentProfessional.tradeCategories,
          profileDescription: currentProfessional.profileDescription,
          rating: currentProfessional.rating,
          totalReviews: currentProfessional.totalReviews,
          reviews: currentProfessional.reviews.map((r) => ({
            id: r.id,
            customerName: r.customerName,
            rating: r.rating,
            comment: r.comment,
            professionalResponse: r.professionalResponse ?? null,
            createdAt: r.createdAt,
          })),
          portfolio: currentProfessional.portfolio.map((p) => ({
            id: p.id,
            uri: p.uri,
            type: p.type,
            caption: p.caption ?? null,
            uploadedAt: p.uploadedAt,
          })),
          isPremium: currentProfessional.isPremium,
        }),
      });
    } catch {
      // Non-fatal — still share the link
    }

    const ratingText = currentProfessional.totalReviews > 0
      ? `⭐ ${currentProfessional.rating.toFixed(1)} (${currentProfessional.totalReviews} reviews)`
      : '';
    const trades = currentProfessional.tradeCategories.join(', ');

    await Share.share({
      message: `Check out my professional profile on Glossy!\n\n${currentProfessional.name}\n${trades}${ratingText ? '\n' + ratingText : ''}\n\nView my work, reviews and portfolio:\nhttps://glossyapp.co.uk/pro/${currentProfessional.id}`,
      title: `${currentProfessional.name} on Glossy`,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View style={{ backgroundColor: colors.primary }} className="rounded-full p-8 mb-4">
              <Ionicons name="person" size={48} color="white" />
            </View>
            <Text style={{ color: colors.text }} className="text-2xl font-bold mb-1">
              {currentProfessional.name}
            </Text>
            <Text style={{ color: colors.textSecondary }}>{currentProfessional.email}</Text>
            {currentProfessional.isPremium && (
              <View className="flex-row items-center bg-purple-600 rounded-full px-4 py-1.5 mt-2">
                <Ionicons name="star" size={13} color="white" />
                <Text className="text-white font-bold text-sm ml-1">PREMIUM MEMBER</Text>
              </View>
            )}

            {/* Share Profile Button */}
            <Pressable
              onPress={handleShareProfile}
              className="flex-row items-center mt-4 px-5 py-2.5 rounded-full active:opacity-70"
              style={{ backgroundColor: colors.primary }}
            >
              <Ionicons name="share-outline" size={17} color="white" />
              <Text className="text-white font-semibold ml-2 text-sm">Share My Profile</Text>
            </Pressable>
          </View>

          {/* App Settings */}
          <View style={{ backgroundColor: colors.surface }} className="rounded-2xl p-5 mb-6">
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">App Settings</Text>

            {/* Dark Mode Toggle */}
            <View className="flex-row items-center justify-between py-3 border-b" style={{ borderColor: colors.border }}>
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

            {/* Lead Settings */}
            <Pressable
              onPress={() => navigation.navigate('LeadSettings')}
              className="flex-row items-center justify-between py-3 border-b active:opacity-70"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-row items-center">
                <View className="bg-blue-100 rounded-full p-2 mr-3">
                  <Ionicons name="options" size={18} color="#2563eb" />
                </View>
                <View>
                  <Text style={{ color: colors.text }} className="font-medium">Lead Preferences</Text>
                  <Text style={{ color: colors.textSecondary }} className="text-sm">
                    Distance, job types, notifications
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>

            {/* Message Templates */}
            <Pressable
              onPress={() => navigation.navigate('MessageTemplates')}
              className="flex-row items-center justify-between py-3 active:opacity-70"
            >
              <View className="flex-row items-center">
                <View className="bg-green-100 rounded-full p-2 mr-3">
                  <Ionicons name="chatbubbles" size={18} color="#16a34a" />
                </View>
                <View>
                  <Text style={{ color: colors.text }} className="font-medium">Message Templates</Text>
                  <Text style={{ color: colors.textSecondary }} className="text-sm">
                    Quick response templates
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Stats */}
          <View style={{ backgroundColor: colors.surface }} className="rounded-2xl p-6 mb-6">
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">Your Stats</Text>
            <View className="space-y-3">
              <StatRow label="Credits Balance" value={currentProfessional.credits.toString()} colors={colors} />
              <StatRow
                label="Total Reviews"
                value={currentProfessional.totalReviews.toString()}
                colors={colors}
              />
              <StatRow
                label="Average Rating"
                value={
                  currentProfessional.rating > 0
                    ? `${currentProfessional.rating.toFixed(1)} ⭐`
                    : 'No ratings yet'
                }
                colors={colors}
              />
              <StatRow
                label="Member Since"
                value={new Date(currentProfessional.createdAt).toLocaleDateString('en-GB', {
                  month: 'long',
                  year: 'numeric',
                })}
                colors={colors}
              />
            </View>
          </View>

          {/* Profile Information */}
          <View style={{ backgroundColor: colors.surface }} className="rounded-2xl p-6 mb-6">
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">Profile Information</Text>

            <View className="mb-4">
              <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-1">Business Name</Text>
              <Text style={{ color: colors.text }}>{currentProfessional.name}</Text>
            </View>

            <View className="mb-4">
              <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-1">Email</Text>
              <Text style={{ color: colors.text }}>{currentProfessional.email}</Text>
            </View>

            {currentProfessional.phone && (
              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-1">Phone</Text>
                <Text style={{ color: colors.text }}>{currentProfessional.phone}</Text>
              </View>
            )}

            <View>
              <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-1">Description</Text>
              <Text style={{ color: colors.text }} className="leading-5">
                {currentProfessional.profileDescription}
              </Text>
            </View>
          </View>

          {/* Portfolio Section */}
          <View className="bg-gray-50 rounded-2xl p-6 mb-6">
            <PortfolioManager
              items={currentProfessional.portfolio}
              onAddItem={handleAddPortfolioItem}
              onRemoveItem={handleRemovePortfolioItem}
              title="Previous Work"
              emptyMessage="Add photos or videos of your completed projects to showcase your work."
            />
          </View>

          {/* Reviews Section */}
          <View className="bg-gray-50 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-900">Reviews</Text>
              {currentProfessional.totalReviews > 0 && (
                <View className="flex-row items-center bg-yellow-100 rounded-full px-3 py-1">
                  <Ionicons name="star" size={16} color="#FBBF24" />
                  <Text className="text-yellow-800 font-bold ml-1">
                    {currentProfessional.rating.toFixed(1)}
                  </Text>
                  <Text className="text-yellow-700 ml-1 text-sm">
                    ({currentProfessional.totalReviews})
                  </Text>
                </View>
              )}
            </View>

            {currentProfessional.reviews.length === 0 ? (
              <View className="items-center py-8">
                <Ionicons name="star-outline" size={48} color="#D1D5DB" />
                <Text className="text-gray-500 mt-2">No reviews yet</Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Complete jobs to start receiving reviews
                </Text>
              </View>
            ) : (
              <View>
                {currentProfessional.reviews
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((review) => (
                    <View
                      key={review.id}
                      className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
                    >
                      {/* Rating Stars */}
                      <View className="flex-row items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= review.rating ? 'star' : 'star-outline'}
                            size={16}
                            color={star <= review.rating ? '#FBBF24' : '#D1D5DB'}
                          />
                        ))}
                        <Text className="text-gray-600 ml-2 text-sm">
                          {new Date(review.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>

                      {/* Customer Name */}
                      <Text className="font-semibold text-gray-900 mb-2">
                        {review.customerName}
                      </Text>

                      {/* Comment */}
                      <Text className="text-gray-700 leading-5 mb-3">
                        {review.comment}
                      </Text>

                      {/* Professional Response */}
                      {review.professionalResponse && (
                        <View className="bg-blue-50 rounded-lg p-3 mt-2">
                          <Text className="text-xs font-semibold text-blue-900 mb-1">
                            Response from {currentProfessional.name}:
                          </Text>
                          <Text className="text-sm text-blue-800 leading-5">
                            {review.professionalResponse}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
              </View>
            )}
          </View>

          {/* Actions */}
          <View className="space-y-3 mb-6">
            <ActionButton
              icon="card"
              title="Purchase Credits"
              onPress={() => navigation.navigate('ProfessionalCredits')}
              color="blue"
            />
            <ActionButton
              icon="star"
              title="Upgrade to Premium"
              onPress={() => navigation.navigate('ProfessionalCredits')}
              color="purple"
            />
            <ActionButton
              icon="mail"
              title="Contact Support"
              onPress={() => navigation.navigate('Contact')}
              color="blue"
            />
            {(currentProfessional.email === 'a2bsolutionsdev@gmail.com' || currentProfessional.email === 'rodneywright111@gmail.com') && (
              <ActionButton
                icon="shield-checkmark"
                title="Admin Dashboard"
                onPress={() => navigation.navigate('AdminDashboard')}
                color="blue"
              />
            )}
          </View>

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
            className="bg-gray-50 py-4 rounded-xl active:opacity-80 flex-row items-center justify-center mb-4"
          >
            <Ionicons name="document-text-outline" size={20} color="#4b5563" />
            <Text className="text-gray-700 font-semibold ml-2">Privacy Policy & Terms</Text>
          </Pressable>

          {/* Export Data */}
          <Pressable
            onPress={handleExportData}
            className="bg-gray-50 py-4 rounded-xl active:opacity-80 flex-row items-center justify-center mb-4"
          >
            <Ionicons name="download-outline" size={20} color="#4b5563" />
            <Text className="text-gray-700 font-semibold ml-2">Export My Data</Text>
          </Pressable>

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            className="bg-red-50 py-4 rounded-xl active:opacity-80 flex-row items-center justify-center mb-4"
          >
            <Ionicons name="log-out" size={20} color="#dc2626" />
            <Text className="text-red-600 font-semibold ml-2">Logout</Text>
          </Pressable>

          {/* Close Account */}
          <Pressable
            onPress={handleCloseAccount}
            className="bg-gray-100 py-4 rounded-xl active:opacity-80 flex-row items-center justify-center"
          >
            <Ionicons name="trash-outline" size={20} color="#6b7280" />
            <Text className="text-gray-500 font-semibold ml-2">Close Account</Text>
          </Pressable>
        </View>
      </ScrollView>
      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userType="professional"
        userId={currentProfessional.id}
        userName={currentProfessional.name}
        userEmail={currentProfessional.email}
        userPhone={currentProfessional.phone || ''}
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

function ActionButton({
  icon,
  title,
  onPress,
  color,
  badge,
}: {
  icon: any;
  title: string;
  onPress: () => void;
  color: 'blue' | 'purple';
  badge?: string;
}) {
  const bgColor = color === 'blue' ? 'bg-blue-50' : 'bg-purple-50';
  const iconColor = color === 'blue' ? '#2563eb' : '#9333ea';

  return (
    <Pressable onPress={onPress} className={`${bgColor} rounded-xl p-4 active:opacity-80`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-white rounded-full p-3 mr-3">
            <Ionicons name={icon} size={24} color={iconColor} />
          </View>
          <Text className="text-gray-900 font-semibold flex-1">{title}</Text>
        </View>
        {badge ? (
          <View className="bg-gray-600 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-bold">{badge}</Text>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
      </View>
    </Pressable>
  );
}
