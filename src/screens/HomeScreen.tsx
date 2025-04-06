import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Button, FAB, Text, List, IconButton } from 'react-native-paper';
import { getDailyWaterTarget, getTotalWaterIntakeForDay, getWaterIntakeEntriesForDay, WaterIntakeEntry, deleteWaterIntakeEntry, getNotificationInterval } from '../services/StorageService';
import WaterProgressIndicator from '../components/WaterProgressIndicator';
import { SCREENS } from '../utils/navigation';
import moment from 'moment';
import * as Notifications from 'expo-notifications';
import { useNotifications } from '../hooks/useNotifications';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [waterTarget, setWaterTarget] = useState<number>(2800);
  const [totalWaterIntake, setTotalWaterIntake] = useState<number>(0);
  const [waterEntries, setWaterEntries] = useState<WaterIntakeEntry[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [todayDate] = useState<Date>(new Date());
  const [reminderInterval, setReminderInterval] = useState<number>(60);
  
  // Use notification hooks
  const { showWaterReminder } = useNotifications();

  // Load data
  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // Get the daily water target
      const target = await getDailyWaterTarget();
      setWaterTarget(target);
      
      // Get today's water intake
      const total = await getTotalWaterIntakeForDay(todayDate);
      setTotalWaterIntake(total);
      
      // Get today's water entries
      const entries = await getWaterIntakeEntriesForDay(todayDate);
      setWaterEntries(entries.sort((a, b) => b.timestamp - a.timestamp)); // Sort by newest first
      
      // Get notification interval
      const interval = await getNotificationInterval();
      setReminderInterval(interval);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [todayDate]);

  // Initial setup
  useEffect(() => {
    // Load initial data
    loadData();

    // Check notification permissions
    async function checkPermissions() {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        console.log('Notification permission status:', newStatus);
      }
    }
    
    checkPermissions();
  }, [loadData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Handle entry deletion
  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteWaterIntakeEntry(id);
      await loadData(); // Reload data after deletion
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  // Handle refreshing
  const onRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    return moment(timestamp).format('h:mm A');
  };

  // Navigate to settings screen
  const openSettings = () => {
    navigation.navigate(SCREENS.SETTINGS as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Water Intake Tracker</Text>
        <IconButton
          icon="cog"
          size={24}
          onPress={openSettings}
          style={styles.settingsButton}
        />
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Progress Indicator */}
        <WaterProgressIndicator
          current={totalWaterIntake}
          target={waterTarget}
        />
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Daily Goal: {waterTarget} ml</Text>
          <Text style={styles.currentInterval}>Current Reminder Interval: <Text style={styles.highlightText}>{reminderInterval} minutes</Text></Text>
          <Text style={styles.infoText}>• Tap any notification to log your water intake</Text>
          <Text style={styles.infoText}>• Tap the settings icon to adjust your goal</Text>
        </View>
        
        {/* Quick Add Button */}
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate(SCREENS.WATER_LOG as never)}
          style={styles.quickAddButton}
        >
          Log Water Intake
        </Button>
        
        {/* Today's Entries */}
        <View style={styles.entriesContainer}>
          <Text style={styles.sectionTitle}>Today's Entries</Text>
          
          {waterEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No water intake logged today.
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the button above to log your first intake!
              </Text>
            </View>
          ) : (
            waterEntries.map((entry) => (
              <List.Item
                key={entry.id}
                title={`${entry.amount} ml`}
                description={entry.note || `Added at ${formatTime(entry.timestamp)}`}
                left={props => <List.Icon {...props} icon="water" />}
                right={props => (
                  <IconButton
                    icon="delete"
                    {...props}
                    onPress={() => handleDeleteEntry(entry.id)}
                  />
                )}
                style={styles.entryItem}
              />
            ))
          )}
        </View>
      </ScrollView>
      
      {/* Navigation FAB */}
      <FAB
        icon="history"
        style={styles.fab}
        onPress={() => navigation.navigate(SCREENS.HISTORY as never)}
        label="History"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 8,
    backgroundColor: '#3498db',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    margin: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollContent: {
    padding: 16,
  },
  quickAddButton: {
    marginBottom: 16,
  },
  entriesContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  entryItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3498db',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentInterval: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  highlightText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default HomeScreen; 