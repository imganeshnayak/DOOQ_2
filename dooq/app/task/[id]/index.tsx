import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, Surface, Chip } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function TaskDetails() {
  const { id } = useLocalSearchParams();
  
  // Find the task based on ID (replace this with your data fetching logic)
  const task = {
    id: 1,
    title: 'Help Moving Furniture',
    description: 'Need help moving heavy furniture from a 2-bedroom apartment to a new house, including a sofa, bed, and dining table.',
    budget: 150,
    location: 'Brooklyn, NY',
    category: 'Moving',
    dueDate: '2024-02-20',
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115',
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header with Back Button */}
      <Surface style={styles.header} elevation={0}>
        <Button 
          icon="arrow-left" 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back
        </Button>
        <Text variant="headlineSmall" style={styles.headerTitle}>Task Details</Text>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: task.image }}
          style={styles.taskImage}
        />

        <Surface style={styles.detailsCard} elevation={1}>
          <Text variant="headlineSmall" style={styles.taskTitle}>
            {task.title}
          </Text>

          <View style={styles.tags}>
            <Chip icon="map-marker" style={styles.tag}>{task.location}</Chip>
            <Chip icon="tag" style={styles.tag}>{task.category}</Chip>
            <Chip icon="calendar" style={styles.tag}>{task.dueDate}</Chip>
          </View>

          <Text variant="titleLarge" style={styles.budget}>
            ${task.budget}
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Description
          </Text>
          <Text style={styles.description}>
            {task.description}
          </Text>
        </Surface>
      </ScrollView>

      {/* Bottom Action Button */}
      <Surface style={styles.bottomBar} elevation={2}>
        <Button 
          mode="contained"
          onPress={() => router.push(`/task/${id}/offer`)}
          style={styles.offerButton}
          contentStyle={styles.offerButtonContent}
        >
          Make an Offer
        </Button>
      </Surface>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  taskImage: {
    height: 250,
    width: '100%',
  },
  detailsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  taskTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(255,87,51,0.1)',
  },
  budget: {
    color: '#FF5733',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    lineHeight: 24,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  offerButton: {
    backgroundColor: '#FF5733',
  },
  offerButtonContent: {
    paddingVertical: 8,
  },
}); 