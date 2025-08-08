export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ab_test_results: {
        Row: {
          clicks: number | null
          conversions: number | null
          cost: number | null
          created_at: string
          date: string
          id: string
          screen_id: string | null
          test_id: string | null
          variant: string
          views: number | null
        }
        Insert: {
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          date?: string
          id?: string
          screen_id?: string | null
          test_id?: string | null
          variant: string
          views?: number | null
        }
        Update: {
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          date?: string
          id?: string
          screen_id?: string | null
          test_id?: string | null
          variant?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_results_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          confidence_level: number | null
          created_at: string
          description: string | null
          end_date: string
          id: string
          start_date: string
          status: string | null
          target_audience: string | null
          test_name: string
          test_screens: string[] | null
          traffic_split: number | null
          updated_at: string
          user_id: string
          variant_a_content: string | null
          variant_b_content: string | null
          winner_variant: string | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string | null
          target_audience?: string | null
          test_name: string
          test_screens?: string[] | null
          traffic_split?: number | null
          updated_at?: string
          user_id: string
          variant_a_content?: string | null
          variant_b_content?: string | null
          winner_variant?: string | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string | null
          target_audience?: string | null
          test_name?: string
          test_screens?: string[] | null
          traffic_split?: number | null
          updated_at?: string
          user_id?: string
          variant_a_content?: string | null
          variant_b_content?: string | null
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_target_audience_fkey"
            columns: ["target_audience"]
            isOneToOne: false
            referencedRelation: "audience_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_tests_variant_a_content_fkey"
            columns: ["variant_a_content"]
            isOneToOne: false
            referencedRelation: "content_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_tests_variant_b_content_fkey"
            columns: ["variant_b_content"]
            isOneToOne: false
            referencedRelation: "content_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_analytics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_date: string
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_security_alerts: {
        Row: {
          affected_user_id: string | null
          alert_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          message: string
          metadata: Json | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
          user_agent: string | null
        }
        Insert: {
          affected_user_id?: string | null
          alert_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          message: string
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          title: string
          user_agent?: string | null
        }
        Update: {
          affected_user_id?: string | null
          alert_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          message?: string
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_system_health: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_check: string
          metadata: Json | null
          response_time_ms: number | null
          service_name: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_check?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name: string
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_check?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name?: string
          status?: string
        }
        Relationships: []
      }
      audience_segments: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          estimated_reach: number | null
          id: string
          screen_match_count: number | null
          segment_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description?: string | null
          estimated_reach?: number | null
          id?: string
          screen_match_count?: number | null
          segment_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          estimated_reach?: number | null
          id?: string
          screen_match_count?: number | null
          segment_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          content_id: string | null
          created_at: string
          id: string
          payment_status: string | null
          scheduled_date: string
          scheduled_end_time: string
          scheduled_start_time: string
          screen_id: string | null
          status: string | null
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          id?: string
          payment_status?: string | null
          scheduled_date: string
          scheduled_end_time: string
          scheduled_start_time: string
          screen_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content_id?: string | null
          created_at?: string
          id?: string
          payment_status?: string | null
          scheduled_date?: string
          scheduled_end_time?: string
          scheduled_start_time?: string
          screen_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_analytics: {
        Row: {
          booking_id: string | null
          click_through_rate: number | null
          conversion_rate: number | null
          created_at: string
          date: string
          engagement_rate: number | null
          hour: number
          id: string
          impressions: number | null
          screen_id: string | null
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          booking_id?: string | null
          click_through_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
          date?: string
          engagement_rate?: number | null
          hour?: number
          id?: string
          impressions?: number | null
          screen_id?: string | null
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          booking_id?: string | null
          click_through_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
          date?: string
          engagement_rate?: number | null
          hour?: number
          id?: string
          impressions?: number | null
          screen_id?: string | null
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_analytics_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_analytics_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      content_moderation: {
        Row: {
          automated_flags: Json | null
          content_id: string
          created_at: string
          id: string
          moderated_by: string | null
          moderation_reason: string | null
          screen_id: string
          status: string
          updated_at: string
        }
        Insert: {
          automated_flags?: Json | null
          content_id: string
          created_at?: string
          id?: string
          moderated_by?: string | null
          moderation_reason?: string | null
          screen_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          automated_flags?: Json | null
          content_id?: string
          created_at?: string
          id?: string
          moderated_by?: string | null
          moderation_reason?: string | null
          screen_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_moderation_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_moderation_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      content_schedules: {
        Row: {
          auto_book: boolean | null
          budget_limit: number | null
          content_id: string | null
          created_at: string
          end_date: string | null
          id: string
          repeat_pattern: string | null
          schedule_name: string
          start_date: string
          status: string | null
          target_screens: string[] | null
          time_slots: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_book?: boolean | null
          budget_limit?: number | null
          content_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          repeat_pattern?: string | null
          schedule_name: string
          start_date: string
          status?: string | null
          target_screens?: string[] | null
          time_slots?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_book?: boolean | null
          budget_limit?: number | null
          content_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          repeat_pattern?: string | null
          schedule_name?: string
          start_date?: string
          status?: string | null
          target_screens?: string[] | null
          time_slots?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_schedules_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      content_uploads: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      device_status: {
        Row: {
          connection_type: string
          created_at: string
          current_content: string | null
          id: string
          last_heartbeat: string
          screen_id: string
          signal_strength: number | null
          status: string
          updated_at: string
          uptime: number | null
        }
        Insert: {
          connection_type?: string
          created_at?: string
          current_content?: string | null
          id?: string
          last_heartbeat?: string
          screen_id: string
          signal_strength?: number | null
          status?: string
          updated_at?: string
          uptime?: number | null
        }
        Update: {
          connection_type?: string
          created_at?: string
          current_content?: string | null
          id?: string
          last_heartbeat?: string
          screen_id?: string
          signal_strength?: number | null
          status?: string
          updated_at?: string
          uptime?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "device_status_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: true
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string | null
          id: string
          platform_fee: number | null
          screen_owner_amount: number | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string | null
          id?: string
          platform_fee?: number | null
          screen_owner_amount?: number | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          platform_fee?: number | null
          screen_owner_amount?: number | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          amount: number
          currency: string
          earnings_period_end: string
          earnings_period_start: string
          id: string
          metadata: Json | null
          processed_at: string | null
          requested_at: string
          screen_owner_id: string
          status: string
          stripe_payout_id: string | null
        }
        Insert: {
          amount: number
          currency?: string
          earnings_period_end: string
          earnings_period_start: string
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          requested_at?: string
          screen_owner_id: string
          status?: string
          stripe_payout_id?: string | null
        }
        Update: {
          amount?: number
          currency?: string
          earnings_period_end?: string
          earnings_period_start?: string
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          requested_at?: string
          screen_owner_id?: string
          status?: string
          stripe_payout_id?: string | null
        }
        Relationships: []
      }
      pricing_analytics: {
        Row: {
          average_price: number
          booking_count: number
          created_at: string
          date: string
          demand_score: number | null
          hour: number
          id: string
          revenue: number
          screen_id: string
          suggested_price: number | null
          updated_at: string
        }
        Insert: {
          average_price?: number
          booking_count?: number
          created_at?: string
          date?: string
          demand_score?: number | null
          hour: number
          id?: string
          revenue?: number
          screen_id: string
          suggested_price?: number | null
          updated_at?: string
        }
        Update: {
          average_price?: number
          booking_count?: number
          created_at?: string
          date?: string
          demand_score?: number | null
          hour?: number
          id?: string
          revenue?: number
          screen_id?: string
          suggested_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_analytics_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          has_completed_broadcaster_onboarding: boolean | null
          has_completed_screen_owner_onboarding: boolean | null
          id: string
          payout_enabled: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          stripe_account_id: string | null
          total_earnings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          has_completed_broadcaster_onboarding?: boolean | null
          has_completed_screen_owner_onboarding?: boolean | null
          id?: string
          payout_enabled?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          stripe_account_id?: string | null
          total_earnings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          has_completed_broadcaster_onboarding?: boolean | null
          has_completed_screen_owner_onboarding?: boolean | null
          id?: string
          payout_enabled?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          stripe_account_id?: string | null
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string
          description: string
          expires_at: string | null
          id: string
          implemented: boolean | null
          is_active: boolean | null
          potential_revenue_increase: number | null
          recommendation_type: string
          screen_id: string
          title: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          implemented?: boolean | null
          is_active?: boolean | null
          potential_revenue_increase?: number | null
          recommendation_type: string
          screen_id: string
          title: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          implemented?: boolean | null
          is_active?: boolean | null
          potential_revenue_increase?: number | null
          recommendation_type?: string
          screen_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_recommendations_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      screen_groups: {
        Row: {
          created_at: string
          description: string | null
          group_name: string
          id: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_name: string
          id?: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          group_name?: string
          id?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      screens: {
        Row: {
          address: string | null
          availability_end: string | null
          availability_start: string | null
          city: string | null
          created_at: string
          group_id: string | null
          id: string
          is_active: boolean | null
          location_lat: number | null
          location_lng: number | null
          owner_id: string | null
          pairing_code: string | null
          price_per_hour: number | null
          qr_code_url: string | null
          screen_name: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          availability_end?: string | null
          availability_start?: string | null
          city?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          owner_id?: string | null
          pairing_code?: string | null
          price_per_hour?: number | null
          qr_code_url?: string | null
          screen_name?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          availability_end?: string | null
          availability_start?: string | null
          city?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          owner_id?: string | null
          pairing_code?: string | null
          price_per_hour?: number | null
          qr_code_url?: string | null
          screen_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "screens_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "screen_groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_pricing_recommendations: {
        Args: { target_screen_id?: string }
        Returns: undefined
      }
      create_security_alert: {
        Args: {
          alert_type: string
          severity: string
          title: string
          message: string
          affected_user_id?: string
          ip_address?: unknown
          user_agent?: string
          metadata?: Json
        }
        Returns: string
      }
      get_platform_analytics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          admin_user_id: string
          action: string
          target_type: string
          target_id?: string
          old_values?: Json
          new_values?: Json
          ip_address?: unknown
          user_agent?: string
        }
        Returns: string
      }
      record_analytics_metric: {
        Args: {
          metric_name: string
          metric_value: number
          metric_date?: string
          metadata?: Json
        }
        Returns: string
      }
      record_system_health: {
        Args: {
          service_name: string
          status: string
          response_time_ms?: number
          error_message?: string
          metadata?: Json
        }
        Returns: string
      }
      resolve_security_alert: {
        Args: { alert_id: string; resolved_by_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "screen_owner" | "broadcaster" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["screen_owner", "broadcaster", "admin"],
    },
  },
} as const
