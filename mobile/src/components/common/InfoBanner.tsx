import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InfoBannerProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onPress?: () => void;
  actionText?: string;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({ type, title, message, onPress, actionText }) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'checkmark-circle' as const,
          iconColor: '#22c55e',
          textColor: 'text-green-800',
          actionColor: '#16a34a',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'warning' as const,
          iconColor: '#f59e0b',
          textColor: 'text-yellow-800',
          actionColor: '#d97706',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'close-circle' as const,
          iconColor: '#ef4444',
          textColor: 'text-red-800',
          actionColor: '#dc2626',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'information-circle' as const,
          iconColor: '#2563eb',
          textColor: 'text-blue-800',
          actionColor: '#2563eb',
        };
    }
  };

  const styles = getStyles();

  const content = (
    <View className={`${styles.bg} border ${styles.border} rounded-xl p-4 flex-row items-start`}>
      <Ionicons name={styles.icon} size={24} color={styles.iconColor} />
      <View className="flex-1 ml-3">
        {title && (
          <Text className={`font-semibold ${styles.textColor} mb-1`}>{title}</Text>
        )}
        <Text className={`${styles.textColor} text-sm leading-5`}>{message}</Text>
        {onPress && actionText && (
          <Text style={{ color: styles.actionColor }} className="font-semibold text-sm mt-2">
            {actionText} →
          </Text>
        )}
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={styles.iconColor} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {content}
      </Pressable>
    );
  }

  return content;
};
