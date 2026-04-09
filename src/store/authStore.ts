import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  emailVerified: boolean | null;
  name: string | null;
  setAuth: (data: {
    userId: string;
    email: string;
    emailVerified: boolean;
    name?: string;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  userId: null,
  email: null,
  emailVerified: null,
  name: null,
  setAuth: ({ userId, email, emailVerified, name }): void =>
    set({
      isAuthenticated: true,
      userId,
      email,
      emailVerified,
      name: name ?? null,
    }),
  clearAuth: (): void =>
    set({
      isAuthenticated: false,
      userId: null,
      email: null,
      emailVerified: null,
      name: null,
    }),
}));
