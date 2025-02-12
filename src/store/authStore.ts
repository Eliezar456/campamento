import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentLeader: string | null;
  login: (leaderName: string) => boolean;
  adminLogin: (password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAdmin: false,
  currentLeader: null,
  login: (leaderName) => {
    set({ isAuthenticated: true, isAdmin: false, currentLeader: leaderName });
    return true;
  },
  adminLogin: (password) => {
    if (password === 'admin') {
      set({ isAuthenticated: true, isAdmin: true, currentLeader: null });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false, isAdmin: false, currentLeader: null }),
}));