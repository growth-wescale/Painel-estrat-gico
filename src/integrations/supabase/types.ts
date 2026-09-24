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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          blocks: Json
          created_at: string
          facts: Json
          id: string
          iframe_url: string | null
          is_visible: boolean
          maturidade: number
          nome: string
          oneliner: string
          position: number
          prot: string
          seg: string
          slug: string
          sub: string
          theme: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          created_at?: string
          facts?: Json
          id?: string
          iframe_url?: string | null
          is_visible?: boolean
          maturidade?: number
          nome: string
          oneliner?: string
          position?: number
          prot?: string
          seg?: string
          slug: string
          sub?: string
          theme?: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          created_at?: string
          facts?: Json
          id?: string
          iframe_url?: string | null
          is_visible?: boolean
          maturidade?: number
          nome?: string
          oneliner?: string
          position?: number
          prot?: string
          seg?: string
          slug?: string
          sub?: string
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          brand_id: string
          created_at: string
          descricao: string
          id: string
          iframe_url: string | null
          is_visible: boolean
          nome: string
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          descricao?: string
          id?: string
          iframe_url?: string | null
          is_visible?: boolean
          nome: string
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          descricao?: string
          id?: string
          iframe_url?: string | null
          is_visible?: boolean
          nome?: string
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_events: {
        Row: {
          brand_slug: string
          created_at: string
          created_by: string | null
          custo: string
          data_evento: string
          formato: string
          grupo: string
          id: string
          link: string
          nome: string
          notas: string
          oferta: string
          periodicidade: string
          position: number
          publico: string
          updated_at: string
        }
        Insert: {
          brand_slug: string
          created_at?: string
          created_by?: string | null
          custo?: string
          data_evento?: string
          formato?: string
          grupo?: string
          id?: string
          link?: string
          nome: string
          notas?: string
          oferta?: string
          periodicidade?: string
          position?: number
          publico?: string
          updated_at?: string
        }
        Update: {
          brand_slug?: string
          created_at?: string
          created_by?: string | null
          custo?: string
          data_evento?: string
          formato?: string
          grupo?: string
          id?: string
          link?: string
          nome?: string
          notas?: string
          oferta?: string
          periodicidade?: string
          position?: number
          publico?: string
          updated_at?: string
        }
        Relationships: []
      }
      panel_access: {
        Row: {
          brand_slug: string | null
          created_at: string
          email: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          brand_slug?: string | null
          created_at?: string
          email: string
          id?: string
          role: string
          updated_at?: string
        }
        Update: {
          brand_slug?: string | null
          created_at?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      pauta_access: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          category_id: string
          created_at: string
          html: string
          id: string
          position: number
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          html?: string
          id?: string
          position?: number
          status?: string
          titulo?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          html?: string
          id?: string
          position?: number
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategies_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_allowed: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_allowed_email: { Args: { _email: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
