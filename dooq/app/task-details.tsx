import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Button, Chip, Surface, Avatar, Divider } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function TaskDetailsScreen() {
  const { taskId } = useLocalSearchParams();
  interface Task {
    title: string;
    category: string;
    budget: number;
    status: string;
    description: string;
    image?: string;
    offers: {
      _id: string;
      tasker: {
        name: string;
        avatar?: string;
        rating?: number;
        completedTasks?: number;
      };
      amount: number;
      message?: string;
      status: string;
    }[];
  }

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTask(response.data);
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: any) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      await axios.put(
        `${API_URL}/api/offers/${offerId}/status`,
        { status: 'accepted' },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchTaskDetails(); // Refresh the task details
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading task details...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading task details</Text>
        <Button onPress={fetchTaskDetails}>Try Again</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Button 
          icon="arrow-left" 
          onPress={() => router.back()}
          style={styles.backButton}
          labelStyle={styles.backButtonLabel}
        >
          Back
        </Button>
        <Text variant="headlineMedium" style={styles.title}>Task Details</Text>
      </Surface>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.taskCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.taskTitle}>{task.title}</Text>
            <View style={styles.tags}>
              <Chip icon="tag" style={styles.categoryChip}>{task.category}</Chip>
              <Chip icon="currency-usd" style={styles.budgetChip}>${task.budget}</Chip>
              <Chip 
                icon="bookmark" 
                style={[
                  styles.statusChip,
                  task.status === 'completed' && styles.completedStatus,
                  task.status === 'in-progress' && styles.inProgressStatus,
                ]}
              >
                {task.status}
              </Chip>
            </View>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium" style={styles.description}>{task.description}</Text>
            
            {task.image && (
              <Image 
                source={{ uri: task.image }} 
                style={styles.taskImage}
                resizeMode="cover"
              />
            )}
          </Card.Content>
        </Card>

        <View style={styles.offersSection}>
          <Text variant="titleLarge" style={styles.offersTitle}>
            Offers ({task.offers.length})
          </Text>
          
          {task.offers.length === 0 ? (
            <Text style={styles.noOffersText}>No offers yet</Text>
          ) : (
            task.offers.map((offer) => (
              <Card key={offer._id} style={styles.offerCard}>
                <Card.Content>
                  <View style={styles.offerHeader}>
                    <View style={styles.taskerInfo}>
                      <Avatar.Image 
                        size={40} 
                        source={{ uri: offer.tasker.avatar || 'https://i.imgur.com/mCHMpLT.png' }} 
                        style={styles.avatar}
                      />
                      <View style={styles.taskerDetails}>
                        <Text variant="titleMedium" style={styles.taskerName}>{offer.tasker.name}</Text>
                        <View style={styles.ratingContainer}>
                          <Text variant="bodySmall" style={styles.ratingText}>
                            Rating: {offer.tasker.rating || 'No ratings'}
                          </Text>
                          {offer.tasker.completedTasks && (
                            <Text variant="bodySmall" style={styles.completedTasksText}>
                              • {offer.tasker.completedTasks} jobs
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <Chip icon="currency-usd" style={styles.offerAmountChip}>${offer.amount}</Chip>
                  </View>
                  
                  <Text variant="bodyMedium" style={styles.offerMessage}>
                    {offer.message || 'No message provided'}
                  </Text>

                  {offer.status === 'pending' && (
                    <Button 
                      mode="contained" 
                      onPress={() => handleAcceptOffer(offer._id)}
                      style={styles.acceptButton}
                      labelStyle={styles.acceptButtonLabel}
                    >
                      Accept Offer
                    </Button>
                  )}

                  {offer.status !== 'pending' && (
                    <Chip 
                      icon="check" 
                      style={[
                        styles.offerStatusChip,
                        offer.status === 'accepted' && styles.acceptedStatus,
                        offer.status === 'rejected' && styles.rejectedStatus,
                      ]}
                      textStyle={styles.offerStatusText}
                    >
                      {offer.status}
                    </Chip>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonLabel: {
    fontSize: 16,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  taskCard: {
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  taskTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#e3f2fd',
  },
  budgetChip: {
    backgroundColor: '#e8f5e9',
  },
  statusChip: {
    backgroundColor: '#fff3e0',
  },
  completedStatus: {
    backgroundColor: '#e8f5e9',
  },
  inProgressStatus: {
    backgroundColor: '#fff3e0',
  },
  divider: {
    marginVertical: 12,
  },
  description: {
    marginBottom: 16,
    lineHeight: 22,
  },
  taskImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  offersSection: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  offersTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  noOffersText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  offerCard: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
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
  avatar: {
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  taskerDetails: {
    flex: 1,
  },
  taskerName: {
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#666',
  },
  completedTasksText: {
    color: '#666',
    marginLeft: 4,
  },
  offerAmountChip: {
    backgroundColor: '#e8f5e9',
  },
  offerMessage: {
    marginBottom: 16,
    color: '#333',
    lineHeight: 20,
  },
  acceptButton: {
    marginTop: 8,
    backgroundColor: '#4caf50',
  },
  acceptButtonLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  offerStatusChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  acceptedStatus: {
    backgroundColor: '#e8f5e9',
  },
  rejectedStatus: {
    backgroundColor: '#ffebee',
  },
  offerStatusText: {
    fontSize: 14,
  },
});