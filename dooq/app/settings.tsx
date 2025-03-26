import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, List, Switch, Divider, Button } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Moon, Sun, Bell, Mail, Shield, HelpCircle, Lock, LogOut } from 'lucide-react-native';
import customTheme from './theme';

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);

  const handleLogout = () => {
    // Implement logout logic
    console.log('User logged out');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://yourapp.com/privacy');
  };

  const openHelpCenter = () => {
    // Navigate to help screen or open URL
    console.log('Open help center');
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: customTheme.colors.surface,
          },
          headerTitleStyle: {
            color: customTheme.colors.onSurface,
          },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Account Section */}
        <List.Section style={styles.section}>
          <List.Subheader style={styles.subheader}>ACCOUNT</List.Subheader>
          <List.Item
            title="Edit Profile"
            left={() => <List.Icon icon="account-edit" />}
            onPress={() => console.log('Edit profile')}
            style={styles.listItem}
          />
          <List.Item
            title="Change Password"
            left={() => <List.Icon icon="lock-reset" />}
            onPress={() => console.log('Change password')}
            style={styles.listItem}
          />
        </List.Section>

        {/* Notifications Section */}
        <List.Section style={styles.section}>
          <List.Subheader style={styles.subheader}>NOTIFICATIONS</List.Subheader>
          <List.Item
            title="Push Notifications"
            description="Receive app notifications"
            left={() => <List.Icon icon={Bell} />}
            right={() => (
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                color={customTheme.colors.primary}
              />
            )}
            style={styles.listItem}
          />
          <List.Item
            title="Email Notifications"
            description="Get updates via email"
            left={() => <List.Icon icon={Mail} />}
            right={() => (
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                color={customTheme.colors.primary}
              />
            )}
            style={styles.listItem}
          />
        </List.Section>

        {/* Appearance Section */}
        <List.Section style={styles.section}>
          <List.Subheader style={styles.subheader}>APPEARANCE</List.Subheader>
          <List.Item
            title={darkMode ? 'Dark Mode' : 'Light Mode'}
            description="Change the app's color scheme"
            left={() => <List.Icon icon={darkMode ? Moon : Sun} />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                color={customTheme.colors.primary}
              />
            )}
            style={styles.listItem}
          />
        </List.Section>

        {/* Security Section */}
        <List.Section style={styles.section}>
          <List.Subheader style={styles.subheader}>SECURITY</List.Subheader>
          <List.Item
            title="Biometric Authentication"
            description="Use fingerprint or face ID"
            left={() => <List.Icon icon={Lock} />}
            right={() => (
              <Switch
                value={biometricAuth}
                onValueChange={setBiometricAuth}
                color={customTheme.colors.primary}
              />
            )}
            style={styles.listItem}
          />
          <List.Item
            title="Privacy Policy"
            left={() => <List.Icon icon={Shield} />}
            onPress={openPrivacyPolicy}
            style={styles.listItem}
          />
        </List.Section>

        {/* Support Section */}
        <List.Section style={styles.section}>
          <List.Subheader style={styles.subheader}>SUPPORT</List.Subheader>
          <List.Item
            title="Help Center"
            left={() => <List.Icon icon={HelpCircle} />}
            onPress={openHelpCenter}
            style={styles.listItem}
          />
          <List.Item
            title="Contact Support"
            left={() => <List.Icon icon="help-box" />}
            onPress={() => console.log('Contact support')}
            style={styles.listItem}
          />
        </List.Section>

        {/* Logout Button */}
        <Button
          mode="outlined"
          icon={LogOut}
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={styles.logoutButtonText}
        >
          Log Out
        </Button>

        {/* App Version */}
        <Text style={styles.versionText}>App Version 1.0.0</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.surface,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  section: {
    backgroundColor: customTheme.colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  subheader: {
    backgroundColor: customTheme.colors.surface,
    color: customTheme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
    paddingHorizontal: 16,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  divider: {
    backgroundColor: customTheme.colors.outline,
    marginVertical: 8,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    borderColor: customTheme.colors.error,
  },
  logoutButtonText: {
    color: customTheme.colors.error,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 16,
    color: customTheme.colors.onSurfaceVariant,
    fontSize: 12,
  },
});