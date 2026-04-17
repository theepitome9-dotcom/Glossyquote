import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../types/glossy';
import { validateReviewText, getReviewGuidelines } from '../../utils/profanity-filter';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (review: Review) => void;
  professionalId: string;
  professionalName: string;
  customerId: string;
  customerName: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  professionalId,
  professionalName,
  customerId,
  customerName,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Validate rating
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    // Validate comment
    const validation = validateReviewText(comment);
    if (!validation.valid) {
      setError(validation.message || 'Invalid review');
      return;
    }

    // Create review
    const review: Review = {
      id: Date.now().toString(),
      customerId,
      customerName,
      professionalId,
      rating,
      comment: comment.trim(),
      verified: false, // Will be set to true when job is completed
      helpful: 0,
      createdAt: new Date().toISOString(),
    };

    onSubmit(review);
    handleClose();
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setError('');
    onClose();
  };

  const guidelines = getReviewGuidelines(rating);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">
                Rate Your Experience
              </Text>
              <Pressable onPress={handleClose} className="active:opacity-70">
                <Ionicons name="close" size={28} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView className="flex-1">
              <View className="px-6 py-6">
                {/* Professional Name */}
                <View className="mb-6">
                  <Text className="text-center text-gray-600 mb-2">
                    How was your experience with
                  </Text>
                  <Text className="text-center text-xl font-bold text-gray-900">
                    {professionalName}?
                  </Text>
                </View>

                {/* Star Rating */}
                <View className="mb-6">
                  <Text className="text-base font-semibold text-gray-900 mb-3">
                    Rating *
                  </Text>
                  <View className="flex-row justify-center items-center space-x-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable
                        key={star}
                        onPress={() => {
                          setRating(star);
                          setError('');
                        }}
                        className="active:scale-110"
                      >
                        <Ionicons
                          name={star <= rating ? 'star' : 'star-outline'}
                          size={48}
                          color={star <= rating ? '#FBBF24' : '#D1D5DB'}
                        />
                      </Pressable>
                    ))}
                  </View>
                  {rating > 0 && (
                    <Text className="text-center text-gray-600 mt-2">
                      {rating === 5 && '⭐ Excellent!'}
                      {rating === 4 && '👍 Very Good'}
                      {rating === 3 && '😊 Good'}
                      {rating === 2 && '😐 Fair'}
                      {rating === 1 && '👎 Poor'}
                    </Text>
                  )}
                </View>

                {/* Guidelines */}
                {rating > 0 && (
                  <View className="bg-blue-50 rounded-xl p-4 mb-6">
                    <View className="flex-row items-start mb-2">
                      <Ionicons name="bulb" size={20} color="#2563EB" />
                      <Text className="text-sm font-semibold text-blue-900 ml-2">
                        Helpful tips:
                      </Text>
                    </View>
                    {guidelines.map((tip, index) => (
                      <Text key={index} className="text-sm text-blue-800 ml-7 mb-1">
                        • {tip}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Comment */}
                <View className="mb-6">
                  <Text className="text-base font-semibold text-gray-900 mb-2">
                    Your Review *
                  </Text>
                  <TextInput
                    value={comment}
                    onChangeText={(text) => {
                      setComment(text);
                      setError('');
                    }}
                    placeholder="Describe your experience... (minimum 10 characters)"
                    multiline
                    numberOfLines={6}
                    maxLength={500}
                    className="bg-gray-50 rounded-xl p-4 text-gray-900"
                    style={{
                      minHeight: 120,
                      textAlignVertical: 'top',
                    }}
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    {comment.length}/500 characters
                  </Text>
                </View>

                {/* Guidelines Info */}
                <View className="bg-gray-50 rounded-xl p-4 mb-6">
                  <View className="flex-row items-start">
                    <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
                    <View className="flex-1 ml-3">
                      <Text className="text-sm font-semibold text-gray-900 mb-1">
                        Review Guidelines
                      </Text>
                      <Text className="text-xs text-gray-600 leading-5">
                        • Be honest and constructive{'\n'}
                        • Focus on facts and your experience{'\n'}
                        • Avoid profanity and derogatory language{'\n'}
                        • Reviews are public and help others make decisions
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Error Message */}
                {error ? (
                  <View className="bg-red-50 rounded-xl p-4 mb-4 flex-row items-start">
                    <Ionicons name="warning" size={20} color="#DC2626" />
                    <Text className="text-red-800 ml-2 flex-1">{error}</Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>

            {/* Submit Button */}
            <View className="px-6 py-4 border-t border-gray-200 bg-white">
              <Pressable
                onPress={handleSubmit}
                className="bg-blue-600 py-4 rounded-xl active:opacity-80"
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Submit Review
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
