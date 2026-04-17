import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { cn } from '../../utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required,
  className,
  ...props
}) => {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <Text className="text-red-600"> *</Text>}
        </Text>
      )}
      <TextInput
        className={cn(
          'bg-gray-50 border rounded-xl px-4 py-3 text-base text-gray-900',
          error ? 'border-red-500' : 'border-gray-200',
          className
        )}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && (
        <Text className="text-red-600 text-sm mt-1">{error}</Text>
      )}
      {helperText && !error && (
        <Text className="text-gray-500 text-sm mt-1">{helperText}</Text>
      )}
    </View>
  );
};
