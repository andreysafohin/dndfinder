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
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      masters: {
        Row: {
          id: string
          experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          systems: string[]
          playstyle_tags: string[]
          platforms: string[]
          rating: number
          total_sessions: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          systems?: string[]
          playstyle_tags?: string[]
          platforms?: string[]
          rating?: number
          total_sessions?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          systems?: string[]
          playstyle_tags?: string[]
          platforms?: string[]
          rating?: number
          total_sessions?: number
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          preferred_systems: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          preferred_systems?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          preferred_systems?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      games: {
        Row: {
          id: string
          master_id: string
          title: string
          system: string
          format: 'one-shot' | 'campaign'
          description: string | null
          image_url: string | null
          scheduled_at: string | null
          session_length_minutes: number
          seats_total: number
          seats_available: number
          price_rub: number | null
          platform: string | null
          status: 'draft' | 'published' | 'completed' | 'cancelled'
          beginner_friendly: boolean
          genre: string | null
          game_time: string | null
          game_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          master_id: string
          title: string
          system: string
          format: 'one-shot' | 'campaign'
          description?: string | null
          image_url?: string | null
          scheduled_at?: string | null
          session_length_minutes?: number
          seats_total: number
          seats_available: number
          price_rub?: number | null
          platform?: string | null
          status?: 'draft' | 'published' | 'completed' | 'cancelled'
          beginner_friendly?: boolean
          genre?: string | null
          game_time?: string | null
          game_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          master_id?: string
          title?: string
          system?: string
          format?: 'one-shot' | 'campaign'
          description?: string | null
          image_url?: string | null
          scheduled_at?: string | null
          session_length_minutes?: number
          seats_total?: number
          seats_available?: number
          price_rub?: number | null
          platform?: string | null
          status?: 'draft' | 'published' | 'completed' | 'cancelled'
          beginner_friendly?: boolean
          genre?: string | null
          game_time?: string | null
          game_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          game_id: string
          player_id: string
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          player_id: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          player_id?: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          message?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Master = Database['public']['Tables']['masters']['Row']
export type Player = Database['public']['Tables']['players']['Row']
export type Game = Database['public']['Tables']['games']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type MasterInsert = Database['public']['Tables']['masters']['Insert']
export type PlayerInsert = Database['public']['Tables']['players']['Insert']
export type GameInsert = Database['public']['Tables']['games']['Insert']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type MasterUpdate = Database['public']['Tables']['masters']['Update']
export type PlayerUpdate = Database['public']['Tables']['players']['Update']
export type GameUpdate = Database['public']['Tables']['games']['Update']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']
