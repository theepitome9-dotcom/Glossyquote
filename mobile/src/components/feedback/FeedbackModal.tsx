import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFeedbackStore, FeedbackEntry } from '../../state/feedbackStore';
import { useTheme } from '../../utils/theme';
import * as Haptics from 'expo-haptics';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  userType: 'customer' | 'professional';
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
}

type FeedbackCategory = FeedbackEntry['category'];

const CATEGORIES: { value: FeedbackCategory; label: string; icon: string }[] = [
  { value: 'general', label: 'General Feedback', icon: 'chatbubble-outline' },
  { value: 'feature', label: 'Feature Request', icon: 'bulb-outline' },
  { value: 'bug', label: 'Report a Bug', icon: 'bug-outline' },
  { value: 'praise', label: 'Praise', icon: 'heart-outline' },
  { value: 'complaint', label: 'Complaint', icon: 'alert-circle-outline' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  userType,
  userId,
  userName,
  userEmail,
  userPhone,
}) => {
  const { colors, isDarkMode } = useTheme();
  const submitFeedback = useFeedbackStore((s) => s.submitFeedback);

  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Message Required', 'Please enter your feedback message.');
      return;
    }

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }

    setIsSubmitting(true);

    try {
      submitFeedback({
        userType,
        userId,
        userName,
        userEmail,
        userPhone,
        category,
        rating,
        message: message.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted. We appreciate you taking the time to share your thoughts with us.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and close
              setCategory('general');
              setRating(0);
              setMessage('');
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarPress = (star: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(star);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View
            className="flex-row items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: colors.border }}
          >
            <View className="flex-row items-center">
              <View
                className="rounded-full p-2 mr-3"
                style={{ backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe' }}
              >
                <Ionicons
                  name="chatbubbles"
                  size={20}
                  color={isDarkMode ? '#60a5fa' : '#2563eb'}
                />
              </View>
              <Text style={{ color: colors.text }} className="text-xl font-bold">
                Share Feedback
              </Text>
            </View>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {/* Info Box */}
            <View
              className="rounded-xl p-4 mb-6 flex-row"
              style={{ backgroundColor: isDarkMode ? '#1e3a5f' : '#eff6ff' }}
            >
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={isDarkMode ? '#60a5fa' : '#2563eb'}
              />
              <View className="ml-3 flex-1">
                <Text
                  style={{ color: isDarkMode ? '#bfdbfe' : '#1e40af' }}
                  className="font-semibold mb-1"
                >
                  Your Privacy Matters
                </Text>
                <Text
                  style={{ color: isDarkMode ? '#93c5fd' : '#3b82f6' }}
                  className="text-sm leading-5"
                >
                  Your feedback is stored securely and is not publicly visible unless
                  we ask for your permission to share it as a testimonial.
                </Text>
              </View>
            </View>

            {/* Category Selection */}
            <Text
              style={{ color: colors.text }}
              className="text-lg font-semibold mb-3"
            >
              What's your feedback about?
            </Text>
            <View className="flex-row flex-wrap mb-6">
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCategory(cat.value);
                  }}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full flex-row items-center ${
                    category === cat.value ? 'border-2 border-blue-500' : ''
                  }`}
                  style={{
                    backgroundColor:
                      category === cat.value
                        ? isDarkMode
                          ? '#1e3a8a'
                          : '#dbeafe'
                        : colors.surface,
                  }}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={
                      category === cat.value
                        ? isDarkMode
                          ? '#60a5fa'
                          : '#2563eb'
                        : colors.textSecondary
                    }
                  />
                  <Text
                    className="ml-2 font-medium"
                    style={{
                      color:
                        category === cat.value
                          ? isDarkMode
                            ? '#60a5fa'
                            : '#2563eb'
                          : colors.text,
                    }}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Star Rating */}
            <Text
              style={{ color: colors.text }}
              className="text-lg font-semibold mb-3"
            >
              How would you rate your experience?
            </Text>
            <View className="flex-row items-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => handleStarPress(star)}
                  className="mr-2"
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? '#FBBF24' : colors.textMuted}
                  />
                </Pressable>
              ))}
              {rating > 0 && (
                <Text
                  style={{ color: colors.textSecondary }}
                  className="ml-2 text-lg"
                >
                  {rating === 1
                    ? 'Poor'
                    : rating === 2
                    ? 'Fair'
                    : rating === 3
                    ? 'Good'
                    : rating === 4
                    ? 'Great'
                    : 'Excellent!'}
                </Text>
              )}
            </View>

            {/* Message Input */}
            <Text
              style={{ color: colors.text }}
              className="text-lg font-semibold mb-3"
            >
              Your Message
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Tell us what you think... What do you love? What could be better? Any suggestions?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={6}
              maxLength={1000}
              textAlignVertical="top"
              style={{
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              }}
              className="rounded-xl p-4 text-base mb-2 border min-h-[150px]"
            />
            <Text
              style={{ color: colors.textMuted }}
              className="text-sm text-right mb-6"
            >
              {message.length}/1000
            </Text>

            {/* User Info Display */}
            <View
              className="rounded-xl p-4 mb-6"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm mb-2"
              >
                Submitting as:
              </Text>
              <View className="flex-row items-center">
                <View
                  className="rounded-full p-2 mr-3"
                  style={{ backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }}
                >
                  <Ionicons name="person" size={16} color={colors.text} />
                </View>
                <View>
                  <Text style={{ color: colors.text }} className="font-semibold">
                    {userName}
                  </Text>
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="text-sm"
                  >
                    {userEmail}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View
            className="px-6 py-4 border-t"
            style={{ borderColor: colors.border }}
          >
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting || !message.trim() || rating === 0}
              className={`py-4 rounded-xl flex-row items-center justify-center ${
                isSubmitting || !message.trim() || rating === 0
                  ? 'bg-gray-300'
                  : 'bg-blue-600'
              }`}
            >
              {isSubmitting ? (
                <Text className="text-white font-bold text-lg">Submitting...</Text>
              ) : (
                <>
                  <Ionicons name="send" size={20} color="white" />
                  <Text className="text-white font-bold text-lg ml-2">
                    Submit Feedback
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};
