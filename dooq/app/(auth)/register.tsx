import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Checkbox } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import Logo from '../components/Logo';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  const handleRegister = async () => {
    console.log('Register button clicked');
    try {
      console.log('Sending registration request...');
      const response = await axios.post('http://192.168.154.125:5000/api/users/register', {
        name,
        email,
        password,
        zipcode,
      }, {
        timeout: 5000 // Set a timeout of 5 seconds
      });
      console.log(response.data);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Full error object:', error); // Log the full error object
      if (error.response) {
        console.error('Registration error:', error.response.data);
      } else if (error.request) {
        console.error('Registration error: No response received from server');
      } else {
        console.error('Registration error:', error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Centered Logo */}
        <View style={styles.logoContainer}>
          <Logo />
        </View>

        <Text variant="displaySmall" style={styles.title}>Create Account</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Join DOOQ today</Text>

        <View style={styles.form}>
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

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
            right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />}
            style={styles.input}
          />

          <TextInput
            label="Zipcode"
            value={zipcode}
            onChangeText={setZipcode}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <Checkbox.Item
            label="I agree to the Terms and Conditions"
            status={termsChecked ? 'checked' : 'unchecked'}
            onPress={() => setTermsChecked(!termsChecked)}
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
          >
            Sign Up
          </Button>
          <View style={styles.footer}>
            <Text variant="bodyMedium">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Button mode="text" compact>Sign In</Button>
            </Link>
          </View>
        </View>
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
  logoContainer: {
    alignItems: 'center', // Center the Logo horizontally
    marginBottom: 24, // Add some spacing below the Logo
  },
  title: {
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
    textAlign: 'center', // Center the title text
  },
  subtitle: {
    color: '#666',
    marginBottom: 32,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center', // Center the subtitle text
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
});