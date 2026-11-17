import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isLoggedIn: boolean;
  registeredUser: { username: string; password: string } | null;
  isLoadingSession: boolean;
  
  // Acciones
  checkSession: () => Promise<void>;
  register: (user: { username: string; password: string }) => Promise<boolean>;
  login: (user: { username: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  registeredUser: null,
  isLoadingSession: true,

  checkSession: async () => {
    try {
      const storedLogin = await AsyncStorage.getItem('is_logged_in');
      const storedUser = await AsyncStorage.getItem('registered_user');
      
      set({
        isLoggedIn: storedLogin === 'true',
        registeredUser: storedUser ? JSON.parse(storedUser) : null,
        isLoadingSession: false,
      });
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      set({ isLoadingSession: false });
    }
  },

  register: async (userData) => {
    try {
      await AsyncStorage.setItem('registered_user', JSON.stringify(userData));
      set({ registeredUser: userData });
      return true;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return false;
    }
  },

  login: async ({ username, password }) => {
    try {
      const storedUser = await AsyncStorage.getItem('registered_user');
      if (!storedUser) return false;

      const { username: savedUser, password: savedPassword } = JSON.parse(storedUser);

      if (username === savedUser && password === savedPassword) {
        await AsyncStorage.setItem('is_logged_in', 'true');
        set({ isLoggedIn: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.setItem('is_logged_in', 'false');
      set({ isLoggedIn: false });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  },
}));