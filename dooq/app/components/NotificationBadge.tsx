import { View, StyleSheet } from 'react-native';
import { Badge, Text } from 'react-native-paper';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await axios.get(`${API_URL}/api/notifications/unread/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUnreadCount(response.data.count);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setError(error.response?.data?.message || 'Error loading notifications');
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error || unreadCount === 0) return null;

  return (
    <Badge 
      size={20} 
      style={styles.badge}
    >
      {unreadCount}
    </Badge>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5733'
  }
});