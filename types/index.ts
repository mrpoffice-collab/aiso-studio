// Database types
export interface User {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  agency_name: string | null;
  agency_logo_url: string | null;
  agency_primary_color: string;
  agency_secondary_color: string;
  agency_email: string | null;
  agency_phone: string | null;
  agency_website: string | null;
  agency_address: string | null;
  agency_tagline: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

// Agency branding interface for API requests/responses
export interface AgencyBranding {
  agency_name: string | null;
  agency_logo_url: string | null;
  agency_primary_color: string;
  agency_secondary_color: string;
  agency_email: string | null;
  agency_phone: string | null;
  agency_website: string | null;
  agency_address: string | null;
  agency_tagline: string | null;
}

export interface Strategy {
  id: string;
  user_id: string;
  client_name: string;
  industry: string;
  goals: string[];
  target_audience: string;
  brand_voice: string;
  frequency: string;
  content_length: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  strategy_id: string;
  title: string;
  keyword: string | null;
  outline: string[];
  seo_intent: string | null;
  word_count: number | null;
  position: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  topic_id: string;
  user_id: string;
  title: string;
  meta_description: string | null;
  content: string;
  word_count: number;
  status: 'draft' | 'approved' | 'published';
  fact_checks: FactCheck[];
  featured_image_url: string | null;
  image_attribution: ImageAttribution | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FactCheck {
  claim: string;
  status: 'verified' | 'uncertain' | 'unverified';
  confidence: number;
  sources: string[];
}

export interface ImageAttribution {
  photographer: string;
  photographer_url: string;
  platform: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  operation_type: 'strategy_generation' | 'content_generation' | 'fact_checking' | 'image_search';
  cost_usd: number;
  tokens_used: number;
  metadata: Record<string, any>;
  created_at: string;
}

// API request/response types
export interface CreateStrategyRequest {
  clientName: string;
  industry: string;
  goals: string[];
  targetAudience: string;
  brandVoice: string;
  frequency: string;
  contentLength: string;
  keywords: string[];
}

export interface CreateStrategyResponse {
  strategyId: string;
  topics: Topic[];
}

export interface GenerateContentRequest {
  topicId: string;
  regenerate?: boolean;
}

export interface GenerateContentResponse {
  postId: string;
  title: string;
  metaDescription: string;
  content: string;
  wordCount: number;
  factChecks: FactCheck[];
  generatedAt: string;
}

export interface UpdatePostRequest {
  content?: string;
  status?: 'draft' | 'approved' | 'published';
  metaDescription?: string;
  featuredImageUrl?: string;
  imageAttribution?: ImageAttribution;
}

export interface SearchImagesResponse {
  images: Array<{
    id: string;
    url: string;
    photographer: string;
    photographer_url: string;
  }>;
}

// Digital Asset Manager types
export interface Asset {
  id: string;
  user_id: string;
  folder_id: string | null;
  filename: string;
  original_filename: string;
  file_type: 'image' | 'pdf' | 'video' | 'document';
  mime_type: string;
  file_size: number;
  blob_url: string;
  public_url: string | null;
  width: number | null;
  height: number | null;
  dominant_color: string | null;
  tags: string[];
  description: string | null;
  alt_text: string | null;
  download_count: number;
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  usage_count?: number;
}

export interface AssetFolder {
  id: string;
  user_id: string;
  parent_folder_id: string | null;
  name: string;
  description: string | null;
  color: string | null;
  strategy_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetUsage {
  id: string;
  asset_id: string;
  entity_type: 'post' | 'mou' | 'strategy';
  entity_id: string;
  usage_type: 'featured_image' | 'attachment' | 'inline' | null;
  created_at: string;
}

// Form types
export type BrandVoice = 'Professional' | 'Conversational' | 'Technical' | 'Casual';
export type PostingFrequency = '1/week' | '2/week' | '1/month';
export type ContentLengthRange = '800-1200' | '1200-1800' | '1800-2500';
export type SEOIntent = 'informational' | 'commercial' | 'transactional';
export type Goal = 'SEO' | 'Lead Gen' | 'Brand Awareness' | 'Education';
