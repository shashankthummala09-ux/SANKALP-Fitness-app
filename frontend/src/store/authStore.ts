import { create } from 'zustand';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  createdAt?: string;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => Promise<void>;
  updateUserCity: (city: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,

  login: (user, token) => {
    localStorage.setItem('fitfinder_token', token);
    localStorage.setItem('fitfinder_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('fitfinder_token');
    localStorage.removeItem('fitfinder_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const token = localStorage.getItem('fitfinder_token');
      const userStr = localStorage.getItem('fitfinder_user');
      
      if (token && userStr) {
        // Sync with API to verify token remains valid on reload
        try {
          const res = await api.get('/api/auth/me');
          if (res.data && res.data.user) {
            set({ 
              user: {
                id: res.data.user.id,
                name: res.data.user.name,
                email: res.data.user.email,
                city: res.data.user.city,
                createdAt: res.data.user.createdAt,
                isAdmin: res.data.user.isAdmin
              }, 
              token, 
              isAuthenticated: true 
            });
          }
        } catch (e) {
          // Token is invalid/expired
          localStorage.removeItem('fitfinder_token');
          localStorage.removeItem('fitfinder_user');
          set({ user: null, token: null, isAuthenticated: false });
        }
      }
    } catch (error) {
      console.error('Error initializing auth store:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateUserCity: (city) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, city };
      localStorage.setItem('fitfinder_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  }
}));
