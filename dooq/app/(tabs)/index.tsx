import { 
  View, StyleSheet, ScrollView, Image, RefreshControl, Alert, Linking 
} from 'react-native';
import { 
  Text, Card, Button, Chip, Searchbar, FAB, Surface, IconButton, ActivityIndicator 
} from 'react-native-paper';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../components/Logo';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;
const CATEGORIES = ['All', 'Moving', 'Cleaning', 'Delivery', 'Assembly', 'Gardening'];
const LOCATION_CACHE_KEY = 'user_location_cache';
const MAX_CACHE_AGE_HOURS = 24;

type Task = {
  _id: string;
  title: string;
  description?: string;
  budget: number;
  location?: {
    coordinates?: { latitude: number; longitude: number };
    city?: string;
  };
  category: string;
  status: string;
  dueDate: string;
  image?: string;
};

type CachedLocation = {
  latitude: number;
  longitude: number;
  city?: string;
  timestamp: number;
};

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const saveLocationToCache = async (location: CachedLocation) => {
  try {
    const locationWithTimestamp = {
      ...location,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationWithTimestamp));
  } catch (error) {
    console.error('Error saving location to cache:', error);
  }
};

const loadLocationFromCache = async (): Promise<CachedLocation | null> => {
  try {
    const cachedLocation = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
    if (!cachedLocation) return null;

    const parsedLocation: CachedLocation = JSON.parse(cachedLocation);
    const cacheAgeHours = (Date.now() - parsedLocation.timestamp) / (1000 * 60 * 60);

    if (cacheAgeHours > MAX_CACHE_AGE_HOURS) {
      await AsyncStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }

    return parsedLocation;
  } catch (error) {
    console.error('Error loading location from cache:', error);
    return null;
  }
};

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [currentCity, setCurrentCity] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const getLocation = async (manualFetch = false) => {
    setIsLocationLoading(true);
    setLocationError(null);

    if (!manualFetch) {
      const cachedLocation = await loadLocationFromCache();
      if (cachedLocation) {
        setUserLocation({
          latitude: cachedLocation.latitude,
          longitude: cachedLocation.longitude,
        });
        if (cachedLocation.city) {
          setCurrentCity(cachedLocation.city);
        }
      }
    }

    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setLocationError('Location services are disabled');
        Alert.alert(
          'Location Required',
          'Please enable location services to see nearby tasks',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(newLocation);

      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        let cityName = 'Unknown Location';
        if (address.length > 0) {
          cityName = address[0].city || address[0].region || 'Unknown Location';
        }
        setCurrentCity(cityName);

        await saveLocationToCache({
          ...newLocation,
          city: cityName,
          timestamp: Date.now()
        });

      } catch (reverseGeocodeError) {
        console.error('Reverse geocoding failed:', reverseGeocodeError);
        setCurrentCity('Location unavailable');
      }

      if (manualFetch) {
        Alert.alert("Location Updated", "Your location has been updated.");
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setLocationError('Unable to get your location');
    } finally {
      setIsLocationLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    loadLocationFromCache().then(cachedLocation => {
      if (cachedLocation) {
        setUserLocation({
          latitude: cachedLocation.latitude,
          longitude: cachedLocation.longitude,
        });
        if (cachedLocation.city) {
          setCurrentCity(cachedLocation.city);
        }
      }
      getLocation();
    });
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchTasks();
    }
  }, [userLocation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks().finally(() => setRefreshing(false));
  };

  const filteredTasks = tasks.filter(task => {
    // Skip completed tasks
    if (task.status === 'completed') return false;

    const matchesSearchAndCategory =
      (selectedCategory === 'All' || task.category === selectedCategory) &&
      task.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (isLocationLoading || locationError) {
      return matchesSearchAndCategory;
    }

    if (userLocation && task.location?.coordinates) {
      const distance = haversineDistance(
        userLocation.latitude,
        userLocation.longitude,
        task.location.coordinates.latitude,
        task.location.coordinates.longitude
      );
      return matchesSearchAndCategory && distance <= 30;
    }

    return matchesSearchAndCategory;
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Surface style={styles.header}>
        <View style={styles.headerRow}>
          <Logo size="medium" />
          <View style={styles.locationButtonContainer}>
            <IconButton
              icon="crosshairs-gps"
              onPress={() => getLocation(true)}
              loading={isLocationLoading}
              style={styles.locationButton}
            />
            {isLocationLoading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.cityText}>{currentCity || 'Location unavailable'}</Text>
            )}
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Available Tasks</Text>

        <Searchbar
          placeholder="Search tasks"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {CATEGORIES.map(category => (
            <Chip key={category} selected={selectedCategory === category} onPress={() => setSelectedCategory(category)}>
              {category}
            </Chip>
          ))}
        </ScrollView>
      </Surface>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredTasks.map(task => (
          <Surface key={task._id} style={styles.card}>
            {task.image && <Image source={{ uri: task.image }} style={styles.taskImage} />}

            <Card.Content>
              <View style={styles.taskHeader}>
                <Text variant="titleLarge">{task.title}</Text>
                <Text variant="titleMedium" style={styles.price}>${task.budget}</Text>
              </View>

              <Text variant="bodyMedium" numberOfLines={2}>
                {task.description || 'No description available'}
              </Text>

              <View style={styles.tags}>
                {task.location?.city && <Chip icon="map-marker">{task.location.city}</Chip>}
                {userLocation && task.location?.coordinates && (
                  <Chip icon="map">{haversineDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    task.location.coordinates.latitude,
                    task.location.coordinates.longitude
                  ).toFixed(2)} km away</Chip>
                )}
                <Chip icon="tag">{task.category}</Chip>
                <Chip icon="calendar">{new Date(task.dueDate).toLocaleDateString()}</Chip>
              </View>
            </Card.Content>

            <Card.Actions>
              <Button
                mode="outlined"
                onPress={() => router.push({
                  pathname: '/view-details',
                  params: {
                    id: task._id,
                    title: task.title,
                    description: task.description,
                    budget: task.budget,
                    category: task.category,
                    dueDate: task.dueDate,
                    image: task.image ? encodeURIComponent(task.image) : null,
                    location: JSON.stringify(task.location),
                  },
                })}
              >
                View Details
              </Button>
              <Button 
                mode="contained" 
                onPress={() => router.push({
                  pathname: '/(tabs)/make-offer',
                  params: { 
                    taskId: task._id,
                    taskTitle: task.title
                  }
                })}
                style={styles.offerButton}
              >
                Make Offer
              </Button>
            </Card.Actions>
          </Surface>
        ))}
      </ScrollView>

      <FAB icon="plus" label="Post a Task" style={styles.fab} onPress={() => router.push('/post-task')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: 4,
    fontSize: 16,
  },
  searchBar: {
    marginTop: 12,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  categories: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  taskImage: {
    height: 200,
    width: '100%',
    borderRadius: 8,
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  price: {
    color: '#FF5733',
    fontFamily: 'Poppins-SemiBold',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF5733',
  },
  locationButtonContainer: {
    alignItems: 'center',
  },
  locationButton: {
    margin: 0,
    padding: 0,
  },
  cityText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  offerButton: {
    marginLeft: 8,
  },
});