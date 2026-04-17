import { RoomPricing, CreditPackage, PostcodeZone } from '../types/glossy';

// NEW PACKAGE-BASED PRICING STRUCTURE (£2 per estimate)
export const ESTIMATE_PACKAGES = [
  { 
    id: 'single-room',
    name: 'Room',
    description: 'Single room - ceilings and walls',
    price: 2,
    minPrice: null, // Will be calculated based on room size
    maxPrice: null,
    rooms: 1,
    hasStairs: false,
  },
  { 
    id: 'studio-flat',
    name: 'Studio Flat',
    description: 'Studio flat - ceilings and walls',
    price: 4,
    minPrice: 700,
    maxPrice: 1200,
    rooms: 1,
    hasStairs: false,
  },
  { 
    id: '1bed-flat-single-level',
    name: '1 Bedroom Flat (Single Level)',
    description: 'Reception, bedroom, bathroom, hallway, kitchen, toilet - ceilings and walls',
    price: 6,
    minPrice: 800,
    maxPrice: 1300,
    rooms: null, // Multiple rooms
    hasStairs: false,
  },
  { 
    id: '2bed-flat-single-level',
    name: '2 Bedroom Flat (Single Level)',
    description: 'All rooms - ceilings and walls',
    price: 8,
    minPrice: 900,
    maxPrice: 1400,
    rooms: null,
    hasStairs: false,
  },
  { 
    id: '3bed-single-level',
    name: '3 Bedroom Flat/House (Single Level)',
    description: 'All rooms - ceilings and walls',
    price: 10,
    minPrice: 1000,
    maxPrice: 1500,
    rooms: null,
    hasStairs: false,
  },
  { 
    id: '1bed-with-stairs',
    name: '1 Bedroom Flat/House (With Stairs)',
    description: 'All rooms - ceilings and walls (may have tall walls)',
    price: 12,
    minPrice: 1200,
    maxPrice: 1700,
    rooms: null,
    hasStairs: true,
  },
  { 
    id: '2bed-with-stairs',
    name: '2 Bedroom Flat/House (With Stairs)',
    description: 'All rooms - ceilings and walls (may have tall walls)',
    price: 14,
    minPrice: 1400,
    maxPrice: 1900,
    rooms: null,
    hasStairs: true,
  },
  { 
    id: '3bed-with-stairs',
    name: '3 Bedroom Flat/House (With Stairs)',
    description: 'All rooms - ceilings and walls (may have tall walls)',
    price: 16,
    minPrice: 1600,
    maxPrice: 2100,
    rooms: null,
    hasStairs: true,
  },
  { 
    id: '4bed-with-stairs',
    name: '4 Bedroom Flat/House (With Stairs)',
    description: 'All rooms - ceilings and walls (may have tall walls)',
    price: 18,
    minPrice: 1800,
    maxPrice: 2300,
    rooms: null,
    hasStairs: true,
  },
  { 
    id: '5bed-with-stairs',
    name: '5 Bedroom House (With Stairs)',
    description: 'All rooms - ceilings and walls (may have tall walls)',
    price: 20,
    minPrice: 2000,
    maxPrice: 2500,
    rooms: null,
    hasStairs: true,
  },
  { 
    id: 'exterior-1-side',
    name: 'Exterior Walls (1 Side)',
    description: '1 side of house exterior walls',
    price: 8,
    minPrice: 600,
    maxPrice: 1000,
    rooms: null,
    hasStairs: false,
    isExterior: true,
  },
];

