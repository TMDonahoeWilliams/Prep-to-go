import { createClient } from '@supabase/supabase-js'

// Supabase project configuration
const supabaseUrl = 'https://abkpizrrlcstjihshlat.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_KEY

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key. Please set VITE_SUPABASE_ANON_KEY or SUPABASE_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your existing schema
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'student' | 'parent' | null
          profile_image_url: string | null
          email_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role?: 'student' | 'parent' | null
          profile_image_url?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'student' | 'parent' | null
          profile_image_url?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          icon: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color: string
          icon?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          category_id: string
          title: string
          description: string | null
          due_date: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'in_progress' | 'completed'
          completed_at: string | null
          notes: string | null
          assigned_to: 'student' | 'parent'
          helpful_link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          title: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed'
          completed_at?: string | null
          notes?: string | null
          assigned_to?: 'student' | 'parent'
          helpful_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed'
          completed_at?: string | null
          notes?: string | null
          assigned_to?: 'student' | 'parent'
          helpful_link?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parent_student_relations: {
        Row: {
          id: string
          parent_id: string
          student_id: string
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          student_id: string
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          student_id?: string
          created_at?: string
        }
      }
    }
  }
}