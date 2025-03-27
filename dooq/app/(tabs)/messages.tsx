import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Text, Surface, ActivityIndicator, Avatar, FAB, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import customTheme from '../theme';
import { io } from 'socket.io-client';
interface CachedAvatars {
  timestamp: number;
  data: Record<string, string>;
}
const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const [avatarFetchTimestamp, setAvatarFetchTimestamp] = useState<number>(0);

  const fetchUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserId(parsed.id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAvatars = async (userIds: string[]) => {
    // Only fetch if 5 minutes have passed since last fetch
    const now = Date.now();
    if (now - avatarFetchTimestamp < 300000) {
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token || !userIds.length) return;

      const uniqueUserIds = [...new Set(userIds)]; // Remove duplicates
      
      console.log('Fetching avatars for users:', uniqueUserIds);

      const response = await axios.post(
        `${API_URL}/api/users/avatars`,
        { userIds: uniqueUserIds },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data) {
        setUserAvatars(response.data);
        setAvatarFetchTimestamp(now);
        
        // Cache avatars in AsyncStorage
        await AsyncStorage.setItem('cachedAvatars', JSON.stringify({
          timestamp: now,
          data: response.data
        }));
      }
    } catch (error: any) {
      console.error('Error fetching avatars:', error.response?.data || error.message);
    }
  };

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setError('Please login to view messages');
        return;
      }

      const convResponse = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(convResponse.data)) {
        setConversations(convResponse.data);
        setError(null);

        // Only fetch avatars if we have conversations
        if (convResponse.data.length > 0) {
          const userIds = convResponse.data.map((conv: any) => conv.userId);
          await fetchAvatars(userIds);
        }
      }
    } catch (error: any) {
      console.error("Error fetching data:", error.response?.data || error.message);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, []);

  useEffect(() => {
    fetchUserId();
    fetchData();
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initializeSocket = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const socket = io(API_URL, {
        auth: { token }
      });

      socket.on('conversationUpdate', () => {
        fetchData(false);
      });

      return () => {
        socket.disconnect();
      };
    };

    initializeSocket();
  }, []);

  // Load cached avatars on mount
  useEffect(() => {
    const loadCachedAvatars = async () => {
      try {
        const cached = await AsyncStorage.getItem('cachedAvatars');
        if (cached) {
          const { timestamp, data } = JSON.parse(cached);
          if (Date.now() - timestamp < 300000) { // Less than 5 minutes old
            setUserAvatars(data);
            setAvatarFetchTimestamp(timestamp);
          }
        }
      } catch (error) {
        console.error('Error loading cached avatars:', error);
      }
    };

    loadCachedAvatars();
  }, []);

  // Only fetch avatars when conversations change
  useEffect(() => {
    if (conversations.length > 0) {
      const userIds = conversations.map(conv => conv.userId);
      fetchAvatars(userIds);
    }
  }, [conversations]);

  const renderItem = ({ item }: { item: any }) => {
    const avatarUri = userAvatars[item.userId] || null;

    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: `/messages/[id]`,
            params: { 
              id: item.userId, 
              userId: item.userId, 
              name: item.userName,
              avatar: avatarUri // Pass avatar URI to chat screen
            }
          });
        }}
        style={styles.conversationItem}
      >
        {avatarUri ? (
          <Image 
            source={{ uri: avatarUri }} 
            style={styles.avatarImage}
          />
        ) : (
          <Avatar.Text
            size={48}
            label={item.userName?.substring(0, 2).toUpperCase() || '??'}
            style={styles.avatarFallback}
          />
        )}
        
        <View style={styles.conversationDetails}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.time}>
              {new Date(item.lastMessageTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Messages</Text>
        <IconButton
          icon="bell"
          size={24}
          onPress={() => router.push('/notifications')}
          style={styles.bellIcon}
        />
      </Surface>

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchData()}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No messages yet</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={item => item.userId}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        onPress={() => router.push('./(tabs)/new-message')}
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  bellIcon: {
    marginRight: 10,
  },
  list: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    backgroundColor: customTheme.colors.primary,
  },
  conversationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  unreadBadge: {
    backgroundColor: customTheme.colors.primary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: customTheme.colors.primary,
  },
});