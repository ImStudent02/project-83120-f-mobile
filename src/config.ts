// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://10.139.49.56:8000'  // Your WiFi IP
  : 'https://your-production-server.com';

// For iOS simulator, use 'http://localhost:8000'
// For physical device, use your computer's IP like 'http://192.168.x.x:8000'

export const ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  UPDATE_PGP_KEY: '/auth/pgp-key',
  
  // Users
  SEARCH_USERS: '/users/search',
  GET_USER: '/users',
  
  // Signaling
  SEND_SIGNAL: '/signaling/send',
  POLL_SIGNALS: '/signaling/poll',
  CLEAR_SIGNALS: '/signaling/clear',
  ICE_SERVERS: '/signaling/ice-servers',
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USERNAME: 'username',
  PGP_PRIVATE_KEY: 'pgp_private_key',
  PGP_PUBLIC_KEY: 'pgp_public_key',
};

// Crypto settings
export const CRYPTO_CONFIG = {
  PGP_KEY_SIZE: 4096,
  PGP_KEY_TYPE: 'rsa',
  AES_KEY_LENGTH: 256,
};
