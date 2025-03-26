import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Platform, Alert } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Check } from 'lucide-react-native';
import customTheme from '../theme';
import * as ImageManipulator from 'expo-image-manipulator';

interface EditProfileModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (data: FormData) => Promise<void>;
  initialData: {
    name: string;
    phone: string;
    city: string;
    avatar: string;
  };
}

export default function EditProfileModal({ 
  visible, 
  onDismiss, 
  onSave,
  initialData 
}: EditProfileModalProps) {
  const [name, setName] = useState(initialData.name);
  const [phone, setPhone] = useState(initialData.phone);
  const [city, setCity] = useState(initialData.city);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    city: ''
  });

  // Reset form when modal is reopened
  useEffect(() => {
    if (visible) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setCity(initialData.city);
      setImage(null);
      setErrors({ name: '', phone: '', city: '' });
    }
  }, [visible]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to let you upload a profile picture.',
        [{ text: 'OK' }]
      );
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
        // Compress and resize the image
        const compressedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 500, height: 500 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        setImage(compressedImage.uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: name.trim() ? '' : 'Name is required',
      phone: /^[\d\s+-]{10,15}$/.test(phone) ? '' : 'Enter a valid phone number',
      city: city.trim() ? '' : 'City is required'
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('city', city);

      if (image) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
        
        formData.append('avatar', {
          uri: image,
          name: filename,
          type,
        } as any);
      }

      await onSave(formData);
      onDismiss();
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>Edit Profile</Text>
          <Button 
            icon={X} 
            onPress={onDismiss} 
            style={styles.closeButton}
            labelStyle={styles.closeButtonText}
          >
            Close
          </Button>
        </View>
        
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.avatar} />
            ) : initialData.avatar ? (
              <Image source={{ uri: initialData.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Camera size={40} color={customTheme.colors.onSurfaceVariant} />
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>Edit</Text>
            </View>
          </TouchableOpacity>
          
          {image && (
            <Button 
              mode="text" 
              onPress={removeImage}
              icon={X}
              style={styles.removeImageButton}
              labelStyle={styles.removeImageButtonText}
            >
              Remove
            </Button>
          )}
        </View>

        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          error={!!errors.name}
          right={errors.name ? <TextInput.Icon icon="alert-circle" /> : undefined}
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

        <TextInput
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          mode="outlined"
          keyboardType="phone-pad"
          error={!!errors.phone}
          right={errors.phone ? <TextInput.Icon icon="alert-circle" /> : undefined}
        />
        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

        <TextInput
          label="City"
          value={city}
          onChangeText={setCity}
          style={styles.input}
          mode="outlined"
          error={!!errors.city}
          right={errors.city ? <TextInput.Icon icon="alert-circle" /> : undefined}
        />
        {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            onPress={onDismiss}
            style={styles.button}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
            icon={Check}
          >
            Save Changes
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: customTheme.colors.surface,
    padding: 24,
    margin: 20,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    color: customTheme.colors.primary,
  },
  closeButton: {
    marginLeft: 'auto',
  },
  closeButtonText: {
    color: customTheme.colors.onSurfaceVariant,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: customTheme.colors.primaryContainer,
  },
  placeholderAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: customTheme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: customTheme.colors.outlineVariant,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: customTheme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editBadgeText: {
    color: customTheme.colors.onPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeImageButton: {
    marginTop: 8,
  },
  removeImageButtonText: {
    color: customTheme.colors.error,
  },
  input: {
    marginBottom: 4,
    backgroundColor: customTheme.colors.surfaceVariant,
  },
  errorText: {
    color: customTheme.colors.error,
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 8,
  },
});