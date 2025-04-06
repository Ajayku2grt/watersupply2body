import { Platform } from 'react-native';

// Configure notification behavior
export const configureNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

// Request permissions for notifications
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Water Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3498db',
      description: 'Reminders to drink water throughout the day',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Only ask if permissions have not already been determined
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

// Show an immediate notification
export const showWaterReminder = async (): Promise<string | null> => {
  try {
    const notificationId = await Notifications.presentNotificationAsync({
      title: 'Water Intake Tracker',
      body: 'Time to drink water! Stay hydrated by drinking regularly.',
      data: {
        notificationId: 'water-reminder',
        timestamp: Date.now(),
      },
      sound: true,
    });

    console.log('Water reminder notification sent');
    return notificationId;
  } catch (error) {
    console.error('Error showing water reminder:', error);
    return null;
  }
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All scheduled notifications have been cancelled');
};
