import { createClient } from '@supabase/supabase-js'

// Supabase project configuration
// Prefer Vite env vars; fall back to a known project URL and a dummy key for builds.
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (import.meta.env.SUPABASE_URL as string) ||
  'https://abkpizrrlcstjihshlat.supabase.co';

const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.SUPABASE_ANON_KEY as string) ||
  (import.meta.env.SUPABASE_KEY as string) ||
  'dummy-key-for-build';

// Always create the client to prevent build issues.
// Use a dummy key if environment variables aren't set.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const key =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    (import.meta.env.SUPABASE_ANON_KEY as string) ||
    (import.meta.env.SUPABASE_KEY as string);
  return !!key && key !== 'dummy-key-for-build';
}

// Database types (partial) — adapt as needed to match your schema
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: 'student' | 'parent' | null;
          profile_image_url: string | null;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          role?: 'student' | 'parent' | null;
          profile_image_url?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: 'student' | 'parent' | null;
          profile_image_url?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string;
          icon: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          color: string;
          icon?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          icon?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'pending' | 'in_progress' | 'completed';
          completed_at: string | null;
          notes: string | null;
          assigned_to: 'student' | 'parent';
          helpful_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in_progress' | 'completed';
          completed_at?: string | null;
          notes?: string | null;
          assigned_to?: 'student' | 'parent';
          helpful_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in_progress' | 'completed';
          completed_at?: string | null;
          notes?: string | null;
          assigned_to?: 'student' | 'parent';
          helpful_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      parent_student_relations: {
        Row: {
          id: string;
          parent_id: string;
          student_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          student_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          student_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
