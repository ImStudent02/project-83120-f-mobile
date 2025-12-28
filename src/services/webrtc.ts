/**
 * WebRTC Connection Manager
 * 
 * Works in both browser (web) and React Native (Expo Go)
 * Uses signaling server for connection setup
 */

import { api } from './api';
import { pgpService } from './crypto/pgp';
import { aesService } from './crypto/aes';
import type { User, SignalMessage } from '../types';

// Import WebRTC from react-native-webrtc for native, use global for web
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed';

export interface WebRTCCallbacks {
  onStateChange: (peerId: string, state: ConnectionState) => void;
  onMessage: (peerId: string, message: string) => void;
  onError: (peerId: string, error: string) => void;
}

interface PeerConnection {
  pc: any; // RTCPeerConnection from react-native-webrtc
  dataChannel: any | null; // RTCDataChannel
  state: ConnectionState;
  pendingCandidates: any[]; // Queue ICE candidates until remote description is set
  hasRemoteDescription: boolean;
}

class WebRTCManager {
  private connections: Map<string, PeerConnection> = new Map();
  private callbacks: WebRTCCallbacks | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private currentUser: string | null = null;

  private iceServers: RTCIceServer[] = [
    // STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Free TURN from Metered (more reliable)
    {
      urls: 'turn:a.relay.metered.ca:80',
      username: 'e13b925c41e6c4d5a6c6f4b8',
      credential: 'CpvDLbTqHnKpO/IZ',
    },
    {
      urls: 'turn:a.relay.metered.ca:80?transport=tcp',
      username: 'e13b925c41e6c4d5a6c6f4b8',
      credential: 'CpvDLbTqHnKpO/IZ',
    },
    {
      urls: 'turn:a.relay.metered.ca:443',
      username: 'e13b925c41e6c4d5a6c6f4b8',
      credential: 'CpvDLbTqHnKpO/IZ',
    },
    {
      urls: 'turns:a.relay.metered.ca:443?transport=tcp',
      username: 'e13b925c41e6c4d5a6c6f4b8',
      credential: 'CpvDLbTqHnKpO/IZ',
    },
  ];

  /**
   * Initialize manager with callbacks
   */
  init(callbacks: WebRTCCallbacks, username: string) {
    this.callbacks = callbacks;
    this.currentUser = username;
    this.startPolling();
  }

  /**
   * Start connection to a peer (initiator)
   */
  async connect(peer: User): Promise<void> {
    const peerId = peer.username;
    console.log('Connecting to peer:', peerId);
    
    this.updateState(peerId, 'connecting');

    try {
      // Create peer connection (cast to any for react-native-webrtc compatibility)
      const pc: any = new RTCPeerConnection({ iceServers: this.iceServers });
      
      // Create data channel
      const dataChannel = pc.createDataChannel('chat', { ordered: true });
      this.setupDataChannel(peerId, dataChannel);

      // Store connection
      this.connections.set(peerId, {
        pc,
        dataChannel,
        state: 'connecting',
        pendingCandidates: [],
        hasRemoteDescription: false,
      });

      // Generate sessionkey for this peer
      aesService.generateSessionKey(peerId);

      // Handle ICE candidates
      pc.onicecandidate = async (event: any) => {
        if (event.candidate) {
          console.log('Sending ICE candidate');
          await this.sendSignal(peer, 'ice', JSON.stringify(event.candidate));
        } else {
          console.log('ICE gathering complete');
        }
      };

      // Handle ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'failed') {
          console.log('ICE connection failed - may need TURN relay');
          this.updateState(peerId, 'failed');
        }
      };

