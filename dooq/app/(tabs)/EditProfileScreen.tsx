import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { Camera, X, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import customTheme from '../theme';

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface UserData {
  id: string;
  name: string;
  phone: string;
  city: string;
  avatar: string;
  bio: string;
  rating?: number;
  completedTasks?: number;
  memberSince?: string;
  level?: string;
  points?: number;
}

const EditProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the userData from stringified JSON
  const initialUserData = params.userData 
    ? JSON.parse(params.userData as string)
    : null;

  const [formData, setFormData] = useState<UserData>({
    id: initialUserData?.id || '',
    name: initialUserData?.name || '',
    phone: initialUserData?.phone || '',
    city: initialUserData?.city || '',
    avatar: initialUserData?.avatar || '',
    bio: initialUserData?.bio || '',
  });

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Update form data when initialUserData changes
  useEffect(() => {
    if (initialUserData) {
      setFormData({
        id: initialUserData.id || '',
        name: initialUserData.name || '',
        phone: initialUserData.phone || '',
        city: initialUserData.city || '',
        avatar: initialUserData.avatar || '',
        bio: initialUserData.bio || '',
      });
    }
  }, []); // Run only once when the component mounts
  const handleChange = useCallback((name: keyof UserData, value: string) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        const compressedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 500, height: 500 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        setImage(compressedImage.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const form = new FormData();
      form.append('name', formData.name);
      form.append('phone', formData.phone);
      form.append('city', formData.city);
      form.append('bio', formData.bio);

      if (image) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
        form.append('avatar', {
          uri: image,
          name: filename,
          type,
        } as any);
      }

      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        form,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Profile updated successfully');
        router.back(); // Go back to profile screen
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color={customTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="headlineMedium" style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.imageSection}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : formData.avatar ? (
            <Image source={{ uri: formData.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Camera size={40} color={customTheme.colors.onSurfaceVariant} />
            </View>
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>Edit</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TextInput
        label="Name"
        value={formData.name}
        onChangeText={text => handleChange("name", text)}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Phone"
        value={formData.phone}
        onChangeText={text => handleChange("phone", text)}
        style={styles.input}
        mode="outlined"
        keyboardType="phone-pad"
      />
      <TextInput
        label="City"
        value={formData.city}
        onChangeText={text => handleChange("city", text)}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Bio"
        value={formData.bio}
        onChangeText={text => handleChange("bio", text)}
        style={[styles.input, styles.bioInput]}
        mode="outlined"
        multiline
        numberOfLines={4}
      />

      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={() => router.back()} 
          style={styles.button}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          style={styles.button}
          loading={loading}
          disabled={loading}
          icon={Check}
        >
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.surface,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    color: customTheme.colors.primary,
    fontWeight: 'bold',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: customTheme.colors.primary,
  },
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: customTheme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: customTheme.colors.outline,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: customTheme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editBadgeText: {
    color: customTheme.colors.onPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: customTheme.colors.surface,
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default EditProfileScreen;