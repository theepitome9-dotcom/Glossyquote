import { Professional } from '../types/glossy';

/**
 * Demo account credentials for Apple App Review
 *
 * Email: reviewer@glossyquotes.com
 * Password: GlossyReview2024!
 */
export const DEMO_ACCOUNT_EMAIL = 'reviewer@glossyquotes.com';
export const DEMO_ACCOUNT_PASSWORD = 'GlossyReview2024!';

/**
 * Creates a pre-configured demo professional account for Apple reviewers.
 * This account has credits, reviews, and a complete profile so reviewers
 * can test all app functionality.
 */
export function createDemoProfessional(): Professional {
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    id: 'demo-reviewer-account',
    name: 'Premium Painters London',
    email: DEMO_ACCOUNT_EMAIL,
    phone: '07700 900123',
    profileDescription: 'Award-winning painting and decorating company serving London and surrounding areas for over 15 years. We specialise in residential and commercial projects, from single rooms to complete property renovations. Our team of skilled decorators takes pride in delivering exceptional finishes with attention to detail.',
    profileImages: [],
    portfolio: [
      {
        id: 'demo-portfolio-1',
        uri: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800',
        type: 'photo',
        caption: 'Victorian living room restoration',
        uploadedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-portfolio-2',
        uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        type: 'photo',
        caption: 'Modern kitchen refresh',
        uploadedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-portfolio-3',
        uri: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        type: 'photo',
        caption: 'Bedroom feature wall',
        uploadedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    tradeCategories: ['painting-decorating', 'plastering'],
    credits: 50, // Plenty of credits for testing
    isPremium: true,
    subscription: {
      tier: 'premium',
      startDate: now.toISOString(),
      endDate: oneWeekFromNow.toISOString(),
      autoRenew: true,
    },
    premiumSince: now.toISOString(),
    rating: 4.8,
    totalReviews: 3,
    reviews: [
      {
        id: 'demo-review-1',
        customerId: 'customer-1',
        customerName: 'Sarah M.',
        professionalId: 'demo-reviewer-account',
        rating: 5,
        comment: 'Absolutely fantastic work! The team was professional, tidy, and the finish is perfect. Would highly recommend.',
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        professionalResponse: 'Thank you so much Sarah! It was a pleasure working on your home.',
        verified: true,
        helpful: 12,
      },
      {
        id: 'demo-review-2',
        customerId: 'customer-2',
        customerName: 'James T.',
        professionalId: 'demo-reviewer-account',
        rating: 5,
        comment: 'Great communication throughout the project. Very happy with the results.',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        helpful: 8,
      },
      {
        id: 'demo-review-3',
        customerId: 'customer-3',
        customerName: 'Emma R.',
        professionalId: 'demo-reviewer-account',
        rating: 4,
        comment: 'Good quality work, arrived on time. Minor touch-ups needed but sorted quickly.',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        professionalResponse: 'Thanks Emma, glad we could get those touch-ups done for you!',
        verified: true,
        helpful: 5,
      },
    ],
    referralCode: 'PREMIUM123',
    referrals: [],
    referralEarnings: 0,
    createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Check if the demo account already exists in the professionals list
 */
export function isDemoAccountExists(professionals: Professional[]): boolean {
  return professionals.some(p => p.email.toLowerCase() === DEMO_ACCOUNT_EMAIL.toLowerCase());
}
