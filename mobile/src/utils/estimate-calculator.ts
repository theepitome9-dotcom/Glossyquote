import {
  RoomPricing,
  EstimateRequest,
  PropertyType,
} from '../types/glossy';
import {
  ROOM_PRICING_DATA,
  POSTCODE_ZONES,
  PROPERTY_HEIGHT_MULTIPLIERS,
} from './pricing-data';
import {
  SupportedLocale,
  formatCurrency as formatCurrencyI18n,
  formatPriceRange as formatPriceRangeI18n,
  convertPrice,
  DEFAULT_LOCALE,
} from '../config/i18n';

/**
 * Calculate square meters from length and width
 */
export function calculateSquareMeters(length: number, width: number): number {
  return Math.round(length * width);
}

/**
 * Find the nearest pricing tier for a given square meter value
 */
export function findNearestPricing(squareMeters: number): RoomPricing {
  // Sort by square meters
  const sorted = [...ROOM_PRICING_DATA].sort((a, b) => a.squareMeters - b.squareMeters);
  
  // Find the closest match
  let closest = sorted[0];
  let minDiff = Math.abs(squareMeters - closest.squareMeters);
  
  for (const pricing of sorted) {
    const diff = Math.abs(squareMeters - pricing.squareMeters);
    if (diff < minDiff) {
      minDiff = diff;
      closest = pricing;
    }
  }
  
  return closest;
}

/**
 * Get postcode multiplier based on postcode
 */
export function getPostcodeMultiplier(postcode: string): number {
  const cleanPostcode = postcode.toUpperCase().replace(/\s/g, '');
  
  // Check for exact matches first (e.g., E14)
  for (const zone of POSTCODE_ZONES) {
    if (zone.zone !== 'DEFAULT' && cleanPostcode.startsWith(zone.zone)) {
      return zone.multiplier;
    }
  }
  
  // Return default multiplier
  return 1.0;
}

/**
 * Get property height multiplier
 */
export function getPropertyMultiplier(propertyType: PropertyType): number {
  return PROPERTY_HEIGHT_MULTIPLIERS[propertyType] || 1.0;
}

/**
 * Calculate total estimate for all rooms
 */
export function calculateEstimate(request: EstimateRequest): {
  minPrice: number;
  maxPrice: number;
  postcodeMultiplier: number;
  propertyMultiplier: number;
} {
  let totalMin = 0;
  let totalMax = 0;
  
  // Calculate base price for all rooms
  for (const room of request.rooms) {
    const pricing = findNearestPricing(room.squareMeters);
    totalMin += pricing.minPrice;
    totalMax += pricing.maxPrice;
  }
  
  // Apply property type multiplier (for ceiling height)
  const propertyMultiplier = getPropertyMultiplier(request.propertyType);
  totalMin *= propertyMultiplier;
  totalMax *= propertyMultiplier;
  
  // Apply postcode multiplier
  const postcodeMultiplier = getPostcodeMultiplier(request.postcode);
  totalMin *= postcodeMultiplier;
  totalMax *= postcodeMultiplier;
  
  // Round to nearest £10
  totalMin = Math.round(totalMin / 10) * 10;
  totalMax = Math.round(totalMax / 10) * 10;
  
  return {
    minPrice: totalMin,
    maxPrice: totalMax,
    postcodeMultiplier,
    propertyMultiplier,
  };
}

/**
 * Single unified price for all estimates - £2.99
 * Simplified pricing model: one price fits all
 */
export const ESTIMATE_PRICE = 2.99;

/**
 * Determine estimate pricing - simplified to single £2.99 price for all estimates
 */
export function getEstimatePriceTier(request: EstimateRequest): {
  price: number;
  type: 'single-room' | 'flat' | 'house';
} {
  // Determine type for display purposes only
  const roomCount = request.rooms?.length || 1;
  let type: 'single-room' | 'flat' | 'house' = 'flat';

  if (roomCount === 1) {
    type = 'single-room';
  } else if (roomCount <= 3) {
    type = 'flat';
  } else {
    type = 'house';
  }

  // Single unified price for all estimates
  return { price: ESTIMATE_PRICE, type };
}

/**
 * Format currency with i18n support
 * @param amount Amount in GBP (base currency)
 * @param locale Target locale for conversion and formatting
 */
export function formatCurrency(amount: number, locale: SupportedLocale = DEFAULT_LOCALE): string {
  const convertedAmount = convertPrice(amount, locale);
  return formatCurrencyI18n(convertedAmount, locale);
}

/**
 * Format price range with i18n support
 * @param min Minimum price in GBP (base currency)
 * @param max Maximum price in GBP (base currency)
 * @param locale Target locale for conversion and formatting
 */
export function formatPriceRange(min: number, max: number, locale: SupportedLocale = DEFAULT_LOCALE): string {
  return formatPriceRangeI18n(min, max, locale);
}
