export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ab_test_campaigns: {
        Row: {
          confidence_level: number | null
          created_at: string
          description: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          status: string
          target_metric: string
          traffic_split: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: string
          target_metric?: string
          traffic_split?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: string
          target_metric?: string
          traffic_split?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ab_test_results: {
        Row: {
          campaign_id: string
          click_through_rate: number | null
          conversion_rate: number | null
          engagement_rate: number | null
          id: string
          impressions: number | null
          recorded_at: string
          screen_id: string
          user_session: string | null
          variant_id: string
          views: number | null
        }
        Insert: {
          campaign_id: string
          click_through_rate?: number | null
          conversion_rate?: number | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          recorded_at?: string
          screen_id: string
          user_session?: string | null
          variant_id: string
          views?: number | null
        }
        Update: {
          campaign_id?: string
          click_through_rate?: number | null
          conversion_rate?: number | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          recorded_at?: string
          screen_id?: string
          user_session?: string | null
          variant_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ab_test_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_results_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ab_test_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_variants: {
        Row: {
          allocation_percentage: number
          campaign_id: string
          content_upload_id: string | null
          created_at: string
          id: string
          variant_name: string
        }
        Insert: {
          allocation_percentage?: number
          campaign_id: string
          content_upload_id?: string | null
          created_at?: string
          id?: string
          variant_name: string
        }
        Update: {
          allocation_percentage?: number
          campaign_id?: string
          content_upload_id?: string | null
          created_at?: string
          id?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_variants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ab_test_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_variants_content_upload_id_fkey"
            columns: ["content_upload_id"]
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
          target_type: string | null
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
          target_type?: string | null
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
          target_type?: string | null
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
          resolved_at: string | null
          resolved_by_user_id: string | null
          severity: string
          status: string
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
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          severity: string
          status?: string
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
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          severity?: string
          status?: string
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
          last_check: string | null
          metadata: Json | null
          response_time_ms: number | null
          service_name: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_check?: string | null
          metadata?: Json | null
          response_time_ms?: number | null
          service_name: string
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_check?: string | null
          metadata?: Json | null
          response_time_ms?: number | null
          service_name?: string
          status?: string
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          count: number
          key: string
          last_request_at: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          last_request_at?: string
          window_start: string
        }
        Update: {
          count?: number
          key?: string
          last_request_at?: string
          window_start?: string
        }
        Relationships: []
      }
      app_releases: {
        Row: {
          bundle_id: string | null
          created_at: string
          download_count: number
          file_extension: string
          file_path: string
          file_size: number
          id: string
          is_active: boolean
          minimum_os_version: string | null
          platform: string
          release_notes: string | null
          updated_at: string
          uploaded_by: string
          version_code: number
          version_name: string
        }
        Insert: {
          bundle_id?: string | null
          created_at?: string
          download_count?: number
          file_extension?: string
          file_path: string
          file_size: number
          id?: string
          is_active?: boolean
          minimum_os_version?: string | null
          platform?: string
          release_notes?: string | null
          updated_at?: string
          uploaded_by: string
          version_code: number
          version_name: string
        }
        Update: {
          bundle_id?: string | null
          created_at?: string
          download_count?: number
          file_extension?: string
          file_path?: string
          file_size?: number
          id?: string
          is_active?: boolean
          minimum_os_version?: string | null
          platform?: string
          release_notes?: string | null
          updated_at?: string
          uploaded_by?: string
          version_code?: number
          version_name?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audience_targets: {
        Row: {
          booking_id: string | null
          campaign_id: string | null
          created_at: string
          device_types: string[] | null
          id: string
          location_lat: number | null
          location_lng: number | null
          location_radius_km: number | null
          target_demographics: Json | null
          time_slots: Json | null
        }
        Insert: {
          booking_id?: string | null
          campaign_id?: string | null
          created_at?: string
          device_types?: string[] | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_radius_km?: number | null
          target_demographics?: Json | null
          time_slots?: Json | null
        }
        Update: {
          booking_id?: string | null
          campaign_id?: string | null
          created_at?: string
          device_types?: string[] | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_radius_km?: number | null
          target_demographics?: Json | null
          time_slots?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audience_targets_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount_cents: number | null
          content_upload_id: string
          created_at: string
          currency: string
          duration_minutes: number
          id: string
          payment_status: string
          screen_id: string
          start_time: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          content_upload_id: string
          created_at?: string
          currency?: string
          duration_minutes: number
          id?: string
          payment_status?: string
          screen_id: string
          start_time: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          content_upload_id?: string
          created_at?: string
          currency?: string
          duration_minutes?: number
          id?: string
          payment_status?: string
          screen_id?: string
          start_time?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_content_upload_id_fkey"
            columns: ["content_upload_id"]
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
      bookings_archive: {
        Row: {
          amount_cents: number | null
          content_upload_id: string
          created_at: string
          currency: string
          duration_minutes: number
          id: string
          payment_status: string
          screen_id: string
          start_time: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          content_upload_id: string
          created_at?: string
          currency?: string
          duration_minutes: number
          id?: string
          payment_status?: string
          screen_id: string
          start_time: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          content_upload_id?: string
          created_at?: string
          currency?: string
          duration_minutes?: number
          id?: string
          payment_status?: string
          screen_id?: string
          start_time?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_moderation_logs: {
        Row: {
          approved: boolean
          confidence_score: number | null
          content_type: string | null
          created_at: string
          file_name: string | null
          file_path: string
          id: string
          issues: string[] | null
          moderation_result: Json | null
          reviewed_at: string
        }
        Insert: {
          approved?: boolean
          confidence_score?: number | null
          content_type?: string | null
          created_at?: string
          file_name?: string | null
          file_path: string
          id?: string
          issues?: string[] | null
          moderation_result?: Json | null
          reviewed_at?: string
        }
        Update: {
          approved?: boolean
          confidence_score?: number | null
          content_type?: string | null
          created_at?: string
          file_name?: string | null
          file_path?: string
          id?: string
          issues?: string[] | null
          moderation_result?: Json | null
          reviewed_at?: string
        }
        Relationships: []
      }
      content_schedule: {
        Row: {
          content_url: string
          created_at: string
          duration_seconds: number | null
          id: string
          scheduled_time: string
          screen_id: string
          status: string
          updated_at: string
        }
        Insert: {
          content_url: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          scheduled_time: string
          screen_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          content_url?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          scheduled_time?: string
          screen_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_uploads: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          moderation_notes: string | null
          moderation_status: string | null
          screen_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          moderation_notes?: string | null
          moderation_status?: string | null
          screen_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          moderation_notes?: string | null
          moderation_status?: string | null
          screen_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      device_commands: {
        Row: {
          command: string
          created_at: string
          device_id: string
          executed_at: string | null
          id: string
          owner_user_id: string
          payload: Json | null
          result: Json | null
          screen_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          command: string
          created_at?: string
          device_id: string
          executed_at?: string | null
          id?: string
          owner_user_id: string
          payload?: Json | null
          result?: Json | null
          screen_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          command?: string
          created_at?: string
          device_id?: string
          executed_at?: string | null
          id?: string
          owner_user_id?: string
          payload?: Json | null
          result?: Json | null
          screen_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      device_metrics: {
        Row: {
          bandwidth_kbps: number | null
          bitrate_kbps: number | null
          buffer_seconds: number | null
          created_at: string
          device_id: string
          dropped_frames: number | null
          error_code: string | null
          id: string
          playback_state: string | null
          rebuffer_count: number | null
          screen_id: string | null
        }
        Insert: {
          bandwidth_kbps?: number | null
          bitrate_kbps?: number | null
          buffer_seconds?: number | null
          created_at?: string
          device_id: string
          dropped_frames?: number | null
          error_code?: string | null
          id?: string
          playback_state?: string | null
          rebuffer_count?: number | null
          screen_id?: string | null
        }
        Update: {
          bandwidth_kbps?: number | null
          bitrate_kbps?: number | null
          buffer_seconds?: number | null
          created_at?: string
          device_id?: string
          dropped_frames?: number | null
          error_code?: string | null
          id?: string
          playback_state?: string | null
          rebuffer_count?: number | null
          screen_id?: string | null
        }
        Relationships: []
      }
      device_pairings: {
        Row: {
          device_id: string
          id: string
          ip: string | null
          method: string | null
          paired_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          device_id: string
          id?: string
          ip?: string | null
          method?: string | null
          paired_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          device_id?: string
          id?: string
          ip?: string | null
          method?: string | null
          paired_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      device_settings: {
        Row: {
          device_id: string
          owner_user_id: string
          settings: Json
          updated_at: string
        }
        Insert: {
          device_id: string
          owner_user_id: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          device_id?: string
          owner_user_id?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      device_status: {
        Row: {
          created_at: string
          current_booking_id: string | null
          device_id: string | null
          id: string
          last_seen: string
          screen_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_booking_id?: string | null
          device_id?: string | null
          id?: string
          last_seen?: string
          screen_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_booking_id?: string | null
          device_id?: string | null
          id?: string
          last_seen?: string
          screen_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_status_current_booking_id_fkey"
            columns: ["current_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_status_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          created_at: string
          device_id: string
          id: string
          last_seen: string | null
          owner_user_id: string
          provisioning_token: string
          screen_id: string | null
          screen_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          last_seen?: string | null
          owner_user_id: string
          provisioning_token: string
          screen_id?: string | null
          screen_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          last_seen?: string | null
          owner_user_id?: string
          provisioning_token?: string
          screen_id?: string | null
          screen_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_logs: {
        Row: {
          client_ip: string | null
          context: string | null
          created_at: string
          details: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          client_ip?: string | null
          context?: string | null
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          client_ip?: string | null
          context?: string | null
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      frontend_errors: {
        Row: {
          created_at: string
          id: string
          message: string
          path: string | null
          session_id: string | null
          stack: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          path?: string | null
          session_id?: string | null
          stack?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          path?: string | null
          session_id?: string | null
          stack?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      frontend_metrics: {
        Row: {
          client_ip: string | null
          created_at: string
          delta: number | null
          device_info: Json | null
          id: string
          id_value: string | null
          metric_name: string
          navigation_type: string | null
          path: string | null
          session_id: string | null
          user_id: string | null
          value: number
        }
        Insert: {
          client_ip?: string | null
          created_at?: string
          delta?: number | null
          device_info?: Json | null
          id?: string
          id_value?: string | null
          metric_name: string
          navigation_type?: string | null
          path?: string | null
          session_id?: string | null
          user_id?: string | null
          value: number
        }
        Update: {
          client_ip?: string | null
          created_at?: string
          delta?: number | null
          device_info?: Json | null
          id?: string
          id_value?: string | null
          metric_name?: string
          navigation_type?: string | null
          path?: string | null
          session_id?: string | null
          user_id?: string | null
          value?: number
        }
        Relationships: []
      }
      idempotency_keys: {
        Row: {
          created_at: string
          function_name: string
          idempotency_key: string
          last_seen: string
          request_hash: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          function_name: string
          idempotency_key: string
          last_seen?: string
          request_hash?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          function_name?: string
          idempotency_key?: string
          last_seen?: string
          request_hash?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      media_jobs: {
        Row: {
          attempts: number
          bucket: string
          created_at: string
          file_path: string
          id: string
          job_type: string
          last_error: string | null
          metadata: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          bucket: string
          created_at?: string
          file_path: string
          id?: string
          job_type: string
          last_error?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          bucket?: string
          created_at?: string
          file_path?: string
          id?: string
          job_type?: string
          last_error?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mobile_features: {
        Row: {
          created_at: string
          feature_type: string
          id: string
          is_enabled: boolean | null
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_type: string
          id?: string
          is_enabled?: boolean | null
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature_type?: string
          id?: string
          is_enabled?: boolean | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          owner_amount_cents: number
          platform_fee_cents: number
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          owner_amount_cents?: number
          platform_fee_cents?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          owner_amount_cents?: number
          platform_fee_cents?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
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
          created_at: string
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
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
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
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
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
          updated_at?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          actor: string | null
          created_at: string
          details: Json | null
          duration_ms: number
          id: string
          status: string
          test_name: string
        }
        Insert: {
          actor?: string | null
          created_at?: string
          details?: Json | null
          duration_ms: number
          id?: string
          status?: string
          test_name: string
        }
        Update: {
          actor?: string | null
          created_at?: string
          details?: Json | null
          duration_ms?: number
          id?: string
          status?: string
          test_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          has_completed_broadcaster_onboarding: boolean
          has_completed_screen_owner_onboarding: boolean
          role: string
          stripe_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          has_completed_broadcaster_onboarding?: boolean
          has_completed_screen_owner_onboarding?: boolean
          role?: string
          stripe_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          has_completed_broadcaster_onboarding?: boolean
          has_completed_screen_owner_onboarding?: boolean
          role?: string
          stripe_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      screen_groups: {
        Row: {
          created_at: string
          description: string | null
          group_name: string
          id: string
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_name: string
          id?: string
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          group_name?: string
          id?: string
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      screens: {
        Row: {
          availability_end: string | null
          availability_start: string | null
          created_at: string
          currency: string | null
          group_id: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          owner_user_id: string
          pairing_code: string | null
          platform_fee_percent: number | null
          price_per_10s_cents: number | null
          pricing_cents: number | null
          screen_name: string | null
          status: string
          unit_rounding_threshold_seconds: number
          updated_at: string
        }
        Insert: {
          availability_end?: string | null
          availability_start?: string | null
          created_at?: string
          currency?: string | null
          group_id?: string | null
          id: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          owner_user_id: string
          pairing_code?: string | null
          platform_fee_percent?: number | null
          price_per_10s_cents?: number | null
          pricing_cents?: number | null
          screen_name?: string | null
          status?: string
          unit_rounding_threshold_seconds?: number
          updated_at?: string
        }
        Update: {
          availability_end?: string | null
          availability_start?: string | null
          created_at?: string
          currency?: string | null
          group_id?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          owner_user_id?: string
          pairing_code?: string | null
          platform_fee_percent?: number | null
          price_per_10s_cents?: number | null
          pricing_cents?: number | null
          screen_name?: string | null
          status?: string
          unit_rounding_threshold_seconds?: number
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
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          analytics_retention_days: number | null
          created_at: string
          currency: string
          description: string | null
          features: Json | null
          id: string
          interval_type: string
          is_active: boolean | null
          max_campaigns: number | null
          max_screens: number | null
          name: string
          price_cents: number
          stripe_price_id: string | null
        }
        Insert: {
          analytics_retention_days?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval_type: string
          is_active?: boolean | null
          max_campaigns?: number | null
          max_screens?: number | null
          name: string
          price_cents: number
          stripe_price_id?: string | null
        }
        Update: {
          analytics_retention_days?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval_type?: string
          is_active?: boolean | null
          max_campaigns?: number | null
          max_screens?: number | null
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      tv_crashes: {
        Row: {
          app_version: string | null
          created_at: string
          device_id: string
          extra: Json | null
          id: string
          message: string | null
          screen_id: string | null
          stack: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_id: string
          extra?: Json | null
          id?: string
          message?: string | null
          screen_id?: string | null
          stack?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_id?: string
          extra?: Json | null
          id?: string
          message?: string | null
          screen_id?: string | null
          stack?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mv_screen_activity: {
        Row: {
          bookings_7d: number | null
          last_booking_at: string | null
          revenue_7d_cents: number | null
          screen_id: string | null
          total_bookings: number | null
          total_revenue_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      archive_old_bookings: {
        Args: { days_old?: number }
        Returns: number
      }
      check_rate_limit: {
        Args: { _key: string; _limit: number; _window_seconds: number }
        Returns: boolean
      }
      create_security_alert: {
        Args:
          | {
              affected_user_id?: string
              alert_type: string
              ip_address?: unknown
              message: string
              metadata?: Json
              severity: string
              title: string
              user_agent?: string
            }
          | {
              p_alert_type: string
              p_message?: string
              p_metadata?: Json
              p_severity: string
              p_title: string
            }
        Returns: string
      }
      generate_device_provisioning_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_platform_analytics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_app_download_count: {
        Args: { release_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action: string
          admin_user_id?: string
          ip_address?: unknown
          new_values?: Json
          old_values?: Json
          target_id?: string
          target_type?: string
          user_agent?: string
        }
        Returns: string
      }
      purge_frontend_metrics: {
        Args: { days_old?: number }
        Returns: number
      }
      purge_old_event_logs: {
        Args: { days_old?: number }
        Returns: number
      }
      purge_performance_metrics: {
        Args: { days_old?: number }
        Returns: number
      }
      record_analytics_metric: {
        Args:
          | {
              metadata?: Json
              metric_date?: string
              metric_name: string
              metric_value: number
            }
          | { p_metadata?: Json; p_metric_name: string; p_value: number }
        Returns: string
      }
      record_system_health: {
        Args:
          | {
              error_message?: string
              metadata?: Json
              response_time_ms: number
              service_name: string
              status: string
            }
          | {
              p_details?: Json
              p_response_time_ms?: number
              p_service_name: string
              p_status: string
            }
        Returns: string
      }
      refresh_mv_screen_activity: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      resolve_security_alert: {
        Args: { alert_id: string; resolved_by_user_id?: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "broadcaster" | "screen_owner" | "admin"
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
      app_role: ["broadcaster", "screen_owner", "admin"],
    },
  },
} as const
