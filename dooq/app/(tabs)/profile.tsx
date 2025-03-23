import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, List, Avatar, Card } from 'react-native-paper';
import { Star, MapPin, Calendar, DollarSign } from 'lucide-react-native';
import { useState } from 'react';

const PROFILE_DATA = {
  user: {
    name: 'Alex Thompson',
    avatar: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c',
    location: 'New York, NY',
    memberSince: 'January 2024',
    rating: 4.8,
    completedTasks: 15,
    bio: 'Experienced in home improvement, furniture assembly, and moving assistance. Always ready to help!',
  },
  stats: [
    { label: 'Tasks Completed', value: 15 },
    { label: 'On-time Rate', value: '98%' },
    { label: 'Repeat Clients', value: 8 },
  ],
  reviews: [
    {
      id: 1,
      user: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      rating: 5,
      task: 'Furniture Assembly',
      comment: 'Alex did an amazing job assembling my IKEA furniture. Very professional and efficient!',
      date: '2 days ago',
    },
    {
      id: 2,
      user: 'John Smith',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
      rating: 5,
      task: 'Moving Help',
      comment: 'Helped me move apartments. Careful with my belongings and very strong. Would hire again!',
      date: '1 week ago',
    },
  ],
};

export default function ProfileScreen() {
  const [showAllReviews, setShowAllReviews] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image
          size={100}
          source={{ uri: PROFILE_DATA.user.avatar }}
          style={styles.avatar}
        />
        <Text variant="headlineMedium" style={styles.name}>
          {PROFILE_DATA.user.name}
        </Text>
        <View style={styles.ratingContainer}>
          <Star size={20} color="#FFD700" fill="#FFD700" />
          <Text variant="titleMedium" style={styles.rating}>
            {PROFILE_DATA.user.rating} ({PROFILE_DATA.user.completedTasks} reviews)
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <MapPin size={16} color="#666" />
            <Text variant="bodyMedium" style={styles.infoText}>
              {PROFILE_DATA.user.location}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Calendar size={16} color="#666" />
            <Text variant="bodyMedium" style={styles.infoText}>
              Member since {PROFILE_DATA.user.memberSince}
            </Text>
          </View>
        </View>
        <Text variant="bodyMedium" style={styles.bio}>
          {PROFILE_DATA.user.bio}
        </Text>
        <Button mode="contained" style={styles.editButton}>
          Edit Profile
        </Button>
      </View>

      <View style={styles.statsContainer}>
        {PROFILE_DATA.stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text variant="headlineSmall" style={styles.statValue}>
              {stat.value}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Reviews
        </Text>
        {PROFILE_DATA.reviews.map((review) => (
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
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
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
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FF5733',
  },
  statLabel: {
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
  reviewCard: {
    marginBottom: 16,
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
  },
  reviewTask: {
    color: '#666',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewComment: {
    marginBottom: 8,
  },
  reviewDate: {
    color: '#666',
  },
  showMoreButton: {
    marginTop: 8,
  },
});