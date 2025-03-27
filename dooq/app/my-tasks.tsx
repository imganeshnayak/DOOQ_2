import { View, StyleSheet, ScrollView, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Chip, Surface, Menu } from 'react-native-paper';
import { MoreVertical, Trash2, CheckCircle } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import customTheme from './theme';

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface Task {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: string;
  statusLabel: string;
  offerCount: number;
  offers: Array<{
    _id: string;
    tasker: {
      _id: string;
      name: string;
      avatar: string;
      rating: number;
    };
    amount: number;
    message: string;
    status: string;
  }>;
}

export default function MyTasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/tasks/my-tasks`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setTasks(response.data);
    } catch (error: any) {
      console.error('Error fetching tasks:', error.response || error);
      setError(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      const interval = setInterval(fetchTasks, 30000);
      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, []);

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await axios.put(
        `${API_URL}/api/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data.success) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId 
              ? { 
                  ...task, 
                  status: newStatus,
                  statusLabel: newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
                }
              : task
          )
        );
        Alert.alert('Success', `Task marked as ${newStatus}`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update task status');
    } finally {
      setMenuVisible(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              
              const response = await axios.delete(
                `${API_URL}/api/tasks/${taskId}`,
                { headers: { Authorization: `Bearer ${token}` }}
              );

              if (response.data.success) {
                setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
                Alert.alert('Success', 'Task deleted successfully');
              }
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete task');
            } finally {
              setMenuVisible(null);
            }
          }
        }
      ]
    );
  };

  const renderTaskCard = (task: Task) => (
    <Card key={task._id} style={styles.taskCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleLarge">{task.title}</Text>
          <Menu
            visible={menuVisible === task._id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <Button
                onPress={() => setMenuVisible(task._id)}
                icon={() => <MoreVertical size={24} color={customTheme.colors.onSurface} />} 
                children={undefined}
              />
            }
          >
            {task.status === 'open' && (
              <Menu.Item
                onPress={() => handleStatusUpdate(task._id, 'completed')}
                title="Mark as Completed"
                leadingIcon={() => <CheckCircle size={20} color={customTheme.colors.primary} />}
              />
            )}
            {/* Always show delete option regardless of status */}
            <Menu.Item
              onPress={() => handleDeleteTask(task._id)}
              title="Delete Task"
              leadingIcon={() => <Trash2 size={20} color={customTheme.colors.error} />}
            />
          </Menu>
        </View>

        <View style={styles.tags}>
          <Chip icon="tag">{task.category}</Chip>
          <Chip icon="currency-usd">${task.budget}</Chip>
          <Chip 
            icon={task.status === 'completed' ? 'check-circle' : 'information'}
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(task.status) }
            ]}
          >
            {task.statusLabel}
          </Chip>
        </View>

        <Text variant="bodyMedium" numberOfLines={2}>
          {task.description}
        </Text>

        <Text variant="titleMedium" style={styles.offersCount}>
          {task.offerCount} Offers Received
        </Text>

        {task.offerCount > 0 && (
          <Button
            mode="contained"
            onPress={() => 
              router.push({
                pathname: '/task-offers',
                params: { taskId: task._id }
              })
            }
            style={styles.viewOffersButton}
          >
            View Offers
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return customTheme.colors.primary;
      case 'assigned':
        return customTheme.colors.primary;
      case 'cancelled':
        return customTheme.colors.error;
      default:
        return customTheme.colors.surfaceVariant;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={customTheme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchTasks} style={{ marginTop: 16 }}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Button icon="arrow-left" onPress={() => router.back()}>Back</Button>
        <Text variant="headlineMedium" style={styles.title}>My Tasks</Text>
      </Surface>

      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {tasks.map(renderTaskCard)}
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
  taskCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  offersCount: {
    marginTop: 8,
    color: customTheme.colors.primary,
    fontFamily: 'Poppins-Medium',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  viewOffersButton: {
    marginTop: 8,
    backgroundColor: customTheme.colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    marginLeft: 'auto',
  },
});