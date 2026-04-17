import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';
import { cn } from '../../utils/cn';

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600';
      case 'secondary':
        return 'bg-gray-200';
      case 'success':
        return 'bg-green-600';
      case 'danger':
        return 'bg-red-600';
      case 'outline':
        return 'bg-transparent border-2 border-blue-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-2 px-4';
      case 'md':
        return 'py-3 px-6';
      case 'lg':
        return 'py-4 px-8';
      default:
        return 'py-3 px-6';
    }
  };

  const getTextColor = () => {
    if (variant === 'secondary') return 'text-gray-800';
    if (variant === 'outline') return 'text-blue-600';
    return 'text-white';
  };

  return (
    <Pressable
      className={cn(
        'rounded-xl active:opacity-80 flex-row items-center justify-center',
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          color={variant === 'secondary' ? '#374151' : '#ffffff'}
          size="small"
          style={{ marginRight: 8 }}
        />
      )}
      {typeof children === 'string' ? (
        <Text className={cn('font-semibold text-base', getTextColor())}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};
