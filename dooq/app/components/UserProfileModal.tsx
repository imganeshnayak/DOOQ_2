import { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Avatar, Surface, Button, TextInput, Chip } from 'react-native-paper';
import { AirbnbRating } from 'react-native-ratings';
import { X, Star, MapPin, Award, MessageCircle, User } from 'lucide-react-native';
import customTheme from '../theme';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    _id: string;
    name: string;
    avatar: string;
    bio: string;
    city: string;
    rating: number;
    level: string;
    skills?: string[];
    reviews?: Array<{
      _id: string;
      rating: number;
      comment: string;
      createdAt: string;
      reviewer: {
        name: string;
        avatar: string;
      };
    }>;
  } | null;
  onSubmitReview: (rating: number, comment: string) => Promise<void>;
}

export default function UserProfileModal({ visible, onClose, user, onSubmitReview }: UserProfileModalProps) {
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmitReview(rating, comment.trim());
      setShowReviewDialog(false);
      setRating(0);
      setComment('');
      Alert.alert('Success', 'Review submitted successfully');
    } catch (error: any) {
      console.error('Review submission error:', error.response?.data || error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit review'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        onRequestClose={onClose}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.container}>
          {/* Header with close button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={customTheme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <Avatar.Image 
                size={120} 
                source={{ uri: user.avatar || 'https://i.pravatar.cc/300' }} 
                style={styles.avatar}
              />
              <Text variant="headlineSmall" style={styles.name}>
                {user.name}
              </Text>
              
              <View style={styles.ratingContainer}>
                <Star size={20} fill={customTheme.colors.primary} color={customTheme.colors.primary} />
                <Text style={styles.ratingText}>
                  {user.rating.toFixed(1)} <Text style={styles.ratingCount}>({user.reviews?.length || 0} reviews)</Text>
                </Text>
              </View>
              
              <Chip mode="outlined" style={styles.levelChip}>
                <Award size={16} color={customTheme.colors.primary} style={styles.chipIcon} />
                {user.level}
              </Chip>
            </View>

            {/* Location and Skills */}
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <MapPin size={20} color={customTheme.colors.primary} />
                <Text style={styles.detailText}>{user.city}</Text>
              </View>
              
              {user.skills && user.skills.length > 0 && (
                <View style={styles.skillsContainer}>
                  <Text style={styles.sectionTitle}>Skills</Text>
                  <View style={styles.skillsList}>
                    {user.skills.map((skill, index) => (
                      <Chip key={index} style={styles.skillChip} textStyle={styles.skillText}>
                        {skill}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Bio Section */}
            {user.bio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>
            )}

            {/* Reviews Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <Button 
                  mode="text" 
                  icon={() => <MessageCircle size={18} color={customTheme.colors.primary} />}
                  onPress={() => setShowReviewDialog(true)}
                  labelStyle={styles.reviewButtonLabel}
                >
                  Add Review
                </Button>
              </View>
              
              {user.reviews && user.reviews.length > 0 ? (
                user.reviews.map((review) => (
                  <Surface key={review._id} style={styles.reviewCard} elevation={1}>
                    <View style={styles.reviewHeader}>
                      <Avatar.Image 
                        size={40} 
                        source={{ uri: review.reviewer.avatar || 'https://i.pravatar.cc/150' }} 
                      />
                      <View style={styles.reviewerInfo}>
                        <Text style={styles.reviewerName}>{review.reviewer.name}</Text>
                        <View style={styles.reviewRating}>
                          <Star size={16} fill={customTheme.colors.primary} color={customTheme.colors.primary} />
                          <Text style={styles.reviewRatingText}>{review.rating.toFixed(1)}</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </Surface>
                ))
              ) : (
                <Text style={styles.noReviewsText}>No reviews yet</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Review Dialog */}
      <Modal
        visible={showReviewDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReviewDialog(false)}
      >
        <View style={styles.dialogOverlay}>
          <Surface style={styles.dialogContainer}>
            <View style={styles.dialogHeader}>
              <Text variant="titleLarge" style={styles.dialogTitle}>
                Write a Review
              </Text>
              <TouchableOpacity 
                onPress={() => setShowReviewDialog(false)}
                style={styles.dialogCloseButton}
              >
                <X size={24} color={customTheme.colors.onSurface} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dialogContent}>
              <AirbnbRating
                count={5}
                defaultRating={rating}
                size={30}
                selectedColor={customTheme.colors.primary}
                onFinishRating={setRating}
                showRating={false}
                starContainerStyle={styles.ratingStars}
              />
              
              <TextInput
                mode="outlined"
                label="Your review"
                placeholder="Share your experience..."
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                style={styles.reviewInput}
                theme={{
                  colors: {
                    primary: customTheme.colors.primary,
                    background: customTheme.colors.surface,
                  }
                }}
              />
            </View>
            
            <View style={styles.dialogActions}>
              <Button 
                mode="outlined" 
                onPress={() => setShowReviewDialog(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSubmitReview}
                loading={submitting}
                disabled={submitting || rating === 0}
                style={styles.submitButton}
              >
                Submit Review
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.surface,
  },
  header: {
    padding: 16,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: customTheme.colors.outlineVariant,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: customTheme.colors.surfaceVariant,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    color: customTheme.colors.onSurface,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    color: customTheme.colors.onSurface,
  },
  ratingCount: {
    color: customTheme.colors.onSurfaceVariant,
    fontSize: 14,
  },
  levelChip: {
    marginTop: 8,
    backgroundColor: customTheme.colors.surfaceVariant,
    borderColor: customTheme.colors.outline,
  },
  chipIcon: {
    marginRight: 4,
  },
  detailsSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: customTheme.colors.outlineVariant,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 16,
    color: customTheme.colors.onSurface,
  },
  skillsContainer: {
    marginTop: 8,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: customTheme.colors.surfaceVariant,
  },
  skillText: {
    color: customTheme.colors.onSurfaceVariant,
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: customTheme.colors.outlineVariant,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: customTheme.colors.onSurface,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: customTheme.colors.onSurfaceVariant,
  },
  reviewButtonLabel: {
    color: customTheme.colors.primary,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: customTheme.colors.surface,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: customTheme.colors.onSurface,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewRatingText: {
    marginLeft: 4,
    fontSize: 14,
    color: customTheme.colors.onSurfaceVariant,
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
    color: customTheme.colors.onSurface,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: customTheme.colors.onSurfaceVariant,
  },
  noReviewsText: {
    color: customTheme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    backgroundColor: customTheme.colors.surface,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: customTheme.colors.onSurface,
  },
  dialogCloseButton: {
    padding: 4,
  },
  dialogContent: {
    marginBottom: 24,
  },
  ratingStars: {
    justifyContent: 'center',
    marginBottom: 24,
  },
  reviewInput: {
    backgroundColor: customTheme.colors.surface,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 8,
    borderColor: customTheme.colors.outline,
  },
  submitButton: {
    backgroundColor: customTheme.colors.primary,
  },
});