import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { getNotificationInterval } from './StorageService';

// Configure notification handler for when received and displayed
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Helper to check if the device is a physical device (not simulator/emulator)
export const isRealDevice = async (): Promise<boolean> => {
  return Device.isDevice;
};

// Request permission for notifications
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  // On Android, we need to set a notification channel
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('water-reminder', {
      name: 'Water Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3498db',
    });
  }

  return true;
};

// Schedule a recurring notification based on the user's configured interval
export const scheduleWaterReminderNotification = async (): Promise<string | null> => {
  try {
    // Get the user's configured notification interval
    const intervalMinutes = await getNotificationInterval();
    
    // Cancel any existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!await requestNotificationPermissions()) {
      return null;
    }

    // Schedule the recurring notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Water Reminder 💧",
        body: "It's time to drink some water! Stay hydrated.",
        data: { type: 'water_reminder' },
        sound: true,
      },
      trigger: {
        seconds: intervalMinutes * 60, // Convert minutes to seconds (minimum 60 seconds)
        repeats: true,
      } as Notifications.NotificationTriggerInput,
    });

    console.log('Scheduled notification with ID:', identifier);
    console.log(`Notification interval set to ${intervalMinutes} minutes`);
    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Send immediate test notification
export const sendImmediateNotification = async (): Promise<string | null> => {
  try {
    if (!await requestNotificationPermissions()) {
      return null;
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Water Reminder 💧",
        body: "It's time to drink some water! Stay hydrated.",
        data: { type: 'water_reminder' },
      },
      trigger: null, // Immediate notification
    });

    console.log('Sent immediate notification with ID:', identifier);
    return identifier;
  } catch (error) {
    console.error('Error sending immediate notification:', error);
    return null;
  }
};

// Cancel all pending notifications
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
};

// Get all pending notification requests
export const getPendingNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    return [];
  }
};
