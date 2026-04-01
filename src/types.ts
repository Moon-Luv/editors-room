import { LucideIcon } from 'lucide-react';

export interface Project {
  id: string;
  display_id?: string;
  title: string;
  category: string;
  image_url: string;
  year?: string;
  description?: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  category?: string;
  sort_order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  bio: string;
  github_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  website_url?: string;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar_url: string;
  is_approved: boolean;
  created_at: string;
}

export interface ProcessStep {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface TimeSlot {
  id: string;
  slot_time: string;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message?: string;
  booking_date: string;
  slot_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  time_slot?: {
    slot_time: string;
  };
}
