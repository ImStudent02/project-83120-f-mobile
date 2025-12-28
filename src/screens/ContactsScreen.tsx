import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../types';

interface Props {
  navigation: any;
}

export const ContactsScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { username, logout } = useAuthStore();

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await api.searchUsers(query);
      setUsers(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUserPress = (user: User) => {
    navigation.navigate('Chat', { peer: user });
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.username.slice(1, 3).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <View style={[styles.status, item.is_online && styles.statusOnline]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <Text style={styles.subtitle}>Logged in as {username}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4a9eff" style={styles.loader} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.username}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            searchQuery.length > 1 ? (
              <Text style={styles.emptyText}>No users found</Text>
            ) : (
              <Text style={styles.emptyText}>Search for users to start a chat</Text>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  logoutButton: {
    position: 'absolute',
    right: 20,
    top: 60,
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 14,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a9eff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
  },
  status: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#666',
  },
  statusOnline: {
    backgroundColor: '#4ade80',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
