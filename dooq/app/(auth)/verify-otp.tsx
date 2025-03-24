import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function VerifyOTPScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending verification request to:', `${API_URL}/api/users/verify-otp`);
      console.log('Request data:', { userId, otp: otp.trim() });

      const response = await axios.post(`${API_URL}/api/users/verify-otp`, {
        userId,
        otp: otp.trim()
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Verification response:', response.data);

      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      
      if (error.message === 'Network Error') {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to verify code. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Verify Your Email
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          Enter the 6-digit code sent to your email
        </Text>

        <TextInput
          label="Verification Code"
          value={otp}
          onChangeText={setOtp}
          mode="outlined"
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleVerify}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Verify
        </Button>
      </View>
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
      justifyContent: 'center',
    },
    title: {
      marginBottom: 8,
      textAlign: 'center',
    },
    description: {
      marginBottom: 32,
      textAlign: 'center',
      color: '#666',
    },
    input: {
      marginBottom: 16,
      backgroundColor: '#fff',  // ✅ Set background to white
      color: '#000',  // ✅ Ensure text color is black
    },
    button: {
      marginTop: 8,
      paddingVertical: 6,
    },
  });
  