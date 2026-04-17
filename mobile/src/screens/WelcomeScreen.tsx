import React, { useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const setUserMode = useAppStore((s) => s.setUserMode);
  const reset = useAppStore((s) => s.reset);
  const [tapCount, setTapCount] = useState(0);
  const [showDevTools, setShowDevTools] = useState(false);

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    // Show dev tools after 7 taps
    if (newCount === 7) {
      setShowDevTools(true);
    }
    
    // Reset counter after 2 seconds
    setTimeout(() => setTapCount(0), 2000);
  };

  const handleClearAllData = async () => {
    try {
      // Clear Zustand store
      reset();
      
      // Clear AsyncStorage completely
      await AsyncStorage.clear();
      
      alert('✅ All data cleared! App reset to fresh state.');
      setShowDevTools(false);
      setTapCount(0);
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('❌ Error clearing data. Please try again.');
    }
  };

  const handleCustomer = () => {
    setUserMode('customer');
    navigation.navigate('CustomerEstimate');
  };

  const handleProfessional = () => {
    setUserMode('professional');
    navigation.navigate('ProfessionalAuth');
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo */}
        <Pressable onPress={handleLogoTap}>
          <View className="mb-12">
            <Image
              source={require('../../assets/glossy-logo.jpg')}
              style={{ width: 350, height: 350 }}
              resizeMode="contain"
            />
          </View>
        </Pressable>

        {/* Subtitle */}
        <Text className="text-xl text-gray-300 mb-12 text-center">
          All Trades. Instant Estimates.
        </Text>

        {/* Dev Tools (Hidden - Tap logo 7 times) */}
        {showDevTools && (
          <View className="mb-6 bg-gray-900 rounded-xl p-4 w-full border-2 border-red-500">
            <Text className="text-white font-bold text-center mb-2">
              🛠️ DEV TOOLS
            </Text>
            <Text className="text-gray-300 text-sm text-center mb-3">
              Development and diagnostic tools
            </Text>
            <Pressable
              onPress={() => navigation.navigate("FunctionLogs")}
              className="bg-blue-600 rounded-lg py-3 px-4 mb-2 border border-blue-500"
            >
              <Text className="text-white font-bold text-center">
                🔍 FUNCTION LOGS & DIAGNOSTICS
              </Text>
            </Pressable>
            <Pressable
              onPress={handleClearAllData}
              className="bg-red-600 rounded-lg py-3 px-4 mb-2 border border-red-500"
            >
              <Text className="text-white font-bold text-center">
                🗑️ CLEAR ALL DATA
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowDevTools(false)}
              className="bg-gray-800 rounded-lg py-2 px-4 border border-gray-700"
            >
              <Text className="text-white text-center">Close</Text>
            </Pressable>
          </View>
        )}

        {/* Customer Button */}
        <Pressable
          onPress={handleCustomer}
          className="bg-gray-900 rounded-2xl py-6 px-8 mb-4 w-full max-w-sm active:opacity-80 border-2 border-gray-700"
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="home" size={32} color="#60a5fa" />
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold text-white">
                I'm a Customer
              </Text>
              <Text className="text-sm text-gray-400 mt-1">
                Get instant trade estimates
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Professional Button */}
        <Pressable
          onPress={handleProfessional}
          className="bg-blue-600 rounded-2xl py-6 px-8 w-full max-w-sm active:opacity-80 border-2 border-blue-500"
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="briefcase" size={32} color="white" />
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold text-white">
                I'm a Professional
              </Text>
              <Text className="text-sm text-blue-200 mt-1">
                Find trade jobs near you
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Footer */}
        <Text className="text-gray-500 text-sm mt-12 text-center">
          Professional trade estimates in seconds
        </Text>
      </View>
    </SafeAreaView>
  );
}
