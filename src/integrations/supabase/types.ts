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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          church_id: string
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          action: string
          church_id: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          action?: string
          church_id?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          church_id: string
          contenu: string
          created_at: string
          date_evenement: string | null
          id: string
          image_url: string | null
          titre: string
          type: string
        }
        Insert: {
          church_id: string
          contenu: string
          created_at?: string
          date_evenement?: string | null
          id?: string
          image_url?: string | null
          titre: string
          type?: string
        }
        Update: {
          church_id?: string
          contenu?: string
          created_at?: string
          date_evenement?: string | null
          id?: string
          image_url?: string | null
          titre?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      attendances: {
        Row: {
          church_id: string
          created_at: string
          date_evenement: string
          id: string
          membre_id: string
          present: boolean
          type_evenement: string
        }
        Insert: {
          church_id: string
          created_at?: string
          date_evenement?: string
          id?: string
          membre_id: string
          present?: boolean
          type_evenement: string
        }
        Update: {
          church_id?: string
          created_at?: string
          date_evenement?: string
          id?: string
          membre_id?: string
          present?: boolean
          type_evenement?: string
        }
        Relationships: []
      }
      churches: {
        Row: {
          adresse: string | null
          code_eglise: string
          contact: string | null
          couverture_url: string | null
          created_at: string
          description: string | null
          email: string | null
          facebook: string | null
          id: string
          logo_url: string | null
          nom: string
          site_web: string | null
          verset_clef: string | null
          whatsapp: string | null
        }
        Insert: {
          adresse?: string | null
          code_eglise: string
          contact?: string | null
          couverture_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          logo_url?: string | null
          nom: string
          site_web?: string | null
          verset_clef?: string | null
          whatsapp?: string | null
        }
        Update: {
          adresse?: string | null
          code_eglise?: string
          contact?: string | null
          couverture_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          logo_url?: string | null
          nom?: string
          site_web?: string | null
          verset_clef?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          church_id: string
          created_at: string
          date_don: string
          id: string
          membre_id: string | null
          montant: number
          reference_transaction: string | null
          statut: string | null
          type_don: string
        }
        Insert: {
          church_id: string
          created_at?: string
          date_don?: string
          id?: string
          membre_id?: string | null
          montant: number
          reference_transaction?: string | null
          statut?: string | null
          type_don: string
        }
        Update: {
          church_id?: string
          created_at?: string
          date_don?: string
          id?: string
          membre_id?: string | null
          montant?: number
          reference_transaction?: string | null
          statut?: string | null
          type_don?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_chunks: {
        Row: {
          chunk_index: number
          church_id: string
          content: string
          created_at: string | null
          document_id: string
          embedding: string | null
          id: string
        }
        Insert: {
          chunk_index: number
          church_id: string
          content: string
          created_at?: string | null
          document_id: string
          embedding?: string | null
          id?: string
        }
        Update: {
          chunk_index?: number
          church_id?: string
          content?: string
          created_at?: string | null
          document_id?: string
          embedding?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_chunks_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "kb_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_documents: {
        Row: {
          church_id: string
          created_at: string | null
          id: string
          language: string | null
          source_type: string
          source_url: string | null
          title: string
        }
        Insert: {
          church_id: string
          created_at?: string | null
          id?: string
          language?: string | null
          source_type?: string
          source_url?: string | null
          title: string
        }
        Update: {
          church_id?: string
          created_at?: string | null
          id?: string
          language?: string | null
          source_type?: string
          source_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_documents_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_faq: {
        Row: {
          answer: string
          church_id: string
          created_at: string | null
          id: string
          question: string
          tags: string[] | null
        }
        Insert: {
          answer: string
          church_id: string
          created_at?: string | null
          id?: string
          question: string
          tags?: string[] | null
        }
        Update: {
          answer?: string
          church_id?: string
          created_at?: string | null
          id?: string
          question?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_faq_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          church_id: string
          created_at: string
          date_adhesion: string | null
          date_naissance: string | null
          email: string | null
          groupe_departement: string | null
          id: string
          nom: string
          prenom: string
          sexe: string | null
          statut: string | null
          telephone: string | null
          user_id: string | null
        }
        Insert: {
          church_id: string
          created_at?: string
          date_adhesion?: string | null
          date_naissance?: string | null
          email?: string | null
          groupe_departement?: string | null
          id?: string
          nom: string
          prenom: string
          sexe?: string | null
          statut?: string | null
          telephone?: string | null
          user_id?: string | null
        }
        Update: {
          church_id?: string
          created_at?: string
          date_adhesion?: string | null
          date_naissance?: string | null
          email?: string | null
          groupe_departement?: string | null
          id?: string
          nom?: string
          prenom?: string
          sexe?: string | null
          statut?: string | null
          telephone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          church_id: string
          created_at: string
          date_demande: string
          id: string
          membre_id: string | null
          texte: string
        }
        Insert: {
          church_id: string
          created_at?: string
          date_demande?: string
          id?: string
          membre_id?: string | null
          texte: string
        }
        Update: {
          church_id?: string
          created_at?: string
          date_demande?: string
          id?: string
          membre_id?: string | null
          texte?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_requests_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_requests_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      spiritual_history: {
        Row: {
          church_id: string
          created_at: string
          date_evenement: string
          details: string | null
          id: string
          membre_id: string
          type_evenement: string
        }
        Insert: {
          church_id: string
          created_at?: string
          date_evenement: string
          details?: string | null
          id?: string
          membre_id: string
          type_evenement: string
        }
        Update: {
          church_id?: string
          created_at?: string
          date_evenement?: string
          details?: string | null
          id?: string
          membre_id?: string
          type_evenement?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          church_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          church_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          church_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_church_code: { Args: never; Returns: string }
      get_user_church_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _church_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_chunks: {
        Args: {
          filter_church_id: string
          match_count: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "operateur" | "fidele"
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
      app_role: ["admin", "operateur", "fidele"],
    },
  },
} as const
