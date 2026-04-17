import { TradeCategory } from '../types/glossy';

// Unified estimate price - £2.99 for all estimates
export const UNIFIED_ESTIMATE_PRICE = 2.99;

// Trade Package Interface
export interface TradePackage {
  id: string;
  tradeCategory: TradeCategory;
  name: string;
  description: string;
  price: number; // Payment link cost in GBP - now unified at £2.99
  minEstimate: number; // Min job estimate in GBP
  maxEstimate: number; // Max job estimate in GBP
  category?: 'skimming' | 'dry-lining' | 'board-and-skim' | 'laminate' | 'floor-tiles' | 'wall-tiles' | 'full-tiling' | 'budget' | 'mid-range' | 'premium'; // Sub-category
}

// ============================================
// PAINTING & DECORATING PACKAGES
// ============================================
export const PAINTING_PACKAGES: TradePackage[] = [
  {
    id: 'painting-single-room',
    tradeCategory: 'painting-decorating',
    name: 'Room',
    description: 'Single room - ceilings and walls',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 250,
    maxEstimate: 450,
  },
  {
    id: 'painting-studio-flat',
    tradeCategory: 'painting-decorating',
    name: 'Studio Flat',
    description: 'Studio flat - ceilings and walls',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 700,
    maxEstimate: 1200,
  },
  {
    id: 'painting-1bed-flat-single-level',
    tradeCategory: 'painting-decorating',
    name: '1 Bedroom Flat (Single Level)',
    description: 'Reception, bedroom, bathroom, hallway, kitchen, toilet - ceilings and walls',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 800,
    maxEstimate: 1300,
  },
  {
    id: 'painting-2bed-flat-single-level',
    tradeCategory: 'painting-decorating',
    name: '2 Bedroom Flat (Single Level)',
    description: 'All rooms - ceilings and walls',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 900,
    maxEstimate: 1400,
  },
  {
    id: 'painting-3bed-single-level',
    tradeCategory: 'painting-decorating',
    name: '3 Bedroom Flat/House (Single Level)',
    description: 'All rooms - ceilings and walls',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 1000,
    maxEstimate: 1500,
  },
  {
    id: 'painting-1bed-with-stairs',
    tradeCategory: 'painting-decorating',
    name: '1 Bedroom Flat/House (With Stairs)',
    description: 'All rooms - ceilings and walls (may have tall walls)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 1200,
    maxEstimate: 1700,
  },
  {
    id: 'painting-2bed-with-stairs',
    tradeCategory: 'painting-decorating',
    name: '2 Bedroom Flat/House (With Stairs)',
    description: 'All rooms - ceilings and walls (may have tall walls)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 1400,
    maxEstimate: 1900,
  },
  {
    id: 'painting-3bed-with-stairs',
    tradeCategory: 'painting-decorating',
    name: '3 Bedroom Flat/House (With Stairs)',
    description: 'All rooms - ceilings and walls (may have tall walls)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 1600,
    maxEstimate: 2100,
  },
  {
    id: 'painting-4bed-with-stairs',
    tradeCategory: 'painting-decorating',
    name: '4 Bedroom Flat/House (With Stairs)',
    description: 'All rooms - ceilings and walls (may have tall walls)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 1800,
    maxEstimate: 2300,
  },
  {
    id: 'painting-5bed-with-stairs',
    tradeCategory: 'painting-decorating',
    name: '5 Bedroom House (With Stairs)',
    description: 'All rooms - ceilings and walls (may have tall walls)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 2000,
    maxEstimate: 2500,
  },
  {
    id: 'painting-exterior-1-side',
    tradeCategory: 'painting-decorating',
    name: 'Exterior Walls (1 Side)',
    description: '1 side of house exterior walls',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 600,
    maxEstimate: 1000,
  },
];

// ============================================
// PLASTERING PACKAGES
// ============================================

