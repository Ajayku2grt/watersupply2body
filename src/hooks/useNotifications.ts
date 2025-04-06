import { useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../utils/navigation';
import {
  requestNotificationPermissions,
  scheduleWaterReminderNotification,
  sendImmediateNotification,
  cancelAllNotifications
} from '../services/NotificationService';

// Set up notification listeners to handle user interactions with notifications
export const useNotifications = () => {
  const navigation = useNavigation();

  // Set up notification listeners
  useEffect(() => {
    // Request permission on component mount
    requestNotificationPermissions();

    // Schedule recurring notifications
    scheduleWaterReminderNotification().then((notificationId) => {
      console.log('Scheduled recurring notification with ID:', notificationId);
    });

    // Handle notification responses (when user taps on notification)
    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
      // Navigate to the water log screen to log water intake when notification is tapped
      navigation.navigate(SCREENS.WATER_LOG as never);
    });

    // Cleanup listeners on unmount
    return () => {
      Notifications.removeNotificationSubscription(notificationResponseListener);
    };
  }, [navigation]);

  // Send immediate notification for testing
  const showWaterReminder = useCallback(async () => {
    const notificationId = await sendImmediateNotification();
    return notificationId;
  }, []);

  // Reset notification schedule
  const resetNotificationSchedule = useCallback(async () => {
    await cancelAllNotifications();
    const notificationId = await scheduleWaterReminderNotification();
    return notificationId;
  }, []);

  return {
    showWaterReminder,
    resetNotificationSchedule
  };
}; 