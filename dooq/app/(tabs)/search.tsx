import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Searchbar, Chip, Button } from 'react-native-paper';
import { useState } from 'react';

const CATEGORIES = ['Moving', 'Cleaning', 'Delivery', 'Assembly', 'Gardening', 'Painting', 'Pet Care', 'Tech Help'];
const LOCATIONS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
const BUDGET_RANGES = ['$0-50', '$51-100', '$101-200', '$201-500', '$500+'];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const toggleBudget = (budget: string) => {
    setSelectedBudgets(prev =>
      prev.includes(budget)
        ? prev.filter(b => b !== budget)
        : [...prev, budget]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Search Tasks</Text>
        <Searchbar
          placeholder="What are you looking for?"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          elevation={1}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Categories</Text>
        <View style={styles.chipGroup}>
          {CATEGORIES.map((category) => (
            <Chip
              key={category}
              selected={selectedCategories.includes(category)}
              onPress={() => toggleCategory(category)}
              style={styles.chip}
              showSelectedOverlay
            >
              {category}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Location</Text>
        <View style={styles.chipGroup}>
          {LOCATIONS.map((location) => (
            <Chip
              key={location}
              selected={selectedLocations.includes(location)}
              onPress={() => toggleLocation(location)}
              style={styles.chip}
              showSelectedOverlay
            >
              {location}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Budget Range</Text>
        <View style={styles.chipGroup}>
          {BUDGET_RANGES.map((budget) => (
            <Chip
              key={budget}
              selected={selectedBudgets.includes(budget)}
              onPress={() => toggleBudget(budget)}
              style={styles.chip}
              showSelectedOverlay
            >
              {budget}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => {}}
          style={styles.searchButton}
          contentStyle={styles.buttonContent}
        >
          Search Tasks
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
    padding: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  searchButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
});