import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { Settings, LogOut, HelpCircle, Bell, Shield, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import customTheme from '../theme';
import { useEffect } from 'react';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function Sidebar({ visible, onClose }: SidebarProps) {
  const router = useRouter();
  const translateX = new Animated.Value(visible ? 0 : -300);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userId');
    router.replace('/(auth)/login');
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
        >
          <LogOut size={24} color={customTheme.colors.error} />
          <Text style={[styles.menuText, { color: customTheme.colors.error }]}>
            Logout
          </Text>
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: customTheme.colors.outline,
  },
});