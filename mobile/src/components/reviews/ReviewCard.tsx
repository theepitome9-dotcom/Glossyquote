import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../types/glossy';
import { Card } from '../ui/Card';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
  showProfessionalResponse?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onHelpful,
  showProfessionalResponse = true,
}) => {
  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#FBBF24' : '#D1D5DB'}
          />
        ))}
      </View>
    );
  };

  return (
    <Card variant="outlined" padding="lg" className="mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="bg-blue-600 rounded-full w-10 h-10 items-center justify-center mr-3">
            <Text className="text-white font-bold text-lg">
              {review.customerName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold">{review.customerName}</Text>
            <View className="flex-row items-center mt-1">
              {renderStars(review.rating)}
              {review.verified && (
                <View className="ml-2 flex-row items-center">
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text className="text-xs text-green-600 ml-1">Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <Text className="text-xs text-gray-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Comment */}
      <Text className="text-gray-700 leading-6 mb-3">{review.comment}</Text>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <View className="flex-row flex-wrap mb-3">
          {review.images.slice(0, 3).map((imageUri, index) => (
            <Image
              key={index}
              source={{ uri: imageUri }}
              className="w-20 h-20 rounded-lg mr-2 mb-2"
              resizeMode="cover"
            />
          ))}
          {review.images.length > 3 && (
            <View className="w-20 h-20 rounded-lg bg-gray-200 items-center justify-center">
              <Text className="text-gray-600 font-semibold">
                +{review.images.length - 3}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Professional Response */}
      {showProfessionalResponse && review.professionalResponse && (
        <View className="bg-blue-50 rounded-xl p-3 mb-3">
          <View className="flex-row items-center mb-2">
            <Ionicons name="chatbubble-ellipses" size={16} color="#2563EB" />
            <Text className="text-sm font-semibold text-blue-900 ml-2">
              Professional Response
            </Text>
          </View>
          <Text className="text-sm text-gray-700 leading-5">
            {review.professionalResponse}
          </Text>
          {review.responseDate && (
            <Text className="text-xs text-gray-500 mt-2">
              {new Date(review.responseDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Footer */}
      <View className="flex-row items-center justify-between border-t border-gray-200 pt-3">
        <Pressable
          onPress={() => onHelpful?.(review.id)}
          className="flex-row items-center active:opacity-70"
        >
          <Ionicons name="thumbs-up-outline" size={18} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-2">
            Helpful ({review.helpful})
          </Text>
        </Pressable>
      </View>
    </Card>
  );
};
