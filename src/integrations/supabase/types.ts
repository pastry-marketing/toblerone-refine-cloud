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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      connection_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          used_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          used_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_codes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      extension_devices: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string | null
          last_sync_at: string | null
          name: string
          revoked_at: string | null
          token_hash: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string | null
          last_sync_at?: string | null
          name?: string
          revoked_at?: string | null
          token_hash: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string | null
          last_sync_at?: string | null
          name?: string
          revoked_at?: string | null
          token_hash?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extension_devices_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          created_at: string
          id: string
          keyword: string
          market: string | null
          notes: string | null
          pages_to_check: number
          website_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          keyword: string
          market?: string | null
          notes?: string | null
          pages_to_check?: number
          website_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          keyword?: string
          market?: string | null
          notes?: string | null
          pages_to_check?: number
          website_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keywords_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keywords_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      ranking_runs: {
        Row: {
          checked_at: string
          client_run_id: string
          device_id: string | null
          found: boolean
          id: string
          keyword_id: string
          market: string | null
          pages_checked: number
          position: number | null
          position_change: number | null
          previous_position: number | null
          ranking_url: string | null
          result_domain: string | null
          result_page_number: number | null
          result_position_on_page: number | null
          result_snippet: string | null
          result_title: string | null
          search_engine: string
          synced_at: string
          website_id: string
          workspace_id: string
        }
        Insert: {
          checked_at: string
          client_run_id: string
          device_id?: string | null
          found?: boolean
          id?: string
          keyword_id: string
          market?: string | null
          pages_checked?: number
          position?: number | null
          position_change?: number | null
          previous_position?: number | null
          ranking_url?: string | null
          result_domain?: string | null
          result_page_number?: number | null
          result_position_on_page?: number | null
          result_snippet?: string | null
          result_title?: string | null
          search_engine?: string
          synced_at?: string
          website_id: string
          workspace_id: string
        }
        Update: {
          checked_at?: string
          client_run_id?: string
          device_id?: string | null
          found?: boolean
          id?: string
          keyword_id?: string
          market?: string | null
          pages_checked?: number
          position?: number | null
          position_change?: number | null
          previous_position?: number | null
          ranking_url?: string | null
          result_domain?: string | null
          result_page_number?: number | null
          result_position_on_page?: number | null
          result_snippet?: string | null
          result_title?: string | null
          search_engine?: string
          synced_at?: string
          website_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_runs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "extension_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_runs_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_runs_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_runs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_reports: {
        Row: {
          config: Json
          created_at: string
          created_by: string
          id: string
          token: string
          workspace_id: string
        }
        Insert: {
          config: Json
          created_at?: string
          created_by: string
          id?: string
          token: string
          workspace_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string
          id?: string
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_reports_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      websites: {
        Row: {
          created_at: string
          domain: string
          id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "websites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      global_workspace_id: { Args: never; Returns: string }
      is_workspace_member: { Args: { _ws: string }; Returns: boolean }
      join_workspace: { Args: { invite_code: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
