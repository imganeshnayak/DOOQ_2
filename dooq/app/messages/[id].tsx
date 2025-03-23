import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import customTheme from '../theme';
import React from 'react';

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  receiver: { _id: string; name: string };
  content: string;
  createdAt: string;
  read: boolean;
}

export default function ChatScreen() {
  const { id: receiverId, name: receiverName } = useLocalSearchParams<{ id: string; name: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          console.warn("⚠️ No auth token found.");
          return;
        }

        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.id) {
          const userIdString = response.data.id.toString();
          console.log("✅ Current User ID:", userIdString);
          setUserId(userIdString);
        } else {
          console.error("❌ Invalid user data received:", response.data);
        }
      } catch (error) {
        console.error('❌ Error getting user data:', error);
        Alert.alert(
          'Error',
          'Failed to load user data. Please try logging in again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await AsyncStorage.removeItem('authToken');
                router.replace('/(auth)/login');
              }
            }
          ]
        );
      }
    };

    getUserId();
  }, []);

  const fetchMessages = async () => {
    if (!userId) {
      console.log("🚨 Skipping message fetch: userId is null");
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token || !receiverId) {
        setLoading(false);
        return;
      }
  
      console.log("📡 Fetching messages for receiver:", receiverId, " and userId:", userId);
  
      const response = await axios.get(`${API_URL}/api/messages/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.data) {
        console.log("📩 Fetched Messages:", response.data);
        setMessages(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (receiverId && userId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [receiverId, userId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Please login to send messages');
        return;
      }

      await axios.post(
        `${API_URL}/api/messages`,
        { receiverId, content: newMessage.trim() },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setNewMessage('');
      fetchMessages();
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      console.error('❌ Error details:', error.response?.data);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{receiverName || 'Chat'}</Text>
      </Surface>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={customTheme.colors.primary} />
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.chatContainer}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {userId && messages.map((msg, index) => {
              const isCurrentUser = msg.sender._id.toString() === userId;
              console.log("📨 Message:", msg, "➡️ Is Current User:", isCurrentUser);

              return (
                <View
                  key={msg._id || index}
                  style={[
                    styles.messageContainer,
                    isCurrentUser ? styles.sentContainer : styles.receivedContainer,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isCurrentUser ? styles.sentMessage : styles.receivedMessage,
                    ]}
                  >
                    <Text style={styles.messageText}>{msg.content}</Text>
                    <Text style={styles.timestamp}>{formatTime(msg.createdAt)}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!newMessage.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.surface,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: customTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: customTheme.colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: customTheme.colors.background,
    flex: 1,
    textAlign: 'left',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  sentContainer: {
    alignSelf: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 12,
  },
  sentMessage: {
    backgroundColor: customTheme.colors.primary,
  },
  receivedMessage: {
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: customTheme.colors.surface,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: customTheme.colors.surface,
    fontSize: 16,
    color: customTheme.colors.background,
  },
  sendButton: {
    backgroundColor: customTheme.colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});