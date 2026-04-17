/**
 * Internationalization (i18n) Configuration
 * Supports: UK (GBP), EU (EUR), US (USD), and other regions
 *
 * PRICING RESEARCH (January 2025):
 * - UK: Base pricing (£9-25/m² painting, £15-30/m² plastering)
 * - US: 2.0-2.5x UK prices due to higher labor costs
 * - France: ~1.15x UK prices (€15-45/m² painting)
 * - Germany/Spain/NL: ~0.85x UK prices (€7-15/m² painting)
 * - Italy/Poland/Portugal: ~0.75x UK prices (lower labor costs)
 */

export type SupportedLocale = 'en-GB' | 'en-US' | 'en-CA' | 'en-AU' | 'de-DE' | 'fr-FR' | 'es-ES' | 'it-IT' | 'nl-NL' | 'pl-PL' | 'pt-PT';
export type SupportedCurrency = 'GBP' | 'EUR' | 'USD' | 'CAD' | 'AUD';

export interface LocaleConfig {
  locale: SupportedLocale;
  currency: SupportedCurrency;
  currencySymbol: string;
  language: string;
  region: string;
  exchangeRate: number; // Currency exchange rate relative to GBP
  marketMultiplier: number; // Trade pricing multiplier based on local market rates
}

// Currency exchange rates (relative to GBP = 1.00)
// Note: These should be updated from a live API in production
export const EXCHANGE_RATES = {
  GBP: 1.00,     // British Pound (base)
  EUR: 1.17,     // Euro
  USD: 1.27,     // US Dollar
  CAD: 1.74,     // Canadian Dollar
  AUD: 1.95,     // Australian Dollar
};

/**
 * Regional market multipliers for trade pricing
 * These reflect ACTUAL market price differences, not just currency exchange
 * Based on research from HomeAdvisor, Checkatrade, Angi, and local sources (Jan 2025)
 *
 * CALCULATION METHOD:
 * We compare actual local prices to UK base prices, then divide by exchange rate
 * to get the pure market multiplier (labor cost difference).
 *
 * Example: UK 1-bed flat painting £900-£2,200 (avg £1,550)
 * - US: $1,500-$3,500 (avg $2,500) → $2,500 / 1.27 = £1,969 → 1,969/1,550 = 1.27x market
 * - Canada: $1,800-$4,000 CAD (avg $2,900) → $2,900 / 1.74 = £1,667 → 1,667/1,550 = 1.08x market
 * - Australia: $2,500-$5,500 AUD (avg $4,000) → $4,000 / 1.95 = £2,051 → 2,051/1,550 = 1.32x market
 */
export const MARKET_MULTIPLIERS = {
  // UK is the base (1.0x)
  UK: 1.0,

  // US: Labor costs higher than UK
  // Sources: HomeAdvisor, Angi - US painting $1,500-$3,500 for 1-bed flat
  US: 1.27,

  // Canada: Similar to UK after exchange
  // Sources: HomeStars - CAD $1,800-$4,000 for 1-bed flat
  CANADA: 1.08,

  // Australia: Higher labor costs
  // Sources: hipages, ServiceSeeking - AUD $2,500-$5,500 for 1-bed flat
  AUSTRALIA: 1.32,

  // France: Higher than UK average
  // Sources: MonsieurPeinture, HabitatPresto - €1,200-€3,000 for 1-bed flat
  FRANCE: 1.15,

  // Germany, Spain, Netherlands: Slightly lower than UK
  // Sources: Zoofy, local guides - €7-15/m² vs UK £9-25/m²
  GERMANY: 0.85,
  SPAIN: 0.80,
  NETHERLANDS: 0.85,

  // Italy, Poland, Portugal: Lower labor costs
  // Estimated based on regional EU data
  ITALY: 0.80,
  POLAND: 0.65,
  PORTUGAL: 0.70,
};

// Supported locales configuration
export const LOCALES: Record<SupportedLocale, LocaleConfig> = {
  'en-GB': {
    locale: 'en-GB',
    currency: 'GBP',
    currencySymbol: '£',
    language: 'English',
    region: 'United Kingdom',
    exchangeRate: EXCHANGE_RATES.GBP,
    marketMultiplier: MARKET_MULTIPLIERS.UK,
  },
  'en-US': {
    locale: 'en-US',
    currency: 'USD',
    currencySymbol: '$',
    language: 'English',
    region: 'United States',
    exchangeRate: EXCHANGE_RATES.USD,
    marketMultiplier: MARKET_MULTIPLIERS.US,
  },
  'en-CA': {
    locale: 'en-CA',
    currency: 'CAD',
    currencySymbol: '$',
    language: 'English',
    region: 'Canada',
    exchangeRate: EXCHANGE_RATES.CAD,
    marketMultiplier: MARKET_MULTIPLIERS.CANADA,
  },
  'en-AU': {
    locale: 'en-AU',
    currency: 'AUD',
    currencySymbol: '$',
    language: 'English',
    region: 'Australia',
    exchangeRate: EXCHANGE_RATES.AUD,
    marketMultiplier: MARKET_MULTIPLIERS.AUSTRALIA,
  },
  'de-DE': {
    locale: 'de-DE',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Deutsch',
    region: 'Deutschland',
    exchangeRate: EXCHANGE_RATES.EUR,
    marketMultiplier: MARKET_MULTIPLIERS.GERMANY,
  },
  'fr-FR': {
    locale: 'fr-FR',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Français',
    region: 'France',
    exchangeRate: EXCHANGE_RATES.EUR,
    marketMultiplier: MARKET_MULTIPLIERS.FRANCE,
  },
  'es-ES': {
    locale: 'es-ES',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Español',
    region: 'España',
    exchangeRate: EXCHANGE_RATES.EUR,
    marketMultiplier: MARKET_MULTIPLIERS.SPAIN,
  },
  'it-IT': {
    locale: 'it-IT',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Italiano',
    region: 'Italia',
    exchangeRate: EXCHANGE_RATES.EUR,
    marketMultiplier: MARKET_MULTIPLIERS.ITALY,
  },
  'nl-NL': {
    locale: 'nl-NL',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Nederlands',
    region: 'Nederland',
    exchangeRate: EXCHANGE_RATES.EUR,
    marketMultiplier: MARKET_MULTIPLIERS.NETHERLANDS,
  },
  'pl-PL': {
    locale: 'pl-PL',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Polski',
    region: 'Polska',
    exchangeRate: EXCHANGE_RATES.EUR,
    marketMultiplier: MARKET_MULTIPLIERS.POLAND,
  },
  'pt-PT': {
    locale: 'pt-PT',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Português',
    region: 'Portugal',
    exchangeRate: EXCHANGE_RATES.EUR,
    marketMultiplier: MARKET_MULTIPLIERS.PORTUGAL,
  },
};

