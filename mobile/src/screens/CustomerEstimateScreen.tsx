import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PropertyType, RoomMeasurement, EstimateExtras, TradeCategory } from '../types/glossy';
import { calculateSquareMeters, formatCurrency } from '../utils/estimate-calculator';
import { getPackagesByTrade, TRADE_INFO, TRADE_DISCLAIMERS } from '../utils/trades-pricing';
import { useAppStore } from '../state/appStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { InfoBanner } from '../components/common/InfoBanner';
import { ContextualHelp } from '../components/common/ContextualHelp';
import { useAlert } from '../components/modals/CustomAlert';
import { Badge } from '../components/ui/Badge';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerEstimate'>;

// Property types configuration with locale support - v2
const getPropertyTypes = (locale: string): { value: PropertyType; label: string }[] => {
  const baseTypes = [
    { value: 'modern' as PropertyType, label: 'Modern' },
    { value: 'victorian' as PropertyType, label: 'Victorian' },
    { value: 'georgian' as PropertyType, label: 'Georgian' },
    { value: 'bungalow' as PropertyType, label: 'Bungalow' },
    { value: 'house' as PropertyType, label: 'House' },
    { value: 'flat' as PropertyType, label: 'Flat' },
    { value: 'studio' as PropertyType, label: 'Studio' },
    { value: 'bedsit' as PropertyType, label: 'Bedsit' },
  ];

  // Add "Condo" only for US users
  if (locale === 'en-US') {
    baseTypes.splice(6, 0, { value: 'condo' as PropertyType, label: 'Condo' });
  }

  return baseTypes;
};

