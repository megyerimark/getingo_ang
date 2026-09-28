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
  example_code: string | null;
}

export interface AdminExercise {
  id: number;
  category_id: number;
  title: string;
  description: string;
  difficulty: string;
  solution: string | null;
}

export interface AdminProject {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimated_time: number;
  solution: string | null;
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

export interface AdminStats {
  users: {
    total: number;
    admins: number;
    students: number;
    banned: number;
  };
  learning_stats: {
    lessons_completed: number;
    quizzes_passed: number;
  };
}

export interface AuditLog {
  id: number;
  actor_user_id: number | null;
  action: string;
  target_type: string | null;
  target_id: number | null;
  metadata?: unknown;
  created_at: string;
}