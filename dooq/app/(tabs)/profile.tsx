import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text, Button, Avatar, Card } from 'react-native-paper';
import { Star, MapPin, Calendar } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import customTheme from '../theme';
import { useRouter } from 'expo-router';
import EditProfileModal from '../components/EditProfileModal';
import AchievementProgress from '../components/AchievementProgress';

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface ProfileData {
  user: {
    avatar: string;
    name: string;
    rating: number;
    completedTasks: number;
    location: string;
    memberSince: string;
    bio: string;
    level: string;
    points: number;
    badges: Array<{
      name: string;
      unlockedAt: string;
    }> | undefined;
  };
  stats: {
    tasksCompleted: number;
    onTimeRate: string;
    repeatClients: number;
  };
  reviews: Array<{
    id: string;
    user: string;
    avatar: string;
    rating: number;
    task: string;
    comment: string;
    date: string;
  }>;
}

const formatLocation = (location: any) => {
  if (!location) return 'Location not set';
  
  if (location.latitude && location.longitude) {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }
  
  if (typeof location === 'string') {
    return location;
  }

  if (location.city || location.zipcode) {
    return [location.city, location.zipcode].filter(Boolean).join(', ');
  }

  return 'Location not available';
};

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/users/profile/me`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data) {
        setProfileData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (data: { name: string; bio: string; location: string }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        data,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setProfileData(prev => prev ? {
          ...prev,
          user: {
            ...prev.user,
            name: data.name,
            bio: data.bio,
            location: data.location
          }
        } : null);
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={customTheme.colors.primary} />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Failed to load profile data</Text>
        <Button mode="contained" onPress={fetchProfile} style={{ marginTop: 16 }}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image
          size={100}
          source={{ uri: profileData.user.avatar }}
          style={styles.avatar}
        />
        <Text variant="headlineMedium" style={styles.name}>
          {profileData?.user?.name}
        </Text>
        <View style={styles.ratingContainer}>
          <Star size={20} color="#FFD700" fill="#FFD700" />
          <Text variant="titleMedium" style={styles.rating}>
            {profileData?.user?.rating} ({profileData?.user?.completedTasks} reviews)
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <MapPin size={16} color="#666" />
            <Text variant="bodyMedium" style={styles.infoText}>
              {formatLocation(profileData?.user?.location)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Calendar size={16} color="#666" />
            <Text variant="bodyMedium" style={styles.infoText}>
              Member since {profileData?.user?.memberSince ?? ''}
            </Text>
          </View>
        </View>
        <Text variant="bodyMedium" style={styles.bio}>
          {profileData.user.bio}
        </Text>
        <Button 
          mode="contained" 
          style={styles.editButton}
          onPress={() => setEditModalVisible(true)}
        >
          Edit Profile
        </Button>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text variant="headlineSmall" style={styles.statValue}>
            {profileData.stats.tasksCompleted}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Tasks Completed
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="headlineSmall" style={styles.statValue}>
            {profileData.stats.onTimeRate}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            On Time Rate
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="headlineSmall" style={styles.statValue}>
            {profileData.stats.repeatClients}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Repeat Clients
          </Text>
        </View>
      </View>

      <AchievementProgress
        currentLevel={profileData?.user?.level || 'BRONZE'}
        completedTasks={profileData?.user?.completedTasks || 0}
        points={profileData?.user?.points || 0}
        badges={
          Array.isArray(profileData?.user?.badges) 
            ? profileData.user.badges
            : []
        }
      />

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Reviews
        </Text>
        {profileData.reviews.map((review) => (
          <Card key={review.id} style={styles.reviewCard}>
            <Card.Content>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewUser}>
                  <Avatar.Image
                    size={40}
                    source={{ uri: review.avatar }}
                    style={styles.reviewAvatar}
                  />
                  <View>
                    <Text variant="titleMedium">{review.user}</Text>
                    <Text variant="bodySmall" style={styles.reviewTask}>
                      {review.task}
                    </Text>
                  </View>
                </View>
                <View style={styles.reviewRating}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text variant="bodyMedium">{review.rating}</Text>
                </View>
              </View>
              <Text variant="bodyMedium" style={styles.reviewComment}>
                {review.comment}
              </Text>
              <Text variant="bodySmall" style={styles.reviewDate}>
                {review.date}
              </Text>
            </Card.Content>
          </Card>
        ))}
        <Button
          mode="outlined"
          onPress={() => setShowAllReviews(!showAllReviews)}
          style={styles.showMoreButton}
        >
          Show All Reviews
        </Button>
      </View>
      
      <EditProfileModal
        visible={editModalVisible}
        onDismiss={() => setEditModalVisible(false)}
        onSave={handleUpdateProfile}
        initialData={{
          name: profileData?.user?.name || '',
          bio: profileData?.user?.bio || '',
          location: profileData?.user?.location || ''
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: customTheme.colors.surfaceVariant,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
    color: customTheme.colors.onSurface,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    marginLeft: 8,
    color: '#666',
  },
  infoContainer: {
    width: '100%',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
  },
  bio: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  editButton: {
    width: '100%',
    backgroundColor: customTheme.colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: customTheme.colors.surfaceVariant,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    color: customTheme.colors.primary,
  },
  statLabel: {
    color: customTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
    color: customTheme.colors.onSurface,
  },
  reviewCard: {
    marginBottom: 16,
    backgroundColor: customTheme.colors.surface,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    marginRight: 12,
    backgroundColor: customTheme.colors.surfaceVariant,
  },
  reviewTask: {
    color: customTheme.colors.onSurfaceVariant,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewComment: {
    marginBottom: 8,
    color: customTheme.colors.onSurface,
  },
  reviewDate: {
    color: customTheme.colors.onSurfaceVariant,
  },
  showMoreButton: {
    marginTop: 8,
    borderColor: customTheme.colors.primary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});