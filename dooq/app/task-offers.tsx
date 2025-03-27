import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, Chip, Surface } from 'react-native-paper';
import { useState, useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import customTheme from './theme';

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface Offer {
  _id: string;
  tasker: {
    _id: string;
    name: string;
    avatar: string;
    rating: number;
    completedTasks: number;
  };
  amount: number;
  message: string;
  estimatedTime: string;
  status: string;
  createdAt: string;
}

export default function TaskOffersScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOffers = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/offers/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOffers();
    }, [taskId])
  );

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      await axios.put(
        `${API_URL}/api/offers/${offerId}/status`,
        { status: 'accepted' },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchOffers(); // Refresh the offers list
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Button icon="arrow-left" onPress={() => router.back()}>Back</Button>
        <Text variant="headlineMedium" style={styles.title}>Offers</Text>
      </Surface>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchOffers} />
        }
      >
        {offers.map((offer) => (
          <Card key={offer._id} style={styles.offerCard}>
            <Card.Content>
              <View style={styles.offerHeader}>
                <View style={styles.taskerInfo}>
                  <Avatar.Image 
                    size={40} 
                    source={{ uri: offer.tasker.avatar }} 
                  />
                  <View style={styles.taskerDetails}>
                    <Text variant="titleMedium">{offer.tasker.name}</Text>
                    <View style={styles.taskerStats}>
                      <Text variant="bodySmall">
                        Rating: {offer.tasker.rating || 'No ratings'}
                      </Text>
                      {offer.tasker.completedTasks > 0 && (
                        <Text variant="bodySmall">
                          • {offer.tasker.completedTasks} tasks completed
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                <Chip icon="currency-usd">${offer.amount}</Chip>
              </View>

              <Text variant="bodyMedium" style={styles.message}>
                {offer.message}
              </Text>
              
              <Text variant="bodyMedium" style={styles.estimatedTime}>
                Estimated time: {offer.estimatedTime}
              </Text>

              {offer.status === 'pending' && (
                <Button 
                  mode="contained" 
                  onPress={() => handleAcceptOffer(offer._id)}
                  style={styles.acceptButton}
                >
                  Accept Offer
                </Button>
              )}

              {offer.status !== 'pending' && (
                <Chip icon="check" style={styles.statusChip}>
                  {offer.status}
                </Chip>
              )}
            </Card.Content>
          </Card>
        ))}
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
    paddingTop: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  offerCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskerDetails: {
    marginLeft: 12,
  },
  taskerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  message: {
    marginBottom: 8,
  },
  estimatedTime: {
    color: '#666',
    marginBottom: 12,
  },
  acceptButton: {
    marginTop: 8,
    backgroundColor: customTheme.colors.primary,
  },
  statusChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});