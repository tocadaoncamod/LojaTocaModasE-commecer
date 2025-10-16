export interface AIProductDescription {
  title: string;
  description: string;
  shortDescription: string;
  features: string[];
  tags: string[];
  keywords: string[];
  category: string;
  targetAudience: string[];
  seasonality: string[];
}

export interface AIVideoConfig {
  productId: string;
  images: string[];
  duration: number;
  style: 'modern' | 'elegant' | 'casual' | 'sport';
  transitions: string[];
  music?: string;
}

export interface CustomerBehavior {
  userId: string;
  viewedProducts: string[];
  purchasedProducts: string[];
  searchTerms: string[];
  clickedCategories: string[];
  timeOnSite: number;
  deviceType: string;
  referralSource: string;
  lastActivity: Date;
}

export interface ProductRecommendation {
  productId: string;
  score: number;
  reason: string;
  confidence: number;
  type: 'similar' | 'complementary' | 'trending' | 'personalized';
}

export interface TrendAnalysis {
  category: string;
  growthRate: number;
  popularProducts: string[];
  searchVolume: number;
  socialMentions: number;
  period: string;
  predictions: {
    nextMonth: number;
    nextQuarter: number;
  };
}

export interface CampaignSuggestion {
  type: 'discount' | 'bundle' | 'seasonal' | 'clearance';
  targetProducts: string[];
  targetAudience: string[];
  suggestedDiscount: number;
  expectedRevenue: number;
  confidence: number;
  duration: number;
  channels: string[];
}

export interface AIAnalytics {
  date: Date;
  totalViews: number;
  conversions: number;
  revenue: number;
  topProducts: string[];
  topCategories: string[];
  customerSegments: Record<string, number>;
  predictions: {
    nextWeekSales: number;
    trendingCategories: string[];
  };
}
