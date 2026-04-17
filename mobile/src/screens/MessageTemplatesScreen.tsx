import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import { useTheme } from '../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'MessageTemplates'>;

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'introduction' | 'quote' | 'followup' | 'custom';
  isDefault: boolean;
}

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'intro-1',
    name: 'Professional Introduction',
    content: `Hi {{customer_name}},

Thank you for posting your {{job_type}} job on GLOSSY. I'm {{my_name}}, a professional with {{experience}} years of experience.

I'd love to discuss your project and provide a competitive quote. I'm available to visit and assess the work at your convenience.

Please feel free to call me on {{my_phone}} or reply to this message.

Best regards,
{{my_name}}`,
    category: 'introduction',
    isDefault: true,
  },
  {
    id: 'intro-2',
    name: 'Quick Introduction',
    content: `Hi {{customer_name}},

I saw your {{job_type}} job in {{location}}. I'm interested and available to help!

I can visit this week to give you a free quote. When works best for you?

{{my_name}}
{{my_phone}}`,
    category: 'introduction',
    isDefault: true,
  },
  {
    id: 'quote-1',
    name: 'Quote Follow-up',
    content: `Hi {{customer_name}},

Following our conversation, I'm pleased to provide my quote for your {{job_type}} project:

[ADD YOUR QUOTE DETAILS HERE]

This includes all materials and labour. I can start within [TIMEFRAME].

Let me know if you have any questions.

{{my_name}}`,
    category: 'quote',
    isDefault: true,
  },
  {
    id: 'followup-1',
    name: 'Gentle Follow-up',
    content: `Hi {{customer_name}},

I hope you're well. I wanted to follow up on the {{job_type}} quote I sent.

Have you had a chance to consider it? I'm happy to answer any questions or adjust anything if needed.

Looking forward to hearing from you.

{{my_name}}`,
    category: 'followup',
    isDefault: true,
  },
  {
    id: 'followup-2',
    name: 'Availability Check',
    content: `Hi {{customer_name}},

Just checking in about your {{job_type}} project. I have some availability coming up next week if you'd like to proceed.

Let me know if you're still interested and we can arrange a suitable time.

Thanks,
{{my_name}}`,
    category: 'followup',
    isDefault: true,
  },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  introduction: { label: 'Introduction', color: '#3b82f6', icon: 'hand-left' },
  quote: { label: 'Quote', color: '#22c55e', icon: 'document-text' },
  followup: { label: 'Follow-up', color: '#f59e0b', icon: 'refresh' },
  custom: { label: 'Custom', color: '#8b5cf6', icon: 'create' },
};

