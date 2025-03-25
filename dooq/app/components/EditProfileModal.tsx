import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import customTheme from '../theme';

interface EditProfileModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (data: EditProfileData) => void;
  initialData: {
    name: string;
    bio: string;
    location: string;
  };
}

interface EditProfileData {
  name: string;
  bio: string;
  location: string;
}

export default function EditProfileModal({ visible, onDismiss, onSave, initialData }: EditProfileModalProps) {
  const [formData, setFormData] = useState<EditProfileData>(initialData);

  const handleSave = () => {
    onSave(formData);
    onDismiss();
  };

  return (
    <Modal visible={visible} onDismiss={onDismiss} animationType="slide">
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>Edit Profile</Text>

          <TextInput
            label="Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Location"
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={4}
          />
        </ScrollView>

        <View style={styles.buttons}>
          <Button 
            mode="outlined" 
            onPress={onDismiss} 
            style={styles.button}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSave}
            style={styles.button}
          >
            Save
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  buttons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  }
});