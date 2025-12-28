/**
 * PGP Crypto Service (Mock for Expo Go)
 * 
 * Real implementation requires native modules.
 * This mock allows testing the UI without native dependencies.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, CRYPTO_CONFIG } from '../../config';

export interface PGPKeyPair {
  publicKey: string;
  privateKey: string;
}

class PGPService {
  private privateKey: string | null = null;

  /**
   * Generate new PGP keypair (MOCK)
   */
  async generateKeyPair(username: string, email: string, passphrase: string): Promise<PGPKeyPair> {
    // Mock keypair for testing
    const mockPublicKey = `-----BEGIN PGP PUBLIC KEY-----
mock-public-key-for-${username}
-----END PGP PUBLIC KEY-----`;
    
    const mockPrivateKey = `-----BEGIN PGP PRIVATE KEY-----
mock-private-key-for-${username}
-----END PGP PRIVATE KEY-----`;

    // Store in AsyncStorage (not secure, just for testing)
    await AsyncStorage.setItem(STORAGE_KEYS.PGP_PRIVATE_KEY, mockPrivateKey);
    await AsyncStorage.setItem(STORAGE_KEYS.PGP_PUBLIC_KEY, mockPublicKey);

    this.privateKey = mockPrivateKey;

    return { publicKey: mockPublicKey, privateKey: mockPrivateKey };
  }

  /**
   * Load existing private key
   */
  async loadPrivateKey(passphrase: string): Promise<boolean> {
    try {
      const key = await AsyncStorage.getItem(STORAGE_KEYS.PGP_PRIVATE_KEY);
      if (key) {
        this.privateKey = key;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load PGP private key:', error);
      return false;
    }
  }

  /**
   * Check if we have a stored keypair
   */
  async hasKeyPair(): Promise<boolean> {
    const key = await AsyncStorage.getItem(STORAGE_KEYS.PGP_PRIVATE_KEY);
    return !!key;
  }

  /**
   * Get stored public key
   */
  async getPublicKey(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.PGP_PUBLIC_KEY);
  }

  /**
   * Encrypt data (MOCK - just base64 encode)
   */
  async encrypt(data: string, recipientPublicKeyArmored: string): Promise<string> {
    // Mock encryption - just base64 for testing
    return Buffer.from(data).toString('base64');
  }

  /**
   * Decrypt data (MOCK - just base64 decode)
   */
  async decrypt(encryptedData: string): Promise<string> {
    if (!this.privateKey) {
      throw new Error('Private key not loaded');
    }
    // Mock decryption
    return Buffer.from(encryptedData, 'base64').toString('utf8');
  }

  /**
   * Clear keys
   */
  async clearKeys(): Promise<void> {
    this.privateKey = null;
    await AsyncStorage.removeItem(STORAGE_KEYS.PGP_PRIVATE_KEY);
    await AsyncStorage.removeItem(STORAGE_KEYS.PGP_PUBLIC_KEY);
  }

  /**
   * Check if private key is loaded
   */
  isReady(): boolean {
    return this.privateKey !== null;
  }
}

export const pgpService = new PGPService();
