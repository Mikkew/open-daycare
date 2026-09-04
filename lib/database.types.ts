export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      child_allergy_tags: {
        Row: {
          child_id: string
          id: string
          tag: string
        }
        Insert: {
          child_id: string
          id?: string
          tag: string
        }
        Update: {
          child_id?: string
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_allergy_tags_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          birth_date: string
          created_at: string
          enrolled_at: string
          full_name: string
          id: string
          medical_notes: string | null
          photo_consent: boolean
          room_id: string | null
          status: Database["public"]["Enums"]["child_status"]
          updated_at: string
        }
        Insert: {
          birth_date: string
          created_at?: string
          enrolled_at: string
          full_name: string
          id?: string
          medical_notes?: string | null
          photo_consent?: boolean
          room_id?: string | null
          status?: Database["public"]["Enums"]["child_status"]
          updated_at?: string
        }
        Update: {
          birth_date?: string
          created_at?: string
          enrolled_at?: string
          full_name?: string
          id?: string
          medical_notes?: string | null
          photo_consent?: boolean
          room_id?: string | null
          status?: Database["public"]["Enums"]["child_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      daycares: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          child_id: string
          code: string
          created_at: string
          expires_at: string
          id: string
          parent_email: string
          parent_name: string
          relationship: Database["public"]["Enums"]["relationship_type"]
          status: string
          used_at: string | null
        }
        Insert: {
          child_id: string
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          parent_email: string
          parent_name: string
          relationship: Database["public"]["Enums"]["relationship_type"]
          status?: string
          used_at?: string | null
        }
        Update: {
          child_id?: string
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          parent_email?: string
          parent_name?: string
          relationship?: Database["public"]["Enums"]["relationship_type"]
          status?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_children: {
        Row: {
          child_id: string
          created_at: string
          id: string
          parent_id: string
          relationship: Database["public"]["Enums"]["relationship_type"]
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          parent_id: string
          relationship: Database["public"]["Enums"]["relationship_type"]
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          parent_id?: string
          relationship?: Database["public"]["Enums"]["relationship_type"]
        }
        Relationships: [
          {
            foreignKeyName: "parent_children_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_children: {
        Row: {
          child_id: string
          post_id: string
        }
        Insert: {
          child_id: string
          post_id: string
        }
        Update: {
          child_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_children_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_children_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_photos: {
        Row: {
          created_at: string
          height: number | null
          id: string
          position: number
          post_id: string
          url: string
          width: number | null
        }
        Insert: {
          created_at?: string
          height?: number | null
          id?: string
          position: number
          post_id: string
          url: string
          width?: number | null
        }
        Update: {
          created_at?: string
          height?: number | null
          id?: string
          position?: number
          post_id?: string
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_photos_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          published_at: string
          room_id: string | null
          title: string | null
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          published_at?: string
          room_id?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["post_type"]
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          published_at?: string
          room_id?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          daycare_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          daycare_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          daycare_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_daycare_id_fkey"
            columns: ["daycare_id"]
            isOneToOne: false
            referencedRelation: "daycares"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_summary_enabled: boolean
          daycare_id: string
          full_name: string
          id: string
          notify_on_post: boolean
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_summary_enabled?: boolean
          daycare_id: string
          full_name: string
          id: string
          notify_on_post?: boolean
          role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_summary_enabled?: boolean
          daycare_id?: string
          full_name?: string
          id?: string
          notify_on_post?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_daycare_id_fkey"
            columns: ["daycare_id"]
            isOneToOne: false
            referencedRelation: "daycares"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_daycare_id: { Args: never; Returns: string }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      child_status: "active" | "archived"
      post_type:
        | "meal"
        | "nap"
        | "activity"
        | "achievement"
        | "photo"
        | "announcement"
      relationship_type: "father" | "mother" | "guardian"
      user_role: "staff" | "parent" | "admin"
      user_status: "pending" | "active"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
