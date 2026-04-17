import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { PortfolioItem } from '../../types/glossy';

interface PortfolioManagerProps {
  items: PortfolioItem[];
  onAddItem: (item: PortfolioItem) => void;
  onRemoveItem: (itemId: string) => void;
  title?: string;
  emptyMessage?: string;
}

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 64) / 3; // 3 columns with padding

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  title = 'Portfolio',
  emptyMessage = 'No items yet. Add photos or videos of your work.',
}) => {
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<{
    uri: string;
    type: 'photo' | 'video';
  } | null>(null);
  const [caption, setCaption] = useState('');

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload media.'
      );
      return false;
    }
    return true;
  };

  const handlePickMedia = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mediaType = asset.type === 'video' ? 'video' : 'photo';

        setPendingMedia({
          uri: asset.uri,
          type: mediaType,
        });
        setShowCaptionInput(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    }
  };

  const handleSaveItem = () => {
    if (!pendingMedia) return;

    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      uri: pendingMedia.uri,
      type: pendingMedia.type,
      caption: caption.trim() || undefined,
      uploadedAt: new Date().toISOString(),
    };

    onAddItem(newItem);
    
    // Reset state
    setPendingMedia(null);
    setCaption('');
    setShowCaptionInput(false);
  };

  const handleCancelUpload = () => {
    setPendingMedia(null);
    setCaption('');
    setShowCaptionInput(false);
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your portfolio?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemoveItem(itemId),
        },
      ]
    );
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-900">{title}</Text>
        <Pressable
          onPress={handlePickMedia}
          className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center active:opacity-70"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-semibold ml-1">Add</Text>
        </Pressable>
      </View>

      {/* Caption Input Modal */}
      {showCaptionInput && pendingMedia && (
        <View className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">Add Caption</Text>
            <Pressable onPress={handleCancelUpload}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          {/* Preview */}
          <View className="mb-3 items-center">
            {pendingMedia.type === 'photo' ? (
              <Image
                source={{ uri: pendingMedia.uri }}
                style={{ width: 200, height: 200, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : (
              <Video
                source={{ uri: pendingMedia.uri }}
                style={{ width: 200, height: 200, borderRadius: 8 }}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
                isLooping
              />
            )}
          </View>

          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Add a description (optional)"
            className="bg-gray-50 px-4 py-3 rounded-lg text-gray-900 mb-3"
            multiline
            maxLength={200}
          />

          <Pressable
            onPress={handleSaveItem}
            className="bg-blue-600 py-3 rounded-lg active:opacity-70"
          >
            <Text className="text-white text-center font-semibold">
              Add to Portfolio
            </Text>
          </Pressable>
        </View>
      )}

      {/* Portfolio Grid */}
      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <Ionicons name="images-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 text-center mt-4 px-8">
            {emptyMessage}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap">
            {items.map((item, index) => (
              <View
                key={item.id}
                style={{
                  width: ITEM_SIZE,
                  height: ITEM_SIZE,
                  marginRight: index % 3 === 2 ? 0 : 8,
                  marginBottom: 8,
                }}
              >
                <Pressable
                  className="relative"
                  onLongPress={() => handleRemoveItem(item.id)}
                >
                  {item.type === 'photo' ? (
                    <Image
                      source={{ uri: item.uri }}
                      style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <>
                      <Video
                        source={{ uri: item.uri }}
                        style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        isLooping
                      />
                      <View className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                        <Ionicons name="play" size={16} color="white" />
                      </View>
                    </>
                  )}

                  {/* Remove button */}
                  <Pressable
                    onPress={() => handleRemoveItem(item.id)}
                    className="absolute top-2 left-2 bg-red-500 rounded-full p-1 active:opacity-70"
                  >
                    <Ionicons name="trash" size={14} color="white" />
                  </Pressable>
                </Pressable>

                {/* Caption */}
                {item.caption && (
                  <Text
                    className="text-xs text-gray-600 mt-1"
                    numberOfLines={2}
                  >
                    {item.caption}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};
