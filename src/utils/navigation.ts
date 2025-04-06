import { NavigationContainerRef, ParamListBase } from '@react-navigation/native';
import { createRef } from 'react';

// Define screen names as constants
export const SCREENS = {
  HOME: 'Home',
  WATER_LOG: 'WaterLog',
  HISTORY: 'History',
  SETTINGS: 'Settings',
} as const;

// Define the app's navigation params
export type RootStackParamList = {
  Home: undefined;
  WaterLog: { 
    timestamp?: number;
    notificationId?: string;
  };
  History: { date?: string };
  Settings: undefined;
};

// Create a navigation ref that can be used outside of the Navigator component
export const navigationRef = createRef<NavigationContainerRef<ParamListBase>>();

// Helper function to navigate to screens from outside of components
export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name as string, params);
  } else {
    console.error('Navigation reference is not set');
  }
} 