export default function CustomerEstimateScreen({ navigation }: Props) {
  const createEstimate = useAppStore((s) => s.createEstimate);
  const locale = useAppStore((s) => s.locale);
  const { showAlert, AlertComponent } = useAlert();

  // Trade selection
  const [selectedTrade, setSelectedTrade] = useState<TradeCategory>('painting-decorating');

  // Mode: 'quick' for package selection, 'detailed' for manual room entry
  const [mode, setMode] = useState<'quick' | 'detailed'>('quick');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const [propertyType, setPropertyType] = useState<PropertyType>('modern');
  const [postcode, setPostcode] = useState('');
  const [rooms, setRooms] = useState<RoomMeasurement[]>([
    { length: 0, width: 0, squareMeters: 0 },
  ]);
  const [extras, setExtras] = useState<EstimateExtras>({
    doors: 0,
    windows: 0,
    skirtingBoardRooms: 0,
    bannister: false,
    windowSills: 0,
    radiators: 0,
  });
  // Get packages for selected trade
  const tradePackages = getPackagesByTrade(selectedTrade);
  const tradeInfo = TRADE_INFO[selectedTrade];
  const tradeDisclaimer = TRADE_DISCLAIMERS[selectedTrade];

  const updateRoom = useCallback((index: number, field: 'length' | 'width', value: string) => {
    const numValue = parseFloat(value) || 0;
    setRooms(prevRooms => {
      const newRooms = [...prevRooms];
      newRooms[index] = { ...newRooms[index], [field]: numValue };
      newRooms[index].squareMeters = calculateSquareMeters(
        newRooms[index].length,
        newRooms[index].width
      );
      return newRooms;
    });
  }, []);

  const addRoom = useCallback(() => {
    if (rooms.length >= 4) {
      showAlert(
        'Maximum Rooms Reached', 
        'Detailed Entry mode supports up to 4 rooms. For larger properties, please use Quick Quote mode or contact us directly.',
        [{ text: 'OK' }],
        'info'
      );
      return;
    }
    setRooms(prev => [...prev, { length: 0, width: 0, squareMeters: 0 }]);
  }, [rooms.length, showAlert]);

  const removeRoom = useCallback((index: number) => {
    if (rooms.length > 1) {
      setRooms(prev => prev.filter((_, i) => i !== index));
    }
  }, [rooms.length]);

  const handleContinue = useCallback(() => {
    // Validation
    if (!postcode.trim()) {
      showAlert('Missing Information', 'Please enter your postcode', [{ text: 'OK' }], 'warning');
      return;
    }

    if (mode === 'quick') {
      // Quick package mode
      if (!selectedPackage) {
        showAlert('Missing Information', 'Please select a property package', [{ text: 'OK' }], 'warning');
        return;
      }

      // Find the selected package
      const pkg = tradePackages.find(p => p.id === selectedPackage);
      if (!pkg) return;

      // Create estimate with package data
      const estimate = createEstimate({
        rooms: [{ length: 1, width: 1, squareMeters: 1 }], // Placeholder for package-based
        propertyType,
        postcode: postcode.trim(),
        extras,
        estimateType: 'flat',
        packageId: selectedPackage, // Store package ID for payment link
        tradeCategory: selectedTrade, // Store trade category for results screen
      });

      // Override with package pricing
      estimate.totalMinPrice = pkg.minEstimate;
      estimate.totalMaxPrice = pkg.maxEstimate;

      Keyboard.dismiss();
      navigation.navigate('PaymentSelection', { estimate });
    } else {
      // Detailed mode - existing logic
      const hasValidRoom = rooms.some((r) => r.length > 0 && r.width > 0);
      if (!hasValidRoom) {
        showAlert('Missing Information', 'Please enter at least one room measurement', [{ text: 'OK' }], 'warning');
        return;
      }

      // Filter out empty rooms
      const validRooms = rooms.filter((r) => r.length > 0 && r.width > 0);

      // Determine estimate type
      let estimateType: 'single-room' | 'flat' | 'house';
      if (validRooms.length === 1) {
        estimateType = 'single-room';
      } else if (['studio', 'bedsit', 'flat'].includes(propertyType)) {
        estimateType = 'flat';
      } else {
        estimateType = 'house';
      }

      // Create estimate
      const estimate = createEstimate({
        rooms: validRooms,
        propertyType,
        postcode: postcode.trim(),
        extras,
        estimateType,
        tradeCategory: selectedTrade, // Store trade category for results screen
      });

      // Dismiss keyboard and navigate
      Keyboard.dismiss();
      navigation.navigate('PaymentSelection', { estimate });
    }
  }, [postcode, rooms, propertyType, extras, createEstimate, navigation, showAlert, mode, selectedPackage, tradePackages]);

  const updateExtra = useCallback((field: keyof EstimateExtras, value: number | boolean) => {
    setExtras(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
        <View className="px-6 py-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-base text-gray-600 mb-3">
              {tradeInfo.description}
            </Text>

            {/* FREE Option Banner */}
            <InfoBanner
              type="success"
              message="Post your job for free! No payment required to connect with professionals"
              onPress={() => navigation.navigate('JobPosting', {})}
              actionText="Post a Job"
            />
          </View>

          {/* Trade Selection */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Select Trade</Text>
            <View className="flex-row flex-wrap -mx-1">
              {(['painting-decorating', 'plastering', 'flooring', 'tiling', 'kitchen-fitting'] as TradeCategory[]).map((trade) => {
                const info = TRADE_INFO[trade];
                return (
                  <Pressable
                    key={trade}
                    onPress={() => {
                      setSelectedTrade(trade);
                      setSelectedPackage(null); // Reset package when trade changes
                    }}
                    className={`m-1 px-4 py-3 rounded-xl ${
                      selectedTrade === trade
                        ? 'bg-blue-600'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        selectedTrade === trade ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {info.icon} {info.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Property Type */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Property Type</Text>
            <ContextualHelp topic="property-type" />
            <View className="flex-row flex-wrap -mx-1">
              {getPropertyTypes(locale).map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => setPropertyType(type.value)}
                  className={`m-1 px-4 py-3 rounded-xl ${
                    propertyType === type.value
                      ? 'bg-blue-600'
                      : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      propertyType === type.value ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Postcode */}
          <Input
            label="Postcode"
            value={postcode}
            onChangeText={setPostcode}
            placeholder="e.g., SW1A 1AA"
            autoCapitalize="characters"
            autoCorrect={false}
            helperText="Prices may vary based on your location"
            required
          />

          {/* Mode Toggle */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Choose Your Method</Text>
            <View className="flex-row space-x-3">
              <Pressable
                onPress={() => setMode('quick')}
                className={`flex-1 py-4 rounded-xl border-2 ${
                  mode === 'quick' ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-200'
                }`}
              >
                <View className="items-center">
                  <Ionicons 
                    name="flash" 
                    size={24} 
                    color={mode === 'quick' ? '#2563eb' : '#9ca3af'} 
                  />
                  <Text className={`font-semibold mt-1 ${mode === 'quick' ? 'text-blue-600' : 'text-gray-600'}`}>
                    Quick Quote
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">Select property type</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setMode('detailed')}
                className={`flex-1 py-4 rounded-xl border-2 ${
                  mode === 'detailed' ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-200'
                }`}
              >
                <View className="items-center">
                  <Ionicons 
                    name="calculator" 
                    size={24} 
                    color={mode === 'detailed' ? '#2563eb' : '#9ca3af'} 
                  />
                  <Text className={`font-semibold mt-1 ${mode === 'detailed' ? 'text-blue-600' : 'text-gray-600'}`}>
                    Detailed Entry
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">Measure each room</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Quick Package Selection */}
          {mode === 'quick' && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Choose Your Project</Text>
              <Text className="text-sm text-gray-600 mb-4">
                Choose the package that best matches your needs
              </Text>

              {tradePackages.map((pkg) => (
                <Pressable
                  key={pkg.id}
                  onPress={() => setSelectedPackage(pkg.id)}
                  className={`mb-3 rounded-xl border-2 ${
                    selectedPackage === pkg.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="p-4">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-base font-bold text-gray-900">{pkg.name}</Text>
                          {pkg.category && (
                            <View className="ml-2">
                              <Badge variant="info" size="sm">{pkg.category.toUpperCase()}</Badge>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm text-gray-600 mt-1">{pkg.description}</Text>
                      </View>
                    </View>

                    {/* Link Fee */}
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-500">Estimate link fee</Text>
                      <Text className="text-base font-semibold text-blue-600">
                        {formatCurrency(pkg.price, locale)}
                      </Text>
                    </View>

                    {selectedPackage === pkg.id && (
                      <View className="mt-2 flex-row items-center">
                        <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                        <Text className="text-blue-600 font-medium ml-2">Selected</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Detailed Room Measurements */}
          {mode === 'detailed' && (
            <>
          {/* Rooms */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-900">Room Measurements</Text>
              <Pressable 
                onPress={addRoom} 
                className="flex-row items-center"
                disabled={rooms.length >= 4}
              >
                <Ionicons 
                  name="add-circle" 
                  size={24} 
                  color={rooms.length >= 4 ? "#9ca3af" : "#2563eb"} 
                />
                <Text className={`ml-1 font-medium ${rooms.length >= 4 ? "text-gray-400" : "text-blue-600"}`}>
                  Add Room {rooms.length >= 4 ? "(Max 4)" : ""}
                </Text>
              </Pressable>
            </View>
            <ContextualHelp topic="room-measurement" />

            {rooms.map((room, index) => (
              <RoomCard
                key={index}
                room={room}
                index={index}
                canRemove={rooms.length > 1}
                onUpdate={updateRoom}
                onRemove={removeRoom}
              />
            ))}
          </View>
            </>
          )}

          {/* Extras - Only show for painting-decorating trade */}
          {selectedTrade === 'painting-decorating' && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Additional Items (Optional)
              </Text>
              <Text className="text-sm text-gray-500 mb-4">
                {"We'll include free woodwork estimates with your purchase"}
              </Text>

              <ExtraInput
                label="Doors (inc. frames)"
                value={extras.doors}
                onChange={(val) => updateExtra('doors', val)}
              />
              <ExtraInput
                label="Windows"
                value={extras.windows}
                onChange={(val) => updateExtra('windows', val)}
              />
              <ExtraInput
                label="Rooms with Skirting Boards"
                value={extras.skirtingBoardRooms}
                onChange={(val) => updateExtra('skirtingBoardRooms', val)}
              />
              <ExtraInput
                label="Window Sills"
                value={extras.windowSills}
                onChange={(val) => updateExtra('windowSills', val)}
              />
              <ExtraInput
                label="Radiators"
                value={extras.radiators}
                onChange={(val) => updateExtra('radiators', val)}
              />

              <Pressable
                onPress={() => updateExtra('bannister', !extras.bannister)}
                className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-4 mb-3"
              >
                <Text className="text-base text-gray-700">Bannister</Text>
                <View
                  className={`w-6 h-6 rounded-md items-center justify-center ${
                    extras.bannister ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  {extras.bannister && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-6 py-4 border-t border-gray-200 bg-white">
        <Button onPress={handleContinue} fullWidth>
          Continue to Payment
        </Button>
      </View>
      </KeyboardAvoidingView>

      <AlertComponent />
    </SafeAreaView>
  );
}

// Room Card Component - uses local string state to allow decimal input
const RoomCard = ({
  room,
  index,
  canRemove,
  onUpdate,
  onRemove,
}: {
  room: RoomMeasurement;
  index: number;
  canRemove: boolean;
  onUpdate: (index: number, field: 'length' | 'width', value: string) => void;
  onRemove: (index: number) => void;
}) => {
  const [lengthText, setLengthText] = useState(room.length > 0 ? room.length.toString() : '');
  const [widthText, setWidthText] = useState(room.width > 0 ? room.width.toString() : '');

  return (
  <Card variant="default" padding="md" className="mb-3">
    <View className="flex-row justify-between items-center mb-3">
      <Text className="text-base font-semibold text-gray-900">
        Room {index + 1}
      </Text>
      <View className="flex-row items-center">
        {canRemove && (
          <Pressable onPress={() => onRemove(index)} className="ml-2">
            <Ionicons name="close-circle" size={24} color="#ef4444" />
          </Pressable>
        )}
      </View>
    </View>

    <View className="flex-row space-x-3">
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Length (meters)
        </Text>
        <TextInput
          value={lengthText}
          onChangeText={(val) => {
            setLengthText(val);
            onUpdate(index, 'length', val);
          }}
          placeholder="0"
          keyboardType="decimal-pad"
          className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-base"
        />
      </View>

      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Width (meters)
        </Text>
        <TextInput
          value={widthText}
          onChangeText={(val) => {
            setWidthText(val);
            onUpdate(index, 'width', val);
          }}
          placeholder="0"
          keyboardType="decimal-pad"
          className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-base"
        />
      </View>
    </View>

    {room.squareMeters > 0 && (
      <View className="mt-3">
        <View className="bg-blue-50 rounded-lg px-3 py-2">
          <Text className="text-blue-700 font-medium text-center">
            {room.squareMeters} square meters
          </Text>
        </View>
      </View>
    )}
  </Card>
  );
};

// Memoized Extra Input Component
const ExtraInput = React.memo<{
  label: string;
  value: number;
  onChange: (value: number) => void;
}>(({ label, value, onChange }) => (
  <View className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-4 mb-3">
    <Text className="text-base text-gray-700 flex-1">{label}</Text>
    <View className="flex-row items-center space-x-3">
      <Pressable
        onPress={() => onChange(Math.max(0, value - 1))}
        className="bg-white rounded-lg p-2"
      >
        <Ionicons name="remove" size={20} color="#374151" />
      </Pressable>
      <Text className="text-base font-semibold text-gray-900 w-8 text-center">{value}</Text>
      <Pressable
        onPress={() => onChange(value + 1)}
        className="bg-white rounded-lg p-2"
      >
        <Ionicons name="add" size={20} color="#374151" />
      </Pressable>
    </View>
  </View>
));
