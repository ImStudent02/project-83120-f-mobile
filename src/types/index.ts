// User types
export interface User {
  username: string;
  pgp_public_key: string;
  is_online: boolean;
}

// Auth types
export interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  birthday: string;  // DD/MM/YYYY
  password: string;
  pgp_public_key: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  username: string;
}

// Signaling types
export type SignalType = 'offer' | 'answer' | 'ice';

export interface SignalMessage {
  from_user: string;
  type: SignalType;
  encrypted_payload: string;
  timestamp: string;
}

export interface SignalSendRequest {
  to_user: string;
  type: SignalType;
  encrypted_payload: string;
}

// Chat types
export interface ChatMessage {
  id: string;           // timestamp-based ID
  peer_id: string;      // @username of chat partner
  direction: 'sent' | 'received';
  content: string;      // decrypted content for display
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

// P2P Connection types
// Note: RTCPeerConnection and RTCDataChannel come from react-native-webrtc
export interface PeerConnection {
  peer_id: string;
  connection: any;  // RTCPeerConnection from react-native-webrtc
  dataChannel: any | null;  // RTCDataChannel
  aesKey: any | null;  // Session key (stored in RAM only)
  status: 'connecting' | 'connected' | 'disconnected';
}

// ICE Server config
export interface ICEServersResponse {
  stun_servers: string[];
  turn_servers: {
    urls: string;
    username: string;
    credential: string;
  }[];
}
