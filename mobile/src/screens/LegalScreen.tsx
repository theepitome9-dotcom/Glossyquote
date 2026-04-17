import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';

type Props = NativeStackScreenProps<RootStackParamList, 'Legal'>;

const PRIVACY_POLICY_URL = 'https://glossyquote.com/privacy.html';
const TERMS_OF_SERVICE_URL = 'https://glossyquote.com/terms.html';
const PRIVACY_CHOICES_URL = 'https://glossyquote.com/privacy-choices.html';

export default function LegalScreen({ navigation }: Props) {
  const handleOpenPrivacyPolicy = async () => {
    await WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
  };

  const handleOpenTermsOfService = async () => {
    await WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL);
  };

  const handleOpenPrivacyChoices = async () => {
    await WebBrowser.openBrowserAsync(PRIVACY_CHOICES_URL);
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['bottom']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient
            colors={['#1f2937', '#374151']}
            className="px-6 pt-8 pb-12 mb-6"
          >
            <View className="items-center">
              <View className="bg-white/20 rounded-full p-4 mb-4">
                <Ionicons name="document-text" size={48} color="#ffffff" />
              </View>
              <Text className="text-3xl font-bold text-white mb-2">
                Legal Information
              </Text>
              <Text className="text-gray-300 text-center text-base leading-6">
                Privacy Policy, Terms of Service, and your rights
              </Text>
            </View>
          </LinearGradient>

          <View className="px-6">
            {/* Privacy Policy */}
            <Pressable
              onPress={handleOpenPrivacyPolicy}
              className="bg-blue-50 rounded-2xl p-5 mb-4 active:opacity-80"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                <View className="bg-blue-600 rounded-full p-3 mr-4">
                  <Ionicons name="shield-checkmark" size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    Privacy Policy
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    How we collect, use, and protect your data
                  </Text>
                </View>
                <Ionicons name="open-outline" size={24} color="#2563eb" />
              </View>
            </Pressable>

            {/* Terms of Service */}
            <Pressable
              onPress={handleOpenTermsOfService}
              className="bg-purple-50 rounded-2xl p-5 mb-4 active:opacity-80"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                <View className="bg-purple-600 rounded-full p-3 mr-4">
                  <Ionicons name="document-text" size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    Terms of Service
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Rules and guidelines for using our app
                  </Text>
                </View>
                <Ionicons name="open-outline" size={24} color="#9333ea" />
              </View>
            </Pressable>

            {/* Privacy Choices */}
            <Pressable
              onPress={handleOpenPrivacyChoices}
              className="bg-green-50 rounded-2xl p-5 mb-4 active:opacity-80"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                <View className="bg-green-600 rounded-full p-3 mr-4">
                  <Ionicons name="options" size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    Privacy Choices
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Manage your privacy preferences and opt-out options
                  </Text>
                </View>
                <Ionicons name="open-outline" size={24} color="#16a34a" />
              </View>
            </Pressable>

            {/* Your Rights Section */}
            <View className="bg-gray-50 rounded-2xl p-5 mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Your Rights
              </Text>

              <View className="space-y-3">
                <View className="flex-row items-start mb-3">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-900 font-semibold">Right to Access</Text>
                    <Text className="text-gray-600 text-sm">
                      You can request a copy of your personal data
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start mb-3">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-900 font-semibold">Right to Delete</Text>
                    <Text className="text-gray-600 text-sm">
                      You can close your account and delete your data
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start mb-3">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-900 font-semibold">Right to Portability</Text>
                    <Text className="text-gray-600 text-sm">
                      You can export your data in a portable format
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-900 font-semibold">Right to Object</Text>
                    <Text className="text-gray-600 text-sm">
                      You can opt out of marketing communications
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Data We Collect */}
            <View className="bg-blue-50 rounded-2xl p-5 mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Data We Collect
              </Text>

              <View className="space-y-2">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="person-outline" size={18} color="#2563eb" />
                  <Text className="text-gray-700 ml-2">Name and contact information</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="location-outline" size={18} color="#2563eb" />
                  <Text className="text-gray-700 ml-2">Postcode for estimate calculations</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="home-outline" size={18} color="#2563eb" />
                  <Text className="text-gray-700 ml-2">Property details for estimates</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="images-outline" size={18} color="#2563eb" />
                  <Text className="text-gray-700 ml-2">Photos you upload (with permission)</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="card-outline" size={18} color="#2563eb" />
                  <Text className="text-gray-700 ml-2">Payment history (processed securely)</Text>
                </View>
              </View>
            </View>

            {/* Subscription Terms */}
            <View className="bg-amber-50 rounded-2xl p-5 mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Subscription Terms
              </Text>
              <Text className="text-gray-700 leading-6 mb-3">
                Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.
              </Text>
              <Text className="text-gray-700 leading-6 mb-3">
                Payment will be charged to your App Store account at confirmation of purchase.
              </Text>
              <Text className="text-gray-700 leading-6">
                You can manage or cancel your subscription anytime in your device's App Store settings.
              </Text>
            </View>

            {/* Contact for Legal Inquiries */}
            <Pressable
              onPress={() => navigation.navigate('Contact')}
              className="bg-gray-100 rounded-2xl p-5 mb-6 active:opacity-80"
            >
              <View className="flex-row items-center">
                <View className="bg-gray-600 rounded-full p-3 mr-4">
                  <Ionicons name="mail" size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    Legal Inquiries
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Contact us for data requests or legal questions
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#6b7280" />
              </View>
            </Pressable>

            {/* App Version */}
            <View className="items-center py-4 mb-4">
              <Text className="text-gray-400 text-sm">GLOSSY App v1.0.0</Text>
              <Text className="text-gray-400 text-xs mt-1">
                © 2025 GLOSSY. All rights reserved.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
