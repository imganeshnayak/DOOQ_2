import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Button, Avatar, Card } from 'react-native-paper';
import { Star, MapPin, Calendar, Menu, RefreshCw } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import customTheme from '../theme';
import { useRouter, useFocusEffect } from 'expo-router';
import AchievementProgress from '../components/AchievementProgress';
import Sidebar from '../components/Sidebar';

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface ProfileData {
  user: {
    id: string;
    city: string;
    phone: string;
    avatar: string;
    name: string;
    rating: number;
    completedTasks: number;
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

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
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
      setRefreshing(false);
    }
  };

  // Manual refresh function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  // Automatic refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchProfile();
    }, [])
  );

  const handleEditProfilePress = () => {
    if (profileData) {
      router.push({
        pathname: '/EditProfileScreen',
        params: { 
          userData: JSON.stringify(profileData.user)
        }
      });
    }
  };

  if (loading && !refreshing) {
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
    <>
      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)} 
      />
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[customTheme.colors.primary]}
            tintColor={customTheme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setSidebarVisible(true)}
          >
            <Menu size={24} color={customTheme.colors.onSurface} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <RefreshCw size={24} color={customTheme.colors.primary} />
          </TouchableOpacity>
          
          <Avatar.Image
            size={100}
            source={{ uri: profileData.user.avatar }}
            style={styles.avatar}
          />
          <Text variant="headlineMedium" style={styles.name}>
            {profileData.user.name}
          </Text>
          
          <View style={styles.ratingContainer}>
            <Star size={20} color="#FFD700" fill="#FFD700" />
            <Text variant="titleMedium" style={styles.rating}>
              {profileData.user.rating?.toFixed(1) || '0.0'} ({profileData.reviews?.length || 0} reviews)
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <MapPin size={16} color="#666" />
              <Text variant="bodyMedium" style={styles.infoText}>
                {profileData.user.city || 'City not set'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Calendar size={16} color="#666" />
              <Text variant="bodyMedium" style={styles.infoText}>
                Member since {profileData.user.memberSince}
              </Text>
            </View>
          </View>
          <Text variant="bodyMedium" style={styles.bio}>
            {profileData.user.bio}
          </Text>
          <Button 
            mode="contained" 
            style={styles.editButton}
            onPress={handleEditProfilePress}
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
          currentLevel={profileData.user.level || 'BRONZE'}
          completedTasks={profileData.user.completedTasks || 0}
          points={profileData.user.points || 0}
          badges={profileData.user.badges || []}
        />

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Reviews
          </Text>
          {profileData.reviews.length > 0 ? (
            <>
              {(showAllReviews ? profileData.reviews : profileData.reviews.slice(0, 3)).map((review, index) => (
                <Card 
                  key={`review-${review.id || index}`} 
                  style={styles.reviewCard}
                >
                  <Card.Content>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewUser}>
                        <Avatar.Image
                          size={40}
                          source={{ uri: review.avatar || 'https://via.placeholder.com/40' }}
                          style={styles.reviewAvatar}
                        />
                        <View>
                          <Text variant="titleMedium">{review.user}</Text>
                          <Text variant="bodySmall" style={styles.reviewTask}>
                            {review.task || 'Task'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.reviewRating}>
                        <Star size={16} color="#FFD700" fill="#FFD700" />
                        <Text variant="bodyMedium">{review.rating.toFixed(1)}</Text>
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
              {profileData.reviews.length > 3 && (
                <Button
                  mode="outlined"
                  onPress={() => setShowAllReviews(!showAllReviews)}
                  style={styles.showMoreButton}
                >
                  {showAllReviews ? 'Show Less' : `Show All (${profileData.reviews.length})`}
                </Button>
              )}
            </>
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet</Text>
          )}
        </View>
      </ScrollView>
    </>
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
  refreshButton: {
    position: 'absolute',
    right: 16,
    top: 50,
    padding: 8,
  },
  menuButton: {
    position: 'absolute',
    left: 16,
    top: 50,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    marginTop: 8,
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noReviewsText: {
    textAlign: 'center',
    color: customTheme.colors.onSurfaceVariant,
  },
});