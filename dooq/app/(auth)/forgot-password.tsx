import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Button, Surface, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending reset request to:', `${API_URL}/api/users/forgot-password`);
      
      const response = await axios.post(`${API_URL}/api/users/forgot-password`, {
        email: email.trim()
      });

      console.log('Reset response:', response.data);

      Alert.alert(
        'Success',
        'If an account exists with this email, you will receive password reset instructions.',
        [{ 
          text: 'OK',
          onPress: () => router.back()
        }]
      );
    } catch (error:any) {
      console.error('Reset password error:', error?.response?.data || error);
      
      Alert.alert(
        'Error',
        error?.response?.data?.message || 
        'Unable to process your request. Please try again later.'
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
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleForgotPassword}
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
            Back to Login
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  description: {
    marginBottom: 32,
    textAlign: 'center',
    color: '#666',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  backButton: {
    marginTop: 8,
  }
});