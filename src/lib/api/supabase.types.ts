export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      events: {
        Row: {
          completed: boolean | null;
          created_at: string;
          creator_id: string;
          id: number;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          completed?: boolean | null;
          created_at?: string;
          creator_id: string;
          id?: number;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          completed?: boolean | null;
          created_at?: string;
          creator_id?: string;
          id?: number;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      records: {
        Row: {
          completed: boolean | null;
          count: number | null;
          created_at: string;
          creator_id: string;
          event_id: number;
          id: number;
          updated_at: string | null;
        };
        Insert: {
          completed?: boolean | null;
          count?: number | null;
          created_at?: string;
          creator_id: string;
          event_id: number;
          id?: number;
          updated_at?: string | null;
        };
        Update: {
          completed?: boolean | null;
          count?: number | null;
          created_at?: string;
          creator_id?: string;
          event_id?: number;
          id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "records_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      stories: {
        Row: {
          count: number;
          created_at: string;
          creator_id: string;
          current_task_id: number | null;
          id: number;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          count: number;
          created_at?: string;
          creator_id: string;
          current_task_id?: number | null;
          id?: number;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          count?: number;
          created_at?: string;
          creator_id?: string;
          current_task_id?: number | null;
          id?: number;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stories_current_task_id_fkey";
            columns: ["current_task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          completed: boolean;
          count: number;
          created_at: string;
          id: number;
          story_id: number;
          updated_at: string | null;
        };
        Insert: {
          completed?: boolean;
          count: number;
          created_at?: string;
          id?: number;
          story_id: number;
          updated_at?: string | null;
        };
        Update: {
          completed?: boolean;
          count?: number;
          created_at?: string;
          id?: number;
          story_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "stories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  stories: {
    Tables: {
      stories: {
        Row: {
          count: number;
          created_at: string;
          creator_id: string;
          current_task_id: number | null;
          id: number;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          count: number;
          created_at?: string;
          creator_id: string;
          current_task_id?: number | null;
          id?: number;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          count?: number;
          created_at?: string;
          creator_id?: string;
          current_task_id?: number | null;
          id?: number;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          completed: boolean;
          count: number;
          created_at: string;
          creator_id: string;
          id: number;
          story_id: number;
          updated_at: string | null;
        };
        Insert: {
          completed?: boolean;
          count: number;
          created_at?: string;
          creator_id: string;
          id?: number;
          story_id: number;
          updated_at?: string | null;
        };
        Update: {
          completed?: boolean;
          count?: number;
          created_at?: string;
          creator_id?: string;
          id?: number;
          story_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "stories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  stories: {
    Enums: {},
  },
} as const;
