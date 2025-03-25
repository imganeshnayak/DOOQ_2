import { Expo } from 'expo-server-sdk';
import User from '../models/users.js';

// Create a new Expo SDK client
let expo = new Expo();

export const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    // Get user's Expo push token
    const user = await User.findById(userId);
    if (!user?.expoPushToken) return;

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(user.expoPushToken)) {
      console.error(`Push token ${user.expoPushToken} is not a valid Expo push token`);
      return;
    }

    // Construct the message
    const message = {
      to: user.expoPushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
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