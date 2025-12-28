import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ENDPOINTS, STORAGE_KEYS } from '../config';
import type { 
  TokenResponse, 
  LoginRequest, 
  RegisterRequest, 
  User,
  SignalSendRequest,
  SignalMessage,
  ICEServersResponse
} from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>(ENDPOINTS.REGISTER, data);
    await this.saveAuthData(response.data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>(ENDPOINTS.LOGIN, data);
    await this.saveAuthData(response.data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post(ENDPOINTS.LOGOUT);
    await this.clearAuthData();
  }

  async updatePGPKey(pgp_public_key: string): Promise<void> {
    await this.client.put(ENDPOINTS.UPDATE_PGP_KEY, { pgp_public_key });
  }

  // User endpoints
  async searchUsers(query: string): Promise<User[]> {
    const response = await this.client.get<User[]>(ENDPOINTS.SEARCH_USERS, {
      params: { q: query },
    });
    return response.data;
  }

  async getUser(username: string): Promise<User> {
    const response = await this.client.get<User>(`${ENDPOINTS.GET_USER}/${username}`);
    return response.data;
  }

  // Signaling endpoints
  async sendSignal(data: SignalSendRequest): Promise<void> {
    await this.client.post(ENDPOINTS.SEND_SIGNAL, data);
  }

  async pollSignals(): Promise<SignalMessage[]> {
    const response = await this.client.get<{ messages: SignalMessage[] }>(ENDPOINTS.POLL_SIGNALS);
    return response.data.messages;
  }

  async clearSignals(): Promise<number> {
    const response = await this.client.delete<{ deleted: number }>(ENDPOINTS.CLEAR_SIGNALS);
    return response.data.deleted;
  }

  async getICEServers(): Promise<ICEServersResponse> {
    const response = await this.client.get<ICEServersResponse>(ENDPOINTS.ICE_SERVERS);
    return response.data;
  }

  // Auth data management
  private async saveAuthData(data: TokenResponse): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, data.access_token],
      [STORAGE_KEYS.USERNAME, data.username],
    ]);
  }

  private async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USERNAME,
    ]);
  }

  async getStoredUsername(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  }

  // Connection endpoints
  async sendConnectionRequest(toUser: string): Promise<any> {
    const response = await this.client.post('/connections/request', { to_user: toUser });
    return response.data;
  }

  async getPendingRequests(): Promise<any[]> {
    const response = await this.client.get<any[]>('/connections/pending');
    return response.data;
  }

  async respondToRequest(requestId: string, action: 'accept' | 'decline'): Promise<any> {
    const response = await this.client.post('/connections/respond', {
      request_id: requestId,
      action,
    });
    return response.data;
  }

  async getConnections(): Promise<any[]> {
    const response = await this.client.get<any[]>('/connections/list');
    return response.data;
  }

  async removeConnection(username: string): Promise<void> {
    await this.client.delete(`/connections/${username}`);
  }

  // Password reset endpoints
  async forgotPassword(username: string): Promise<{ message: string; email_hint: string }> {
    const response = await this.client.post<{ message: string; email_hint: string }>(
      '/auth/forgot-password',
      { username }
    );
    return response.data;
  }

  async resetPassword(username: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      '/auth/reset-password',
      { username, otp, new_password: newPassword }
    );
    return response.data;
  }
}

export const api = new ApiService();
