/**
 * AES Crypto Service
 * 
 * - Generates random AES-256 session keys (RAM-only)
 * - Keys are NEVER stored on disk
 * - Keys destroyed on disconnect/app close
 * - Used for encrypting messages/files over WebRTC
 */

// Note: React Native doesn't have WebCrypto API
// Using a polyfill or native module would be needed
// This is a simplified implementation for the structure

import { Buffer } from 'buffer';

// We'll use a simple implementation; for production use react-native-crypto
export interface AESKey {
  key: Uint8Array;
  createdAt: number;
}

class AESService {
  // RAM-only storage for session keys per peer
  private sessionKeys: Map<string, AESKey> = new Map();

  /**
   * Generate new AES-256 session key for a peer connection
   * Key is stored only in RAM
   */
  generateSessionKey(peerId: string): Uint8Array {
    // Generate 256-bit (32 bytes) random key
    const key = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      key[i] = Math.floor(Math.random() * 256);
    }

    // Store in RAM only
    this.sessionKeys.set(peerId, {
      key,
      createdAt: Date.now(),
    });

    return key;
  }

  /**
   * Set session key received from peer (via PGP-encrypted signaling)
   */
  setSessionKey(peerId: string, keyBase64: string): void {
    const keyBuffer = Buffer.from(keyBase64, 'base64');
    const key = new Uint8Array(keyBuffer.length);
    for (let i = 0; i < keyBuffer.length; i++) {
      key[i] = keyBuffer[i];
    }
    this.sessionKeys.set(peerId, {
      key,
      createdAt: Date.now(),
    });
  }

  /**
   * Get session key for peer
   */
  getSessionKey(peerId: string): Uint8Array | null {
    const entry = this.sessionKeys.get(peerId);
    return entry ? entry.key : null;
  }

  /**
   * Check if we have a session key for peer
   */
  hasSessionKey(peerId: string): boolean {
    return this.sessionKeys.has(peerId);
  }

  /**
   * Export key as base64 for sending via signaling
   */
  exportKey(peerId: string): string | null {
    const key = this.getSessionKey(peerId);
    if (!key) return null;
    return Buffer.from(key).toString('base64');
  }

  /**
   * Encrypt message using AES-256-GCM
   * Returns: { iv: base64, ciphertext: base64, tag: base64 }
   */
  async encrypt(peerId: string, plaintext: string): Promise<{
    iv: string;
    ciphertext: string;
    tag: string;
  }> {
    const key = this.getSessionKey(peerId);
    if (!key) {
      throw new Error(`No session key for peer: ${peerId}`);
    }

    // Generate random IV (12 bytes for GCM)
    const iv = new Uint8Array(12);
    for (let i = 0; i < 12; i++) {
      iv[i] = Math.floor(Math.random() * 256);
    }

    // In production, use native crypto module
    // This is a placeholder structure
    const plaintextBytes = Buffer.from(plaintext, 'utf8');
    
    // TODO: Use actual AES-GCM implementation
    // For now, return placeholder
    return {
      iv: Buffer.from(iv).toString('base64'),
      ciphertext: plaintextBytes.toString('base64'), // Placeholder
      tag: Buffer.from(new Uint8Array(16)).toString('base64'), // Placeholder
    };
  }

  /**
   * Decrypt message using AES-256-GCM
   */
  async decrypt(peerId: string, data: {
    iv: string;
    ciphertext: string;
    tag: string;
  }): Promise<string> {
    const key = this.getSessionKey(peerId);
    if (!key) {
      throw new Error(`No session key for peer: ${peerId}`);
    }

    // TODO: Use actual AES-GCM implementation
    // For now, return placeholder
    return Buffer.from(data.ciphertext, 'base64').toString('utf8');
  }

  /**
   * Destroy session key for peer (on disconnect)
   */
  destroySessionKey(peerId: string): void {
    const entry = this.sessionKeys.get(peerId);
    if (entry) {
      // Zero out the key in memory
      entry.key.fill(0);
      this.sessionKeys.delete(peerId);
    }
  }

  /**
   * Destroy ALL session keys (on app close/logout)
   */
  destroyAllKeys(): void {
    for (const [peerId, entry] of this.sessionKeys) {
      entry.key.fill(0);
    }
    this.sessionKeys.clear();
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    return this.sessionKeys.size;
  }
}

export const aesService = new AESService();
