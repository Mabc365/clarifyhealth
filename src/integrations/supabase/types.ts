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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      article_feedback: {
        Row: {
          article_slug: string
          comment: string | null
          created_at: string
          id: string
          language: string
          rating: string
        }
        Insert: {
          article_slug: string
          comment?: string | null
          created_at?: string
          id?: string
          language?: string
          rating: string
        }
        Update: {
          article_slug?: string
          comment?: string | null
          created_at?: string
          id?: string
          language?: string
          rating?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          body_system: string
          conditions: string[]
          created_at: string
          id: string
          key_terms: Json
          language: string
          last_reviewed: string
          life_stage: string
          questions_to_ask: Json
          read_time_min: number
          reading_grade: number
          related_slugs: string[]
          reviewer_credentials: string
          reviewer_name: string
          sections: Json
          slug: string
          sources: Json
          summary: string | null
          title: string
          tldr: Json
          updated_at: string
          when_to_call: Json
        }
        Insert: {
          body_system: string
          conditions?: string[]
          created_at?: string
          id?: string
          key_terms?: Json
          language?: string
          last_reviewed?: string
          life_stage?: string
          questions_to_ask?: Json
          read_time_min?: number
          reading_grade?: number
          related_slugs?: string[]
          reviewer_credentials?: string
          reviewer_name?: string
          sections?: Json
          slug: string
          sources?: Json
          summary?: string | null
          title: string
          tldr?: Json
          updated_at?: string
          when_to_call?: Json
        }
        Update: {
          body_system?: string
          conditions?: string[]
          created_at?: string
          id?: string
          key_terms?: Json
          language?: string
          last_reviewed?: string
          life_stage?: string
          questions_to_ask?: Json
          read_time_min?: number
          reading_grade?: number
          related_slugs?: string[]
          reviewer_credentials?: string
          reviewer_name?: string
          sections?: Json
          slug?: string
          sources?: Json
          summary?: string | null
          title?: string
          tldr?: Json
          updated_at?: string
          when_to_call?: Json
        }
        Relationships: []
      }
      doctor_search_queries: {
        Row: {
          created_at: string
          id: string
          insurance_type: string | null
          results_count: number | null
          specialty_detected: string | null
          symptoms_summary: string | null
          zip_code: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          insurance_type?: string | null
          results_count?: number | null
          specialty_detected?: string | null
          symptoms_summary?: string | null
          zip_code?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          insurance_type?: string | null
          results_count?: number | null
          specialty_detected?: string | null
          symptoms_summary?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      glossary_terms: {
        Row: {
          category: string | null
          created_at: string
          id: string
          language: string
          plain_definition: string
          pronunciation: string | null
          see_also: string[]
          term: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          language?: string
          plain_definition: string
          pronunciation?: string | null
          see_also?: string[]
          term: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          language?: string
          plain_definition?: string
          pronunciation?: string | null
          see_also?: string[]
          term?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmation_token: string
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          language: string
          status: string
          unsubscribed_at: string | null
        }
        Insert: {
          confirmation_token: string
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          language?: string
          status?: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmation_token?: string
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          language?: string
          status?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      problem_reports: {
        Row: {
          article_slug: string
          created_at: string
          description: string
          id: string
          problem_type: string
          reporter_email: string | null
        }
        Insert: {
          article_slug: string
          created_at?: string
          description: string
          id?: string
          problem_type: string
          reporter_email?: string | null
        }
        Update: {
          article_slug?: string
          created_at?: string
          description?: string
          id?: string
          problem_type?: string
          reporter_email?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      visit_notes: {
        Row: {
          ai_holistic: string | null
          ai_plain_english: string | null
          ai_questions: Json | null
          ai_summary: string | null
          created_at: string
          doctor_name: string
          id: string
          language: string | null
          raw_notes: string | null
          recording_url: string | null
          specialty: string | null
          user_id: string
          visit_date: string
        }
        Insert: {
          ai_holistic?: string | null
          ai_plain_english?: string | null
          ai_questions?: Json | null
          ai_summary?: string | null
          created_at?: string
          doctor_name: string
          id?: string
          language?: string | null
          raw_notes?: string | null
          recording_url?: string | null
          specialty?: string | null
          user_id: string
          visit_date?: string
        }
        Update: {
          ai_holistic?: string | null
          ai_plain_english?: string | null
          ai_questions?: Json | null
          ai_summary?: string | null
          created_at?: string
          doctor_name?: string
          id?: string
          language?: string | null
          raw_notes?: string | null
          recording_url?: string | null
          specialty?: string | null
          user_id?: string
          visit_date?: string
        }
        Relationships: []
      }
      wellness_plans: {
        Row: {
          created_at: string
          id: string
          plan: Json | null
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan?: Json | null
          preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan?: Json | null
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
