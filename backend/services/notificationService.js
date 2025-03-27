import { Expo } from 'expo-server-sdk';
import User from '../models/users.js';

let expo = new Expo();

// Add sound configuration for different notification types
const NOTIFICATION_SOUNDS = {
  message: 'message.wav',
  offer: 'offer.wav',
  task: 'task.wav',
  default: 'default'
};

export const sendPushNotification = async (userId, title, body, data = {}, notificationType = 'default') => {
  try {
    const user = await User.findById(userId);
    if (!user?.expoPushToken) return;

    if (!Expo.isExpoPushToken(user.expoPushToken)) {
      console.error(`Push token ${user.expoPushToken} is not a valid Expo push token`);
      return;
    }

    // Get the appropriate sound for the notification type
    const sound = NOTIFICATION_SOUNDS[notificationType] || NOTIFICATION_SOUNDS.default;

    // Construct the message with enhanced configuration
    const message = {
      to: user.expoPushToken,
      sound,
      title,
      body,
      data: {
        ...data,
        notificationType,
        timestamp: new Date().toISOString()
      },
      priority: 'high',
      // Add Android channel configuration
      _displayInForeground: true,
      androidChannelId: notificationType
    };

    try {
      const chunks = expo.chunkPushNotifications([message]);
      const tickets = [];

      // Send the chunks to the Expo push notification service
      for (let chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending chunk:', error);
        }
      }

      return tickets;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
  }
};

// Add a new function to handle different notification types
export const sendTypedNotification = async (params) => {
  const { userId, type, title, body, data } = params;

  switch (type) {
    case 'message':
      return sendPushNotification(
        userId,
        title || 'New Message',
        body,
        data,
        'message'
      );

    case 'offer':
      return sendPushNotification(
        userId,
        title || 'New Offer',
        body,
        data,
        'offer'
      );

    case 'task':
      return sendPushNotification(
        userId,
        title || 'Task Update',
        body,
        data,
        'task'
      );

    default:
      return sendPushNotification(
        userId,
        title,
        body,
        data,
        'default'
      );
  }
};

// Add this function to handle receipts
export const handleNotificationReceipts = async (tickets) => {
  try {
    const receiptIds = [];
    for (let ticket of tickets) {
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
    }

    const receiptChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    for (let chunk of receiptChunks) {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

        for (let receiptId in receipts) {
          const { status, message, details } = receipts[receiptId];
          
          if (status === 'error') {
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              console.error(`The error code is ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error('Error checking receipts:', error);
      }
    }
  } catch (error) {
    console.error('Error handling notification receipts:', error);
  }
};