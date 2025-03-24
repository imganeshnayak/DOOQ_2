import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Button, Surface, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
        console.log('Attempting login...');
        const response = await axios.post(`${API_URL}/api/users/login`, {
            email,
            password
        });

        console.log('Login successful:', response.data);
        const { token } = response.data;
        await AsyncStorage.setItem("authToken", token); // Store token properly
    
        router.replace('/(tabs)');
    } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
        Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back</Text>
      </View>

      {/* Content */}
      <Surface style={styles.content} elevation={0}>
        <Text variant="bodyLarge" style={styles.description}>
          Sign in to continue managing your tasks and staying productive
        </Text>

        {/* Form */}
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

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon 
                icon={showPassword ? 'eye-off' : 'eye'} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />

          <Button 
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Sign In
          </Button>
        </View>

        {/* Forgot Password */}
        <View style={styles.forgotPassword}>
          <Button 
            mode="text" 
            onPress={() => router.push('/forgot-password')}
            compact
          >
            Forgot Password?
          </Button>
        </View>

        {/* Sign in with Google */}
        <Button 
          mode="contained"
          onPress={handleLogin}
          style={styles.googleButton}
          contentStyle={styles.buttonContent}
        >
          Sign in with Google
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  welcomeText: {
    marginTop: 16,
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  description: {
    color: '#666',
    lineHeight: 24,
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
  forgotPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    marginRight: 8,
  },
  googleButton: {
    marginTop: 16,
    paddingVertical: 6,
    backgroundColor: '#DB4437',
  },
  buttonContent: {
    paddingVertical: 6,
  },
});