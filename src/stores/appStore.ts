/**
 * App Store - Global app state
 * Manages mode, active chats, connection requests
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppMode = 'online' | 'offline';

export interface ActiveChat {
  peerId: string;
  peerName: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  isConnected: boolean;
}

export interface ConnectionRequest {
  id: string;
  fromUser: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'declined';
}

export interface ChatMessage {
  id: string;
  peerId: string;
  direction: 'sent' | 'received';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface AppState {
  mode: AppMode;
  activeChats: ActiveChat[];
  pendingRequests: ConnectionRequest[];
  chatHistory: Record<string, ChatMessage[]>;
}

interface AppActions {
  setMode: (mode: AppMode) => void;
  addActiveChat: (chat: ActiveChat) => void;
  updateActiveChat: (peerId: string, updates: Partial<ActiveChat>) => void;
  removeActiveChat: (peerId: string) => void;
  addRequest: (request: ConnectionRequest) => void;
  updateRequest: (id: string, status: 'accepted' | 'declined') => void;
  clearRequests: () => void;
  addMessage: (peerId: string, message: ChatMessage) => void;
  getMessages: (peerId: string) => ChatMessage[];
  clearChatHistory: (peerId: string) => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

type AppStore = AppState & AppActions;

const STORAGE_KEY = 'app_store';

export const useAppStore = create<AppStore>()((set, get) => ({
  // Initial state
  mode: 'online',
  activeChats: [],
  pendingRequests: [],
  chatHistory: {},

  // Mode
  setMode: (mode) => {
    set({ mode });
    get().saveToStorage();
  },

  // Active chats
  addActiveChat: (chat) => {
    const current = get().activeChats;
    set({ activeChats: [...current.filter(c => c.peerId !== chat.peerId), chat] });
    get().saveToStorage();
  },

  updateActiveChat: (peerId, updates) => {
    const current = get().activeChats;
    set({
      activeChats: current.map(c => c.peerId === peerId ? { ...c, ...updates } : c),
    });
    get().saveToStorage();
  },

  removeActiveChat: (peerId) => {
    const current = get().activeChats;
    set({ activeChats: current.filter(c => c.peerId !== peerId) });
    get().saveToStorage();
  },

  // Connection requests
  addRequest: (request) => {
    const current = get().pendingRequests;
    set({ pendingRequests: [...current, request] });
  },

  updateRequest: (id, status) => {
    const current = get().pendingRequests;
    set({
      pendingRequests: current.map(r => r.id === id ? { ...r, status } : r),
    });
  },

  clearRequests: () => {
    set({ pendingRequests: [] });
  },

  // Chat history
  addMessage: (peerId, message) => {
    const current = get().chatHistory;
    const peerMessages = current[peerId] || [];
    set({
      chatHistory: {
        ...current,
        [peerId]: [...peerMessages, message],
      },
    });
    // Update active chat
    const chat = get().activeChats.find(c => c.peerId === peerId);
    get().updateActiveChat(peerId, {
      lastMessage: message.content,
      lastMessageTime: message.timestamp,
      unreadCount: message.direction === 'received'
        ? (chat?.unreadCount || 0) + 1
        : 0,
    });
    get().saveToStorage();
  },

  getMessages: (peerId) => {
    return get().chatHistory[peerId] || [];
  },

  clearChatHistory: (peerId) => {
    const current = get().chatHistory;
    const newHistory = { ...current };
    delete newHistory[peerId];
    set({ chatHistory: newHistory });
    get().saveToStorage();
  },

  // Persistence
  loadFromStorage: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({
          mode: parsed.mode || 'online',
          activeChats: parsed.activeChats || [],
          chatHistory: parsed.chatHistory || {},
        });
      }
    } catch (error) {
      console.error('Failed to load app store:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const state = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        mode: state.mode,
        activeChats: state.activeChats,
        chatHistory: state.chatHistory,
      }));
    } catch (error) {
      console.error('Failed to save app store:', error);
    }
  },
}));
