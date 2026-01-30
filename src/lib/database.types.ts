export type Database = {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      columns: {
        Row: {
          id: string;
          board_id: string;
          title: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          title: string;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          title?: string;
          position?: number;
          created_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          column_id: string;
          board_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          column_id: string;
          board_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          position: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          column_id?: string;
          board_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      card_history: {
        Row: {
          id: string;
          card_id: string;
          user_id: string;
          user_email: string;
          action: string;
          from_column_id: string | null;
          to_column_id: string | null;
          changes: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          user_id: string;
          user_email: string;
          action: string;
          from_column_id?: string | null;
          to_column_id?: string | null;
          changes?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          user_id?: string;
          user_email?: string;
          action?: string;
          from_column_id?: string | null;
          to_column_id?: string | null;
          changes?: Record<string, any> | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