// SKIMMING
export const PLASTERING_SKIMMING_PACKAGES: TradePackage[] = [
  {
    id: 'plastering-small-repair',
    tradeCategory: 'plastering',
    name: 'Small Plaster Repair',
    description: 'Small plaster repair',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 80,
    maxEstimate: 150,
    category: 'skimming',
  },
  {
    id: 'plastering-skim-1-wall',
    tradeCategory: 'plastering',
    name: 'Skimming 1 Wall',
    description: 'Skimming 1 wall',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 150,
    maxEstimate: 300,
    category: 'skimming',
  },
  {
    id: 'plastering-skim-small-ceiling',
    tradeCategory: 'plastering',
    name: 'Skimming Small Ceiling',
    description: 'Skimming 1 small ceiling',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 300,
    maxEstimate: 600,
    category: 'skimming',
  },
  {
    id: 'plastering-skim-medium-ceiling',
    tradeCategory: 'plastering',
    name: 'Skimming Medium Ceiling',
    description: 'Skimming medium ceiling',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 500,
    maxEstimate: 800,
    category: 'skimming',
  },
  {
    id: 'plastering-skim-large-ceiling',
    tradeCategory: 'plastering',
    name: 'Skimming Large Ceiling',
    description: 'Skimming large ceiling',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 700,
    maxEstimate: 1000,
    category: 'skimming',
  },
  {
    id: 'plastering-skim-small-room',
    tradeCategory: 'plastering',
    name: 'Skimming Small Room',
    description: 'Skimming small room - ceiling and walls',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 600,
    maxEstimate: 900,
    category: 'skimming',
  },
  {
    id: 'plastering-skim-medium-room',
    tradeCategory: 'plastering',
    name: 'Skimming Medium Room',
    description: 'Skimming medium room - ceiling and walls',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 700,
    maxEstimate: 1100,
    category: 'skimming',
  },
  {
    id: 'plastering-skim-large-room',
    tradeCategory: 'plastering',
    name: 'Skimming Large Room',
    description: 'Skimming large room - ceiling and walls',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 800,
    maxEstimate: 1300,
    category: 'skimming',
  },
];

// DRY LINING (BOARD ONLY)
export const PLASTERING_DRYLINING_PACKAGES: TradePackage[] = [
  {
    id: 'plastering-board-small-ceiling',
    tradeCategory: 'plastering',
    name: 'Fit Plasterboard to Small Ceiling',
    description: 'Fit plasterboard to small ceiling (board only)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 200,
    maxEstimate: 350,
    category: 'dry-lining',
  },
  {
    id: 'plastering-board-medium-ceiling',
    tradeCategory: 'plastering',
    name: 'Fit Plasterboard to Medium Ceiling',
    description: 'Fit plasterboard to medium ceiling (board only)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 300,
    maxEstimate: 450,
    category: 'dry-lining',
  },
  {
    id: 'plastering-board-large-ceiling',
    tradeCategory: 'plastering',
    name: 'Fit Plasterboard to Large Ceiling',
    description: 'Fit plasterboard to large ceiling (board only)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 400,
    maxEstimate: 550,
    category: 'dry-lining',
  },
];

// BOARD AND SKIM
export const PLASTERING_BOARD_AND_SKIM_PACKAGES: TradePackage[] = [
  {
    id: 'plastering-board-skim-small-ceiling',
    tradeCategory: 'plastering',
    name: 'Board Small Ceiling and Skim',
    description: 'Board small ceiling and skim',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 400,
    maxEstimate: 550,
    category: 'board-and-skim',
  },
  {
    id: 'plastering-board-skim-medium-ceiling',
    tradeCategory: 'plastering',
    name: 'Board Medium Ceiling and Skim',
    description: 'Board medium ceiling and skim',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 500,
    maxEstimate: 650,
    category: 'board-and-skim',
  },
  {
    id: 'plastering-board-skim-large-ceiling',
    tradeCategory: 'plastering',
    name: 'Board Large Ceiling and Skim',
    description: 'Board large ceiling and skim',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 600,
    maxEstimate: 750,
    category: 'board-and-skim',
  },
  {
    id: 'plastering-board-skim-small-room',
    tradeCategory: 'plastering',
    name: 'Board Small Room and Skim',
    description: 'Board small room and skim - ceiling and walls',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 800,
    maxEstimate: 1200,
    category: 'board-and-skim',
  },
  {
    id: 'plastering-board-skim-medium-room',
    tradeCategory: 'plastering',
    name: 'Board Medium Room and Skim',
    description: 'Board medium room and skim - ceiling and walls',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 900,
    maxEstimate: 1300,
    category: 'board-and-skim',
  },
  {
    id: 'plastering-board-skim-large-room',
    tradeCategory: 'plastering',
    name: 'Board Large Room and Skim',
    description: 'Board large room and skim - ceiling and walls',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 1000,
    maxEstimate: 1400,
    category: 'board-and-skim',
  },
];

