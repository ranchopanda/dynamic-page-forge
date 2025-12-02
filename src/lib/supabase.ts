import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { safeStorage } from './storage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a storage wrapper that catches ALL errors
const createSafeStorageWrapper = () => ({
  getItem: (key: string): string | null => {
    try {
      return safeStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      safeStorage.setItem(key, value);
    } catch {
      // Silently fail - session won't persist but app will work
    }
  },
  removeItem: (key: string): void => {
    try {
      safeStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },
});

// Create Supabase client with safe storage configuration
let supabaseInstance: SupabaseClient;

// Always use our safe storage wrapper - it handles all edge cases
try {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: createSafeStorageWrapper(),
      storageKey: 'henna-auth',
      flowType: 'implicit',
    },
  });
} catch {
  // Fallback: create client with no persistence at all
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = supabaseInstance;

// Database types
export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'USER' | 'ARTIST' | 'ADMIN';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArtistProfile {
  id: string;
  user_id: string;
  bio?: string;
  specialties: string[];
  experience: number;
  portfolio: string[];
  rating: number;
  review_count: number;
  available: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface HennaStyle {
  id: string;
  name: string;
  description: string;
  image_url: string;
  prompt_modifier: string;
  category: string;
  complexity: 'Simple' | 'Medium' | 'Complex' | 'Intricate';
  coverage: 'Minimal' | 'Partial' | 'Full' | 'Extended';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


export interface Design {
  id: string;
  user_id: string;
  style_id?: string;
  hand_image_url: string;
  generated_image_url: string;
  outfit_context?: string;
  hand_analysis?: Record<string, any>;
  is_public: boolean;
  likes: number;
  review_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  can_be_template: boolean;
  user_rating?: number;
  user_feedback?: string;
  feedback_at?: string;
  created_at: string;
  updated_at: string;
  style?: HennaStyle;
  profile?: Profile;
}

export interface Booking {
  id: string;
  user_id: string;
  artist_id?: string;
  design_id?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  consultation_type: 'VIRTUAL' | 'IN_PERSON' | 'ON_SITE';
  scheduled_date: string;
  scheduled_time: string;
  event_date?: string;
  message?: string;
  confirmation_code: string;
  total_price?: number;
  deposit_paid: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  design?: Design;
  artist?: ArtistProfile;
}

export interface Review {
  id: string;
  user_id: string;
  artist_id: string;
  rating: number;
  comment?: string;
  images: string[];
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  category: string;
  tags: string[];
  author: string;
  is_published: boolean;
  is_featured: boolean;
  views: number;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  owner_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  price_per_hand: number;
  available_days: string;
  instagram?: string;
  facebook?: string;
  pinterest?: string;
  twitter?: string;
  about_text?: string;
  seo_keywords: string;
  google_analytics?: string;
  updated_at: string;
}

export interface Newsletter {
  id: string;
  email: string;
  created_at: string;
}
