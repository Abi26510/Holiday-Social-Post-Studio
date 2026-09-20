export type HolidayCategory = 'major' | 'cultural' | 'fun_awareness' | 'seasonal' | 'business';

export interface ColorTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  bgGradient: string;
}

export interface HolidayItem {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  month: number; // 1-12
  day: number; // 1-31
  category: HolidayCategory;
  categoryLabel: string;
  emoji: string;
  description: string;
  recommendedAngle: string;
  suggestedHooks: string[];
  defaultHashtags: string[];
  colorTheme: ColorTheme;
  isCustom?: boolean;
}

export type Platform = 'instagram' | 'linkedin' | 'twitter' | 'tiktok';

export type Tone = 'celebratory' | 'engaging' | 'promotional' | 'thoughtful' | 'humorous' | 'storytelling';

export type VisualFormat = 'square_1_1' | 'story_9_16' | 'landscape_16_9';

export interface VisualCardConfig {
  format: VisualFormat;
  themeIndex: number;
  headline: string;
  subheading: string;
  badgeText: string;
  brandName: string;
  cta: string;
  emoji: string;
  fontStyle: 'serif' | 'sans' | 'display';
  pattern: 'sparkles' | 'confetti' | 'geometric' | 'festive_dots' | 'minimal_rings' | 'clean';
  overlayIntensity: number;
  customBgColor?: string;
  customTextColor?: string;
}

export type PostStatus = 'draft' | 'ready' | 'scheduled' | 'published';

export interface ProcessedPost {
  id: string;
  holidayId: string;
  holidayName: string;
  holidayDate: string;
  holidayEmoji: string;
  tone: Tone;
  brandName: string;
  platforms: {
    instagram: string;
    linkedin: string;
    twitter: string;
    tiktok: string;
  };
  visualConfig: VisualCardConfig;
  status: PostStatus;
  createdAt: string;
  notes: string;
  templateSentence: string;
}
