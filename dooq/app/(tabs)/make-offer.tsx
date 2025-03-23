import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function MakeOfferScreen() {
  // Get task details from params
  const { taskId, taskTitle } = useLocalSearchParams<{ taskId: string; taskTitle: string }>();
  
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitOffer = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login to make an offer');
        return;
      }

      // Log request details for debugging
      console.log('Making offer request:', {
        url: `${API_URL}/api/offers`,
        data: {
          taskId,
          amount: Number(amount),
          message,
          estimatedTime
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await axios.post(
        `${API_URL}/api/offers`,
        {
          taskId,
          amount: Number(amount),
          message,
          estimatedTime
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Offer response:', response.data);
      Alert.alert('Success', 'Your offer has been submitted');
      router.back();
    } catch (error:any) {
      console.error('Full error:', error.response || error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit offer'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="titleLarge">Make an Offer</Text>
        <Text variant="bodyMedium" style={styles.taskTitle}>
          Task: {taskTitle}
        </Text>
      </Surface>

      <ScrollView style={styles.content}>
        <TextInput
          label="Offer Amount ($)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Message"
          value={message}
          onChangeText={setMessage}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          placeholder="Explain why you're the best person for this task"
        />

        <TextInput
          label="Estimated Time"
          value={estimatedTime}
          onChangeText={setEstimatedTime}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., 2 hours, 3 days"
        />

        <Button
          mode="contained"
          onPress={handleSubmitOffer}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          Submit Offer
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  taskTitle: {
    marginTop: 4,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
  },
});