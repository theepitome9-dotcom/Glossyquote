import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import { useTheme } from '../utils/theme';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'LeadSettings'>;

interface LeadPreferences {
  maxDistance: number; // in miles
  minJobValue: number;
  maxJobValue: number;
  tradeCategories: string[];
  notificationInstant: boolean;
  notificationDigest: boolean;
  digestTime: 'morning' | 'evening';
}

const TRADE_OPTIONS = [
  { id: 'painting-decorating', name: 'Painting & Decorating', icon: 'brush' },
  { id: 'plastering', name: 'Plastering', icon: 'construct' },
  { id: 'flooring', name: 'Flooring', icon: 'layers' },
  { id: 'plumbing', name: 'Plumbing', icon: 'water' },
  { id: 'electrical', name: 'Electrical', icon: 'flash' },
  { id: 'tiling', name: 'Tiling', icon: 'grid' },
  { id: 'carpentry', name: 'Carpentry', icon: 'hammer' },
];

const DEFAULT_PREFERENCES: LeadPreferences = {
  maxDistance: 15,
  minJobValue: 0,
  maxJobValue: 10000,
  tradeCategories: ['painting-decorating', 'plastering', 'flooring'],
  notificationInstant: true,
  notificationDigest: false,
  digestTime: 'morning',
};

