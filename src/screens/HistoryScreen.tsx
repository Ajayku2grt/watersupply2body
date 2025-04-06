import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Text, List, Divider, ActivityIndicator } from 'react-native-paper';
import { getWaterIntakeEntriesForDay, getTotalWaterIntakeForDay, getDailyWaterTarget } from '../services/StorageService';
import WaterProgressIndicator from '../components/WaterProgressIndicator';
import moment from 'moment';

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [waterTarget, setWaterTarget] = useState<number>(2000);
  const [totalWaterIntake, setTotalWaterIntake] = useState<number>(0);
  const [waterEntries, setWaterEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dates, setDates] = useState<Date[]>([]);

  // Generate dates for the last 14 days (today + 13 previous days)
  useEffect(() => {
    const newDates: Date[] = [];
    for (let i = 0; i < 14; i++) {
      newDates.push(moment().subtract(i, 'days').toDate());
    }
    setDates(newDates);
  }, []);

  // Load data for the selected date
  const loadData = useCallback(async (date: Date) => {
    try {
      setLoading(true);
      
      // Get the daily water target
      const target = await getDailyWaterTarget();
      setWaterTarget(target);
      
      // Get the selected day's water intake
      const total = await getTotalWaterIntakeForDay(date);
      setTotalWaterIntake(total);
      
      // Get the selected day's water entries
      const entries = await getWaterIntakeEntriesForDay(date);
      setWaterEntries(entries.sort((a, b) => b.timestamp - a.timestamp)); // Sort by newest first
    } catch (error) {
      console.error('Error loading history data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data when selected date changes
  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate, loadData]);

  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    return moment(timestamp).format('h:mm A');
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');
    const momentDate = moment(date).startOf('day');
    
    if (momentDate.isSame(today)) {
      return 'Today';
    } else if (momentDate.isSame(yesterday)) {
      return 'Yesterday';
    } else {
      return momentDate.format('MMM D');
    }
  };
  
  // Check if the date is today
  const isToday = (date: Date) => {
    return moment(date).isSame(moment(), 'day');
  };

  // Check if dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return moment(date1).isSame(moment(date2), 'day');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Water Intake History" />
      </Appbar.Header>

      {/* Date selection buttons */}
      <View style={styles.dateButtonsContainer}>
        {dates.slice(0, 7).map((date, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.dateButton,
              isSameDay(date, selectedDate) && styles.selectedDateButton
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text 
              style={[
                styles.dateText, 
                isSameDay(date, selectedDate) && styles.selectedDateText
              ]}
            >
              {formatDate(date)}
            </Text>
            <Text 
              style={[
                styles.dayText, 
                isSameDay(date, selectedDate) && styles.selectedDateText
              ]}
            >
              {moment(date).format('ddd')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <>
            {/* Progress Indicator */}
            <WaterProgressIndicator
              current={totalWaterIntake}
              target={waterTarget}
            />
            
            {/* Entries List */}
            <View style={styles.entriesContainer}>
              <Text style={styles.sectionTitle}>
                {isToday(selectedDate) ? "Today's Entries" : `Entries for ${moment(selectedDate).format('MMMM D, YYYY')}`}
              </Text>
              
              {waterEntries.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No water intake recorded for this day.
                  </Text>
                </View>
              ) : (
                waterEntries.map((entry, index) => (
                  <React.Fragment key={entry.id}>
                    <List.Item
                      title={`${entry.amount} ml`}
                      description={entry.note || `Added at ${formatTime(entry.timestamp)}`}
                      left={props => <List.Icon {...props} icon="water" />}
                    />
                    {index < waterEntries.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  dateButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dateButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginVertical: 5,
    marginHorizontal: 3,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    width: '13%',
  },
  selectedDateButton: {
    backgroundColor: '#3498db',
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  dayText: {
    fontSize: 12,
    marginTop: 2,
    color: '#666',
    textAlign: 'center',
  },
  selectedDateText: {
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loader: {
    marginTop: 24,
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
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HistoryScreen; 