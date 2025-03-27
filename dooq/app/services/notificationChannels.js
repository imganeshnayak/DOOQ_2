import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Promise.all([
      Notifications.setNotificationChannelAsync('message', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'message.wav'
      }),

      Notifications.setNotificationChannelAsync('offer', {
        name: 'Offers',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00FF00',
        sound: 'offer.wav'
      }),

      Notifications.setNotificationChannelAsync('task', {
        name: 'Task Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0000FF',
        sound: 'task.wav'
      })
    ]);
  }
};