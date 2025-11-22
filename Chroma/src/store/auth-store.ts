import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '@devvai/devv-code-backend';

interface User {
  uid: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDevMode: boolean; // Track if using master password bypass
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  checkAuth: () => void;
  isSessionValid: () => boolean;
  setDevMode: (isDevMode: boolean) => void;
  switchToRealAuth: () => Promise<void>; // Switch from dev mode to real authentication
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isDevMode: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setDevMode: (isDevMode) => set({ isDevMode }),

      logout: async () => {
        try {
          const state = get();
          if (!state.isDevMode) {
            await auth.logout();
          }
          // Clear dev mode session
          localStorage.removeItem('DEVV_CODE_SID');
          set({ user: null, isAuthenticated: false, isDevMode: false });
        } catch (error) {
          console.error('Logout failed:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
          console.error('Raw error:', error);
        }
      },

      checkAuth: () => {
        const sid = localStorage.getItem('DEVV_CODE_SID');
        if (!sid) {
          set({ user: null, isAuthenticated: false, isDevMode: false });
        }
      },
      
      // Validate session is still valid
      // In dev mode, mock session is always valid for UI testing
      isSessionValid: () => {
        const state = get();
        if (state.isDevMode) {
          return true; // Dev mode mock session is always valid for UI
        }
        const sid = localStorage.getItem('DEVV_CODE_SID');
        return !!sid;
      },

      // Switch from dev mode to real authentication
      // This should be called AFTER navigation to /login starts
      switchToRealAuth: async () => {
        try {
          const state = get();
          console.log('[switchToRealAuth] Starting switch from dev mode to real auth');
          
          // Store email for convenience when switching
          if (state.user?.email) {
            localStorage.setItem('dev_mode_email', state.user.email);
            console.log('[switchToRealAuth] Stored email for login convenience:', state.user.email);
          }
          
          // Clear dev mode session
          localStorage.removeItem('DEVV_CODE_SID');
          console.log('[switchToRealAuth] Cleared mock session ID');
          
          // Update state - this will persist to localStorage via Zustand middleware
          set({ user: null, isAuthenticated: false, isDevMode: false });
          console.log('[switchToRealAuth] Cleared auth state and disabled dev mode');
          
          // Force a small delay to ensure persist middleware flushes
          await new Promise(resolve => setTimeout(resolve, 50));
          console.log('[switchToRealAuth] State persisted to storage');
        } catch (error) {
          console.error('[switchToRealAuth] Failed:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
          console.error('[switchToRealAuth] Raw error:', error);
          // Ensure state is cleared even if error occurs
          localStorage.removeItem('DEVV_CODE_SID');
          set({ user: null, isAuthenticated: false, isDevMode: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
