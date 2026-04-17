import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Phone, MessageCircle, HelpCircle, RefreshCw } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'Contact'>;

type ContactMethod = 'email' | 'whatsapp' | 'phone' | null;

export default function ContactScreen({ navigation }: Props) {
  const email = 'glossyquote@gmail.com';
  const phone = '07378825257';
  const whatsappNumber = '447378825257'; // UK format with country code
  const [lastFailed, setLastFailed] = useState<ContactMethod>(null);

  const openURL = async (url: string, method: ContactMethod) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        setLastFailed(method);
        return;
      }
      await Linking.openURL(url);
      setLastFailed(null);
    } catch (error) {
      console.error(`Error opening ${method}:`, error);
      setLastFailed(method);
    }
  };

  const handleEmail = () => openURL(`mailto:${email}`, 'email');
  const handlePhone = () => openURL(`tel:${phone}`, 'phone');
  const handleWhatsApp = () => openURL(`https://wa.me/${whatsappNumber}`, 'whatsapp');

  const handleTryAgain = () => {
    if (lastFailed === 'email') handleEmail();
    else if (lastFailed === 'phone') handlePhone();
    else if (lastFailed === 'whatsapp') handleWhatsApp();
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['bottom']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient
            colors={['#2563eb', '#1d4ed8']}
            className="px-6 pt-8 pb-12 mb-6"
          >
            <View className="items-center">
              <View className="bg-white/20 rounded-full p-4 mb-4">
                <HelpCircle size={48} color="#ffffff" />
              </View>
              <Text className="text-3xl font-bold text-white mb-2">
                Customer Service
              </Text>
              <Text className="text-blue-100 text-center text-base leading-6">
                We're here to help! Get in touch with our support team
              </Text>
            </View>
          </LinearGradient>

          <View className="px-6">
            {/* Contact Methods */}
            <View className="mb-8">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Get In Touch
              </Text>

              {/* Email Card */}
              <Pressable
                onPress={handleEmail}
                className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5 mb-4 active:opacity-80"
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
                    <Mail size={24} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-blue-900 mb-1">
                      Email Us
                    </Text>
                    <Text className="text-blue-700 font-semibold">
                      {email}
                    </Text>
                  </View>
                  <View className="bg-blue-600 rounded-full px-3 py-1">
                    <Text className="text-white text-xs font-bold">TAP</Text>
                  </View>
                </View>
              </Pressable>

              {/* WhatsApp Card */}
              <Pressable
                onPress={handleWhatsApp}
                className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-5 mb-4 active:opacity-80"
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
                    <MessageCircle size={24} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-green-900 mb-1">
                      WhatsApp
                    </Text>
                    <Text className="text-green-700 font-semibold">
                      {phone}
                    </Text>
                  </View>
                  <View className="bg-green-600 rounded-full px-3 py-1">
                    <Text className="text-white text-xs font-bold">CHAT</Text>
                  </View>
                </View>
              </Pressable>

              {/* Phone Card */}
              <Pressable
                onPress={handlePhone}
                className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-5 active:opacity-80"
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
                    <Phone size={24} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-purple-900 mb-1">
                      Call Us
                    </Text>
                    <Text className="text-purple-700 font-semibold">
                      {phone}
                    </Text>
                  </View>
                  <View className="bg-purple-600 rounded-full px-3 py-1">
                    <Text className="text-white text-xs font-bold">CALL</Text>
                  </View>
                </View>
              </Pressable>
            </View>

            {/* Support Hours */}
            <View className="bg-gray-50 rounded-2xl p-5 mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Support Hours
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-700">Monday - Friday</Text>
                  <Text className="text-gray-900 font-semibold">9:00 AM - 6:00 PM</Text>
                </View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-700">Saturday</Text>
                  <Text className="text-gray-900 font-semibold">10:00 AM - 4:00 PM</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-700">Sunday</Text>
                  <Text className="text-gray-900 font-semibold">Closed</Text>
                </View>
              </View>
            </View>

            {/* FAQ Hint */}
            <View className="bg-blue-50 rounded-2xl p-5 mb-6">
              <Text className="text-base text-blue-900 font-medium mb-2">
                💡 Quick Help
              </Text>
              <Text className="text-blue-700 leading-6">
                Before contacting us, try asking our AI assistant by tapping the chat button at the bottom right of the screen. It can answer most questions instantly!
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
