export interface SocialMediaAccount {
  id: string;
  platform: 'instagram' | 'facebook' | 'youtube' | 'whatsapp';
  accountId: string;
  accountName: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  isConnected: boolean;
  lastSync?: Date;
  settings: Record<string, any>;
}

export interface InstagramProduct {
  id: string;
  productId: string;
  instagramId?: string;
  catalogId?: string;
  status: 'pending' | 'active' | 'rejected' | 'deleted';
  postedAt?: Date;
  postUrl?: string;
  engagementMetrics?: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
  };
}

export interface FacebookProduct {
  id: string;
  productId: string;
  facebookId?: string;
  catalogId?: string;
  status: 'pending' | 'active' | 'rejected' | 'deleted';
  shopUrl?: string;
  engagementMetrics?: {
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
  };
}

export interface YouTubeVideo {
  id: string;
  productId: string;
  videoId?: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  status: 'draft' | 'processing' | 'published' | 'failed';
  uploadedAt?: Date;
  publishedAt?: Date;
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface WhatsAppMessage {
  id: string;
  to: string;
  from?: string;
  type: 'text' | 'image' | 'template' | 'order' | 'notification';
  content: string;
  mediaUrl?: string;
  templateName?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  errorMessage?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'marketing' | 'transactional' | 'otp';
  language: string;
  status: 'pending' | 'approved' | 'rejected';
  components: Array<{
    type: 'header' | 'body' | 'footer' | 'buttons';
    content: string;
    variables?: string[];
  }>;
}

export interface SocialMediaPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'youtube';
  productIds: string[];
  content: string;
  mediaUrls: string[];
  scheduledFor?: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagementMetrics?: {
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    reach: number;
  };
}

export interface SocialMediaCampaign {
  id: string;
  name: string;
  platforms: Array<'instagram' | 'facebook' | 'youtube' | 'whatsapp'>;
  targetProducts: string[];
  startDate: Date;
  endDate: Date;
  budget?: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
  };
}

export interface WhatsAppConversation {
  id: string;
  customerId: string;
  customerPhone: string;
  customerName?: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  lastMessageAt: Date;
  unreadCount: number;
  messages: WhatsAppMessage[];
  assignedTo?: string;
  tags?: string[];
}

export interface SocialMediaAnalytics {
  platform: 'instagram' | 'facebook' | 'youtube' | 'whatsapp';
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    followers: number;
    engagement: number;
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  topPosts: Array<{
    id: string;
    type: string;
    engagement: number;
    reach: number;
  }>;
  demographics: {
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
    locations: Record<string, number>;
  };
}
