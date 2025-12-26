
export interface Page {
  id: string;
  slug: string;
  title: string;
  meta_title?: string;
  meta_description?: string;
  hero_title?: string;
  hero_description?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
  content: any;
  is_published: boolean;
  // Added updated_at to track synchronization and modification history
  updated_at?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  sector: string;
  headline_summary: string;
  excerpt?: string;
  full_description?: string;
  background?: string;
  strategic_approach?: string;
  impact?: string;
  featured_image_url?: string;
  tags: string[];
  service_type: 'business' | 'individuals' | 'entertainment';
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  // Added updated_at for consistency with database updates
  updated_at?: string;
}

export interface Insight {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  content_body: string;
  featured_image_url?: string;
  author_name: string;
  content_format: 'article' | 'video';
  is_published: boolean;
  created_at: string;
  // Track article updates
  updated_at?: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  company?: string;
  title?: string;
  page_source?: string;
  service_interest?: string;
  message?: string;
  status: 'new' | 'contacted' | 'converted' | 'archived';
  created_at: string;
  // Track lead status modification time
  updated_at?: string;
}

export interface Testimonial {
  id: string;
  feedback: string;
  service_type: string;
  customer_name: string;
  company?: string;
  designation?: string;
  is_anonymous: boolean;
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
  // Track approval status changes
  updated_at?: string;
}

export interface JobOpening {
  id: string;
  role_title: string;
  business_division: string;
  team: string;
  work_type: string;
  location: string;
  description: string;
  is_active: boolean;
  // Standard timestamps for career listings
  created_at?: string;
  updated_at?: string;
}

export interface BrandClient {
  id: string;
  industry_group: string;
  company_name: string;
  logo_url?: string;
  service_type?: string;
  is_active: boolean;
  // Standard timestamps for brand assets
  created_at?: string;
  updated_at?: string;
}
