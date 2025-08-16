export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          preferences: Json
          statistics: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          preferences?: Json
          statistics?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          preferences?: Json
          statistics?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      meditation_sessions: {
        Row: {
          id: string
          user_id: string | null
          script_id: string
          start_time: string
          end_time: string | null
          completed: boolean
          duration: number | null
          rating: number | null
          notes: string | null
          device_info: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          script_id: string
          start_time: string
          end_time?: string | null
          completed?: boolean
          duration?: number | null
          rating?: number | null
          notes?: string | null
          device_info?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          script_id?: string
          start_time?: string
          end_time?: string | null
          completed?: boolean
          duration?: number | null
          rating?: number | null
          notes?: string | null
          device_info?: Json | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}