export default function MessageTemplatesScreen({ navigation }: Props) {
  const currentProfessional = useAppStore((s) => s.currentProfessional);
  const { colors } = useTheme();
  const [templates, setTemplates] = useState<MessageTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const saved = await AsyncStorage.getItem('message_templates');
      if (saved) {
        const custom = JSON.parse(saved) as MessageTemplate[];
        setTemplates([...DEFAULT_TEMPLATES, ...custom]);
      }
    } catch (error) {
      console.log('Error loading templates:', error);
    }
  };

  const saveCustomTemplates = async (customTemplates: MessageTemplate[]) => {
    try {
      await AsyncStorage.setItem('message_templates', JSON.stringify(customTemplates));
    } catch (error) {
      console.log('Error saving templates:', error);
    }
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTemplate(template);
    setIsEditing(false);
  };

  const handleUseTemplate = async (template: MessageTemplate) => {
    if (!currentProfessional) return;

    // Replace placeholders with actual values
    let message = template.content
      .replace(/{{my_name}}/g, currentProfessional.name)
      .replace(/{{my_phone}}/g, currentProfessional.phone || '[Your Phone]')
      .replace(/{{experience}}/g, '5+') // Placeholder
      .replace(/{{customer_name}}/g, '[Customer Name]')
      .replace(/{{job_type}}/g, '[Job Type]')
      .replace(/{{location}}/g, '[Location]');

    try {
      await Share.share({
        message,
        title: template.name,
      });
    } catch (error) {
      // Copy to clipboard fallback would go here
      Alert.alert('Template Ready', 'Your message template is ready to use.');
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsEditing(true);
    setEditName('');
    setEditContent('');
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    if (template.isDefault) {
      // For default templates, create a copy
      setEditName(template.name + ' (Copy)');
      setEditContent(template.content);
    } else {
      setEditName(template.name);
      setEditContent(template.content);
    }
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!editName.trim() || !editContent.trim()) {
      Alert.alert('Error', 'Please enter a name and content for your template.');
      return;
    }

    const customTemplates = templates.filter((t) => !t.isDefault);

    if (selectedTemplate && !selectedTemplate.isDefault) {
      // Update existing custom template
      const updated = customTemplates.map((t) =>
        t.id === selectedTemplate.id
          ? { ...t, name: editName, content: editContent }
          : t
      );
      await saveCustomTemplates(updated);
      setTemplates([...DEFAULT_TEMPLATES, ...updated]);
    } else {
      // Create new template
      const newTemplate: MessageTemplate = {
        id: `custom-${Date.now()}`,
        name: editName,
        content: editContent,
        category: 'custom',
        isDefault: false,
      };
      const updated = [...customTemplates, newTemplate];
      await saveCustomTemplates(updated);
      setTemplates([...DEFAULT_TEMPLATES, ...updated]);
    }

    setIsEditing(false);
    setSelectedTemplate(null);
    Alert.alert('Saved', 'Your template has been saved.');
  };

  const handleDeleteTemplate = (template: MessageTemplate) => {
    if (template.isDefault) return;

    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const customTemplates = templates.filter(
              (t) => !t.isDefault && t.id !== template.id
            );
            await saveCustomTemplates(customTemplates);
            setTemplates([...DEFAULT_TEMPLATES, ...customTemplates]);
            setSelectedTemplate(null);
          },
        },
      ]
    );
  };

  const filteredTemplates = activeCategory
    ? templates.filter((t) => t.category === activeCategory)
    : templates;

  if (!currentProfessional) {
    navigation.replace('ProfessionalAuth');
    return null;
  }

  if (isEditing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={() => setIsEditing(false)}>
              <Text className="text-blue-600 font-medium">Cancel</Text>
            </Pressable>
            <Text style={{ color: colors.text }} className="font-bold text-lg">
              {selectedTemplate?.isDefault === false ? 'Edit Template' : 'New Template'}
            </Text>
            <Pressable onPress={handleSaveTemplate}>
              <Text className="text-blue-600 font-bold">Save</Text>
            </Pressable>
          </View>

          <View className="mb-4">
            <Text style={{ color: colors.textSecondary }} className="text-sm mb-2">
              Template Name
            </Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="e.g., My Introduction"
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              }}
              className="border rounded-xl px-4 py-3"
            />
          </View>

          <View className="mb-4">
            <Text style={{ color: colors.textSecondary }} className="text-sm mb-2">
              Message Content
            </Text>
            <TextInput
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Type your message template..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={12}
              textAlignVertical="top"
              style={{
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
                minHeight: 200,
              }}
              className="border rounded-xl px-4 py-3"
            />
          </View>

          <View
            style={{ backgroundColor: colors.surface }}
            className="rounded-xl p-4"
          >
            <Text style={{ color: colors.text }} className="font-medium mb-2">
              Available Placeholders
            </Text>
            <View className="flex-row flex-wrap">
              {['{{my_name}}', '{{my_phone}}', '{{customer_name}}', '{{job_type}}', '{{location}}'].map((placeholder) => (
                <Pressable
                  key={placeholder}
                  onPress={() => setEditContent((prev) => prev + ' ' + placeholder)}
                  className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <Text className="text-blue-700 text-sm">{placeholder}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedTemplate) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView className="flex-1">
          <View className="px-6 py-4">
            <Pressable
              onPress={() => setSelectedTemplate(null)}
              className="flex-row items-center mb-4"
            >
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
              <Text className="text-blue-600 font-medium ml-1">Back</Text>
            </Pressable>

            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <View
                  className="px-3 py-1 rounded-full mr-2"
                  style={{ backgroundColor: CATEGORY_LABELS[selectedTemplate.category].color + '20' }}
                >
                  <Text style={{ color: CATEGORY_LABELS[selectedTemplate.category].color }} className="text-xs font-bold">
                    {CATEGORY_LABELS[selectedTemplate.category].label}
                  </Text>
                </View>
                {selectedTemplate.isDefault && (
                  <View className="bg-gray-100 px-2 py-1 rounded-full">
                    <Text className="text-gray-500 text-xs">Default</Text>
                  </View>
                )}
              </View>
              <Text style={{ color: colors.text }} className="text-2xl font-bold">
                {selectedTemplate.name}
              </Text>
            </View>

            <View
              style={{ backgroundColor: colors.surface }}
              className="rounded-2xl p-4 mb-4"
            >
              <Text style={{ color: colors.text }} className="leading-6">
                {selectedTemplate.content
                  .replace(/{{my_name}}/g, currentProfessional.name)
                  .replace(/{{my_phone}}/g, currentProfessional.phone || '[Your Phone]')}
              </Text>
            </View>

            <Pressable
              onPress={() => handleUseTemplate(selectedTemplate)}
              className="bg-blue-600 py-4 rounded-xl active:opacity-80 mb-3"
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="share" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  Use This Template
                </Text>
              </View>
            </Pressable>

            <View className="flex-row">
              <Pressable
                onPress={() => handleEditTemplate(selectedTemplate)}
                style={{ backgroundColor: colors.surface }}
                className="flex-1 py-3 rounded-xl mr-2 active:opacity-80"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="create" size={18} color={colors.primary} />
                  <Text style={{ color: colors.primary }} className="font-medium ml-2">
                    {selectedTemplate.isDefault ? 'Copy & Edit' : 'Edit'}
                  </Text>
                </View>
              </Pressable>

              {!selectedTemplate.isDefault && (
                <Pressable
                  onPress={() => handleDeleteTemplate(selectedTemplate)}
                  className="flex-1 py-3 rounded-xl bg-red-50 ml-2 active:opacity-80"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="trash" size={18} color="#ef4444" />
                    <Text className="text-red-500 font-medium ml-2">Delete</Text>
                  </View>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text style={{ color: colors.text }} className="text-2xl font-bold">
            Message Templates
          </Text>
          <Pressable
            onPress={handleCreateTemplate}
            className="bg-blue-600 px-4 py-2 rounded-xl active:opacity-80"
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={18} color="white" />
              <Text className="text-white font-medium ml-1">New</Text>
            </View>
          </Pressable>
        </View>
        <Text style={{ color: colors.textSecondary }} className="text-sm mb-4">
          Quick response templates for customer messages
        </Text>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <Pressable
            onPress={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full mr-2 ${!activeCategory ? 'bg-blue-600' : ''}`}
            style={activeCategory ? { backgroundColor: colors.surface } : {}}
          >
            <Text className={!activeCategory ? 'text-white font-medium' : ''} style={activeCategory ? { color: colors.text } : {}}>
              All
            </Text>
          </Pressable>
          {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
            <Pressable
              key={key}
              onPress={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded-full mr-2 flex-row items-center ${activeCategory === key ? 'bg-blue-600' : ''}`}
              style={activeCategory !== key ? { backgroundColor: colors.surface } : {}}
            >
              <Ionicons
                name={value.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={activeCategory === key ? 'white' : value.color}
              />
              <Text
                className={`ml-1 ${activeCategory === key ? 'text-white font-medium' : ''}`}
                style={activeCategory !== key ? { color: colors.text } : {}}
              >
                {value.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-6">
        {filteredTemplates.map((template) => (
          <Pressable
            key={template.id}
            onPress={() => handleSelectTemplate(template)}
            style={{ backgroundColor: colors.surface }}
            className="rounded-xl p-4 mb-3 active:opacity-80"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-3">
                <View className="flex-row items-center mb-2">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: CATEGORY_LABELS[template.category].color + '20' }}
                  >
                    <Ionicons
                      name={CATEGORY_LABELS[template.category].icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={CATEGORY_LABELS[template.category].color}
                    />
                  </View>
                  <Text style={{ color: colors.text }} className="font-semibold flex-1">
                    {template.name}
                  </Text>
                </View>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-sm"
                  numberOfLines={2}
                >
                  {template.content.substring(0, 100)}...
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
