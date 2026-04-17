import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Keyboard, Pressable, Image, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/types';
import { JobListingWithContact, Customer, TradeCategory } from '../types/glossy';
import { useAppStore } from '../state/appStore';
import { formatPriceRange } from '../utils/estimate-calculator';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAlert } from '../components/modals/CustomAlert';
import { TRADE_CATEGORIES, getTradeInfo } from '../config/trades-pricing';
import { getPackageById } from '../utils/trades-pricing';

const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const INTERNAL_SECRET = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET || '';

type Props = NativeStackScreenProps<RootStackParamList, 'JobPosting'>;

export default function JobPostingScreen({ navigation, route }: Props) {
  const { estimate } = route.params;
  const addJobListing = useAppStore((s) => s.addJobListing);
  const currentCustomer = useAppStore((s) => s.currentCustomer);
  const setCurrentCustomer = useAppStore((s) => s.setCurrentCustomer);
  const locale = useAppStore((s) => s.locale);
  const { showAlert, AlertComponent } = useAlert();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [postcode, setPostcode] = useState(estimate?.request.postcode || '');
  const [description, setDescription] = useState('');
  const [roomImages, setRoomImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Determine trade category from estimate - use package's own tradeCategory first
  const getTradeFromPackageId = (packageId?: string): TradeCategory => {
    if (!packageId) return 'painting-decorating';
    const pkg = getPackageById(packageId);
    if (pkg?.tradeCategory) return pkg.tradeCategory as TradeCategory;
    // Fallback string matching for edge cases
    if (packageId.includes('plastering') || packageId.includes('skim') || packageId.includes('drylining') || packageId.includes('board')) return 'plastering';
    if (packageId.includes('flooring')) return 'flooring';
    if (packageId.includes('tiling')) return 'tiling';
    if (packageId.includes('kitchen')) return 'kitchen-fitting';
    if (packageId.includes('bathroom')) return 'bathroom-fitting';
    if (packageId.includes('carpentry') || packageId.includes('woodwork')) return 'carpentry';
    if (packageId.includes('electrical')) return 'electrical';
    if (packageId.includes('plumbing')) return 'plumbing';
    return 'painting-decorating';
  };

  const [selectedTrade, setSelectedTrade] = useState<TradeCategory>(
    estimate ? getTradeFromPackageId(estimate.request.packageId) : 'painting-decorating'
  );

  // Get trade display name
  const getTradeDisplayName = (trade: TradeCategory): string => {
    const tradeInfo = getTradeInfo(trade);
    return tradeInfo?.name || 'Painting & Decorating';
  };

  // Form validation
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    postcode: '',
    description: '',
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      postcode: '',
      description: '',
    };

    if (!customerName.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email is optional — only validate format if provided
    if (customerEmail.trim() && !validateEmail(customerEmail.trim())) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!customerPhone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Project description is required';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.phone && !newErrors.postcode && !newErrors.description;
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload room photos.'
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setRoomImages([...roomImages, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleRemoveImage = (index: number) => {
    setRoomImages(roomImages.filter((_, i) => i !== index));
  };

  const handlePostJob = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    // Create or update customer profile
    const customerId = currentCustomer?.id || Date.now().toString();

    if (!currentCustomer) {
      const newCustomer: Customer = {
        id: customerId,
        name: customerName.trim(),
        email: customerEmail.trim(),
        phone: customerPhone.trim(),
        portfolio: [],
        estimates: estimate ? [estimate] : [],
        jobListings: [],
        referralCode: `CUST${Date.now().toString().slice(-6)}`,
        referrals: [],
        referralCredits: 0,
        createdAt: new Date().toISOString(),
      };
      setCurrentCustomer(newCustomer);
    }

    const postcodeValue = postcode.trim().toUpperCase();
    const jobId = Date.now().toString();

    // Create job listing for local state
    const job: JobListingWithContact = {
      id: jobId,
      customerId: customerId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || '',
      customerPhone: customerPhone.trim(),
      tradeCategory: selectedTrade,
      estimate: estimate,
      description: description.trim(),
      images: roomImages,
      postcode: postcodeValue,
      postedAt: new Date().toISOString(),
      interestedProfessionals: [],
      maxProfessionals: 4,
    };

    // Save locally
    addJobListing(job);

    // Send to backend (non-blocking - don't fail if backend is down)
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': INTERNAL_SECRET,
        },
        body: JSON.stringify({
          id: jobId,
          customerName: job.customerName,
          customerEmail: job.customerEmail || null,
          customerPhone: job.customerPhone,
          tradeCategory: job.tradeCategory,
          description: job.description,
          postcode: job.postcode,
          estimatePaid: estimate?.paid ?? false,
          estimateMinPrice: estimate?.totalMinPrice ?? null,
          estimateMaxPrice: estimate?.totalMaxPrice ?? null,
          imageCount: roomImages.length,
          postedAt: job.postedAt,
        }),
      });

      if (!response.ok) {
        console.warn('[JobPosting] Backend save returned:', response.status);
      } else {
        console.log('[JobPosting] Job saved to backend successfully');
      }
    } catch (err) {
      // Non-fatal - job is saved locally regardless
      console.warn('[JobPosting] Could not save to backend:', err);
    }

    // Register customer in backend for owner visibility (non-blocking)
    fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': INTERNAL_SECRET },
      body: JSON.stringify({
        id: customerId,
        userType: 'customer',
        name: customerName.trim(),
        email: customerEmail.trim() || null,
        phone: customerPhone.trim(),
        registeredAt: new Date().toISOString(),
      }),
    }).catch((err) => console.warn('[JobPosting] Could not register customer:', err));

    setLoading(false);

    showAlert(
      'Job Posted Successfully!',
      'Your job has been posted. Up to 4 verified professionals can now view and contact you about this project. You can upload photos of work you like in your profile to share with professionals.',
      [
        {
          text: 'View Profile',
          onPress: () => navigation.navigate('CustomerProfile'),
        },
        {
          text: 'Done',
          onPress: () => navigation.navigate('Welcome'),
        },
      ],
      'success'
    );
  }, [customerName, customerEmail, customerPhone, description, roomImages, selectedTrade, estimate, currentCustomer, addJobListing, setCurrentCustomer, navigation, showAlert]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1" 
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 py-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">Post Your Job</Text>
            <Text className="text-base text-gray-600">
              Connect with verified professionals. Your contact details will only be
              visible to professionals who purchase your lead.
            </Text>
          </View>

          {/* Trade Category Selection (if no estimate) */}
          {!estimate && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Select Trade Category</Text>
              <View className="flex-row flex-wrap">
                {TRADE_CATEGORIES.map((trade) => {
                  const isSelected = selectedTrade === trade.id;
                  return (
                    <Pressable
                      key={trade.id}
                      onPress={() => setSelectedTrade(trade.id)}
                      className={`mr-2 mb-2 px-4 py-3 rounded-xl flex-row items-center ${
                        isSelected ? 'bg-blue-600 border-2 border-blue-600' : 'bg-gray-100 border-2 border-gray-200'
                      }`}
                    >
                      <Ionicons 
                        name={trade.icon as any} 
                        size={20} 
                        color={isSelected ? 'white' : '#6B7280'} 
                      />
                      <Text className={`ml-2 text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                        {trade.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Estimate Summary (only show price if paid) */}
          {estimate && (
            <Card variant="default" padding="md" className="mb-6 bg-blue-50">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-blue-800">YOUR PROJECT</Text>
                <View className="bg-blue-600 px-2 py-1 rounded-md">
                  <Text className="text-xs text-white font-medium">{getTradeDisplayName(selectedTrade)}</Text>
                </View>
              </View>
              {estimate.paid ? (
                <>
                  <Text className="text-2xl font-bold text-blue-600 mb-2">
                    {formatPriceRange(estimate.totalMinPrice, estimate.totalMaxPrice, locale)}
                  </Text>
                  <Text className="text-gray-600">
                    {estimate.request.packageId ? '' : `${estimate.request.rooms.length} room(s) • ${estimate.request.rooms.reduce((sum, r) => sum + r.squareMeters, 0)} m² • `}
                    {estimate.request.postcode.toUpperCase()}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-gray-600 mb-2">
                    {estimate.request.packageId ? '' : `${estimate.request.rooms.length} room(s) • ${estimate.request.rooms.reduce((sum, r) => sum + r.squareMeters, 0)} m² • `}
                    {estimate.request.postcode.toUpperCase()}
                  </Text>
                  <Text className="text-xs text-gray-500 italic">
                    Price estimate not purchased - professionals will provide quotes
                  </Text>
                </>
              )}
            </Card>
          )}

          {/* Contact Information */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Contact Information</Text>

            <Input
              label="Your Name"
              value={customerName}
              onChangeText={(text) => {
                setCustomerName(text);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="John Smith"
              autoCapitalize="words"
              error={errors.name}
              required
            />

            <Input
              label="Email Address (Optional)"
              value={customerEmail}
              onChangeText={(text) => {
                setCustomerEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />

            <Input
              label="Phone Number"
              value={customerPhone}
              onChangeText={(text) => {
                setCustomerPhone(text);
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              placeholder="07123 456789"
              keyboardType="phone-pad"
              error={errors.phone}
              required
            />

            <Input
              label="Postcode"
              value={postcode}
              onChangeText={(text) => {
                setPostcode(text.toUpperCase());
                if (errors.postcode) setErrors({ ...errors, postcode: '' });
              }}
              placeholder="e.g. NW10 5JL"
              autoCapitalize="characters"
              autoCorrect={false}
              error={errors.postcode}
              required
            />
          </View>

          {/* Project Description */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Project Description
            </Text>

            <Input
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              placeholder="Add details about your project..."
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
              error={errors.description}
              required
            />
          </View>

          {/* Room Photos */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Photos (Optional)
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
              Upload photos of your project space. This helps professionals provide more accurate quotes.
            </Text>

            {/* Image Grid */}
            {roomImages.length > 0 && (
              <View className="flex-row flex-wrap mb-4">
                {roomImages.map((uri, index) => (
                  <View key={index} style={{ width: 100, height: 100, marginRight: 8, marginBottom: 8 }}>
                    <Image
                      source={{ uri }}
                      style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
                      resizeMode="cover"
                    />
                    <Pressable
                      onPress={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1 active:opacity-70"
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Add Photo Button */}
            <Pressable
              onPress={handlePickImage}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center active:bg-gray-50"
            >
              <View className="bg-blue-100 rounded-full p-3 mb-2">
                <Ionicons name="camera" size={24} color="#2563eb" />
              </View>
              <Text className="text-blue-600 font-semibold">Add Room Photo</Text>
              <Text className="text-xs text-gray-500 mt-1">
                {roomImages.length > 0 ? `${roomImages.length} photo(s) added` : 'Tap to upload'}
              </Text>
            </Pressable>
          </View>

          {/* Privacy Notice */}
          <Card variant="default" padding="md" className="mb-6 bg-gray-50">
            <Text className="text-sm text-gray-600 leading-5">
              <Text className="font-semibold">Privacy Notice: </Text>
              Your contact details will only be shared with professionals who purchase your lead.
              Up to 4 professionals can view and contact you about this project.
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-6 py-4 border-t border-gray-200 bg-white">
        <Button 
          onPress={handlePostJob}
          loading={loading}
          fullWidth
        >
          Post Job for FREE
        </Button>
      </View>

      <AlertComponent />
    </SafeAreaView>
  );
}
