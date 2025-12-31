
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
  updated_at?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  status: 'in progress' | 'complete' | string;
  headline_summary: string;
  snippet?: string;
  sub_snippet?: string;
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
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
  seo_meta_title?: string;
  seo_meta_description?: string;
  published_at?: string;
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
  excerpt: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Applicant {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  status: 'new' | 'reviewed' | 'interviewing' | 'hired' | 'rejected';
  answers?: { question: string; answer: string }[];
  created_at: string;
  job_openings?: { role_title: string };
}

export interface BrandClient {
  id: string;
  industry_group: string;
  company_name: string;
  logo_url?: string;
  service_type?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
