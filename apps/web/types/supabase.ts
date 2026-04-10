export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      color_lab_photos: {
        Row: {
          id: string;
          src: string | null;
          recipe_id: string | null;
          storage_path: string | null;
          sort_order: number | null;
          caption: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          src?: string | null;
          recipe_id?: string | null;
          storage_path?: string | null;
          sort_order?: number | null;
          caption: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          src?: string | null;
          recipe_id?: string | null;
          storage_path?: string | null;
          sort_order?: number | null;
          caption?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "color_lab_photos_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "color_lab_recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      color_lab_recipes: {
        Row: {
          id: string;
          name: string;
          base_profile: string;
          author: string;
          tags: string[] | null;
          camera_lines: string[] | null;
          compatibility_notes: string | null;
          color: Json | null;
          settings: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          base_profile: string;
          author: string;
          tags?: string[] | null;
          camera_lines?: string[] | null;
          compatibility_notes?: string | null;
          color?: Json | null;
          settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          base_profile?: string;
          author?: string;
          tags?: string[] | null;
          camera_lines?: string[] | null;
          compatibility_notes?: string | null;
          color?: Json | null;
          settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      wiki_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      wiki_products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category_id: string | null;
          description: string | null;
          short_description: string | null;
          main_image: string | null;
          subcategory: string | null;
          price_vnd: number | null;
          buy_link: string | null;
          gallery: string[] | null;
          specs: Json | null;
          is_published: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          author_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category_id?: string | null;
          description?: string | null;
          short_description?: string | null;
          main_image?: string | null;
          subcategory?: string | null;
          price_vnd?: number | null;
          buy_link?: string | null;
          gallery?: string[] | null;
          specs?: Json | null;
          is_published?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          author_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category_id?: string | null;
          description?: string | null;
          short_description?: string | null;
          main_image?: string | null;
          subcategory?: string | null;
          price_vnd?: number | null;
          buy_link?: string | null;
          gallery?: string[] | null;
          specs?: Json | null;
          is_published?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          author_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "wiki_products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "wiki_categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

type PublicSchema = Database["public"];

export type TableRow<TableName extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][TableName]["Row"];
