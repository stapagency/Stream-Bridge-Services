import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

export type Database = {
  public: {
    Tables: {
      home_content: {
        Row: {
          id: string;
          section: string;
          title: string;
          description: string | null;
          content: Record<string, any>;
          order_position: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['home_content']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['home_content']['Insert']>;
      };
      testimonials: {
        Row: {
          id: string;
          client_name: string;
          company: string | null;
          position: string | null;
          content: string;
          rating: number;
          image_url: string | null;
          is_featured: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['testimonials']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['testimonials']['Insert']>;
      };
      contact_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          service: string | null;
          message: string;
          status: 'pending' | 'contacted' | 'completed';
          email_sent: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contact_requests']['Row'], 'id' | 'created_at' | 'status' | 'email_sent'>;
        Update: Partial<Database['public']['Tables']['contact_requests']['Row']>;
      };
      services_content: {
        Row: {
          id: string;
          title: string;
          description: string;
          features: string[];
          icon: string | null;
          image_url: string | null;
          order_position: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['services_content']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['services_content']['Insert']>;
      };
      products_content: {
        Row: {
          id: string;
          title: string;
          category: string;
          description: string;
          features: string[];
          image_url: string | null;
          is_featured: boolean;
          order_position: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products_content']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products_content']['Insert']>;
      };
    };
  };
};
