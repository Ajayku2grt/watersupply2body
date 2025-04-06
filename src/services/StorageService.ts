import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

// Define the water intake entry type
export interface WaterIntakeEntry {
  id: string;
  timestamp: number;
  amount: number; // in milliliters
  note?: string;
}

// Define the storage keys
const STORAGE_KEYS = {
  WATER_INTAKE: 'water_intake_data',
  DAILY_TARGET: 'daily_water_target',
  NOTIFICATION_INTERVAL: 'notification_interval',
};

// Default daily target in milliliters (2800ml = 2.8 liters)
const DEFAULT_DAILY_TARGET = 2800;
// Default notification interval in minutes
const DEFAULT_NOTIFICATION_INTERVAL = 60;

// Save a water intake entry
export const saveWaterIntakeEntry = async (entry: Omit<WaterIntakeEntry, 'id'>) => {
  try {
    // Get existing entries
    const existingEntries = await getWaterIntakeEntries();
    
    // Create a new entry with ID
    const newEntry: WaterIntakeEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    
    // Add new entry to existing entries
    const updatedEntries = [...existingEntries, newEntry];
    
    // Save the updated entries
    await AsyncStorage.setItem(
      STORAGE_KEYS.WATER_INTAKE,
      JSON.stringify(updatedEntries)
    );
    
    return newEntry;
  } catch (error) {
    console.error('Error saving water intake entry:', error);
    throw error;
  }
};

// Get all water intake entries
export const getWaterIntakeEntries = async (): Promise<WaterIntakeEntry[]> => {
  try {
    const entriesJson = await AsyncStorage.getItem(STORAGE_KEYS.WATER_INTAKE);
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (error) {
    console.error('Error getting water intake entries:', error);
    return [];
  }
};

// Get water intake entries for a specific day
export const getWaterIntakeEntriesForDay = async (date: Date): Promise<WaterIntakeEntry[]> => {
  try {
    const allEntries = await getWaterIntakeEntries();
    
    // Filter entries for the specified day
    const startOfDay = moment(date).startOf('day').valueOf();
    const endOfDay = moment(date).endOf('day').valueOf();
    
    return allEntries.filter(
      entry => entry.timestamp >= startOfDay && entry.timestamp <= endOfDay
    );
  } catch (error) {
    console.error('Error getting water intake entries for day:', error);
    return [];
  }
};

// Calculate total water intake for a specific day
export const getTotalWaterIntakeForDay = async (date: Date): Promise<number> => {
  const entries = await getWaterIntakeEntriesForDay(date);
  return entries.reduce((total, entry) => total + entry.amount, 0);
};

// Set daily water intake target
export const setDailyWaterTarget = async (target: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TARGET, target.toString());
  } catch (error) {
    console.error('Error setting daily water target:', error);
    throw error;
  }
};

// Get daily water intake target
export const getDailyWaterTarget = async (): Promise<number> => {
  try {
    const target = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_TARGET);
    return target ? parseInt(target, 10) : DEFAULT_DAILY_TARGET;
  } catch (error) {
    console.error('Error getting daily water target:', error);
    return DEFAULT_DAILY_TARGET;
  }
};

// Set notification interval (in minutes)
export const setNotificationInterval = async (interval: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_INTERVAL, interval.toString());
  } catch (error) {
    console.error('Error setting notification interval:', error);
    throw error;
  }
};

// Get notification interval
export const getNotificationInterval = async (): Promise<number> => {
  try {
    const interval = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_INTERVAL);
    return interval ? parseInt(interval, 10) : DEFAULT_NOTIFICATION_INTERVAL;
  } catch (error) {
    console.error('Error getting notification interval:', error);
    return DEFAULT_NOTIFICATION_INTERVAL;
  }
};

// Delete a water intake entry
export const deleteWaterIntakeEntry = async (id: string): Promise<void> => {
  try {
    const entries = await getWaterIntakeEntries();
    const updatedEntries = entries.filter(entry => entry.id !== id);
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.WATER_INTAKE,
      JSON.stringify(updatedEntries)
    );
  } catch (error) {
    console.error('Error deleting water intake entry:', error);
    throw error;
  }
};

// Clear all water intake data
export const clearAllWaterIntakeData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.WATER_INTAKE);
  } catch (error) {
    console.error('Error clearing water intake data:', error);
    throw error;
  }
}; 