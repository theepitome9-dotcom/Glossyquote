import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Estimate,
  JobListing,
  JobListingWithContact,
  PurchasedLeadContact,
  Professional,
  Customer,
  EstimateRequest,
  PortfolioItem,
  Review,
} from '../types/glossy';
import {
  calculateEstimate,
} from '../utils/estimate-calculator';
import { WOODWORK_PRICING } from '../utils/pricing-data';
import { LEAD_COST_STANDARD, LEAD_COST_PREMIUM } from '../config/trades-pricing';
import { SupportedLocale, detectUserLocale } from '../config/i18n';

interface AppState {
  // Internationalization
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Current user mode
  userMode: 'customer' | 'professional' | null;
  setUserMode: (mode: 'customer' | 'professional' | null) => void;

  // Current customer
  currentCustomer: Customer | null;
  setCurrentCustomer: (customer: Customer | null) => void;

  // Current professional
  currentProfessional: Professional | null;
  setCurrentProfessional: (professional: Professional | null) => void;

  // Estimates
  currentEstimate: Estimate | null;
  setCurrentEstimate: (estimate: Estimate | null) => void;
  createEstimate: (request: EstimateRequest) => Estimate;
  markEstimateAsPaid: (estimateId: string) => void;

  // Job listings
  jobListings: JobListing[];
  // Contact details unlocked per-professional after purchase.
  // Key format: `${jobId}:${professionalId}`
  purchasedLeadContacts: Record<string, PurchasedLeadContact>;
  addJobListing: (job: JobListingWithContact) => void;
  removeJobListing: (jobId: string) => void;
  purchaseLead: (jobId: string, professionalId: string) => boolean;
  getPurchasedContact: (jobId: string, professionalId: string) => PurchasedLeadContact | null;
  setPurchasedContact: (jobId: string, professionalId: string, contact: PurchasedLeadContact) => void;

  // Professionals
  professionals: Professional[];
  addProfessional: (professional: Professional) => void;
  updateProfessionalCredits: (professionalId: string, credits: number) => void;
  updateProfessionalPremium: (professionalId: string, isPremium: boolean) => void;
  addProfessionalPortfolioItem: (professionalId: string, item: PortfolioItem) => void;
  removeProfessionalPortfolioItem: (professionalId: string, itemId: string) => void;
  
  // Customer portfolio
  addCustomerPortfolioItem: (customerId: string, item: PortfolioItem) => void;
  removeCustomerPortfolioItem: (customerId: string, itemId: string) => void;
  
  // Reviews
  addReview: (professionalId: string, review: Review) => void;
  addProfessionalReply: (professionalId: string, reviewId: string, reply: string) => void;
  
  // Reset
  reset: () => void;
}

interface PersistedState {
  isDarkMode: boolean;
  locale: SupportedLocale;
  jobListings: JobListing[];
  professionals: Professional[];
  purchasedLeadContacts: Record<string, PurchasedLeadContact>;
  // NOTE: currentEstimate is NOT persisted to prevent wrong estimate being shown after payment
  // Each estimate session should be fresh - no old data from previous sessions
}

