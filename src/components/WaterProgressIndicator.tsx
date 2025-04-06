import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';

interface WaterProgressIndicatorProps {
  current: number;
  target: number;
  showPercentage?: boolean;
}

const WaterProgressIndicator: React.FC<WaterProgressIndicatorProps> = ({
  current,
  target,
  showPercentage = true,
}) => {
  // Calculate the progress (capped at 100%)
  const progress = Math.min(current / target, 1);
  const percentage = Math.round(progress * 100);
  
  // Determine color based on progress
  const getProgressColor = () => {
    if (progress < 0.25) return '#f44336'; // Red
    if (progress < 0.5) return '#ff9800';  // Orange
    if (progress < 0.75) return '#2196f3'; // Blue
    return '#4caf50'; // Green
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Daily Water Intake</Text>
        <Text style={styles.stats}>
          {current} / {target} ml
        </Text>
      </View>
      
      <ProgressBar
        progress={progress}
        color={getProgressColor()}
        style={styles.progressBar}
      />
      
      {showPercentage && (
        <Text style={styles.percentage}>
          {percentage}% of daily goal
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stats: {
    fontSize: 16,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
  },
  percentage: {
    marginTop: 8,
    textAlign: 'right',
    fontSize: 14,
    color: '#666',
  },
});

export default WaterProgressIndicator; 