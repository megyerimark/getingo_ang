export interface AdminStats {
  summary: {
    total_users: number;
    students: number;
    admins: number;
    banned_users: number;
    total_lessons: number;
    total_projects: number;
    total_quizzes: number;
    total_categories: number;
    total_notes: number;
    total_favorites: number;
    completed_lessons: number;
    completed_quizzes: number;
  };
  growth: {
    users_today: number;
    users_this_week: number;
    users_this_month: number;
  };
  performance: {
    lesson_completion_rate: number;
    quiz_completion_rate: number;
    engagement_score: number;
  };
  top_categories: {
    id: number;
    name: string;
    lessons_count: number;
  }[];
  recent_users: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
  }[];
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
  is_banned: boolean;
  created_at: string;
}

export interface AdminLesson {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  content: string;
  example_code?: string | null;
  example_html?: string | null;
  example_css?: string | null;
  example_javascript?: string | null;
}

export interface AdminQuiz {
  id: number;
  lesson_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
}

export interface AdminExercise {
  id: number;
  category_id: number;
  title: string;
  description: string;
  difficulty: string;
  solution?: string | null;
}

export interface AdminProject {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimated_time: number;
  solution?: string | null;
}

export interface AuditLog {
  id: number;
  action: string;
  user_id?: number | null;
  ip_address?: string | null;
  created_at: string;
}