const initialState = {
  isDarkMode: false,
  locale: detectUserLocale() as SupportedLocale,
  userMode: null,
  currentCustomer: null,
  currentProfessional: null,
  currentEstimate: null, // Not persisted - fresh each session
  jobListings: [],
  professionals: [],
  purchasedLeadContacts: {} as Record<string, PurchasedLeadContact>,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLocale: (locale) => set({ locale }),

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      setUserMode: (mode) => set({ userMode: mode }),

      setCurrentCustomer: (customer) => set({ currentCustomer: customer }),

      setCurrentProfessional: (professional) => set({ currentProfessional: professional }),

      setCurrentEstimate: (estimate) => set({ currentEstimate: estimate }),

      createEstimate: (request: EstimateRequest) => {
        // Clear any existing estimate first to prevent showing wrong data
        set({ currentEstimate: null });
        
        const calculation = calculateEstimate(request);

        const estimate: Estimate = {
          id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9), // More unique ID
          request,
          totalMinPrice: calculation.minPrice,
          totalMaxPrice: calculation.maxPrice,
          woodworkPricing: WOODWORK_PRICING,
          postcodeMultiplier: calculation.postcodeMultiplier,
          paid: false,
          createdAt: new Date().toISOString(),
        };

        if (__DEV__) {
          console.log('📝 Created new estimate:', {
            id: estimate.id,
            rooms: estimate.request.rooms.length,
            propertyType: estimate.request.propertyType,
            packageId: estimate.request.packageId,
            totalMinPrice: estimate.totalMinPrice,
            totalMaxPrice: estimate.totalMaxPrice,
          });
        }

        set({ currentEstimate: estimate });
        return estimate;
      },

      markEstimateAsPaid: (estimateId: string) => {
        const { currentEstimate } = get();
        
        if (__DEV__) {
          console.log('💰 Marking estimate as paid:', {
            requestedId: estimateId,
            currentId: currentEstimate?.id,
            match: currentEstimate?.id === estimateId,
          });
        }
        
        if (currentEstimate && currentEstimate.id === estimateId) {
          set({
            currentEstimate: {
              ...currentEstimate,
              paid: true,
            },
          });
          
          if (__DEV__) {
            console.log('✅ Estimate marked as paid successfully');
          }
        } else {
          if (__DEV__) {
            console.warn('⚠️ Estimate ID mismatch - could not mark as paid');
          }
        }
      },

      addJobListing: (job: JobListingWithContact) => {
        // Strip contact info from the public listing — store it separately
        const { customerEmail, customerPhone, ...publicJob } = job;
        const contactKey = `${job.id}:${job.customerId}`;
        set((state) => ({
          jobListings: [publicJob, ...state.jobListings],
          purchasedLeadContacts: {
            ...state.purchasedLeadContacts,
            // Store under owner's id so they can always see their own contact
            [contactKey]: { customerEmail, customerPhone, purchasedAt: new Date().toISOString() },
          },
        }));
      },

      removeJobListing: (jobId: string) => {
        set((state) => ({
          jobListings: state.jobListings.filter((j) => j.id !== jobId),
        }));
      },

      getPurchasedContact: (jobId: string, professionalId: string) => {
        const { purchasedLeadContacts } = get();
        return purchasedLeadContacts[`${jobId}:${professionalId}`] ?? null;
      },

      setPurchasedContact: (jobId: string, professionalId: string, contact: PurchasedLeadContact) => {
        set((state) => ({
          purchasedLeadContacts: {
            ...state.purchasedLeadContacts,
            [`${jobId}:${professionalId}`]: contact,
          },
        }));
      },

      purchaseLead: (jobId: string, professionalId: string) => {
        const { jobListings, currentProfessional } = get();
        const job = jobListings.find((j) => j.id === jobId);

        if (!job || !currentProfessional) return false;

        // Check if already purchased
        if (job.interestedProfessionals.includes(professionalId)) {
          return false;
        }

        // Check if max professionals reached
        if (job.interestedProfessionals.length >= job.maxProfessionals) {
          return false;
        }

        // Determine lead cost based on premium status
        const leadCost = currentProfessional.isPremium ? LEAD_COST_PREMIUM : LEAD_COST_STANDARD;

        // Check if professional has enough credits
        if (currentProfessional.credits < leadCost) {
          return false;
        }

        // Update job listing - mark this professional as having purchased
        set((state) => {
          const ownerContactKey = `${jobId}:${job.customerId}`;
          const ownerContact = state.purchasedLeadContacts[ownerContactKey];
          const professionalContactKey = `${jobId}:${professionalId}`;
          return {
            jobListings: state.jobListings.map((j) =>
              j.id === jobId
                ? { ...j, interestedProfessionals: [...j.interestedProfessionals, professionalId] }
                : j
            ),
            // If contact was posted on this device, use it directly
            purchasedLeadContacts: ownerContact
              ? { ...state.purchasedLeadContacts, [professionalContactKey]: ownerContact }
              : state.purchasedLeadContacts,
          };
        });

        // Deduct credits based on membership tier
        get().updateProfessionalCredits(professionalId, currentProfessional.credits - leadCost);

        // Fetch contact details from backend (handles cross-device purchases)
        const professionalContactKey = `${jobId}:${professionalId}`;
        const alreadyHasContact = !!get().purchasedLeadContacts[professionalContactKey];
        if (!alreadyHasContact) {
          const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
          const INTERNAL_SECRET = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET || '';
          fetch(`${BACKEND_URL}/api/jobs/${jobId}/contact?professionalId=${encodeURIComponent(professionalId)}`, {
            headers: { 'x-internal-secret': INTERNAL_SECRET },
          })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
              if (data?.customerPhone) {
                set((state) => ({
                  purchasedLeadContacts: {
                    ...state.purchasedLeadContacts,
                    [professionalContactKey]: {
                      customerEmail: data.customerEmail ?? null,
                      customerPhone: data.customerPhone,
                      purchasedAt: new Date().toISOString(),
                    },
                  },
                }));
              }
            })
            .catch((err) => console.warn('[purchaseLead] Failed to fetch contact from backend:', err));
        }

        // Notify owner of lead purchase (non-blocking)
        const BACKEND_URL_PURCHASE = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
        const INTERNAL_SECRET_PURCHASE = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET || '';
        fetch(`${BACKEND_URL_PURCHASE}/api/users/purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-secret': INTERNAL_SECRET_PURCHASE },
          body: JSON.stringify({
            jobId,
            professionalId,
            professionalName: currentProfessional.name,
            professionalEmail: currentProfessional.email,
            professionalPhone: currentProfessional.phone ?? null,
            customerName: job.customerName,
            tradeCategory: job.tradeCategory,
            postcode: job.postcode ?? '',
            creditsSpent: leadCost,
            isPremium: currentProfessional.isPremium,
            purchasedAt: new Date().toISOString(),
          }),
        }).catch((err) => console.warn('[purchaseLead] Failed to notify backend of purchase:', err));

        return true;
      },

      addProfessional: (professional) => {
        set((state) => ({
          professionals: [...state.professionals, professional],
        }));
      },

      updateProfessionalCredits: (professionalId: string, credits: number) => {
        set((state) => ({
          professionals: state.professionals.map((p) =>
            p.id === professionalId ? { ...p, credits } : p
          ),
          currentProfessional:
            state.currentProfessional?.id === professionalId
              ? { ...state.currentProfessional, credits }
              : state.currentProfessional,
        }));
      },

      updateProfessionalPremium: (professionalId: string, isPremium: boolean) => {
        set((state) => ({
          professionals: state.professionals.map((p) =>
            p.id === professionalId ? { ...p, isPremium } : p
          ),
          currentProfessional:
            state.currentProfessional?.id === professionalId
              ? { ...state.currentProfessional, isPremium }
              : state.currentProfessional,
        }));
      },

      addProfessionalPortfolioItem: (professionalId: string, item: PortfolioItem) => {
        set((state) => ({
          professionals: state.professionals.map((p) =>
            p.id === professionalId
              ? { ...p, portfolio: [...p.portfolio, item] }
              : p
          ),
          currentProfessional:
            state.currentProfessional?.id === professionalId
              ? { ...state.currentProfessional, portfolio: [...state.currentProfessional.portfolio, item] }
              : state.currentProfessional,
        }));
      },

      removeProfessionalPortfolioItem: (professionalId: string, itemId: string) => {
        set((state) => ({
          professionals: state.professionals.map((p) =>
            p.id === professionalId
              ? { ...p, portfolio: p.portfolio.filter((i) => i.id !== itemId) }
              : p
          ),
          currentProfessional:
            state.currentProfessional?.id === professionalId
              ? { ...state.currentProfessional, portfolio: state.currentProfessional.portfolio.filter((i) => i.id !== itemId) }
              : state.currentProfessional,
        }));
      },

      addCustomerPortfolioItem: (customerId: string, item: PortfolioItem) => {
        set((state) => ({
          currentCustomer:
            state.currentCustomer?.id === customerId
              ? { ...state.currentCustomer, portfolio: [...state.currentCustomer.portfolio, item] }
              : state.currentCustomer,
        }));
      },

      removeCustomerPortfolioItem: (customerId: string, itemId: string) => {
        set((state) => ({
          currentCustomer:
            state.currentCustomer?.id === customerId
              ? { ...state.currentCustomer, portfolio: state.currentCustomer.portfolio.filter((i) => i.id !== itemId) }
              : state.currentCustomer,
        }));
      },

      addReview: (professionalId: string, review: Review) => {
        set((state) => {
          const professional = state.professionals.find((p) => p.id === professionalId);
          if (!professional) return state;

          const newReviews = [...professional.reviews, review];
          const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = totalRating / newReviews.length;

          return {
            professionals: state.professionals.map((p) =>
              p.id === professionalId
                ? {
                    ...p,
                    reviews: newReviews,
                    rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
                    totalReviews: newReviews.length,
                  }
                : p
            ),
            currentProfessional:
              state.currentProfessional?.id === professionalId
                ? {
                    ...state.currentProfessional,
                    reviews: newReviews,
                    rating: Math.round(avgRating * 10) / 10,
                    totalReviews: newReviews.length,
                  }
                : state.currentProfessional,
          };
        });
      },

      addProfessionalReply: (professionalId: string, reviewId: string, reply: string) => {
        set((state) => ({
          professionals: state.professionals.map((p) =>
            p.id === professionalId
              ? {
                  ...p,
                  reviews: p.reviews.map((r) =>
                    r.id === reviewId ? { ...r, professionalResponse: reply } : r
                  ),
                }
              : p
          ),
          currentProfessional:
            state.currentProfessional?.id === professionalId
              ? {
                  ...state.currentProfessional,
                  reviews: state.currentProfessional.reviews.map((r) =>
                    r.id === reviewId ? { ...r, professionalResponse: reply } : r
                  ),
                }
              : state.currentProfessional,
        }));
      },

      reset: () => set(initialState),
    }),
    {
      name: 'glossy-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): PersistedState => ({
        isDarkMode: state.isDarkMode,
        locale: state.locale,
        jobListings: state.jobListings,
        professionals: state.professionals,
        purchasedLeadContacts: state.purchasedLeadContacts,
        // currentEstimate is NOT persisted - prevents showing wrong estimate after payment
      }),
    }
  )
);
