import React from 'react';
import { Text } from 'react-native';
import { formatPriceRange } from '../../utils/estimate-calculator';

interface PriceDisplayProps {
  minPrice: number;
  maxPrice: number;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  minPrice,
  maxPrice,
  className = '',
}) => {
  return (
    <Text className={className}>
      {formatPriceRange(minPrice, maxPrice)}
    </Text>
  );
};
