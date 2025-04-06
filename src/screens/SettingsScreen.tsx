import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Divider, List, Switch, Card, TextInput, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getDailyWaterTarget, setDailyWaterTarget, clearAllWaterIntakeData, getNotificationInterval, setNotificationInterval as saveNotificationInterval } from '../services/StorageService';
import * as Notifications from 'expo-notifications';
import { useNotifications } from '../hooks/useNotifications';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [waterTarget, setWaterTarget] = useState<number>(2800);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [notificationInterval, setReminderInterval] = useState<number>(60); // minutes
  const [tempWaterTarget, setTempWaterTarget] = useState<string>('2800');
  const { resetNotificationSchedule } = useNotifications();

  // Load current settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load water target
      const target = await getDailyWaterTarget();
      setWaterTarget(target);
      setTempWaterTarget(target.toString());
      
      // Load notification interval
      const interval = await getNotificationInterval();
      setReminderInterval(interval);
      
      // Check notification permissions
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === 'granted');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Save water target
  const saveWaterTarget = async () => {
    try {
      const newTarget = parseInt(tempWaterTarget, 10);
      if (isNaN(newTarget) || newTarget <= 0) {
        Alert.alert('Invalid Input', 'Please enter a valid water target.');
        return;
      }
      
      await setDailyWaterTarget(newTarget);
      setWaterTarget(newTarget);
      Alert.alert('Success', 'Water target updated successfully.');
    } catch (error) {
      console.error('Error saving water target:', error);
      Alert.alert('Error', 'Failed to save water target.');
    }
  };

  // Toggle notifications
  const toggleNotifications = async (value: boolean) => {
    try {
      if (value) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive water intake reminders.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      setNotificationsEnabled(value);
      // Here you would typically update notification settings in storage
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  // Update notification interval
  const updateNotificationInterval = async (minutes: number) => {
    try {
      setReminderInterval(minutes);
      await saveNotificationInterval(minutes);
      
      // Reset notification schedule with new interval
      await resetNotificationSchedule();
      console.log(`Notification interval updated to ${minutes} minutes`);
    } catch (error) {
      console.error('Error updating notification interval:', error);
    }
  };

  // Reset all data
  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to reset all data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllWaterIntakeData();
              Alert.alert('Success', 'All data has been reset.');
              loadSettings(); // Reload settings
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'Failed to reset data.');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#fff"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerText}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Water Target */}
        <Card style={styles.card}>
          <Card.Title title="Daily Water Target" />
          <Card.Content>
            <Text style={styles.description}>
              Set your daily water intake goal in milliliters (ml).
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                label="Water Target (ml)"
                value={tempWaterTarget}
                onChangeText={setTempWaterTarget}
                keyboardType="number-pad"
                style={styles.input}
              />
              <Button 
                mode="contained" 
                onPress={saveWaterTarget}
                style={styles.saveButton}
              >
                Save
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Notification Settings */}
        <Card style={styles.card}>
          <Card.Title title="Notification Settings" />
          <Card.Content>
            <List.Item
              title="Enable Notifications"
              description="Get periodic reminders to drink water"
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                />
              )}
            />
            
            {notificationsEnabled && (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.sliderLabel}>
                  Reminder Interval:
                  <Text style={{color: '#3498db', fontWeight: 'bold'}}> {notificationInterval} minutes</Text>
                </Text>
                
                <View style={styles.optionsContainer}>
                  <TouchableOpacity 
                    style={styles.option}
                    onPress={() => updateNotificationInterval(1)}
                  >
                    <View style={[
                      styles.radioButton, 
                      notificationInterval === 1 && styles.radioButtonSelected
                    ]} />
                    <Text style={styles.optionText}>Every 1 minute</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.option}
                    onPress={() => updateNotificationInterval(15)}
                  >
                    <View style={[
                      styles.radioButton, 
                      notificationInterval === 15 && styles.radioButtonSelected
                    ]} />
                    <Text style={styles.optionText}>Every 15 minutes</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.option}
                    onPress={() => updateNotificationInterval(30)}
                  >
                    <View style={[
                      styles.radioButton, 
                      notificationInterval === 30 && styles.radioButtonSelected
                    ]} />
                    <Text style={styles.optionText}>Every 30 minutes</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.option}
                    onPress={() => updateNotificationInterval(60)}
                  >
                    <View style={[
                      styles.radioButton, 
                      notificationInterval === 60 && styles.radioButtonSelected
                    ]} />
                    <Text style={styles.optionText}>Every 60 minutes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Data Management */}
        <Card style={styles.card}>
          <Card.Title title="Data Management" />
          <Card.Content>
            <Button 
              mode="outlined" 
              icon="delete" 
              onPress={handleResetData}
              style={styles.dangerButton}
              textColor="#e74c3c"
            >
              Reset All Data
            </Button>
            <Text style={styles.warningText}>
              This will delete all your water intake records and reset your settings.
            </Text>
          </Card.Content>
        </Card>

        {/* About */}
        <Card style={styles.card}>
          <Card.Title title="About" />
          <Card.Content>
            <Text style={styles.aboutText}>
              Water Intake Tracker v1.0.0
            </Text>
            <Text style={styles.aboutText}>
              Stay hydrated, stay healthy!
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  description: {
    marginBottom: 12,
    color: '#666',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
  },
  saveButton: {
    marginLeft: 8,
    alignSelf: 'center',
  },
  divider: {
    marginVertical: 8,
  },
  sliderLabel: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  radioButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    backgroundColor: '#3498db',
    borderWidth: 6,
    borderColor: 'white',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  dangerButton: {
    borderColor: '#e74c3c',
    marginBottom: 8,
  },
  warningText: {
    color: '#e74c3c',
    fontSize: 12,
  },
  aboutText: {
    marginBottom: 4,
    color: '#666',
  },
  backButton: {
    margin: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
  }
});

export default SettingsScreen; 