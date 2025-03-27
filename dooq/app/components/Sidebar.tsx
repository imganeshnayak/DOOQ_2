import { View, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Text, Divider, ActivityIndicator } from 'react-native-paper';
import { Settings, LogOut, HelpCircle, Bell, Shield, X, Briefcase } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';
import customTheme from '../theme';
import { useEffect, useState } from 'react';

// Get API URL from Expo Constants
const API_URL = Constants.expoConfig?.extra?.API_URL;

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function Sidebar({ visible, onClose }: SidebarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const translateX = new Animated.Value(visible ? 0 : -300);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              
              // Get token before clearing storage
              const token = await AsyncStorage.getItem('authToken');
              
              // Call logout endpoint if API_URL is configured
              if (token && API_URL) {
                try {
                  await axios.post(
                    `${API_URL}/api/auth/logout`,
                    {},
                    { 
                      headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    }
                  );
                } catch (error) {
                  console.log('Logout API error:', error);
                  // Continue with local logout even if API fails
                }
              }

              // Clear all auth-related data
              await AsyncStorage.multiRemove([
                'authToken',
                'userId',
                'userProfile',
                'preferences'
              ]);

              // Navigate to login screen
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(
                'Error',
                'Failed to logout. Please try again.'
              );
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  return (
    <>
      {visible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ translateX }] }
        ]}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>Menu</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={24} color={customTheme.colors.onSurface} />
          </TouchableOpacity>
        </View>
        <Divider />
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              router.push('/my-tasks');
              onClose();
            }}
          >
            <Briefcase size={24} color={customTheme.colors.primary} />
            <Text style={[styles.menuText, { color: customTheme.colors.primary }]}>
              My Tasks
            </Text>
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              router.push('/settings');
              onClose();
            }}
          >
            <Settings size={24} color={customTheme.colors.onSurface} />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              router.push('/notifications');
              onClose();
            }}
          >
            <Bell size={24} color={customTheme.colors.onSurface} />
            <Text style={styles.menuText}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              router.push('/privacy');
              onClose();
            }}
          >
            <Shield size={24} color={customTheme.colors.onSurface} />
            <Text style={styles.menuText}>Privacy & Security</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              router.push('/help');
              onClose();
            }}
          >
            <HelpCircle size={24} color={customTheme.colors.onSurface} />
            <Text style={styles.menuText}>Help & Support</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={customTheme.colors.error} />
          ) : (
            <>
              <LogOut size={24} color={customTheme.colors.error} />
              <Text style={[styles.menuText, { color: customTheme.colors.error }]}>
                Logout
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: customTheme.colors.surface,
    elevation: 8,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    color: customTheme.colors.onSurface,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
    color: customTheme.colors.onSurface,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content when showing loading spinner
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: customTheme.colors.outline,
    minHeight: 56, // Ensure consistent height during loading
  },
  divider: {
    marginVertical: 8,
    backgroundColor: customTheme.colors.outline,
    height: 1,
  },
});