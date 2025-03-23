import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, Surface, Chip } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';

export default function ViewDetails() {
  // Access task data from route params
  const {
    id,
    title,
    description,
    budget,
    category,
    dueDate,
    image,
    location,
  } = useLocalSearchParams();

  // Parse location if available
  const taskLocation = location ? JSON.parse(location) : null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <Surface style={styles.header} elevation={0}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Task Details</Text>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Info Card */}
        <Surface style={styles.card} elevation={1}>
          {/* Task Image */}
          {image && (
            <Image
              source={{ uri: image }} // Use the image URL from params
              style={styles.taskImage}
            />
          )}

          <Text variant="titleLarge" style={styles.taskTitle}>
            {title}
          </Text>
          
          <View style={styles.tags}>
            <Chip style={styles.tag}>{category}</Chip>
          </View>

          <Text style={styles.price}>Budget: ${budget}</Text>
          
          <View style={styles.divider} />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Description
          </Text>
          <Text style={styles.description}>
            {description || 'No description available'}
          </Text>

          {/* Location Section */}
          {taskLocation && (
            <>
              <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 16 }]}>
                Location
              </Text>
              <Text style={styles.description}>
                {taskLocation.city || 'Location not specified'}
              </Text>
            </>
          )}

          {/* Timeline Section */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 16 }]}>
            Timeline
          </Text>
          <Text style={styles.timelineText}>
            Due Date: {new Date(dueDate).toLocaleDateString()}
          </Text>
        </Surface>
      </ScrollView>

      {/* Bottom Action Bar */}
      <Surface style={styles.bottomBar} elevation={2}>
        <Button 
          mode="outlined" 
          onPress={() => router.back()}
          style={styles.button}
        >
          Back
        </Button>
        <Button 
          mode="contained"
          onPress={() => router.push({
            pathname: '/make-offer',
            params: {
              id: id,    // Make sure to pass the task ID
              title: title // Pass the task title for display
            }
          })}
          style={[styles.button, styles.makeOfferButton]}
        >
          Make Offer
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
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  taskImage: {
    height: 200,
    width: '100%',
    borderRadius: 8,
    marginBottom: 16,
  },
  taskTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255,87,51,0.1)',
  },
  price: {
    fontSize: 18,
    color: '#FF5733',
    fontFamily: 'Poppins-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    color: '#666',
    lineHeight: 22,
  },
  timelineText: {
    color: '#666',
    marginBottom: 8,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  makeOfferButton: {
    backgroundColor: '#FF5733',
  },
});