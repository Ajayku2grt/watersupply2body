import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';
import WaterIntakeForm from '../components/WaterIntakeForm';
import { RootStackParamList } from '../utils/navigation';

type WaterLogScreenRouteProp = RouteProp<RootStackParamList, 'WaterLog'>;

const WaterLogScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<WaterLogScreenRouteProp>();
  
  // Get timestamp and notificationId from params if available
  const { timestamp, notificationId } = route.params || {};

  // Handle form submission
  const handleSubmit = () => {
    // Navigate back to home screen
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Log Water Intake" />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <WaterIntakeForm
          timestamp={timestamp}
          notificationId={notificationId}
          onSubmit={handleSubmit}
        />
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
    flexGrow: 1,
  },
});

export default WaterLogScreen; 