// All plastering packages combined
export const PLASTERING_PACKAGES: TradePackage[] = [
  ...PLASTERING_SKIMMING_PACKAGES,
  ...PLASTERING_DRYLINING_PACKAGES,
  ...PLASTERING_BOARD_AND_SKIM_PACKAGES,
];

// ============================================
// FLOORING PACKAGES
// ============================================
export const FLOORING_PACKAGES: TradePackage[] = [
  {
    id: 'flooring-laminate-small-room',
    tradeCategory: 'flooring',
    name: 'Fit Laminate to Small Room',
    description: 'Fit laminate flooring/underlay/trim to small room',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 300,
    maxEstimate: 500,
    category: 'laminate',
  },
  {
    id: 'flooring-laminate-medium-room',
    tradeCategory: 'flooring',
    name: 'Fit Laminate to Medium Room',
    description: 'Fit laminate flooring/underlay/trim to medium room',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 400,
    maxEstimate: 600,
    category: 'laminate',
  },
  {
    id: 'flooring-laminate-large-room',
    tradeCategory: 'flooring',
    name: 'Fit Laminate to Large Room',
    description: 'Fit laminate flooring/underlay/trim to large room',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 500,
    maxEstimate: 700,
    category: 'laminate',
  },
];

// ============================================
// TILING PACKAGES (UK Prices)
// ============================================
export const TILING_PACKAGES: TradePackage[] = [
  // Floor Tiling
  {
    id: 'tiling-floor-small-bathroom',
    tradeCategory: 'tiling',
    name: 'Small Bathroom Floor',
    description: 'Floor tiling for small bathroom (up to 4m²)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 200,
    maxEstimate: 400,
    category: 'floor-tiles',
  },
  {
    id: 'tiling-floor-medium-bathroom',
    tradeCategory: 'tiling',
    name: 'Medium Bathroom Floor',
    description: 'Floor tiling for medium bathroom (4-8m²)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 350,
    maxEstimate: 600,
    category: 'floor-tiles',
  },
  {
    id: 'tiling-floor-large-bathroom',
    tradeCategory: 'tiling',
    name: 'Large Bathroom Floor',
    description: 'Floor tiling for large bathroom (8-15m²)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 500,
    maxEstimate: 900,
    category: 'floor-tiles',
  },
  {
    id: 'tiling-floor-kitchen',
    tradeCategory: 'tiling',
    name: 'Kitchen Floor',
    description: 'Floor tiling for kitchen (up to 15m²)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 600,
    maxEstimate: 1100,
    category: 'floor-tiles',
  },
  // Wall Tiling
  {
    id: 'tiling-wall-splashback',
    tradeCategory: 'tiling',
    name: 'Kitchen Splashback',
    description: 'Wall tiling behind hob/sink (up to 2m²)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 150,
    maxEstimate: 300,
    category: 'wall-tiles',
  },
  {
    id: 'tiling-wall-small-bathroom',
    tradeCategory: 'tiling',
    name: 'Small Bathroom Walls',
    description: 'Wall tiling for small bathroom/shower area',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 400,
    maxEstimate: 700,
    category: 'wall-tiles',
  },
  {
    id: 'tiling-wall-medium-bathroom',
    tradeCategory: 'tiling',
    name: 'Medium Bathroom Walls',
    description: 'Wall tiling for medium bathroom (half-height or full)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 600,
    maxEstimate: 1000,
    category: 'wall-tiles',
  },
  {
    id: 'tiling-wall-large-bathroom',
    tradeCategory: 'tiling',
    name: 'Large Bathroom Walls',
    description: 'Full wall tiling for large bathroom',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 900,
    maxEstimate: 1500,
    category: 'wall-tiles',
  },
  // Full Bathroom Tiling
  {
    id: 'tiling-full-small-bathroom',
    tradeCategory: 'tiling',
    name: 'Small Bathroom Complete',
    description: 'Full floor and wall tiling for small bathroom',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 800,
    maxEstimate: 1400,
    category: 'full-tiling',
  },
  {
    id: 'tiling-full-medium-bathroom',
    tradeCategory: 'tiling',
    name: 'Medium Bathroom Complete',
    description: 'Full floor and wall tiling for medium bathroom',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 1200,
    maxEstimate: 2000,
    category: 'full-tiling',
  },
  {
    id: 'tiling-full-large-bathroom',
    tradeCategory: 'tiling',
    name: 'Large Bathroom Complete',
    description: 'Full floor and wall tiling for large bathroom',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 1800,
    maxEstimate: 3000,
    category: 'full-tiling',
  },
];

