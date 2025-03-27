import { Link, Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AlertCircle } from 'lucide-react-native';
import customTheme from './theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AlertCircle size={64} color={customTheme.colors.error} style={styles.icon} />
      
      <Text variant="headlineMedium" style={styles.title}>
        Session Expired
      </Text>
      
      <Text variant="bodyLarge" style={styles.description}>
        Your session has expired or you have been logged out. Please sign in again to continue.
      </Text>

      <Button 
        mode="contained" 
        onPress={() => router.replace('/(auth)/login')}
        style={styles.button}
      >
        Sign In
      </Button>

      <Button 
        mode="text" 
        onPress={() => router.replace('/(auth)/register')}
        style={styles.registerButton}
      >
        Create New Account
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: customTheme.colors.background,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    color: customTheme.colors.error,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
    color: customTheme.colors.onSurfaceVariant,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
  registerButton: {
    width: '100%',
  }
});
