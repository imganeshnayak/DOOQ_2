import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, AppState, StatusBar } from 'react-native';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { useState, useEffect, useRef, useCallback, memo, useLayoutEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import customTheme from '../theme';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
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
      case 'sending': return <Text style={styles.statusText}>⋯</Text>;
      case 'sent': return <Text style={styles.statusText}>✓</Text>;
      case 'delivered': return <Text style={styles.statusText}>✓✓</Text>;
      case 'read': return <Text style={[styles.statusText, { color: '#34B7F1' }]}>✓✓</Text>; // ✅ FIXED
      case 'error': return <Text style={[styles.statusText, { color: 'red' }]}>!</Text>;
      default: return <Text style={styles.statusText}>✓</Text>;
    }
  };
  

  return (
    <View style={[styles.messageContainer, isCurrentUser ? styles.sentContainer : styles.receivedContainer]}>
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

// Update the MessageList component
const MessageList = memo(({ messages, userId }: { messages: Message[]; userId: string | null }) => {
  const listRef = useRef<ScrollView>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastContentOffset = useRef(0);
  const isScrollingDown = useRef(true);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    isScrollingDown.current = currentOffset > lastContentOffset.current;
    lastContentOffset.current = currentOffset;

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    
    setAutoScroll(isCloseToBottom);
  };

  useEffect(() => {
    if (autoScroll) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, autoScroll]);

  return (
    <ScrollView
      ref={listRef}
      style={styles.chatContainer}
      contentContainerStyle={styles.scrollContent}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}
    >
      {messages.map((msg, index) => (
        <MessageBubble 
          key={msg._id || index} 
          message={msg} 
          isCurrentUser={msg.sender._id === userId}
        />
      ))}
    </ScrollView>
  );
});

export default function ChatScreen() {
  const { id: receiverId, name: receiverName } = useLocalSearchParams<{ id: string; name: string }>();
  const navigation = useNavigation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sentMessages] = useState(new Set());

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: receiverName || 'Chat',
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, [receiverName]);

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

        if (response.data?.id) {
          setUserId(response.data.id.toString());
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    getUserId();
  }, []);

  const fetchMessages = async () => {
    if (!userId || !receiverId) return;

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeSocket = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const socketInstance = io(API_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
      });

      socketInstance.on('connect', () => {
        socketInstance.emit('joinChat', receiverId);
        fetchMessages();
      });

      socketInstance.on('newMessage', (message) => {
        setMessages(prev => {
          if (prev.some(msg => msg._id === message._id)) return prev;
          
          socketInstance.emit('messageDelivered', { messageId: message._id });
          
          if (AppState.currentState === 'active') {
            socketInstance.emit('messageRead', { messageId: message._id });
          }
          
          return [...prev, message];
        });
      });

      socketInstance.on('messageDelivered', ({ messageId }) => {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, status: 'delivered' } : msg
        ));
      });

      socketInstance.on('messageRead', ({ messageId }) => {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, status: 'read', read: true } : msg
        ));
      });

      setSocket(socketInstance);

      const subscription = AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
          messages.forEach(msg => {
            if (msg.sender._id === receiverId && !msg.read) {
              socketInstance.emit('messageRead', { messageId: msg._id });
            }
          });
        }
      });

      return () => {
        subscription.remove();
        socketInstance.disconnect();
      };
    };

    if (userId && receiverId) {
      initializeSocket();
    }
  }, [userId, receiverId]);

  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!socket || !receiverId) return;

      try {
        // Mark all unread messages as read when chat is opened
        socket.emit('markConversationRead', { otherUserId: receiverId });
        
        // Update local message states
        setMessages(prev => prev.map(msg => 
          msg.sender._id === receiverId ? { ...msg, read: true, status: 'read' } : msg
        ));
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markMessagesAsRead();
  }, [socket, receiverId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !socket) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

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
    setNewMessage('');

    try {
      await new Promise((resolve, reject) => {
        socket.emit('message', 
          { receiverId, content: messageContent, tempId },
          (response: { success: boolean; messageId?: string }) => {
            if (response.success) {
              setMessages(prev => prev.map(msg =>
                msg._id === tempId ? { ...msg, _id: response.messageId!, status: 'sent' } : msg
              ));
              resolve(response.messageId);
            } else {
              reject(new Error('Failed to send message'));
            }
          }
        );

        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
    } catch (error) {
      setMessages(prev => prev.map(msg =>
        msg._id === tempId ? { ...msg, status: 'error' } : msg
      ));
    }
  };

  // Update the main return statement in ChatScreen
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: receiverName || 'Chat',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  router.push('/(tabs)/messages');
                }
              }}
              style={styles.backButton}
            >
              <ChevronLeft size={28} color={customTheme.colors.primary} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: customTheme.colors.surface,
          },
          headerTitleStyle: {
            color: customTheme.colors.onSurface,
          },
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.innerContainer}>
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={customTheme.colors.primary} />
            </View>
          ) : (
            <>
              <MessageList messages={messages} userId={userId} />
              <Surface style={styles.inputSurface}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                    maxLength={500}
                    maxHeight={100}
                    onSubmitEditing={handleSend}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      !newMessage.trim() && styles.sendButtonDisabled
                    ]}
                    onPress={handleSend}
                    disabled={!newMessage.trim()}
                  >
                    <Text style={styles.sendButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </Surface>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

// Update the styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.surface,
  },
  innerContainer: {
    flex: 1,
  },
  inputSurface: {
    elevation: 4,
    backgroundColor: customTheme.colors.surface,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: customTheme.colors.surface,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginRight: 10,
    backgroundColor: customTheme.colors.surface,
    fontSize: 16,
    color: customTheme.colors.onSurface,
    maxHeight: 100,
    minHeight: 40,
  },
  chatContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  messageStatus: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },
  statusText: {
    fontSize: 12,
  },
  sentMessageText: {
    color: '#fff',
  },
  backButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: customTheme.colors.primary,
  },
});