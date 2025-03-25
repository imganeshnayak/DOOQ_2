import { View, StyleSheet, ScrollView, Image, Modal, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Chip } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Constants from 'expo-constants';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

const API_URL = Constants.expoConfig?.extra?.API_URL;

const MAIN_CATEGORIES = ['Moving', 'Cleaning', 'Delivery', 'Assembly', 'Gardening', 'Painting', 'Pet Care', 'Tech Help'];
const OTHER_CATEGORIES = [
  'Accounting & Tax Services', 'Automobile Services',
  'Beauty & Personal Care',
  'Carpentry',
  'Catering Services',
  'Cooking & Home Chef',
  'Delivery & Pickup Services',
  'Documentation & Legal Help',
  'Electrical',
  'Event Help',
  'Fitness & Wellness',
  'Graphic Design & Video Editing',
  'Handyman Services',
  'Home Cleaning',
  'Home Improvement',
  'Home Renovation',
  'Home Repairs',
  'Language Translation & Content Writing',
  'Laundry & Dry Cleaning',
  'Marketing & Social Media',
  'Moving & Relocation Services',
  'Music & Dance Lessons',
  'Online Tutoring & Coaching',
  'Painting & Waterproofing',
  'Pest Control',
  'Personal Assistant',
  'Pet Care & Grooming',
  'Photography & Videography',
  'Plumbing',
  'Repair & Maintenance (Gadgets, AC, Fridge, TV, etc.)',
  'Security & Surveillance',
  'Tailoring & Alterations',
  'Tech Help & IT Support',
  'Other'
];


export default function PostTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number | null, longitude: number | null }>({ latitude: null, longitude: null });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showOtherCategories, setShowOtherCategories] = useState(false);
  const [dueDate, setDueDate] = useState('');

  // Image picker function
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
  
      // Get last known location first
      let lastKnown = await Location.getLastKnownPositionAsync({});
      if (lastKnown) {
        setLocation({
          latitude: parseFloat(lastKnown.coords.latitude.toFixed(5)),
          longitude: parseFloat(lastKnown.coords.longitude.toFixed(5)),
        });
      }
  
      // Then get current location
      let newLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
  
      setLocation({
        latitude: parseFloat(newLocation.coords.latitude.toFixed(5)),
        longitude: parseFloat(newLocation.coords.longitude.toFixed(5)),
      });
    })();
  }, []);

  // Date handling
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDueDate(formattedDate);
    }
  }, [selectedDate]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: selectedDate || new Date(),
      onChange: (event, date) => {
        if (date) {
          setSelectedDate(date);
        }
      },
      mode: 'date',
      minimumDate: new Date(),
    });
  };

  // Category selection
  const handleCategorySelect = (category: string) => {
    if (category === 'Other') {
      setShowOtherCategories(true);
    } else {
      setSelectedCategory(category);
    }
  };

  const handleOtherCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowOtherCategories(false);
  };

  const handleSubmit = async () => {
    try {
      let token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error("No token found");
        return;
      }

      // Upload image if exists
      let imageUrl = null;
      if (image) {
        // Here you would implement image upload to your server or cloud storage
        // and get back the URL
        imageUrl = image; // For now, just using the local URI
      }

      const taskData = {
        title,
        description,
        budget: Number(budget),
        location: {
          address,
          city,
          zipcode,
          coordinates: location.latitude && location.longitude 
            ? { latitude: location.latitude, longitude: location.longitude } 
            : null
        },
        image: imageUrl,
        category: selectedCategory,
        dueDate,
      };

      console.log("Sending Task Data:", taskData);

      const response = await axios.post(`${API_URL}/api/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Task created:', response.data);
      setTitle('');
      setDescription('');
      setBudget('');
      setAddress('');
      setCity('');
      setZipcode('');
      setImage(null);
      setSelectedCategory('');
      setSelectedDate(null);
      setDueDate('');
      router.push('/(tabs)');
    } catch (error: any) {
      console.error('Error creating task:', error.response?.data || error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>Post a New Task</Text>
        
        <View style={styles.form}>
          <TextInput 
            label="Task Title" 
            value={title} 
            onChangeText={setTitle} 
            mode="outlined" 
            style={styles.input} 
          />

          <TextInput 
            label="Description" 
            value={description} 
            onChangeText={setDescription} 
            mode="outlined" 
            multiline 
            numberOfLines={4} 
            style={styles.input} 
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>Category</Text>
          <View style={styles.categories}>
            {MAIN_CATEGORIES.map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => handleCategorySelect(category)}
                style={styles.categoryChip}
                showSelectedOverlay
              >
                {category}
              </Chip>
            ))}
            <Chip
              selected={selectedCategory === 'Other' || OTHER_CATEGORIES.includes(selectedCategory)}
              onPress={() => handleCategorySelect('Other')}
              style={styles.categoryChip}
              showSelectedOverlay
            >
              Other
            </Chip>
          </View>

          <TextInput 
            label="Budget ($)" 
            value={budget} 
            onChangeText={setBudget} 
            mode="outlined" 
            keyboardType="numeric" 
            style={styles.input} 
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>Location Details</Text>
          
          <TextInput 
            label="Address" 
            value={address} 
            onChangeText={setAddress} 
            mode="outlined" 
            style={styles.input} 
          />

          <TextInput 
            label="City" 
            value={city} 
            onChangeText={setCity} 
            mode="outlined" 
            style={styles.input} 
          />

          <TextInput 
            label="Zipcode" 
            value={zipcode} 
            onChangeText={setZipcode} 
            mode="outlined" 
            keyboardType="numeric" 
            style={styles.input} 
          />

          <Text style={styles.coordinates}>
            {location.latitude && location.longitude
              ? `GPS Location: ${location.latitude}, ${location.longitude}`
              : 'Fetching GPS location...'}
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>Add Image (Optional)</Text>
          <Button 
            mode="outlined" 
            onPress={pickImage} 
            style={styles.imageButton}
            icon="image"
          >
            Choose Image
          </Button>
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}

          <TextInput 
        label="Due Date" 
        value={dueDate} 
        onChangeText={setDueDate} 
        mode="outlined" 
        placeholder="YYYY-MM-DD" 
        style={styles.input}
        right={
          <TextInput.Icon 
            icon="calendar" 
            onPress={showDatepicker} 
          />
        }
      />

          

          <Modal
            visible={showOtherCategories}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowOtherCategories(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text variant="titleLarge" style={styles.modalTitle}>Select Category</Text>
                <ScrollView contentContainerStyle={styles.modalCategories}>
                  {OTHER_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.modalCategoryItem,
                        selectedCategory === category && styles.selectedCategoryItem
                      ]}
                      onPress={() => handleOtherCategorySelect(category)}
                    >
                      <Text style={styles.modalCategoryText}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowOtherCategories(false)}
                  style={styles.modalCloseButton}
                >
                  Close
                </Button>
              </View>
            </View>
          </Modal>

          <Button 
            mode="contained" 
            onPress={handleSubmit} 
            style={styles.button} 
            contentStyle={styles.buttonContent}
          >
            Post Task
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 24,
    marginTop: 16,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    marginBottom: 8,
  },
  coordinates: {
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
    color: '#666',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  imageButton: {
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  modalCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  modalCategoryItem: {
    padding: 12,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedCategoryItem: {
    backgroundColor: '#e0e0e0',
  },
  modalCategoryText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 16,
  },
});