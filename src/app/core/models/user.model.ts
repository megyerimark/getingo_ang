export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: 'student' | 'admin';
  is_banned: boolean;
  xp_points: number;
  current_streak: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface MeResponse {
  user: User;
}
