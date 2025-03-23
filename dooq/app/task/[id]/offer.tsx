import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, TextInput } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function MakeOffer() {
  const { id } = useLocalSearchParams();

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
        <Text variant="headlineSmall" style={styles.headerTitle}>Make an Offer</Text>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Your Offer</Text>
          
          <TextInput
            label="Offer Amount ($)"
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            placeholder="Enter your price"
          />

          <TextInput
            label="Message"
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Describe why you're the best person for this task"
          />

          <TextInput
            label="Estimated Completion Time"
            mode="outlined"
            style={styles.input}
            placeholder="When can you complete this task?"
          />
        </Surface>
      </ScrollView>

      {/* Bottom Action Button */}
      <Surface style={styles.bottomBar} elevation={2}>
        <Button 
          mode="contained"
          onPress={() => {
            // Handle offer submission
            router.push('/(tabs)');
          }}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Submit Offer
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
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  submitButton: {
    backgroundColor: '#FF5733',
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
}); 