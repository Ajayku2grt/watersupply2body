import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import WaterLogScreen from './src/screens/WaterLogScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { SCREENS, navigationRef, RootStackParamList } from './src/utils/navigation';
import { useNotifications } from './src/hooks/useNotifications';
import { requestNotificationPermissions, scheduleWaterReminderNotification } from './src/services/NotificationService';

// Create the stack navigator
const Stack = createStackNavigator<RootStackParamList>();

// Define the app theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    accent: '#2ecc71',
    background: '#f5f5f5',
  },
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AppContent = () => {
  // Use the notifications hook to set up notification listeners
  useNotifications();

  return (
    <Stack.Navigator
      initialRouteName={SCREENS.HOME}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={SCREENS.HOME} component={HomeScreen} />
      <Stack.Screen 
        name={SCREENS.WATER_LOG} 
        component={WaterLogScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen 
        name={SCREENS.HISTORY} 
        component={HistoryScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen 
        name={SCREENS.SETTINGS} 
        component={SettingsScreen}
        options={{ gestureEnabled: true }}
      />
    </Stack.Navigator>
  );
};

export default function App() {
  // Request permissions and setup notifications on app start
  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await scheduleWaterReminderNotification();
      }
    };
    
    setupNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer ref={navigationRef}>
          <AppContent />
        </NavigationContainer>
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