      // Handle connection state
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        this.handleConnectionState(peerId, pc.connectionState);
      };

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('Sending offer');

      // Send offer (with AES key for message encryption)
      const aesKey = aesService.exportKey(peerId) || '';
      await this.sendSignal(peer, 'offer', JSON.stringify({
        sdp: offer.sdp,
        type: offer.type,
        aesKey,
      }));

    } catch (error: any) {
      console.error('Connection error:', error);
      this.callbacks?.onError(peerId, error.message);
      this.updateState(peerId, 'failed');
    }
  }

  /**
   * Handle incoming signal
   */
  async handleSignal(signal: SignalMessage): Promise<void> {
    const peerId = signal.from_user;
    console.log('Received signal:', signal.type, 'from:', peerId);

    try {
      // Decrypt payload
      let payload: any;
      try {
        payload = JSON.parse(await pgpService.decrypt(signal.encrypted_payload));
      } catch {
        // If decryption fails, try parsing directly (for testing)
        payload = JSON.parse(signal.encrypted_payload);
      }

      if (signal.type === 'offer') {
        await this.handleOffer(peerId, payload);
      } else if (signal.type === 'answer') {
        await this.handleAnswer(peerId, payload);
      } else if (signal.type === 'ice') {
        await this.handleIceCandidate(peerId, payload);
      }
    } catch (error: any) {
      console.error('Failed to handle signal:', error);
    }
  }

  /**
   * Handle incoming offer (responder)
   */
  private async handleOffer(peerId: string, payload: any): Promise<void> {
    console.log('Handling offer from:', peerId);
    
    // Check for offer collision - if we already have a connection we initiated
    const existingConn = this.connections.get(peerId);
    if (existingConn) {
      // We already have a connection - this is a glare situation
      // Use polite peer logic: lower username loses, higher wins
      // The peer with "higher" username keeps their offer
      if (this.currentUser && this.currentUser > peerId) {
        console.log('Offer collision - we win (higher username), ignoring their offer');
        return; // Keep our offer, ignore theirs
      } else {
        console.log('Offer collision - they win (higher username), closing our connection');
        existingConn.pc.close();
        this.connections.delete(peerId);
      }
    }
    
    this.updateState(peerId, 'connecting');

    // Store received AES key
    if (payload.aesKey) {
      aesService.setSessionKey(peerId, payload.aesKey);
    }

    // Create peer connection (cast to any for react-native-webrtc compatibility)
    const pc: any = new RTCPeerConnection({ iceServers: this.iceServers });

    this.connections.set(peerId, {
      pc,
      dataChannel: null,
      state: 'connecting',
      pendingCandidates: [],
      hasRemoteDescription: false,
    });

    // Handle data channel from initiator
    pc.ondatachannel = (event: any) => {
      console.log('Data channel received');
      const conn = this.connections.get(peerId);
      if (conn) {
        conn.dataChannel = event.channel;
        this.setupDataChannel(peerId, event.channel);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = async (event: any) => {
      if (event.candidate) {
        const peer = await this.getPeerInfo(peerId);
        if (peer) {
          await this.sendSignal(peer, 'ice', JSON.stringify(event.candidate));
        }
      } else {
        console.log('ICE gathering complete (responder)');
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state (responder):', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        console.log('ICE connection failed - may need TURN relay');
        this.updateState(peerId, 'failed');
      } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log('ICE connected! Waiting for data channel...');
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state (responder):', pc.connectionState);
      this.handleConnectionState(peerId, pc.connectionState);
    };

    // Set remote description and create answer
    await pc.setRemoteDescription(new RTCSessionDescription({
      sdp: payload.sdp,
      type: payload.type,
    }));
    
    // Mark that we have remote description and process queued candidates
    const conn = this.connections.get(peerId);
    if (conn) {
      conn.hasRemoteDescription = true;
      await this.processPendingCandidates(peerId);
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Send answer
    console.log('Sending answer to:', peerId);
    const peer = await this.getPeerInfo(peerId);
    if (peer) {
      await this.sendSignal(peer, 'answer', JSON.stringify({
        sdp: answer.sdp,
        type: answer.type,
      }));
    }
  }

  /**
   * Handle incoming answer
   */
  private async handleAnswer(peerId: string, payload: any): Promise<void> {
    console.log('Handling answer from:', peerId);
    const conn = this.connections.get(peerId);
    if (!conn) {
      console.log('No connection found for answer, ignoring');
      return;
    }
    
    // Only accept answer if we haven't already set remote description
    // (prevents duplicate answer processing)
    if (conn.hasRemoteDescription) {
      console.log('Already have remote description, ignoring duplicate answer');
      return;
    }
    
    await conn.pc.setRemoteDescription(new RTCSessionDescription({
      sdp: payload.sdp,
      type: payload.type,
    }));
    conn.hasRemoteDescription = true;
    // Process any queued ICE candidates
    await this.processPendingCandidates(peerId);
  }

  /**
   * Handle ICE candidate
   */
  private async handleIceCandidate(peerId: string, candidate: any): Promise<void> {
    const conn = this.connections.get(peerId);
    if (!conn || !candidate) return;
    
    // Queue candidates if remote description not yet set
    if (!conn.hasRemoteDescription) {
      console.log('Queueing ICE candidate (waiting for remote desc)');
      conn.pendingCandidates.push(candidate);
      return;
    }
    
    try {
      await conn.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.log('ICE candidate error:', e);
    }
  }
  
  /**
   * Process queued ICE candidates after remote description is set
   */
  private async processPendingCandidates(peerId: string): Promise<void> {
    const conn = this.connections.get(peerId);
    if (!conn) return;
    
    console.log(`Processing ${conn.pendingCandidates.length} queued candidates`);
    for (const candidate of conn.pendingCandidates) {
      try {
        await conn.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.log('ICE candidate error:', e);
      }
    }
    conn.pendingCandidates = [];
  }

  /**
   * Get peer info for sending signals
   */
  private async getPeerInfo(peerId: string): Promise<User | null> {
    try {
      return await api.getUser(peerId);
    } catch {
      return null;
    }
  }

  /**
   * Send signal via server (with optional PGP encryption)
   */
  private async sendSignal(peer: User, type: 'offer' | 'answer' | 'ice', payload: string): Promise<void> {
    let encrypted = payload;
    
    // Try to encrypt with PGP if we have the peer's key
    if (peer.pgp_public_key && !peer.pgp_public_key.includes('mock')) {
      try {
        encrypted = await pgpService.encrypt(payload, peer.pgp_public_key);
      } catch {
        // Use plain if encryption fails
      }
    }

    await api.sendSignal({
      to_user: peer.username,
      type,
      encrypted_payload: encrypted,
    });
  }

  /**
   * Setup data channel event handlers
   */
  private setupDataChannel(peerId: string, channel: RTCDataChannel): void {
    channel.onopen = () => {
      console.log('Data channel opened with:', peerId);
      this.updateState(peerId, 'connected');
    };

    channel.onclose = () => {
      console.log('Data channel closed with:', peerId);
      this.updateState(peerId, 'disconnected');
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.updateState(peerId, 'failed');
    };

    channel.onmessage = async (event) => {
      try {
        // Try to decrypt, or use plain text
        let message = event.data;
        try {
          const data = JSON.parse(event.data);
          message = await aesService.decrypt(peerId, data);
        } catch {
          // Plain text message
        }
        this.callbacks?.onMessage(peerId, message);
      } catch (error) {
        console.error('Failed to process message:', error);
      }
    };
  }

  /**
   * Send message to peer
   */
  async sendMessage(peerId: string, message: string): Promise<boolean> {
    const conn = this.connections.get(peerId);
    if (!conn?.dataChannel || conn.dataChannel.readyState !== 'open') {
      console.log('Data channel not ready:', conn?.dataChannel?.readyState);
      return false;
    }

    try {
      // Try to encrypt, or send plain
      let toSend = message;
      try {
        const encrypted = await aesService.encrypt(peerId, message);
        toSend = JSON.stringify(encrypted);
      } catch {
        // Send plain if encryption fails
      }
      conn.dataChannel.send(toSend);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  /**
   * Poll for incoming signals
   */
  private startPolling(): void {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(async () => {
      try {
        const signals = await api.pollSignals();
        for (const signal of signals) {
          await this.handleSignal(signal);
        }
      } catch (error) {
        // Ignore polling errors
      }
    }, 2000);
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Handle connection state changes
   */
  private handleConnectionState(peerId: string, state: string): void {
    switch (state) {
      case 'connected':
        this.updateState(peerId, 'connected');
        break;
      case 'disconnected':
      case 'closed':
        this.updateState(peerId, 'disconnected');
        break;
      case 'failed':
        this.updateState(peerId, 'failed');
        break;
    }
  }

  /**
   * Update connection state and notify
   */
  private updateState(peerId: string, state: ConnectionState): void {
    const conn = this.connections.get(peerId);
    if (conn) {
      conn.state = state;
    }
    this.callbacks?.onStateChange(peerId, state);
  }

  /**
   * Disconnect from peer
   */
  disconnect(peerId: string): void {
    const conn = this.connections.get(peerId);
    if (conn) {
      conn.dataChannel?.close();
      conn.pc.close();
      aesService.destroySessionKey(peerId);
      this.connections.delete(peerId);
    }
    this.stopPolling();
  }

  /**
   * Get connection status
   */
  getConnectionStatus(peerId: string): ConnectionState {
    const conn = this.connections.get(peerId);
    return conn?.state || 'idle';
  }
}

export const webrtcManager = new WebRTCManager();
