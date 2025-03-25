import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Searchbar, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import customTheme from '../theme';

const API_URL = Constants.expoConfig?.extra?.API_URL;

const CATEGORIES = [
  'Moving', 'Cleaning', 'Delivery', 'Assembly', 
  'Gardening', 'Painting', 'Pet Care', 'Tech Help',
  'Electrical', 'Plumbing', 'Carpentry', 'Personal Assistant',
  'Event Help', 'Other'
];

const BUDGET_RANGES = [
  '₹0-500', 
  '₹501-1,000', 
  '₹1,001-2,500', 
  '₹2,501-5,000', 
  '₹5,001-10,000', 
  '₹10,000+'
];

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
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/health`, {
          timeout: 5000 // 5 second timeout
        });
        
        if (response.status !== 200 && mounted) {
          throw new Error('Server not responding');
        }
      } catch (error:any) {
        // Only show alert if connection actually fails
        if (error.message === 'Network Error' && mounted) {
          Alert.alert(
            'Connection Error',
            'Unable to connect to server. Please check your internet connection.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    checkConnection();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleBudget = (budget: string) => {
    setSelectedBudgets(prev =>
      prev.includes(budget)
        ? prev.filter(b => b !== budget)
        : [...prev, budget]
    );
  };

  const parseRanges = (budgetRanges: string[]) => {
    return budgetRanges.map(range => {
      // Handle special case for "₹10,000+"
      if (range.includes('+')) {
        return {
          min: parseInt(range.replace(/[₹,+]/g, '')),
          max: Infinity
        };
      }

      // Handle normal ranges
      const [minStr, maxStr] = range
        .replace('₹', '')
        .split('-')
        .map(str => str.replace(/,/g, ''));

      return {
        min: parseInt(minStr),
        max: parseInt(maxStr)
      };
    });
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login to search tasks');
        router.replace('/(auth)/login');
        return;
      }

      // Prepare search parameters
      const searchParams = {
        ...(searchQuery && { query: searchQuery }),
        ...(selectedCategories.length > 0 && { 
          categories: selectedCategories.join(',') 
        }),
        ...(selectedBudgets.length > 0 && { 
          budgetRanges: JSON.stringify(parseRanges(selectedBudgets))
        })
      };

      console.log('Sending search request with params:', searchParams);

      const response = await axios.get(`${API_URL}/api/tasks/search`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: searchParams,
        timeout: 10000
      });

      console.log(`Found ${response.data.length} tasks`);

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }

      router.push({
        pathname: '/(tabs)/search-results',
        params: {
          tasks: JSON.stringify(response.data),
          query: searchQuery,
          categories: selectedCategories.join(','),
          budgets: selectedBudgets.join(',')
        }
      });

    } catch (error: any) {
      console.error('Search error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 
        'Failed to search tasks. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Find Tasks</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search tasks..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            elevation={1}
            icon="magnify"
            iconColor={customTheme.colors.primary}
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
                selectedColor={customTheme.colors.primary}
              >
                {category}
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
                selectedColor={customTheme.colors.primary}
              >
                {budget}
              </Chip>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSearch}
          style={styles.searchButton}
          contentStyle={styles.buttonContent}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Tasks'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.surface,
  },
  header: {
    padding: 16,
    paddingTop: 40,
    backgroundColor: customTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    color: customTheme.colors.background,
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: customTheme.colors.surface,
  },
  searchBar: {
    backgroundColor: '#f5f5f5',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
    color: customTheme.colors.background,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  footer: {
    backgroundColor: customTheme.colors.surface,
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
    padding: 16,
  },
  searchButton: {
    borderRadius: 8,
    backgroundColor: customTheme.colors.primary,
  },
  buttonContent: {
    height: 48,
  },
});