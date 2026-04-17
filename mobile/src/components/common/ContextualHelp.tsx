import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface HelpTip {
  title: string;
  content: string;
  tips?: string[];
}

interface ContextualHelpProps {
  topic: 'room-measurement' | 'property-type' | 'postcode' | 'extras' | 'credits' | 'leads' | 'pricing';
}

const HELP_CONTENT: Record<string, HelpTip> = {
  'room-measurement': {
    title: 'How to Measure Your Rooms',
    content: 'Accurate measurements ensure better estimates. Here is how to measure:',
    tips: [
      'Measure length and width in meters (not feet)',
      'Measure floor to ceiling for standard rooms',
      'Round to nearest 0.5m for accuracy',
      'Measure each room separately',
      'Don\'t include built-in furniture',
    ],
  },
  'property-type': {
    title: 'Choosing Property Type',
    content: 'Property type affects ceiling height and complexity:',
    tips: [
      'Georgian: Very high ceilings (3.5m+), ornate features',
      'Victorian: High ceilings (3m), decorative moldings',
      'Modern: Standard ceilings (2.4m), simple finish',
      'Flat/Studio: Typically modern standard height',
    ],
  },
  'postcode': {
    title: 'Why Postcode Matters',
    content: 'Location affects pricing due to:',
    tips: [
      'Travel costs for professionals',
      'Cost of living in area',
      'Central London: +30% pricing',
      'Affluent areas: +20-25% pricing',
      'Standard areas: Base pricing',
    ],
  },
  'extras': {
    title: 'Additional Items',
    content: 'Woodwork painting adds value to your project:',
    tips: [
      'Doors & Frames: £35-70 each',
      'Windows: £40-70 each',
      'Skirting Boards: £40-80 per room',
      'All woodwork estimates included FREE',
      'Optional but adds to total project value',
    ],
  },
  'credits': {
    title: 'How Credits Work',
    content: 'Credits are used to purchase customer leads:',
    tips: [
      'Each lead costs 6 credits',
      'Credits never expire',
      'Bulk packages save money',
      'Average job value: £500-£2,000',
      'Typical ROI: 50-200x investment',
    ],
  },
  'leads': {
    title: 'Lead Quality & Value',
    content: 'GLOSSY leads are pre-qualified and high quality:',
    tips: [
      'Customers provide detailed measurements',
      'Price range already calculated',
      'Ready to quote - no time wasted',
      'Max 4 professionals per lead',
      'Contact details revealed after purchase',
    ],
  },
  'pricing': {
    title: 'Understanding Pricing',
    content: 'Our pricing is based on multiple factors:',
    tips: [
      'Room size (square meters)',
      'Property type (ceiling height)',
      'Location (postcode zone)',
      'Prices rounded to nearest £10',
      'Includes 2 coats ceiling & walls',
    ],
  },
};

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ topic }) => {
  const [showModal, setShowModal] = useState(false);
  const help = HELP_CONTENT[topic];

  if (!help) return null;

  return (
    <>
      <Pressable
        onPress={() => setShowModal(true)}
        className="flex-row items-center bg-blue-50 rounded-lg px-3 py-2 mb-3"
      >
        <Ionicons name="help-circle" size={20} color="#2563eb" />
        <Text className="text-blue-600 text-sm ml-2 flex-1">
          Need help with this?
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#2563eb" />
      </Pressable>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[80%]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <View className="flex-row items-center">
                <View className="bg-blue-100 rounded-full p-2 mr-3">
                  <Ionicons name="help-circle" size={24} color="#2563eb" />
                </View>
                <Text className="text-xl font-bold text-gray-900">{help.title}</Text>
              </View>
              <Pressable onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={28} color="#6b7280" />
              </Pressable>
            </View>

            {/* Content */}
            <View className="px-6 py-6">
              <Text className="text-gray-700 text-base mb-4 leading-6">
                {help.content}
              </Text>

              {help.tips && (
                <Card variant="default" padding="md" className="bg-blue-50">
                  {help.tips.map((tip, index) => (
                    <View key={index} className="flex-row items-start mb-3">
                      <View className="bg-blue-600 rounded-full w-6 h-6 items-center justify-center mr-3 mt-0.5">
                        <Text className="text-white text-xs font-bold">{index + 1}</Text>
                      </View>
                      <Text className="text-gray-700 flex-1 leading-5">{tip}</Text>
                    </View>
                  ))}
                </Card>
              )}

              <View className="mt-6">
                <Button onPress={() => setShowModal(false)} variant="primary" fullWidth>
                  Got it, thanks!
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
