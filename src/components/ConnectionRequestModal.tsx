/**
 * Connection Request Modal
 * Shows incoming connection requests with Accept/Decline
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useAppStore, ConnectionRequest } from '../stores/appStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAccept: (request: ConnectionRequest) => void;
  onDecline: (request: ConnectionRequest) => void;
}

export const ConnectionRequestModal: React.FC<Props> = ({
  visible,
  onClose,
  onAccept,
  onDecline,
}) => {
  const { pendingRequests } = useAppStore();
  const pending = pendingRequests.filter(r => r.status === 'pending');

  const renderRequest = ({ item }: { item: ConnectionRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestIcon}>👤</Text>
        <View>
          <Text style={styles.requestUser}>{item.fromUser}</Text>
          <Text style={styles.requestTime}>
            wants to connect
          </Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => onDecline(item)}
        >
          <Text style={styles.declineText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => onAccept(item)}
        >
          <Text style={styles.acceptText}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Connection Requests</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {pending.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No pending requests</Text>
            </View>
          ) : (
            <FlatList
              data={pending}
              renderItem={renderRequest}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    color: '#888',
    fontSize: 24,
  },
  list: {
    paddingBottom: 20,
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  requestUser: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  requestTime: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4ade80',
  },
  declineButton: {
    backgroundColor: '#444',
  },
  acceptText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  declineText: {
    color: '#fff',
    fontSize: 18,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});
