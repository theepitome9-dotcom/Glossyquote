import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FeedbackEntry {
  id: string;
  userType: 'customer' | 'professional';
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  category: 'general' | 'bug' | 'feature' | 'complaint' | 'praise';
  rating: number; // 1-5 stars
  message: string;
  createdAt: string;
  isPublic: boolean; // Admin can choose to make public
  adminNotes?: string; // Internal notes
}

interface FeedbackState {
  // All feedback entries (stored securely, not publicly accessible)
  feedbackEntries: FeedbackEntry[];

  // Submit new feedback
  submitFeedback: (feedback: Omit<FeedbackEntry, 'id' | 'createdAt' | 'isPublic'>) => void;

  // Admin functions (for future dashboard)
  togglePublicStatus: (feedbackId: string) => void;
  addAdminNote: (feedbackId: string, note: string) => void;
  deleteFeedback: (feedbackId: string) => void;

  // Get public feedback only (for potential testimonials)
  getPublicFeedback: () => FeedbackEntry[];

  // Get all feedback (admin only)
  getAllFeedback: () => FeedbackEntry[];
}

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set, get) => ({
      feedbackEntries: [],

      submitFeedback: (feedback) => {
        const newEntry: FeedbackEntry = {
          ...feedback,
          id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          isPublic: false, // Default to private - admin must approve
        };

        set((state) => ({
          feedbackEntries: [newEntry, ...state.feedbackEntries],
        }));

        // Log for debugging (in production, this would send to backend)
        if (__DEV__) {
          console.log('📝 New feedback submitted:', {
            id: newEntry.id,
            userType: newEntry.userType,
            category: newEntry.category,
            rating: newEntry.rating,
            userName: newEntry.userName,
            userEmail: newEntry.userEmail,
            userPhone: newEntry.userPhone,
          });
        }
      },

      togglePublicStatus: (feedbackId) => {
        set((state) => ({
          feedbackEntries: state.feedbackEntries.map((entry) =>
            entry.id === feedbackId
              ? { ...entry, isPublic: !entry.isPublic }
              : entry
          ),
        }));
      },

      addAdminNote: (feedbackId, note) => {
        set((state) => ({
          feedbackEntries: state.feedbackEntries.map((entry) =>
            entry.id === feedbackId
              ? { ...entry, adminNotes: note }
              : entry
          ),
        }));
      },

      deleteFeedback: (feedbackId) => {
        set((state) => ({
          feedbackEntries: state.feedbackEntries.filter(
            (entry) => entry.id !== feedbackId
          ),
        }));
      },

      getPublicFeedback: () => {
        return get().feedbackEntries.filter((entry) => entry.isPublic);
      },

      getAllFeedback: () => {
        return get().feedbackEntries;
      },
    }),
    {
      name: 'glossy-feedback-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
