import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Button, TextInput, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    try {
      setLoading(true);

      // Validation
      if (!email || !resetToken || !newPassword) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      console.log('Attempting password reset:', { email, resetToken });

      const response = await axios.post(`${API_URL}/api/users/reset-password`, {
        email: email,
        resetToken: resetToken.trim(),
        newPassword
      });

      Alert.alert(
        'Success',
        'Password reset successful. Please login with your new password.',
        [{
          text: 'OK',
          onPress: () => router.replace('/(auth)/login')
        }]
      );

    } catch (error: any) {
      console.error('Reset password error:', error.response?.data || error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      
      <Surface style={styles.content} elevation={0}>
        <Text variant="headlineMedium" style={styles.title}>
          Reset Password
        </Text>

        <Text variant="bodyLarge" style={styles.description}>
          Enter the reset code sent to {email} and your new password.
        </Text>

        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="Reset Code"
            value={resetToken}
            onChangeText={setResetToken}
            keyboardType="number-pad"
            style={styles.input}
            maxLength={6}
          />

          <TextInput
            mode="outlined"
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Reset Password
          </Button>

          <Button
            mode="text"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Back
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium'
  },
  description: {
    marginBottom: 32,
    textAlign: 'center',
    color: '#666'
  },
  form: {
    gap: 16
  },
  input: {
    backgroundColor: '#fff'
  },
  button: {
    marginTop: 8,
    paddingVertical: 6
  },
  backButton: {
    marginTop: 8
  }
});