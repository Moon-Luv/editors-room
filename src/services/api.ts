import { supabase } from '../lib/supabase';

export interface Project {
  id: string;
  display_id: string;
  title: string;
  category: string;
  image_url: string;
  year: string;
  description: string;
  is_featured: boolean;
  sort_order: number;
  created_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
  sort_order: number;
  created_at?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  image_url: string;
  rating: number;
  sort_order: number;
  created_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  author_id: string;
  published: boolean;
  published_at?: string;
  created_at?: string;
}

export const api = {
  storage: {
    getOptimizedUrl: (path: string, options: { width?: number; quality?: number } = {}) => {
      const { width = 800, quality = 80 } = options;
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/render/image/public`;
      return `${baseUrl}/${path}?width=${width}&quality=${quality}`;
    },
    upload: async (bucket: string, file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    },
    delete: async (bucket: string, url: string) => {
      const fileName = url.split('/').pop();
      if (!fileName) return;
      const { error } = await supabase.storage.from(bucket).remove([fileName]);
      if (error) throw error;
    }
  },
  projects: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Project[];
    },
    create: async (project: Omit<Project, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('projects').insert([project]).select().single();
      if (error) throw error;
      return data as Project;
    },
    update: async (id: string, project: Partial<Project>) => {
      const { data, error } = await supabase.from('projects').update(project).eq('id', id).select().single();
      if (error) throw error;
      return data as Project;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    }
  },
  team: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as TeamMember[];
    },
    create: async (member: Omit<TeamMember, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('team_members').insert([member]).select().single();
      if (error) throw error;
      return data as TeamMember;
    },
    update: async (id: string, member: Partial<TeamMember>) => {
      const { data, error } = await supabase.from('team_members').update(member).eq('id', id).select().single();
      if (error) throw error;
      return data as TeamMember;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    }
  },
  testimonials: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Testimonial[];
    },
    create: async (testimonial: Omit<Testimonial, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('testimonials').insert([testimonial]).select().single();
      if (error) throw error;
      return data as Testimonial;
    },
    update: async (id: string, testimonial: Partial<Testimonial>) => {
      const { data, error } = await supabase.from('testimonials').update(testimonial).eq('id', id).select().single();
      if (error) throw error;
      return data as Testimonial;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
    }
  },
  blog: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
    create: async (post: Omit<BlogPost, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('blog_posts').insert([post]).select().single();
      if (error) throw error;
      return data as BlogPost;
    },
    update: async (id: string, post: Partial<BlogPost>) => {
      const { data, error } = await supabase.from('blog_posts').update(post).eq('id', id).select().single();
      if (error) throw error;
      return data as BlogPost;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    }
  }
};