// Default locale (UK)
export const DEFAULT_LOCALE: SupportedLocale = 'en-GB';

/**
 * Get locale configuration
 */
export function getLocaleConfig(locale?: SupportedLocale): LocaleConfig {
  return LOCALES[locale || DEFAULT_LOCALE] || LOCALES[DEFAULT_LOCALE];
}

/**
 * Convert price from GBP to target currency
 * This applies BOTH the market multiplier (regional pricing difference)
 * AND the currency exchange rate
 *
 * Example: UK £1000 estimate
 * - In US: £1000 × 2.2 (market) × 1.27 (USD) = $2,794
 * - In Germany: £1000 × 0.85 (market) × 1.17 (EUR) = €994
 * - In France: £1000 × 1.15 (market) × 1.17 (EUR) = €1,346
 */
export function convertPrice(
  priceGBP: number,
  targetLocale: SupportedLocale = DEFAULT_LOCALE
): number {
  const config = getLocaleConfig(targetLocale);
  // Apply market multiplier first (adjusts for local trade pricing)
  // Then apply exchange rate (converts to local currency)
  return Math.round(priceGBP * config.marketMultiplier * config.exchangeRate);
}

/**
 * Format currency with proper locale formatting
 */
export function formatCurrency(
  amount: number,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  const config = getLocaleConfig(locale);
  
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback if Intl.NumberFormat fails
    return `${config.currencySymbol}${amount.toLocaleString(config.locale)}`;
  }
}

/**
 * Format price range with proper locale
 */
export function formatPriceRange(
  minGBP: number,
  maxGBP: number,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  const minConverted = convertPrice(minGBP, locale);
  const maxConverted = convertPrice(maxGBP, locale);
  
  return `${formatCurrency(minConverted, locale)} - ${formatCurrency(maxConverted, locale)}`;
}

/**
 * Detect user locale from device settings
 * Note: In production, use expo-localization for better detection
 */
export function detectUserLocale(): SupportedLocale {
  try {
    // Try to get device locale
    const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    
    // Try exact match
    if (deviceLocale in LOCALES) {
      return deviceLocale as SupportedLocale;
    }
    
    // Try language match (e.g., 'en-AU' -> 'en-GB')
    const language = deviceLocale.split('-')[0];
    const matchingLocale = Object.keys(LOCALES).find(
      (key) => key.startsWith(language)
    ) as SupportedLocale;
    
    if (matchingLocale) {
      return matchingLocale;
    }
    
    // Default to UK
    return DEFAULT_LOCALE;
  } catch (error) {
    return DEFAULT_LOCALE;
  }
}

/**
 * Get currency symbol for locale
 */
export function getCurrencySymbol(locale: SupportedLocale = DEFAULT_LOCALE): string {
  return getLocaleConfig(locale).currencySymbol;
}

/**
 * Get currency code for locale
 */
export function getCurrencyCode(locale: SupportedLocale = DEFAULT_LOCALE): SupportedCurrency {
  return getLocaleConfig(locale).currency;
}

/**
 * Get market multiplier for locale
 * This reflects how trade prices in this region compare to UK base prices
 */
export function getMarketMultiplier(locale: SupportedLocale = DEFAULT_LOCALE): number {
  return getLocaleConfig(locale).marketMultiplier;
}

/**
 * Get a human-readable explanation of pricing for the locale
 */
export function getPricingContext(locale: SupportedLocale = DEFAULT_LOCALE): string {
  const config = getLocaleConfig(locale);
  const multiplier = config.marketMultiplier;

  if (multiplier > 1.5) {
    return 'Prices reflect higher labor costs in your region';
  } else if (multiplier > 1.1) {
    return 'Prices are slightly higher than average for your region';
  } else if (multiplier < 0.8) {
    return 'Prices reflect lower labor costs in your region';
  }
  return 'Prices are typical for your region';
}
