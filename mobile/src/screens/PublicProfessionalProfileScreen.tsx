import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getTradeInfo } from '../config/trades-pricing';

type Props = NativeStackScreenProps<RootStackParamList, 'PublicProfessionalProfile'>;

interface PublicReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  professionalResponse?: string | null;
  createdAt: string;
}

interface PublicPortfolioItem {
  id: string;
  uri: string;
  type: 'photo' | 'video';
  caption?: string | null;
}

interface PublicProfile {
  id: string;
  name: string;
  tradeCategories: string[];
  profileDescription: string | null;
  rating: number;
  totalReviews: number;
  reviews: PublicReview[];
  portfolio: PublicPortfolioItem[];
  isPremium: boolean;
  updatedAt: string;
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color={star <= Math.round(rating) ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </View>
  );
}

const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function PublicProfessionalProfileScreen({ route, navigation }: Props) {
  const { professionalId } = route.params;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [professionalId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BACKEND_URL}/api/professionals/${professionalId}/public`);
      if (!res.ok) {
        setError('Profile not found or no longer available.');
        return;
      }
      const data = await res.json();
      setProfile(data);
    } catch {
      setError('Could not load profile. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-3">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <View className="bg-gray-100 rounded-full p-6 mb-4">
          <Ionicons name="person-remove-outline" size={48} color="#9ca3af" />
        </View>
        <Text className="text-xl font-bold text-gray-900 text-center mb-2">Profile Unavailable</Text>
        <Text className="text-gray-500 text-center">{error || 'This profile could not be found.'}</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-xl active:opacity-80"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const tradeNames = profile.tradeCategories.map(
    (id) => getTradeInfo(id as any)?.name || id
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <LinearGradient
          colors={['#1e40af', '#2563eb', '#3b82f6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 48, paddingBottom: 40, paddingHorizontal: 24 }}
        >
          {/* Avatar */}
          <View className="items-center mb-5">
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: 'rgba(255,255,255,0.4)',
              }}
            >
              <Text style={{ fontSize: 36, fontWeight: '700', color: '#fff' }}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Name & Premium Badge */}
          <View className="items-center">
            <View className="flex-row items-center gap-2">
              <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff' }}>{profile.name}</Text>
              {profile.isPremium && (
                <View style={{ backgroundColor: '#f59e0b', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>PRO</Text>
                </View>
              )}
            </View>

            {/* Trades */}
            <View className="flex-row flex-wrap justify-center mt-2" style={{ gap: 6 }}>
              {tradeNames.map((t, i) => (
                <View
                  key={i}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}
                >
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>{t}</Text>
                </View>
              ))}
            </View>

            {/* Rating Row */}
            {profile.totalReviews > 0 && (
              <View className="flex-row items-center mt-4 gap-2">
                <StarRating rating={profile.rating} size={18} />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                  {profile.rating.toFixed(1)}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                  ({profile.totalReviews} review{profile.totalReviews !== 1 ? 's' : ''})
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View className="px-5 py-5">
          {/* About */}
          {profile.profileDescription ? (
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
              <Text className="text-sm font-bold text-gray-400 mb-2 tracking-widest">ABOUT</Text>
              <Text className="text-gray-800 text-base leading-6">{profile.profileDescription}</Text>
            </View>
          ) : null}

          {/* Portfolio */}
          {profile.portfolio.length > 0 && (
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-400 mb-3 tracking-widest px-1">PORTFOLIO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {profile.portfolio.filter((p) => p.type === 'photo').map((item) => (
                    <View
                      key={item.id}
                      style={{ width: 160, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f3f4f6' }}
                    >
                      <Image
                        source={{ uri: item.uri }}
                        style={{ width: 160, height: 130 }}
                        resizeMode="cover"
                      />
                      {item.caption ? (
                        <View style={{ padding: 8 }}>
                          <Text style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>{item.caption}</Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Reviews */}
          {profile.reviews.length > 0 ? (
            <View>
              <Text className="text-sm font-bold text-gray-400 mb-3 tracking-widest px-1">REVIEWS</Text>
              {profile.reviews.slice(0, 10).map((review) => (
                <View
                  key={review.id}
                  className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-gray-100"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center gap-2">
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: '#eff6ff',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#2563eb', fontWeight: '700', fontSize: 15 }}>
                          {review.customerName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text className="font-semibold text-gray-900 text-sm">{review.customerName}</Text>
                        <Text className="text-gray-400 text-xs">
                          {new Date(review.createdAt).toLocaleDateString('en-GB', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    </View>
                    <StarRating rating={review.rating} size={14} />
                  </View>

                  <Text className="text-gray-700 leading-5">{review.comment}</Text>

                  {review.professionalResponse ? (
                    <View className="mt-3 bg-blue-50 rounded-xl p-3 border-l-2 border-blue-400">
                      <Text className="text-xs font-semibold text-blue-600 mb-1">Response from {profile.name}</Text>
                      <Text className="text-gray-700 text-sm">{review.professionalResponse}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
              <Ionicons name="chatbubble-outline" size={40} color="#d1d5db" />
              <Text className="text-gray-400 mt-3 text-center">No reviews yet</Text>
            </View>
          )}

          {/* Footer */}
          <Text className="text-center text-gray-400 text-xs mt-6 mb-2">
            Listed on Glossy · Verified UK Trade Professional
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
