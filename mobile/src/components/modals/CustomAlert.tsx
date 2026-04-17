import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onClose: () => void;
  type?: 'info' | 'success' | 'error' | 'warning';
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons,
  onClose,
  type = 'info',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: '#22c55e' };
      case 'error':
        return { name: 'close-circle' as const, color: '#ef4444' };
      case 'warning':
        return { name: 'warning' as const, color: '#f59e0b' };
      default:
        return { name: 'information-circle' as const, color: '#2563eb' };
    }
  };

  const icon = getIcon();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          {/* Icon */}
          <View className="items-center mb-4">
            <View className="bg-gray-100 rounded-full p-3">
              <Ionicons name={icon.name} size={32} color={icon.color} />
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-gray-600 mb-6 text-center leading-5">
            {message}
          </Text>

          {/* Buttons */}
          <View className={buttons.length === 1 ? '' : 'flex-row space-x-3'}>
            {buttons.map((button, index) => (
              <Pressable
                key={index}
                className={`py-3 rounded-xl active:opacity-80 ${
                  buttons.length === 1 ? 'mb-2' : 'flex-1'
                } ${
                  button.style === 'cancel'
                    ? 'bg-gray-200'
                    : button.style === 'destructive'
                    ? 'bg-red-600'
                    : 'bg-blue-600'
                }`}
                onPress={() => {
                  button.onPress?.();
                  onClose();
                }}
              >
                <Text
                  className={`text-center font-semibold ${
                    button.style === 'cancel' ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Hook for easier usage
export const useAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
    type?: 'info' | 'success' | 'error' | 'warning';
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    type: 'info',
  });

  const showAlert = (
    title: string,
    message: string,
    buttons: AlertButton[] = [{ text: 'OK' }],
    type: 'info' | 'success' | 'error' | 'warning' = 'info'
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons,
      type,
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const AlertComponent = () => (
    <CustomAlert {...alertConfig} onClose={hideAlert} />
  );

  return { showAlert, hideAlert, AlertComponent };
};