// ============================================
// KITCHEN FITTING PACKAGES (UK Prices)
// Labour only - customer supplies kitchen units
// ============================================
export const KITCHEN_FITTING_PACKAGES: TradePackage[] = [
  // Budget Range (Basic Flat-Pack Kitchens)
  {
    id: 'kitchen-small-budget',
    tradeCategory: 'kitchen-fitting',
    name: 'Small Kitchen (Budget)',
    description: 'Fitting 5-8 units, basic flat-pack kitchen',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 800,
    maxEstimate: 1200,
    category: 'budget',
  },
  {
    id: 'kitchen-medium-budget',
    tradeCategory: 'kitchen-fitting',
    name: 'Medium Kitchen (Budget)',
    description: 'Fitting 8-12 units, basic flat-pack kitchen',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 1200,
    maxEstimate: 1800,
    category: 'budget',
  },
  {
    id: 'kitchen-large-budget',
    tradeCategory: 'kitchen-fitting',
    name: 'Large Kitchen (Budget)',
    description: 'Fitting 12-16 units, basic flat-pack kitchen',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 1800,
    maxEstimate: 2500,
    category: 'budget',
  },
  // Mid-Range (Quality Flat-Pack or Basic Rigid)
  {
    id: 'kitchen-small-midrange',
    tradeCategory: 'kitchen-fitting',
    name: 'Small Kitchen (Mid-Range)',
    description: 'Fitting 5-8 units with worktop templating',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 1200,
    maxEstimate: 1800,
    category: 'mid-range',
  },
  {
    id: 'kitchen-medium-midrange',
    tradeCategory: 'kitchen-fitting',
    name: 'Medium Kitchen (Mid-Range)',
    description: 'Fitting 8-12 units with worktop templating',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 1800,
    maxEstimate: 2800,
    category: 'mid-range',
  },
  {
    id: 'kitchen-large-midrange',
    tradeCategory: 'kitchen-fitting',
    name: 'Large Kitchen (Mid-Range)',
    description: 'Fitting 12-16 units with worktop templating',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 2800,
    maxEstimate: 4000,
    category: 'mid-range',
  },
  // Premium (Rigid Kitchens, Complex Installs)
  {
    id: 'kitchen-small-premium',
    tradeCategory: 'kitchen-fitting',
    name: 'Small Kitchen (Premium)',
    description: 'Fitting 5-8 rigid units, stone worktops, integrated appliances',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 2000,
    maxEstimate: 3000,
    category: 'premium',
  },
  {
    id: 'kitchen-medium-premium',
    tradeCategory: 'kitchen-fitting',
    name: 'Medium Kitchen (Premium)',
    description: 'Fitting 8-12 rigid units, stone worktops, integrated appliances',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 3000,
    maxEstimate: 4500,
    category: 'premium',
  },
  {
    id: 'kitchen-large-premium',
    tradeCategory: 'kitchen-fitting',
    name: 'Large Kitchen (Premium)',
    description: 'Fitting 12-16+ rigid units, stone worktops, integrated appliances',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 4500,
    maxEstimate: 7000,
    category: 'premium',
  },
  // Individual Services
  {
    id: 'kitchen-worktop-laminate',
    tradeCategory: 'kitchen-fitting',
    name: 'Worktop Installation (Laminate)',
    description: 'Cut and fit laminate worktops only',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 200,
    maxEstimate: 400,
    category: 'budget',
  },
  {
    id: 'kitchen-worktop-solid',
    tradeCategory: 'kitchen-fitting',
    name: 'Worktop Installation (Solid Surface)',
    description: 'Template and fit stone/composite worktops',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 400,
    maxEstimate: 800,
    category: 'premium',
  },
  {
    id: 'kitchen-appliance-install',
    tradeCategory: 'kitchen-fitting',
    name: 'Appliance Installation',
    description: 'Install integrated appliances (hob, oven, dishwasher)',
    price: UNIFIED_ESTIMATE_PRICE,
    minEstimate: 150,
    maxEstimate: 350,
    category: 'mid-range',
  },
];

