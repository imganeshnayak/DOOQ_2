import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, ActivityIndicator, Avatar, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import customTheme from './theme';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function NotificationsScreen() {
  interface Notification {
    _id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setError('Please login to view notifications');
        return;
      }

      const response = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(response.data);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = (notification: any) => {
    router.push({
      pathname: '/messages/[id]',
      params: { id: notification.senderId, name: notification.senderName },
    });
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              if (!token) return;

              await axios.delete(`${API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setNotifications([]);
            } catch (error) {
              console.error("Error clearing notifications:", error);
              Alert.alert('Error', 'Failed to clear notifications');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <Surface style={styles.notificationItem} elevation={2}>
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        style={styles.notificationContent}
      >
        <Avatar.Text
          size={40}
          label={item.senderName?.substring(0, 2).toUpperCase() || '??'}
          style={{ backgroundColor: customTheme.colors.primary }}
        />
        <View style={styles.notificationDetails}>
          <Text style={styles.notificationText}>{item.message}</Text>
          <Text style={styles.time}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </TouchableOpacity>
      <IconButton
        icon="close"
        size={20}
        onPress={() => deleteNotification(item._id)}
        style={styles.deleteButton}
      />
    </Surface>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={customTheme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </Surface>

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchNotifications()}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearAllText: {
    color: customTheme.colors.primary,
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationContent: {
    flexDirection: 'row',
    flex: 1,
    padding: 16,
  },
  notificationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deleteButton: {
    marginRight: 8,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryText: {
    color: customTheme.colors.primary,
    textDecorationLine: 'underline',
  },
});