export interface Lesson {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  content: string;
  example_code: string | null;
  created_at?: string;
  updated_at?: string;
}