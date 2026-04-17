import { TradeInfo, CreditPackage, TradeCategory } from '../types/glossy';

/**
 * Trade Categories Configuration
 */
export const TRADE_CATEGORIES: TradeInfo[] = [
  {
    id: 'painting-decorating',
    name: 'Painting & Decorating',
    icon: 'brush',
    hasEstimator: true,
    comingSoon: false,
  },
  {
    id: 'plastering',
    name: 'Plastering',
    icon: 'hammer',
    hasEstimator: true,
    comingSoon: false,
  },
  {
    id: 'flooring',
    name: 'Flooring',
    icon: 'grid',
    hasEstimator: true,
    comingSoon: false,
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: 'water',
    hasEstimator: false,
    comingSoon: true,
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: 'flash',
    hasEstimator: false,
    comingSoon: true,
  },
  {
    id: 'tiling',
    name: 'Tiling',
    icon: 'grid',
    hasEstimator: false,
    comingSoon: true,
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    icon: 'hammer',
    hasEstimator: false,
    comingSoon: true,
  },
  {
    id: 'kitchen-fitting',
    name: 'Kitchen Fitting',
    icon: 'restaurant',
    hasEstimator: false,
    comingSoon: true,
  },
  {
    id: 'bathroom-fitting',
    name: 'Bathroom Fitting',
    icon: 'home',
    hasEstimator: false,
    comingSoon: true,
  },
  {
    id: 'handyman',
    name: 'Handyman',
    icon: 'construct',
    hasEstimator: false,
    comingSoon: true,
  },
];

/**
 * Get trade info by ID
 */
export function getTradeInfo(id: TradeCategory): TradeInfo | undefined {
  return TRADE_CATEGORIES.find(trade => trade.id === id);
}

/**
 * Get trade name by ID
 */
export function getTradeName(id: TradeCategory): string {
  return getTradeInfo(id)?.name || 'Unknown Trade';
}

/**
 * Lead Cost Configuration
 */
export const LEAD_COST_STANDARD = 6; // Credits per lead for standard members
export const LEAD_COST_PREMIUM = 4;  // Credits per lead for premium members
export const LEAD_DISCOUNT_PREMIUM = 33; // 33% discount for premium members

/**
 * Premium Membership Pricing
 */
export const PREMIUM_PRICING = {
  monthly: {
    price: 49,
    currency: 'GBP',
    interval: 'month',
    savings: 0,
  },
  annual: {
    price: 490,
    currency: 'GBP',
    interval: 'year',
    savings: 98, // £49 * 12 = £588 - £490 = £98 saved
    pricePerMonth: 40.83,
  },
};

/**
 * Credit Packages (Updated Pricing Structure)
 * Matches App Store product pricing
 */
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'trial',
    name: 'Trial Pack',
    price: 15,
    credits: 12,
    pricePerCredit: 1.25,
    estimatedLeads: 2,
    estimatedLeadsPremium: 3,
    savings: '-',
    isPremiumOnly: false,
    featured: false,
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    price: 35,
    credits: 28,
    pricePerCredit: 1.25,
    estimatedLeads: 4.67,
    estimatedLeadsPremium: 7,
    savings: '17% off',
    isPremiumOnly: false,
    featured: false,
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    price: 50,
    credits: 46,
    pricePerCredit: 1.09,
    estimatedLeads: 7.67,
    estimatedLeadsPremium: 11.5,
    savings: '27% off',
    isPremiumOnly: false,
    featured: true,
  },
  {
    id: 'business',
    name: 'Business Pack',
    price: 99,
    credits: 100,
    pricePerCredit: 0.99,
    estimatedLeads: 16.67,
    estimatedLeadsPremium: 25,
    savings: '34% off',
    isPremiumOnly: false,
    featured: false,
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    price: 169,
    credits: 200,
    pricePerCredit: 0.85,
    estimatedLeads: 33.33,
    estimatedLeadsPremium: 50,
    savings: '43% off',
    isPremiumOnly: false,
    featured: false,
  },
  {
    id: 'premium-pro',
    name: 'Premium Pro Pack',
    price: 229,
    credits: 290,
    pricePerCredit: 0.79,
    estimatedLeads: 48.33,
    estimatedLeadsPremium: 72.5,
    savings: '47% off',
    isPremiumOnly: true,
    featured: true,
  },
];

/**
 * Get credit package by ID
 */
export function getCreditPackage(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === id);
}

