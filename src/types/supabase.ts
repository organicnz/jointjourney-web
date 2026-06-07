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
      audio_files: {
        Row: {
          bit_rate: number | null
          channel_layout: string | null
          channels: number | null
          codec: string | null
          created_at: string | null
          duration: number
          episode_id: string | null
          filename: string
          id: string
          library_item_id: string
          mime_type: string
          size: number
          storage_path: string
          track_index: number
        }
        Insert: {
          bit_rate?: number | null
          channel_layout?: string | null
          channels?: number | null
          codec?: string | null
          created_at?: string | null
          duration: number
          episode_id?: string | null
          filename: string
          id?: string
          library_item_id: string
          mime_type: string
          size: number
          storage_path: string
          track_index?: number
        }
        Update: {
          bit_rate?: number | null
          channel_layout?: string | null
          channels?: number | null
          codec?: string | null
          created_at?: string | null
          duration?: number
          episode_id?: string | null
          filename?: string
          id?: string
          library_item_id?: string
          mime_type?: string
          size?: number
          storage_path?: string
          track_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "audio_files_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "podcast_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_files_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          asin: string | null
          created_at: string | null
          description: string | null
          id: string
          image_path: string | null
          library_id: string
          name: string
          name_lf: string | null
          updated_at: string | null
        }
        Insert: {
          asin?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_path?: string | null
          library_id: string
          name: string
          name_lf?: string | null
          updated_at?: string | null
        }
        Update: {
          asin?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_path?: string | null
          library_id?: string
          name?: string
          name_lf?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "authors_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      book_authors: {
        Row: {
          author_id: string
          book_id: string
        }
        Insert: {
          author_id: string
          book_id: string
        }
        Update: {
          author_id?: string
          book_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_authors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      book_narrators: {
        Row: {
          book_id: string
          narrator_id: string
        }
        Insert: {
          book_id: string
          narrator_id: string
        }
        Update: {
          book_id?: string
          narrator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_narrators_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_narrators_narrator_id_fkey"
            columns: ["narrator_id"]
            isOneToOne: false
            referencedRelation: "narrators"
            referencedColumns: ["id"]
          },
        ]
      }
      book_series: {
        Row: {
          book_id: string
          sequence: string | null
          series_id: string
        }
        Insert: {
          book_id: string
          sequence?: string | null
          series_id: string
        }
        Update: {
          book_id?: string
          sequence?: string | null
          series_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_series_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_series_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string | null
          id: string
          library_item_id: string
          time_pos: number
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          library_item_id: string
          time_pos: number
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          library_item_id?: string
          time_pos?: number
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          audio_file_id: string | null
          chapter_index: number
          end_time: number
          id: string
          library_item_id: string
          start_time: number
          title: string
        }
        Insert: {
          audio_file_id?: string | null
          chapter_index: number
          end_time: number
          id?: string
          library_item_id: string
          start_time: number
          title: string
        }
        Update: {
          audio_file_id?: string | null
          chapter_index?: number
          end_time?: number
          id?: string
          library_item_id?: string
          start_time?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_audio_file_id_fkey"
            columns: ["audio_file_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          book_id: string
          collection_id: string
          display_order: number
        }
        Insert: {
          book_id: string
          collection_id: string
          display_order?: number
        }
        Update: {
          book_id?: string
          collection_id?: string
          display_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          library_id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          library_id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          library_id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      libraries: {
        Row: {
          created_at: string | null
          display_order: number
          icon: string
          id: string
          media_type: string
          name: string
          settings: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          icon?: string
          id?: string
          media_type: string
          name: string
          settings?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          icon?: string
          id?: string
          media_type?: string
          name?: string
          settings?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      library_items: {
        Row: {
          abridged: boolean | null
          added_at: string | null
          asin: string | null
          auto_download_episodes: boolean | null
          auto_download_schedule: string | null
          cover_path: string | null
          description: string | null
          duration: number | null
          embedding: string | null
          explicit: boolean
          feed_url: string | null
          genres: string[]
          id: string
          image_url: string | null
          is_missing: boolean
          isbn: string | null
          itunes_id: string | null
          language: string | null
          last_storage_check: string | null
          library_id: string
          max_episodes_to_keep: number | null
          media_type: string
          num_files: number | null
          published_date: string | null
          published_year: string | null
          publisher: string | null
          size: number | null
          subtitle: string | null
          tags: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          abridged?: boolean | null
          added_at?: string | null
          asin?: string | null
          auto_download_episodes?: boolean | null
          auto_download_schedule?: string | null
          cover_path?: string | null
          description?: string | null
          duration?: number | null
          embedding?: string | null
          explicit?: boolean
          feed_url?: string | null
          genres?: string[]
          id?: string
          image_url?: string | null
          is_missing?: boolean
          isbn?: string | null
          itunes_id?: string | null
          language?: string | null
          last_storage_check?: string | null
          library_id: string
          max_episodes_to_keep?: number | null
          media_type: string
          num_files?: number | null
          published_date?: string | null
          published_year?: string | null
          publisher?: string | null
          size?: number | null
          subtitle?: string | null
          tags?: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          abridged?: boolean | null
          added_at?: string | null
          asin?: string | null
          auto_download_episodes?: boolean | null
          auto_download_schedule?: string | null
          cover_path?: string | null
          description?: string | null
          duration?: number | null
          embedding?: string | null
          explicit?: boolean
          feed_url?: string | null
          genres?: string[]
          id?: string
          image_url?: string | null
          is_missing?: boolean
          isbn?: string | null
          itunes_id?: string | null
          language?: string | null
          last_storage_check?: string | null
          library_id?: string
          max_episodes_to_keep?: number | null
          media_type?: string
          num_files?: number | null
          published_date?: string | null
          published_year?: string | null
          publisher?: string | null
          size?: number | null
          subtitle?: string | null
          tags?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_items_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      media_progress: {
        Row: {
          current_time_pos: number
          duration: number | null
          episode_id: string | null
          id: string
          is_finished: boolean
          last_update: string | null
          library_item_id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          current_time_pos?: number
          duration?: number | null
          episode_id?: string | null
          id?: string
          is_finished?: boolean
          last_update?: string | null
          library_item_id: string
          progress?: number | null
          user_id: string
        }
        Update: {
          current_time_pos?: number
          duration?: number | null
          episode_id?: string | null
          id?: string
          is_finished?: boolean
          last_update?: string | null
          library_item_id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_progress_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "podcast_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_progress_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      narrators: {
        Row: {
          id: string
          library_id: string
          name: string
        }
        Insert: {
          id?: string
          library_id: string
          name: string
        }
        Update: {
          id?: string
          library_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "narrators_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_items: {
        Row: {
          display_order: number
          episode_id: string | null
          id: string
          library_item_id: string
          playlist_id: string
        }
        Insert: {
          display_order?: number
          episode_id?: string | null
          id?: string
          library_item_id: string
          playlist_id: string
        }
        Update: {
          display_order?: number
          episode_id?: string | null
          id?: string
          library_item_id?: string
          playlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "podcast_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          library_id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          library_id: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          library_id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_episodes: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          enclosure_type: string | null
          enclosure_url: string | null
          episode: string | null
          episode_index: number | null
          episode_type: string | null
          guid: string | null
          id: string
          library_item_id: string
          pub_date: string | null
          published_at: string | null
          season: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          enclosure_type?: string | null
          enclosure_url?: string | null
          episode?: string | null
          episode_index?: number | null
          episode_type?: string | null
          guid?: string | null
          id?: string
          library_item_id: string
          pub_date?: string | null
          published_at?: string | null
          season?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          enclosure_type?: string | null
          enclosure_url?: string | null
          episode?: string | null
          episode_index?: number | null
          episode_type?: string | null
          guid?: string | null
          id?: string
          library_item_id?: string
          pub_date?: string | null
          published_at?: string | null
          season?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_episodes_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          default_library_id: string | null
          id: string
          language: string
          preferences: Json | null
          theme: string
          updated_at: string | null
          user_type: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          default_library_id?: string | null
          id: string
          language?: string
          preferences?: Json | null
          theme?: string
          updated_at?: string | null
          user_type?: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          default_library_id?: string | null
          id?: string
          language?: string
          preferences?: Json | null
          theme?: string
          updated_at?: string | null
          user_type?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_library_id_fkey"
            columns: ["default_library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          cover_path: string | null
          created_at: string | null
          description: string | null
          id: string
          library_id: string
          name: string
          name_ignore_prefix: string | null
          updated_at: string | null
        }
        Insert: {
          cover_path?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          library_id: string
          name: string
          name_ignore_prefix?: string | null
          updated_at?: string | null
        }
        Update: {
          cover_path?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          library_id?: string
          name?: string
          name_ignore_prefix?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "series_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_library_items: {
        Args: { item_id: string; match_count: number; match_threshold: number }
        Returns: {
          id: string
          similarity: number
        }[]
      }
      search_library_items: {
        Args: { p_library_id: string; p_limit?: number; p_query: string }
        Returns: {
          author_names: string[]
          cover_path: string
          id: string
          media_type: string
          rank: number
          series_names: string[]
          title: string
        }[]
      }
      search_library_items_by_embedding: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          id: string
          similarity: number
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
