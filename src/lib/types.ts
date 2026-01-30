export interface Board {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface Card {
  id: string;
  column_id: string;
  board_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CardHistory {
  id: string;
  card_id: string;
  user_id: string;
  user_email: string;
  action: 'created' | 'moved' | 'updated' | 'deleted';
  from_column_id: string | null;
  to_column_id: string | null;
  changes: Record<string, any> | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}
