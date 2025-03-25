import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, AppState } from 'react-native';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import customTheme from '../theme';
import React from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  receiver: { _id: string; name: string };
  content: string;
  createdAt: string;
  read: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}

const MessageBubble = ({ message, isCurrentUser }: { message: Message; isCurrentUser: boolean }) => {
  const getStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    switch (message.status) {
      case 'sending':
        return <Text style={styles.statusText}>⋯</Text>;
      case 'sent':
        return <Text style={styles.statusText}>✓</Text>;
      case 'delivered':
        return <Text style={styles.statusText}>✓✓</Text>;
      case 'read':
        return (
          <Text style={[styles.statusText, { color: '#34B7F1' }]}>
            ✓✓
          </Text>
        );
      case 'error':
        return <Text style={[styles.statusText, { color: '#FF0000' }]}>!</Text>;
      default:
        return <Text style={styles.statusText}>✓</Text>;
    }
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.sentContainer : styles.receivedContainer,
      ]}
    >
      <View style={[styles.messageBubble, isCurrentUser ? styles.sentMessage : styles.receivedMessage]}>
        <Text style={[styles.messageText, isCurrentUser && styles.sentMessageText]}>
          {message.content}
        </Text>
        {isCurrentUser && (
          <View style={styles.messageStatus}>
            {getStatusIcon()}
          </View>
        )}
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const { id: receiverId, name: receiverName } = useLocalSearchParams<{ id: string; name: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sentMessages] = useState(new Set());

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
    if (!userId || !receiverId) {
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/messages/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = useCallback(() => {
    if (!socket || !messages.length) return;

    messages.forEach(msg => {
      if (msg.sender._id === receiverId && !msg.read) {
        socket.emit('messageRead', { messageId: msg._id });
      }
    });
  }, [messages, receiverId, socket]);

  useEffect(() => {
    markMessagesAsRead();
  }, [markMessagesAsRead]);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return;

        const socketInstance = io(API_URL, {
          auth: { token },
          transports: ['websocket']
        });

        socketInstance.on('connect', () => {
          socketInstance.emit('joinChat', receiverId);
          // Mark all messages as read when opening chat
          messages.forEach(msg => {
            if (msg.sender._id === receiverId && !msg.read) {
              socketInstance.emit('messageRead', { messageId: msg._id });
            }
          });
          fetchMessages();
        });

        socketInstance.on('messageDelivered', ({ messageId, status }) => {
          setMessages(prev => prev.map(msg => 
            msg._id === messageId ? { ...msg, status } : msg
          ));
        });

        socketInstance.on('messageRead', ({ messageId, status }) => {
          setMessages(prev => prev.map(msg => 
            msg._id === messageId ? { ...msg, status, read: true } : msg
          ));
        });

        socketInstance.on('newMessage', (message) => {
          // Immediately mark received messages as read
          if (message.sender._id === receiverId) {
            socketInstance.emit('messageRead', { messageId: message._id });
          }

          setMessages((prev) => {
            // Avoid duplicate messages
            if (prev.some(msg => msg._id === message._id)) {
              return prev;
            }

            // Remove temporary message if exists
            const withoutTemp = prev.filter(msg => 
              !msg._id.startsWith('temp-') || 
              msg.content !== message.content
            );

            return [...withoutTemp, {
              ...message,
              read: message.sender._id === receiverId
            }];
          });
        });

        setSocket(socketInstance);

        // Cleanup function
        return () => {
          socketInstance.disconnect();
        };

      } catch (error) {
        console.error('❌ Socket initialization error:', error);
      }
    };

    if (userId && receiverId) {
      initializeSocket();
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId, receiverId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !socket) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    try {
      setNewMessage('');

      const tempMessage: Message = {
        _id: tempId,
        sender: { _id: userId || '', name: 'You' },
        receiver: { _id: receiverId, name: receiverName || 'Unknown' },
        content: messageContent,
        createdAt: new Date().toISOString(),
        read: false,
        status: 'sending'
      };

      setMessages(prev => [...prev, tempMessage]);

      socket.emit('message', { 
        receiverId, 
        content: messageContent,
        tempId
      }, (acknowledgement: { success: boolean; messageId: string }) => {
        if (acknowledgement?.success) {
          setMessages(prev => prev.map(msg => 
            msg._id === tempId ? { ...msg, _id: acknowledgement.messageId, status: 'sent' } : msg
          ));
          sentMessages.add(acknowledgement.messageId);
        } else {
          setMessages(prev => prev.map(msg => 
            msg._id === tempId ? { ...msg, status: 'error' } : msg
          ));
        }
      });

      scrollViewRef.current?.scrollToEnd({ animated: true });

    } catch (error) {
      console.error('❌ Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...msg, status: 'error' } : msg
      ));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
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
            contentContainerStyle={styles.scrollContent}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg, index) => {
              const isCurrentUser = msg.sender._id.toString() === userId;
              return (
                <MessageBubble key={msg._id || index} message={msg} isCurrentUser={isCurrentUser} />
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
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    backgroundColor: customTheme.colors.surface,
  },
  scrollContent: {
    paddingBottom: 20, // This creates the space between messages and input
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
  messageStatus: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  sentMessageText: {
    color: '#fff',
    marginRight: 20, // Make room for status icons
  },
});