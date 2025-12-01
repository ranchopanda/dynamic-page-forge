export enum AppView {
  LANDING = 'LANDING',
  GENERATOR = 'GENERATOR',
  SAVED = 'SAVED',
  BOOKING = 'BOOKING',
  AUTH = 'AUTH',
  PROFILE = 'PROFILE',
  GALLERY = 'GALLERY',
  ARTISTS = 'ARTISTS',
  MY_BOOKINGS = 'MY_BOOKINGS',
  ADMIN = 'ADMIN',
  BLOG = 'BLOG',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS',
}

export enum GeneratorStep {
  UPLOAD = 'UPLOAD',
  ANALYSIS = 'ANALYSIS',
  OUTFIT_SELECTION = 'OUTFIT_SELECTION',
  STYLE_SELECTION = 'STYLE_SELECTION',
  RESULT = 'RESULT',
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'USER' | 'ARTIST' | 'ADMIN';
  avatar?: string;
  createdAt: string;
  _count?: {
    designs: number;
    bookings: number;
  };
}

export interface HennaStyle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  promptModifier: string;
  category: string;
  complexity: string;
  coverage: string;
}

export interface HandAnalysis {
  skinTone: string;
  handShape: string;
  recommendedStyles: string[];
  coverage: string;
  keyFeature: string;
  fingerShape: string;
  wristArea: string;
}

export interface OutfitAnalysis {
  outfitType: string;
  dominantColors: string[];
  styleKeywords: string[];
}

export interface Design {
  id: string;
  userId: string;
  styleId?: string;
  style?: HennaStyle;
  handImageUrl: string;
  generatedImageUrl: string;
  outfitContext?: string;
  handAnalysis?: HandAnalysis;
  isPublic: boolean;
  likes: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Booking {
  id: string;
  userId: string;
  artistId?: string;
  designId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  consultationType: 'VIRTUAL' | 'IN_PERSON' | 'ON_SITE';
  scheduledDate: string;
  scheduledTime: string;
  eventDate?: string;
  message?: string;
  confirmationCode: string;
  totalPrice?: number;
  depositPaid: boolean;
  notes?: string;
  createdAt: string;
  design?: Design;
  artist?: ArtistProfile;
  user?: User;
}

export interface ArtistProfile {
  id: string;
  userId: string;
  user: User;
  bio?: string;
  specialties: string[];
  experience: number;
  portfolio: string[];
  rating: number;
  reviewCount: number;
  available: boolean;
}

export interface Review {
  id: string;
  userId: string;
  artistId: string;
  rating: number;
  comment?: string;
  images: string[];
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}

// Legacy types for backward compatibility
export interface GeneratedResult {
  imageUrl: string;
  description: string;
}

export interface SavedDesign {
  id: string;
  imageUrl: string;
  styleName: string;
  date: string;
  analysis?: HandAnalysis;
  outfitContext?: string;
}
