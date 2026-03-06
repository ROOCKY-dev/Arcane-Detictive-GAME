/**
 * User and authentication type definitions.
 */

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: string;
  avatarUrl: string | null;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  role: UserRole;
}
