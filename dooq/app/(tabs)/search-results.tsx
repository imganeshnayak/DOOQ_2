import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import customTheme from '../theme';

interface Task {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  location: {
    city: string;
    zipcode: string;
  };
  image?: string;
  dueDate?: string;
  status?: string;
  userId?: string;
  createdAt?: string;
}

export default function SearchResultsScreen() {
  const params = useLocalSearchParams<{
    tasks: string;
    query: string;
    categories: string;
    budgets: string;
  }>();

  const tasks: Task[] = JSON.parse(params.tasks || '[]');
  const query = params.query;
  const categories = params.categories?.split(',').filter(Boolean) || [];
  const budgets = params.budgets?.split(',').filter(Boolean) || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button 
          icon="arrow-left" 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back
        </Button>
        <Text variant="titleMedium" style={styles.resultCount}>
          {tasks.length} Tasks Found
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {tasks.map((task) => (
          <Card 
            key={task._id} 
            style={styles.taskCard}
            onPress={() => router.push({
              pathname: '/(tabs)/view-details',
              params: {
                id: task._id,
                title: task.title,
                description: task.description,
                budget: task.budget,
                category: task.category,
                location: JSON.stringify(task.location),
                image: task.image ? encodeURIComponent(task.image) : null
              }
            })}
          >
            <Card.Content>
              <Text variant="titleLarge" style={styles.taskTitle}>
                {task.title}
              </Text>
              <Text variant="bodyMedium" style={styles.taskDesc}>
                {task.description}
              </Text>
              <View style={styles.taskMeta}>
                <Chip icon="tag">{task.category}</Chip>
                <Chip icon="currency-inr">₹{task.budget}</Chip>
                {task.location?.city && (
                  <Chip icon="map-marker">{task.location.city}</Chip>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: customTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  resultCount: {
    color: customTheme.colors.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  taskCard: {
    marginBottom: 16,
    elevation: 2,
  },
  taskTitle: {
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  taskDesc: {
    color: '#666',
    marginBottom: 16,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  }
});