// LEGACY: Old square-meter based pricing (kept for backward compatibility)
export const ROOM_PRICING_DATA: RoomPricing[] = [
  { squareMeters: 6, minPrice: 250, maxPrice: 400 },
  { squareMeters: 8, minPrice: 280, maxPrice: 430 },
  { squareMeters: 9, minPrice: 300, maxPrice: 450 },
  { squareMeters: 12, minPrice: 350, maxPrice: 500 },
  { squareMeters: 15, minPrice: 400, maxPrice: 550 },
  { squareMeters: 16, minPrice: 420, maxPrice: 570 },
  { squareMeters: 18, minPrice: 450, maxPrice: 600 },
  { squareMeters: 20, minPrice: 480, maxPrice: 630 },
  { squareMeters: 21, minPrice: 500, maxPrice: 650 },
  { squareMeters: 24, minPrice: 550, maxPrice: 700 },
  { squareMeters: 25, minPrice: 520, maxPrice: 770 },
  { squareMeters: 27, minPrice: 600, maxPrice: 750 },
  { squareMeters: 28, minPrice: 620, maxPrice: 870 },
  { squareMeters: 30, minPrice: 650, maxPrice: 800 },
  { squareMeters: 32, minPrice: 670, maxPrice: 820 },
  { squareMeters: 35, minPrice: 680, maxPrice: 830 },
  { squareMeters: 36, minPrice: 700, maxPrice: 850 },
  { squareMeters: 40, minPrice: 740, maxPrice: 890 },
  { squareMeters: 44, minPrice: 760, maxPrice: 910 },
  { squareMeters: 45, minPrice: 780, maxPrice: 930 },
  { squareMeters: 48, minPrice: 800, maxPrice: 950 },
  { squareMeters: 50, minPrice: 820, maxPrice: 970 },
];

// Woodwork pricing (free with estimate)
export const WOODWORK_PRICING = {
  doorFrame: { min: 35, max: 70 },
  window: { min: 40, max: 70 },
  skirtingBoards: { min: 40, max: 80 }, // per room
};

// NEW Estimate pricing tiers
export const ESTIMATE_PRICING = {
  singleRoom: 2, // UPDATED from £5 to £2
  flat: 4, // studio
  house: 10, // 3+ bed with stairs
};

// Credit packages for professionals - DEPRECATED - Use CREDIT_PACKAGES from ../config/trades-pricing.ts
// export const CREDIT_PACKAGES: CreditPackage[] = [
//   ...
// ];

// Premium membership pricing
export const PREMIUM_MEMBERSHIP_MONTHLY = 30; // £30/month

// Lead cost in credits
export const LEAD_COST_CREDITS = 6;

// Postcode zone multipliers (can be expanded)
export const POSTCODE_ZONES: PostcodeZone[] = [
  // Central London (Zone 1)
  { zone: 'EC', multiplier: 1.3, description: 'Central London - Zone 1' },
  { zone: 'WC', multiplier: 1.3, description: 'West Central London - Zone 1' },
  { zone: 'E14', multiplier: 1.25, description: 'Canary Wharf' },
  { zone: 'SW1', multiplier: 1.3, description: 'Westminster' },
  { zone: 'W1', multiplier: 1.3, description: 'West End' },
  
  // Affluent areas
  { zone: 'SW3', multiplier: 1.25, description: 'Chelsea' },
  { zone: 'SW7', multiplier: 1.25, description: 'South Kensington' },
  { zone: 'W8', multiplier: 1.25, description: 'Kensington' },
  { zone: 'W11', multiplier: 1.2, description: 'Notting Hill' },
  { zone: 'NW1', multiplier: 1.2, description: 'Camden/Regent\'s Park' },
  { zone: 'NW3', multiplier: 1.2, description: 'Hampstead' },
  { zone: 'NW8', multiplier: 1.2, description: 'St John\'s Wood' },
  
  // ULEZ/Congestion Zone
  { zone: 'N1', multiplier: 1.15, description: 'Islington' },
  { zone: 'SE1', multiplier: 1.15, description: 'Southwark' },
  { zone: 'E1', multiplier: 1.15, description: 'Whitechapel' },
  
  // Standard areas (default)
  { zone: 'DEFAULT', multiplier: 1.0, description: 'Standard pricing' },
];

// Property type height multipliers
export const PROPERTY_HEIGHT_MULTIPLIERS = {
  georgian: 1.25, // Higher ceilings
  victorian: 1.15, // Slightly higher ceilings
  modern: 1.0,
  flat: 1.0,
  studio: 1.0,
  bedsit: 1.0,
  bungalow: 1.0,
  house: 1.1, // Slightly higher than flats
  condo: 1.0,
};

// Disclaimer text
export const DISCLAIMER_TEXT =
  "This estimate is based on the assumption that ceiling and walls are in good condition without multiple holes or cracks. If ceiling/walls have holes or cracks, additional preparation will be required which will take more time and incur additional cost. This is a guide price only and actual costs may vary.";

// Maximum professionals per lead
export const MAX_PROFESSIONALS_PER_LEAD = 4;
