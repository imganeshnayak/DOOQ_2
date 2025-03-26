import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, List, Switch, Divider, Button, Menu } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Shield, Lock, Eye, Bell, ChevronDown, AlertCircle, Key, MapPin, User } from 'lucide-react-native';
import customTheme from './theme';

export default function PrivacyScreen() {
  const [locationSharing, setLocationSharing] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [activityStatus, setActivityStatus] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const openPrivacyPolicy = () => {
    Linking.openURL('https://yourapp.com/privacy');
  };

  const openSecurityTips = () => {
    // Navigate to security tips screen
    console.log('Open security tips');
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Privacy & Security',
          headerStyle: {
            backgroundColor: customTheme.colors.surface,
          },
          headerTitleStyle: {
            color: customTheme.colors.onSurface,
          },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Privacy Settings Section */}
        <List.Section style={styles.section}>
          <List.Subheader style={styles.subheader}>PRIVACY SETTINGS</List.Subheader>
          <List.Item
            title="Location Sharing"
            description="Share your location while completing tasks"
            left={() => <List.Icon icon={MapPin} color={customTheme.colors.primary} />}
            right={() => (
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
                color={customTheme.colors.primary}
              />
            )}
            style={styles.listItem}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Profile Visibility"
            description="Control who can see your profile"
            left={() => <List.Icon icon={User} color={customTheme.colors.primary} />}
            right={() => (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button 
                    mode="outlined" 
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                    contentStyle={styles.menuButtonContent}
                    icon={ChevronDown}
                  >
                    {profileVisibility.charAt(0).toUpperCase() + profileVisibility.slice(1)}
                  </Button>
                }
              >
                <Menu.Item 
                  onPress={() => {
                    setProfileVisibility('public');
                    setMenuVisible(false);
                  }} 
                  title="Public" 
                />
                <Menu.Item 
                  onPress={() => {
                    setProfileVisibility('private');
                    setMenuVisible(false);
                  }} 
                  title="Private" 
                />
                <Menu.Item 
                  onPress={() => {
                    setProfileVisibility('contacts');
                    setMenuVisible(false);
                  }} 
                  title="Contacts Only" 
                />
              </Menu>
            )}
            style={styles.listItem}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Activity Status"
            description="Show when you're active on the app"
            left={() => <List.Icon icon={Bell} color={customTheme.colors.primary} />}
            right={() => (
              <Switch
                value={activityStatus}
                onValueChange={setActivityStatus}
                color={customTheme.colors.primary}
              />
            )}
            style={styles.listItem}
          />
        </List.Section>

        {/* Security Settings Section */}
        <List.Section style={styles.section}>
          <List.Subheader style={styles.subheader}>SECURITY</List.Subheader>
          <List.Item
            title="Two-Factor Authentication"
            description="Add an extra layer of security"
            left={() => <List.Icon icon={Key} color={customTheme.colors.primary} />}
            right={() => (
              <Switch
                value={twoFactorAuth}
                onValueChange={setTwoFactorAuth}
                color={customTheme.colors.primary}
              />
            )}
            style={styles.listItem}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Security Tips"
            description="Learn how to protect your account"
            left={() => <List.Icon icon={AlertCircle} color={customTheme.colors.primary} />}
            onPress={openSecurityTips}
            style={styles.listItem}
          />
        </List.Section>

        {/* Privacy Policy Section */}
        <List.Section style={styles.section}>
          <List.Subheader style={styles.subheader}>LEGAL</List.Subheader>
          <List.Item
            title="Privacy Policy"
            description="Review how we handle your data"
            left={() => <List.Icon icon={Shield} color={customTheme.colors.primary} />}
            onPress={openPrivacyPolicy}
            style={styles.listItem}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Data Permissions"
            description="Manage what data we collect"
            left={() => <List.Icon icon={Eye} color={customTheme.colors.primary} />}
            onPress={() => console.log('Open data permissions')}
            style={styles.listItem}
          />
        </List.Section>

        {/* Advanced Privacy Controls */}
        <Button 
          mode="contained-tonal" 
          style={styles.advancedButton}
          icon={Lock}
          onPress={() => console.log('Open advanced privacy')}
        >
          Advanced Privacy Controls
        </Button>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.background,
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
    marginVertical: 0,
  },
  menuButton: {
    borderColor: customTheme.colors.outline,
    borderRadius: 6,
    height: 36,
  },
  menuButtonContent: {
    flexDirection: 'row-reverse',
    height: 36,
  },
  advancedButton: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: customTheme.colors.surfaceVariant,
  },
});