/**
 * Get available packages for member tier
 * Returns all packages, but marks premium-only ones
 */
export function getAvailablePackages(isPremium: boolean): CreditPackage[] {
  // Show all packages to everyone, the UI will handle isPremiumOnly display
  return CREDIT_PACKAGES;
}

/**
 * Calculate cost per lead for a package
 */
export function getCostPerLead(packageId: string, isPremium: boolean): number {
  const pkg = getCreditPackage(packageId);
  if (!pkg) return 0;
  
  const leadCost = isPremium ? LEAD_COST_PREMIUM : LEAD_COST_STANDARD;
  return pkg.pricePerCredit * leadCost;
}

/**
 * Premium Membership Benefits
 */
export const PREMIUM_BENEFITS = [
  {
    category: 'Cost Savings',
    benefits: [
      '33% cheaper leads (4 credits vs 6 credits)',
      'Exclusive Premium Pro Pack (150 credits at best rate)',
      'Average savings: £344-412 per year',
    ],
  },
  {
    category: 'Visibility & Priority',
    benefits: [
      'Premium Pro badge on profile',
      'Top 3 priority placement in search results',
      'Featured profile with highlighted border',
      '2x visibility in customer searches',
    ],
  },
  {
    category: 'Contact & Communication',
    benefits: [
      'Phone number displayed on profile',
      'Email visible to customers',
      'Website link allowed',
      'Direct message button for customers',
    ],
  },
  {
    category: 'Enhanced Profile',
    benefits: [
      'Video introduction option',
      'Unlimited portfolio photos/videos',
      'Custom profile banner',
      'Professional verification badge',
    ],
  },
  {
    category: 'Business Tools',
    benefits: [
      'Detailed analytics dashboard',
      'Lead conversion tracking',
      'Performance metrics',
      'Monthly business reports',
    ],
  },
  {
    category: 'Support',
    benefits: [
      'Priority customer support (24h response)',
      'Early access to new features',
      'Exclusive business webinars',
      'Dedicated account manager (annual)',
    ],
  },
];

/**
 * Calculate Premium ROI
 */
export function calculatePremiumROI(leadsPerMonth: number): {
  monthlyCost: number;
  standardCost: number;
  premiumCost: number;
  monthlySavings: number;
  annualSavings: number;
  breaksEvenAt: number;
} {
  const premiumSubscription = PREMIUM_PRICING.monthly.price;
  const averageCreditCost = 1.80; // Average across packages
  
  // Standard member costs
  const standardLeadCost = LEAD_COST_STANDARD * averageCreditCost; // £10.80 per lead
  const standardMonthlyCost = leadsPerMonth * standardLeadCost;
  
  // Premium member costs
  const premiumLeadCost = LEAD_COST_PREMIUM * averageCreditCost; // £7.20 per lead
  const premiumMonthlyCost = (leadsPerMonth * premiumLeadCost) + premiumSubscription;
  
  const monthlySavings = standardMonthlyCost - premiumMonthlyCost;
  const annualSavings = (monthlySavings * 12) + PREMIUM_PRICING.annual.savings;
  
  // Break-even: when subscription cost equals savings from reduced lead cost
  const savingsPerLead = standardLeadCost - premiumLeadCost; // £3.60 per lead
  const breaksEvenAt = Math.ceil(premiumSubscription / savingsPerLead); // ~14 leads
  
  return {
    monthlyCost: premiumSubscription,
    standardCost: standardMonthlyCost,
    premiumCost: premiumMonthlyCost,
    monthlySavings,
    annualSavings,
    breaksEvenAt,
  };
}

/**
 * App description and branding
 */
export const APP_DESCRIPTION = {
  tagline: 'Find trusted tradespeople for any job',
  shortDescription: 'Get instant pricing estimates and connect with verified professionals',
  longDescription: 'GLOSSY is your all-in-one platform for home improvement projects. Get instant painting estimates, post jobs for any trade, and connect with verified professionals. Starting with painting & decorating, with more trades coming soon!',
  forCustomers: 'Get free estimates and connect with up to 4 verified tradespeople',
  forProfessionals: 'Grow your business with quality leads and premium tools',
};

/**
 * Feature flags
 */
export const FEATURES = {
  paintingEstimator: true,
  plasteringEstimator: false,
  plumbingEstimator: false,
  electricalEstimator: false,
  tilingEstimator: false,
  premiumMembership: true,
  inAppMessaging: false,
  videoProfiles: false,
};