// ============================================
// ALL PACKAGES COMBINED
// ============================================
export const ALL_TRADE_PACKAGES: TradePackage[] = [
  ...PAINTING_PACKAGES,
  ...PLASTERING_PACKAGES,
  ...FLOORING_PACKAGES,
  ...TILING_PACKAGES,
  ...KITCHEN_FITTING_PACKAGES,
];

// Helper function to get packages by trade
export function getPackagesByTrade(tradeCategory: TradeCategory): TradePackage[] {
  return ALL_TRADE_PACKAGES.filter(pkg => pkg.tradeCategory === tradeCategory);
}

// Helper function to get package by ID
export function getPackageById(packageId: string): TradePackage | undefined {
  return ALL_TRADE_PACKAGES.find(pkg => pkg.id === packageId);
}

// Trade display info
export const TRADE_INFO: Record<TradeCategory, { name: string; icon: string; description: string; hasEstimator: boolean }> = {
  'painting-decorating': {
    name: 'Painting & Decorating',
    icon: '🎨',
    description: 'Professional painting estimates for your property',
    hasEstimator: true,
  },
  'plastering': {
    name: 'Plastering',
    icon: '🏗️',
    description: 'Skimming, dry lining, and boarding services',
    hasEstimator: true,
  },
  'flooring': {
    name: 'Flooring',
    icon: '🪵',
    description: 'Laminate flooring fitting with underlay and trim',
    hasEstimator: true,
  },
  'tiling': {
    name: 'Tiling',
    icon: '🔲',
    description: 'Floor and wall tiling for bathrooms and kitchens',
    hasEstimator: true,
  },
  'kitchen-fitting': {
    name: 'Kitchen Fitting',
    icon: '🍳',
    description: 'Professional kitchen unit installation',
    hasEstimator: true,
  },
  'plumbing': {
    name: 'Plumbing',
    icon: '🔧',
    description: 'Coming soon',
    hasEstimator: false,
  },
  'electrical': {
    name: 'Electrical',
    icon: '⚡',
    description: 'Coming soon',
    hasEstimator: false,
  },
  'carpentry': {
    name: 'Carpentry',
    icon: '🪚',
    description: 'Coming soon',
    hasEstimator: false,
  },
  'bathroom-fitting': {
    name: 'Bathroom Fitting',
    icon: '🚿',
    description: 'Coming soon',
    hasEstimator: false,
  },
  'handyman': {
    name: 'Handyman',
    icon: '🔨',
    description: 'Coming soon',
    hasEstimator: false,
  },
};

// Disclaimers by trade
export const TRADE_DISCLAIMERS: Record<TradeCategory, string> = {
  'painting-decorating': 'This estimate is based on the assumption that ceiling and walls are in good condition without multiple holes or cracks. If ceiling/walls have holes or cracks, additional preparation will be required which will take more time and incur additional cost. This is a guide price only and actual costs may vary.',
  'plastering': 'Plastering is a skilled trade that takes time to master. Plasterers normally want their minimum day rate even for small jobs, however you can negotiate/have a polite discussion. These estimates are based on the assumption the room is square/rectangle shape. This is a guide price only and actual costs may vary.',
  'flooring': 'These estimates are for fitting laminate flooring and underlay to floor. Removing old flooring will incur further cost. This is a guide price only and actual costs may vary.',
  'tiling': 'These estimates are for labour only and assume surfaces are prepared and ready for tiling. Tiles, adhesive, grout, and other materials are not included. Complex patterns, large format tiles, or intricate cuts may incur additional cost. This is a guide price only and actual costs may vary.',
  'kitchen-fitting': 'These estimates are for labour only - fitting kitchen units supplied by the customer. Plumbing, electrical, and gas work are not included and must be carried out by qualified tradespeople. Removal of old kitchen may incur additional cost. This is a guide price only and actual costs may vary.',
  'plumbing': 'Coming soon',
  'electrical': 'Coming soon',
  'carpentry': 'Coming soon',
  'bathroom-fitting': 'Coming soon',
  'handyman': 'Coming soon',
};
