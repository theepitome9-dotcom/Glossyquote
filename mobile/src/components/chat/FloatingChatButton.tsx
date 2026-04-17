import React, { useState } from 'react';
import { View, Pressable, Modal, Animated, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatBot } from './ChatBot';
import { useAppStore } from '../../state/appStore';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FloatingChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const userMode = useAppStore((s) => s.userMode);
  const navigation = useNavigation<NavigationProp>();
  const scaleAnim = new Animated.Value(1);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Don't show if user hasn't selected a mode yet
  if (!userMode) return null;

  return (
    <>
      {/* Floating Button */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
        className="absolute bottom-6 right-6 z-50"
      >
        <Pressable
          onPress={handlePress}
          className="bg-blue-600 rounded-full p-4 shadow-lg active:opacity-80"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="relative">
            <Ionicons name="chatbubbles" size={28} color="white" />
            {/* Pulse indicator */}
            <View className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white" />
          </View>
        </Pressable>
      </Animated.View>

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ChatBot
            userType={userMode}
            onClose={handleClose}
            onContactSupport={() => {
              handleClose();
              navigation.navigate('Contact');
            }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};