export default function LeadSettingsScreen({ navigation }: Props) {
  const currentProfessional = useAppStore((s) => s.currentProfessional);
  const { colors, isDarkMode } = useTheme();
  const [preferences, setPreferences] = useState<LeadPreferences>(DEFAULT_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('lead_preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem('lead_preferences', JSON.stringify(preferences));
      setHasChanges(false);
      Alert.alert('Saved', 'Your lead preferences have been updated.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences.');
    }
  };

  const updatePreference = <K extends keyof LeadPreferences>(
    key: K,
    value: LeadPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const toggleTrade = (tradeId: string) => {
    const current = preferences.tradeCategories;
    const updated = current.includes(tradeId)
      ? current.filter((t) => t !== tradeId)
      : [...current, tradeId];
    updatePreference('tradeCategories', updated);
  };

  if (!currentProfessional) {
    navigation.replace('ProfessionalAuth');
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text style={{ color: colors.text }} className="text-2xl font-bold">
                Lead Settings
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
                Customize which leads you receive
              </Text>
            </View>
            {hasChanges && (
              <Pressable
                onPress={savePreferences}
                className="bg-blue-600 px-4 py-2 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold">Save</Text>
              </Pressable>
            )}
          </View>

          {/* Distance Radius */}
          <View
            style={{ backgroundColor: colors.surface }}
            className="rounded-2xl p-5 mb-4"
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-blue-100 rounded-full p-2 mr-3">
                <Ionicons name="location" size={20} color="#2563eb" />
              </View>
              <Text style={{ color: colors.text }} className="font-semibold text-lg">
                Working Radius
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary }} className="mb-3">
              Only show leads within {preferences.maxDistance} miles
            </Text>
            <Slider
              value={preferences.maxDistance}
              onValueChange={(value) => updatePreference('maxDistance', Math.round(value))}
              minimumValue={5}
              maximumValue={50}
              step={5}
              minimumTrackTintColor="#2563eb"
              maximumTrackTintColor={colors.border}
              thumbTintColor="#2563eb"
            />
            <View className="flex-row justify-between mt-2">
              <Text style={{ color: colors.textMuted }} className="text-xs">5 miles</Text>
              <Text style={{ color: colors.primary }} className="font-bold">
                {preferences.maxDistance} miles
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-xs">50 miles</Text>
            </View>
          </View>

          {/* Job Value Range */}
          <View
            style={{ backgroundColor: colors.surface }}
            className="rounded-2xl p-5 mb-4"
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-green-100 rounded-full p-2 mr-3">
                <Ionicons name="cash" size={20} color="#16a34a" />
              </View>
              <Text style={{ color: colors.text }} className="font-semibold text-lg">
                Job Value Range
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary }} className="mb-3">
              Minimum job value: £{preferences.minJobValue}
            </Text>
            <Slider
              value={preferences.minJobValue}
              onValueChange={(value) => updatePreference('minJobValue', Math.round(value / 100) * 100)}
              minimumValue={0}
              maximumValue={5000}
              step={100}
              minimumTrackTintColor="#16a34a"
              maximumTrackTintColor={colors.border}
              thumbTintColor="#16a34a"
            />
            <View className="flex-row justify-between mt-2 mb-4">
              <Text style={{ color: colors.textMuted }} className="text-xs">£0</Text>
              <Text style={{ color: colors.textMuted }} className="text-xs">£5,000</Text>
            </View>

            <Text style={{ color: colors.textSecondary }} className="mb-3">
              Maximum job value: £{preferences.maxJobValue.toLocaleString()}
            </Text>
            <Slider
              value={preferences.maxJobValue}
              onValueChange={(value) => updatePreference('maxJobValue', Math.round(value / 500) * 500)}
              minimumValue={500}
              maximumValue={50000}
              step={500}
              minimumTrackTintColor="#16a34a"
              maximumTrackTintColor={colors.border}
              thumbTintColor="#16a34a"
            />
            <View className="flex-row justify-between mt-2">
              <Text style={{ color: colors.textMuted }} className="text-xs">£500</Text>
              <Text style={{ color: colors.textMuted }} className="text-xs">£50,000</Text>
            </View>
          </View>

          {/* Trade Categories */}
          <View
            style={{ backgroundColor: colors.surface }}
            className="rounded-2xl p-5 mb-4"
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-purple-100 rounded-full p-2 mr-3">
                <Ionicons name="construct" size={20} color="#9333ea" />
              </View>
              <Text style={{ color: colors.text }} className="font-semibold text-lg">
                Trade Categories
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary }} className="mb-4">
              Select the types of work you want to receive leads for
            </Text>
            <View className="flex-row flex-wrap">
              {TRADE_OPTIONS.map((trade) => {
                const isSelected = preferences.tradeCategories.includes(trade.id);
                return (
                  <Pressable
                    key={trade.id}
                    onPress={() => toggleTrade(trade.id)}
                    className={`mr-2 mb-2 px-4 py-2 rounded-full flex-row items-center ${
                      isSelected ? 'bg-blue-600' : ''
                    }`}
                    style={!isSelected ? { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border } : {}}
                  >
                    <Ionicons
                      name={trade.icon as any}
                      size={16}
                      color={isSelected ? 'white' : colors.textSecondary}
                    />
                    <Text
                      className={`ml-2 text-sm font-medium ${isSelected ? 'text-white' : ''}`}
                      style={!isSelected ? { color: colors.text } : {}}
                    >
                      {trade.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Notification Preferences */}
          <View
            style={{ backgroundColor: colors.surface }}
            className="rounded-2xl p-5 mb-4"
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-orange-100 rounded-full p-2 mr-3">
                <Ionicons name="notifications" size={20} color="#ea580c" />
              </View>
              <Text style={{ color: colors.text }} className="font-semibold text-lg">
                Notifications
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b" style={{ borderColor: colors.border }}>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="font-medium">
                  Instant Notifications
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  Get notified immediately for new leads
                </Text>
              </View>
              <Switch
                value={preferences.notificationInstant}
                onValueChange={(value) => updatePreference('notificationInstant', value)}
                trackColor={{ false: colors.border, true: '#3b82f6' }}
                thumbColor="white"
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="font-medium">
                  Daily Digest
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  Receive a summary of new leads
                </Text>
              </View>
              <Switch
                value={preferences.notificationDigest}
                onValueChange={(value) => updatePreference('notificationDigest', value)}
                trackColor={{ false: colors.border, true: '#3b82f6' }}
                thumbColor="white"
              />
            </View>

            {preferences.notificationDigest && (
              <View className="flex-row mt-3">
                <Pressable
                  onPress={() => updatePreference('digestTime', 'morning')}
                  className={`flex-1 py-3 rounded-l-xl ${
                    preferences.digestTime === 'morning' ? 'bg-blue-600' : ''
                  }`}
                  style={preferences.digestTime !== 'morning' ? { backgroundColor: colors.card } : {}}
                >
                  <Text
                    className={`text-center font-medium ${
                      preferences.digestTime === 'morning' ? 'text-white' : ''
                    }`}
                    style={preferences.digestTime !== 'morning' ? { color: colors.text } : {}}
                  >
                    Morning (8am)
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => updatePreference('digestTime', 'evening')}
                  className={`flex-1 py-3 rounded-r-xl ${
                    preferences.digestTime === 'evening' ? 'bg-blue-600' : ''
                  }`}
                  style={preferences.digestTime !== 'evening' ? { backgroundColor: colors.card } : {}}
                >
                  <Text
                    className={`text-center font-medium ${
                      preferences.digestTime === 'evening' ? 'text-white' : ''
                    }`}
                    style={preferences.digestTime !== 'evening' ? { color: colors.text } : {}}
                  >
                    Evening (6pm)
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Save Button */}
          {hasChanges && (
            <Pressable
              onPress={savePreferences}
              className="bg-blue-600 py-4 rounded-2xl active:opacity-80 mb-6"
            >
              <Text className="text-white text-center font-bold text-lg">
                Save Preferences
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
