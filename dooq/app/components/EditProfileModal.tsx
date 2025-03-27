import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Modal, Portal, Text, TextInput, Button } from 'react-native-paper';
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
    bio: string;
  };
}

const EditProfileModal = ({ visible, onDismiss, onSave, initialData }: EditProfileModalProps) => {
  const [formData, setFormData] = useState({ ...initialData });
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prevent overwriting user input by only setting initialData when modal opens
  useEffect(() => {
    if (visible) {
      setFormData({ ...initialData });
      setImage(null);
    }
  }, [visible]);

  // Memoized handlers to prevent full re-renders
  const handleChange = useCallback((name: string, value: string) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }, [setFormData]);

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
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => form.append(key, value));

      if (image) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
        form.append('avatar', { uri: image, name: filename, type } as any);
      }

      await onSave(form);
      onDismiss();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>Edit Profile</Text>
          <Button icon={X} onPress={onDismiss} style={styles.closeButton}>Close</Button>
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
        />

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={onDismiss} disabled={loading}>Cancel</Button>
          <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading} icon={Check}>Save</Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: customTheme.colors.surface, padding: 24, borderRadius: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontWeight: 'bold', color: customTheme.colors.primary },
  closeButton: { marginLeft: 'auto' },
  imageSection: { alignItems: 'center', marginBottom: 20 },
  imageContainer: { position: 'relative', marginBottom: 8 },
  avatar: { width: 140, height: 140, borderRadius: 70 },
  placeholderAvatar: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'black', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  editBadgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  input: { marginBottom: 12, backgroundColor: customTheme.colors.surface },
  bioInput: { height: 120, textAlignVertical: 'top' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
});

export default React.memo(EditProfileModal);
