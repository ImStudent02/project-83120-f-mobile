import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { User, ChatMessage } from '../types';
import { webrtcManager, ConnectionState } from '../services/webrtc';
import { useAuthStore } from '../stores/authStore';

interface Props {
  route: {
    params: {
      peer: User;
    };
  };
  navigation: any;
}

export const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { peer } = route.params;
  const { username: currentUser } = useAuthStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('idle');

  useEffect(() => {
    // Initialize WebRTC manager callbacks
    webrtcManager.init({
      onStateChange: (peerId, state) => {
        if (peerId === peer.username) {
          setConnectionStatus(state);
        }
      },
      onMessage: (peerId, content) => {
        if (peerId === peer.username) {
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            peer_id: peerId,
            direction: 'received',
            content,
            timestamp: Date.now(),
          };
          setMessages(prev => [newMessage, ...prev]); // inverted list
        }
      },
      onError: (peerId, error) => {
        console.error(`Error with ${peerId}:`, error);
      },
    }, currentUser || 'unknown');

    // Only one side should initiate - use username comparison
    // Higher username creates offer, lower username waits to receive
    const shouldInitiate = currentUser && currentUser > peer.username;
    console.log(`[WebRTC] ${currentUser} -> ${peer.username}: shouldInitiate=${shouldInitiate}`);

    if (shouldInitiate) {
      // We initiate - create offer
      const initConnection = async () => {
        setConnectionStatus('connecting');
        await webrtcManager.connect(peer);
      };
      initConnection();
    } else {
      // We wait for offer from peer
      setConnectionStatus('connecting');
      console.log('[WebRTC] Waiting for offer from peer...');
    }

    return () => {
      webrtcManager.disconnect(peer.username);
    };
  }, [peer, currentUser]);

  const sendMessage = useCallback(async () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      peer_id: peer.username,
      direction: 'sent',
      content: message,
      timestamp: Date.now(),
      status: 'sending',
    };

    setMessages(prev => [newMessage, ...prev]); // inverted list
    const sent = await webrtcManager.sendMessage(peer.username, message);
    
    // Update message status
    if (sent) {
      setMessages(prev => 
        prev.map(m => m.id === newMessage.id ? { ...m, status: 'sent' } : m)
      );
    }
    
    setMessage('');
  }, [message, peer.username]);

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return '🔄 Connecting...';
      case 'connected':
        return '🔒 Encrypted P2P';
      case 'disconnected':
        return '❌ Disconnected';
      case 'failed':
        return '⚠️ Connection Failed';
      default:
        return '⏳ Initializing...';
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.direction === 'sent' ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
      <View style={styles.messageFooter}>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {item.direction === 'sent' && item.status && (
          <Text style={styles.messageStatus}>
            {item.status === 'sending' ? '⏳' : item.status === 'sent' ? '✓' : '✓✓'}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.peerName}>{peer.username}</Text>
            <Text style={[styles.status, connectionStatus === 'connected' && styles.statusConnected]}>
              {getStatusText()}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.endSessionButton}
            onPress={() => {
              webrtcManager.disconnect(peer.username);
              navigation.goBack();
            }}
          >
            <Text style={styles.endSessionText}>End</Text>
          </TouchableOpacity>
        </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        inverted={messages.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🔐</Text>
            <Text style={styles.emptyTitle}>End-to-End Encrypted</Text>
            <Text style={styles.emptySubtitle}>
              Messages are encrypted with a unique session key.{'\n'}
              Only you and {peer.username} can read them.
            </Text>
          </View>
        }
      />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor="#888"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!message.trim() || connectionStatus !== 'connected') && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!message.trim() || connectionStatus !== 'connected'}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    color: '#4a9eff',
    fontSize: 16,
  },
  headerInfo: {
    marginLeft: 16,
  },
  peerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  status: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statusConnected: {
    color: '#4ade80',
  },
  endSessionButton: {
    marginLeft: 'auto',
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  endSessionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  sentMessage: {
    backgroundColor: '#4a9eff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    backgroundColor: '#2a2a2a',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },
  messageStatus: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4a9eff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 48,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
