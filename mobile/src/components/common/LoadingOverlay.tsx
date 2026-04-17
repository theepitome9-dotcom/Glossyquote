import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
      <View className="bg-white rounded-2xl p-6 items-center min-w-[200px]">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-900 font-semibold mt-4">{message}</Text>
      </View>
    </View>
  );
};
