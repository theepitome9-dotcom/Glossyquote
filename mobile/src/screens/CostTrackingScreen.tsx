import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getCostBreakdown,
  getRecentCosts,
  resetCostTracking,
  exportCostData,
  CostEntry,
} from '../utils/cost-tracker';

export default function CostTrackingScreen() {
  const [breakdown, setBreakdown] = useState({
    total: '$0.00',
    aiMeasurement: '$0.00',
    aiValidation: '$0.00',
    other: '$0.00',
    todayCost: '$0.00',
    averageDailyCost: '$0.00',
  });
  const [recentCosts, setRecentCosts] = useState<CostEntry[]>([]);

  const loadData = async () => {
    try {
      const stats = await getCostBreakdown();
      setBreakdown(stats);

      const recent = await getRecentCosts(20);
      setRecentCosts(recent);
    } catch (error) {
      console.error('Failed to load cost data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = () => {
    Alert.alert(
      'Reset Cost Tracking?',
      'This will clear all cost tracking data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetCostTracking();
            await loadData();
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      await exportCostData();
      if (__DEV__) {
        console.log('Cost data exported');
      }
      Alert.alert('Export Complete', 'Cost data exported successfully.');
    } catch {
      Alert.alert('Export Failed', 'Could not export cost data');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Header */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="analytics" size={32} color="#2563eb" />
              <Text className="text-3xl font-bold text-gray-900 ml-3">Cost Tracking</Text>
            </View>
            <Text className="text-base text-gray-600">
              Monitor API usage and estimated costs
            </Text>
          </View>

          {/* Summary Cards */}
          <View className="flex-row mb-4">
            <Card variant="elevated" padding="md" className="flex-1 mr-2 bg-blue-50">
              <Text className="text-sm text-gray-600 mb-1">Total Cost</Text>
              <Text className="text-2xl font-bold text-blue-600">{breakdown.total}</Text>
            </Card>
            <Card variant="elevated" padding="md" className="flex-1 ml-2 bg-green-50">
              <Text className="text-sm text-gray-600 mb-1">Today</Text>
              <Text className="text-2xl font-bold text-green-600">{breakdown.todayCost}</Text>
            </Card>
          </View>

          {/* Cost Breakdown */}
          <Card variant="elevated" padding="lg" className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</Text>

            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Ionicons name="camera" size={20} color="#6366f1" />
                <Text className="text-gray-700 ml-2">AI Room Measurement</Text>
              </View>
              <Text className="font-semibold text-gray-900">{breakdown.aiMeasurement}</Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text className="text-gray-700 ml-2">Photo Validation</Text>
              </View>
              <Text className="font-semibold text-gray-900">{breakdown.aiValidation}</Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Ionicons name="ellipsis-horizontal" size={20} color="#f59e0b" />
                <Text className="text-gray-700 ml-2">Other</Text>
              </View>
              <Text className="font-semibold text-gray-900">{breakdown.other}</Text>
            </View>

            <View className="border-t border-gray-200 pt-3 mt-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Avg. Daily Cost</Text>
                <Text className="font-bold text-gray-900">{breakdown.averageDailyCost}</Text>
              </View>
            </View>
          </Card>

          {/* Cost Limits Warning */}
          {parseFloat(breakdown.todayCost.replace('$', '')) > 5 && (
            <Card variant="outlined" padding="md" className="mb-4 border-orange-500 bg-orange-50">
              <View className="flex-row items-start">
                <Ionicons name="warning" size={24} color="#f97316" />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-orange-900 mb-1">Daily Limit Warning</Text>
                  <Text className="text-sm text-orange-800">
                    {"Today's cost exceeds $5. AI features may be rate-limited to prevent unexpected bills."}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Recent Activity */}
          <Card variant="default" padding="lg" className="mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">Recent Activity</Text>
              <Pressable onPress={loadData}>
                <Ionicons name="refresh" size={24} color="#2563eb" />
              </Pressable>
            </View>

            {recentCosts.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">No cost data yet</Text>
            ) : (
              recentCosts.slice(0, 10).map((entry) => (
                <View key={entry.id} className="border-b border-gray-100 py-3">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">
                        {entry.operation.replace('_', ' ')}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </Text>
                      {entry.metadata?.details && (
                        <Text className="text-xs text-gray-600 mt-1">
                          {entry.metadata.details}
                        </Text>
                      )}
                    </View>
                    <Text className="font-semibold text-blue-600 ml-2">
                      ${entry.cost.toFixed(4)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card>

          {/* Actions */}
          <View className="mb-6">
            <Button onPress={handleExport} variant="secondary" fullWidth className="mb-3">
              <Ionicons name="download" size={20} color="#374151" style={{ marginRight: 8 }} />
              <Text className="text-gray-800 font-semibold">Export Data (CSV)</Text>
            </Button>

            <Button onPress={handleReset} variant="secondary" fullWidth>
              <Ionicons name="trash" size={20} color="#ef4444" style={{ marginRight: 8 }} />
              <Text className="text-red-600 font-semibold">Reset All Data</Text>
            </Button>
          </View>

          {/* Info */}
          <Card variant="default" padding="md" className="bg-blue-50">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#2563eb" />
              <View className="ml-2 flex-1">
                <Text className="text-sm text-gray-700 leading-5">
                  Cost estimates are based on OpenAI GPT-4o pricing. Actual costs may vary. Daily limit is set to $5 to prevent unexpected bills.
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
