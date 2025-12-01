export enum AppView {
  LANDING = 'LANDING',
  GENERATOR = 'GENERATOR',
  SAVED = 'SAVED',
  BOOKING = 'BOOKING',
  PROFILE = 'PROFILE',
  GALLERY = 'GALLERY',
  ARTISTS = 'ARTISTS',
  ADMIN = 'ADMIN'
}

export enum GeneratorStep {
  UPLOAD = 'UPLOAD',
  ANALYSIS = 'ANALYSIS',
  OUTFIT_SELECTION = 'OUTFIT_SELECTION',
  STYLE_SELECTION = 'STYLE_SELECTION',
  RESULT = 'RESULT'
}

export interface HennaStyle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  promptModifier: string;
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
