export type PropertyType = 'georgian' | 'victorian' | 'modern' | 'flat' | 'studio' | 'bedsit' | 'bungalow' | 'house' | 'condo';

export type HouseType = 'house' | 'flat' | 'studio' | 'bedsit';

export type TradeCategory =
  | 'painting-decorating'
  | 'plastering'
  | 'flooring'
  | 'plumbing'
  | 'electrical'
  | 'tiling'
  | 'carpentry'
  | 'kitchen-fitting'
  | 'bathroom-fitting'
  | 'handyman';

export interface TradeInfo {
  id: TradeCategory;
  name: string;
  icon: string;
  hasEstimator: boolean;
  comingSoon?: boolean;
}

export type MembershipTier = 'free' | 'premium';

export interface Subscription {
  tier: MembershipTier;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
}

export interface RoomMeasurement {
  length: number;
  width: number;
  squareMeters: number;
}

export interface RoomPricing {
  squareMeters: number;
  minPrice: number;
  maxPrice: number;
}

export interface WoodworkPricing {
  doorFrame: { min: number; max: number };
  window: { min: number; max: number };
  skirtingBoards: { min: number; max: number };
}

export interface EstimateExtras {
  doors: number;
  windows: number;
  skirtingBoardRooms: number;
  bannister: boolean;
  windowSills: number;
  radiators: number;
}

export interface EstimateRequest {
  rooms: RoomMeasurement[];
  propertyType: PropertyType;
  postcode: string;
  extras: EstimateExtras;
  estimateType: 'single-room' | 'flat' | 'house'; // For pricing tier
  packageId?: string; // Optional: for quick quote packages
  tradeCategory?: TradeCategory; // Trade type for the estimate
}

export interface Estimate {
  id: string;
  request: EstimateRequest;
  totalMinPrice: number;
  totalMaxPrice: number;
  woodworkPricing: WoodworkPricing;
  postcodeMultiplier: number;
  paid: boolean;
  createdAt: string;
}

export interface JobListing {
  id: string;
  customerId: string;
  customerName: string;
  // customerEmail and customerPhone are NOT stored here.
  // They are stored in the purchasedLeadContacts map in the store,
  // keyed by `${jobId}:${professionalId}`, and only populated after purchase.
  tradeCategory: TradeCategory;
  estimate?: Estimate; // Optional - only for painting jobs
  description: string;
  images?: string[];
  postcode: string;
  postedAt: string;
  interestedProfessionals: string[]; // Professional IDs who purchased this lead
  maxProfessionals: 4;
}

// Contact details unlocked after lead purchase - stored separately from JobListing
export interface PurchasedLeadContact {
  customerEmail: string | null;
  customerPhone: string;
  purchasedAt: string; // ISO timestamp
}

// Used only when posting a job (customer side) — includes contact info for storage
export interface JobListingWithContact extends JobListing {
  customerEmail: string;
  customerPhone: string;
}

export interface PortfolioItem {
  id: string;
  uri: string;
  type: 'photo' | 'video';
  caption?: string;
  uploadedAt: string;
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileDescription: string;
  profileImages: string[];
  portfolio: PortfolioItem[]; // Portfolio of previous work
  tradeCategories: TradeCategory[]; // Multiple trade specialties
  credits: number;
  isPremium: boolean;
  subscription?: Subscription;
  premiumSince?: string;
  rating: number; // Average rating
  totalReviews: number;
  reviews: Review[];
  referralCode: string; // Unique referral code
  referrals: Referral[]; // Referrals made by this professional
  referralEarnings: number; // Total earned from referrals
  createdAt: string;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  professionalId: string;
  jobId?: string;
  rating: number; // 1-5
  comment: string;
  images?: string[]; // Photos of completed work
  professionalResponse?: string;
  responseDate?: string;
  verified: boolean; // True if review is from a completed job
  helpful: number; // Count of "helpful" votes
  createdAt: string;
}

export interface ReferralReward {
  type: 'customer' | 'professional';
  amount: number; // In GBP
  credited: boolean;
  creditedAt?: string;
}

export interface Referral {
  id: string;
  referrerId: string; // Who made the referral
  referrerType: 'customer' | 'professional';
  refereeId?: string; // Who was referred (null until they sign up)
  refereeType: 'customer' | 'professional';
  referralCode: string;
  status: 'pending' | 'signed_up' | 'completed' | 'rewarded';
  referrerReward?: ReferralReward;
  refereeReward?: ReferralReward;
  createdAt: string;
  completedAt?: string; // When referee completed their first job/purchase
}

export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credits: number;
  pricePerCredit: number;
  estimatedLeads: number; // For standard members (6 credits/lead)
  estimatedLeadsPremium: number; // For premium members (4 credits/lead)
  savings: string;
  isPremiumOnly: boolean;
  featured?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  portfolio: PortfolioItem[]; // Portfolio of work examples they want done
  estimates: Estimate[];
  jobListings: JobListing[];
  referralCode: string; // Unique referral code
  referrals: Referral[]; // Referrals made by this customer
  referralCredits: number; // Credits earned from referrals (in GBP)
  createdAt: string;
}

export interface PostcodeZone {
  zone: string;
  multiplier: number;
  description: string;
}
