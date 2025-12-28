/**
 * Auth Store using Zustand
 * Manages authentication state across the app
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { pgpService } from '../services/crypto';
import { STORAGE_KEYS } from '../config';
import type { AuthState, LoginRequest, RegisterRequest } from '../types';

interface AuthStore extends AuthState {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  register: (data: Omit<RegisterRequest, 'pgp_public_key'> & { passphrase: string }) => Promise<void>;
  login: (data: LoginRequest & { passphrase: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  token: null,
  username: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Initialize auth state on app start
  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
      
      if (token && username) {
        set({
          token,
          username,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false, error: 'Failed to initialize auth' });
    }
  },

  // Register new user
  register: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      // Generate PGP keypair on client (passphrase derived from email+birthday)
      const { publicKey } = await pgpService.generateKeyPair(
        data.username,
        data.email,
        data.passphrase
      );

      // Register with server (upload public key + birthday)
      const response = await api.register({
        username: data.username,
        email: data.email,
        birthday: data.birthday,
        password: data.password,
        pgp_public_key: publicKey,
      });

      set({
        token: response.access_token,
        username: response.username,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Registration failed',
      });
      throw error;
    }
  },

  // Login existing user
  login: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      // Login to server
      const response = await api.login({
        username: data.username,
        password: data.password,
      });

      // Check if we have stored PGP keys
      const hasKeys = await pgpService.hasKeyPair();
      
      if (hasKeys) {
        // Load existing private key
        await pgpService.loadPrivateKey(data.passphrase);
      } else {
        // Reinstall case: generate new keypair and update server
        const { publicKey } = await pgpService.generateKeyPair(
          response.username,
          '', // email not needed for regeneration
          data.passphrase
        );
        await api.updatePGPKey(publicKey);
      }

      set({
        token: response.access_token,
        username: response.username,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Login failed',
      });
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.logout();
    } catch {
      // Continue logout even if server call fails
    }
    
    // Clear all auth data
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USERNAME,
    ]);
    
    set({
      token: null,
      username: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
