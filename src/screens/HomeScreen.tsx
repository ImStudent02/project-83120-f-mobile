/**
 * Home Screen - Active Chats List
 * Shows list of active conversations, mode toggle, and search
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore, ActiveChat } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { ConnectionRequestModal } from '../components/ConnectionRequestModal';
import { api } from '../services/api';

interface Props {
  navigation: any;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { mode, setMode, activeChats, pendingRequests, addActiveChat, updateRequest, addRequest, removeActiveChat } = useAppStore();
  const { username, logout } = useAuthStore();
  const [showRequests, setShowRequests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requestSent, setRequestSent] = useState<string | null>(null);

  const pendingCount = pendingRequests.filter(r => r.status === 'pending').length;

  // Load connections and poll for requests on mount
  useEffect(() => {
    loadConnections();
    pollPendingRequests();
    // Poll both pending requests AND connections (for accepted requests)
    const pollInterval = setInterval(() => {
      pollPendingRequests();
      loadConnections(); // Also refresh connections to see accepted requests
    }, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  // Load accepted connections from server
  const loadConnections = async () => {
    try {
      const connections = await api.getConnections();
      connections.forEach((conn: any) => {
        // Only add if not already in active chats
        const exists = activeChats.some(c => c.peerId === conn.username);
        if (!exists) {
          addActiveChat({
            peerId: conn.username,
            peerName: conn.username,
            unreadCount: 0,
            isConnected: conn.is_online,
          });
        }
      });
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  };

  // Poll for pending requests
  const pollPendingRequests = async () => {
    try {
      const requests = await api.getPendingRequests();
      requests.forEach((req: any) => {
        // Only add if not already in pending
        const exists = pendingRequests.some(r => r.id === req.request_id);
        if (!exists) {
          addRequest({
            id: req.request_id,
            fromUser: req.from_user,
            timestamp: Date.now(),
            status: 'pending',
          });
        }
      });
    } catch (error) {
      // Ignore polling errors
    }
  };

  // Search users
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await api.searchUsers(searchQuery);
      setSearchResults(results.filter((u: any) => u.username !== username));
    } catch (error) {
      console.error('Search failed:', error);
    }
    setIsSearching(false);
  };

  // Send connection request
  const sendConnectionRequest = async (targetUser: string) => {
    try {
      await api.sendConnectionRequest(targetUser);
      setRequestSent(targetUser);
      setTimeout(() => setRequestSent(null), 2000);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to send request';
      alert(message);
    }
  };

  // Handle accept request
  const handleAcceptRequest = async (request: any) => {
    try {
      await api.respondToRequest(request.id, 'accept');
      updateRequest(request.id, 'accepted');
      addActiveChat({
        peerId: request.fromUser,
        peerName: request.fromUser,
        unreadCount: 0,
        isConnected: true,
      });
      setShowRequests(false);
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  // Handle decline request
  const handleDeclineRequest = async (request: any) => {
    try {
      await api.respondToRequest(request.id, 'decline');
      updateRequest(request.id, 'declined');
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  };

  // Open chat
  const openChat = (chat: ActiveChat) => {
    navigation.navigate('Chat', {
      peer: { username: chat.peerId, pgp_public_key: '' },
    });
  };

  // Format time
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderChat = ({ item }: { item: ActiveChat }) => (
    <TouchableOpacity style={styles.chatCard} onPress={() => openChat(item)}>
      <View style={styles.chatAvatar}>
        <Text style={styles.avatarText}>
          {item.peerName.replace('@', '').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.peerName}</Text>
          <Text style={styles.chatTime}>{formatTime(item.lastMessageTime)}</Text>
        </View>
        <View style={styles.chatPreview}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'Tap to start chatting...'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={[styles.statusDot, item.isConnected && styles.statusOnline]} />
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: any }) => (
    <View style={styles.searchResult}>
      <View style={styles.searchAvatar}>
        <Text style={styles.avatarText}>
          {item.username.replace('@', '').charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.searchName}>{item.username}</Text>
      <View style={[styles.searchStatus, item.is_online && styles.statusOnline]} />
      <TouchableOpacity
        style={[
          styles.requestButton,
          requestSent === item.username && styles.requestButtonSent,
        ]}
        onPress={() => sendConnectionRequest(item.username)}
        disabled={requestSent === item.username}
      >
        <Text style={styles.requestButtonText}>
          {requestSent === item.username ? '✓ Sent' : 'Request'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Chats</Text>
          <Text style={styles.subtitle}>{username}</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <Text style={[styles.modeLabel, mode === 'offline' && styles.modeLabelActive]}>
              Offline
            </Text>
            <Switch
              value={mode === 'online'}
              onValueChange={(v) => setMode(v ? 'online' : 'offline')}
              trackColor={{ false: '#333', true: '#4a9eff' }}
              thumbColor="#fff"
            />
            <Text style={[styles.modeLabel, mode === 'online' && styles.modeLabelActive]}>
              Online
            </Text>
          </View>
          {/* Requests Badge */}
          {pendingCount > 0 && (
            <TouchableOpacity
              style={styles.requestsBadge}
              onPress={() => setShowRequests(true)}
            >
              <Text style={styles.requestsText}>🔔 {pendingCount}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={mode === 'online' ? 'Search users...' : 'Nearby devices...'}
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.username}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Active Chats */}
      {activeChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No active chats</Text>
          <Text style={styles.emptySubtitle}>
            {mode === 'online'
              ? 'Search for users to start chatting'
              : 'Enable WiFi/Hotspot to find nearby devices'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeChats}
          renderItem={renderChat}
          keyExtractor={(item) => item.peerId}
          contentContainerStyle={styles.chatList}
        />
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Connection Request Modal */}
      <ConnectionRequestModal
        visible={showRequests}
        onClose={() => setShowRequests(false)}
        onAccept={handleAcceptRequest}
        onDecline={handleDeclineRequest}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeLabel: {
    color: '#666',
    fontSize: 12,
  },
  modeLabelActive: {
    color: '#4a9eff',
  },
  requestsBadge: {
    backgroundColor: '#4a9eff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  requestsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#4a9eff',
    borderRadius: 12,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchButtonText: {
    fontSize: 20,
  },
  searchResults: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchResult: {
    alignItems: 'center',
    marginRight: 16,
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  searchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a9eff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchName: {
    color: '#fff',
    fontSize: 12,
  },
  searchStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#666',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  chatList: {
    paddingHorizontal: 20,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a9eff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatTime: {
    color: '#888',
    fontSize: 12,
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lastMessage: {
    color: '#888',
    fontSize: 14,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#4a9eff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#666',
    marginLeft: 12,
  },
  statusOnline: {
    backgroundColor: '#4ade80',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  logoutButton: {
    padding: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 16,
  },
  requestButton: {
    backgroundColor: '#4a9eff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  requestButtonSent: {
    backgroundColor: '#4ade80',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
