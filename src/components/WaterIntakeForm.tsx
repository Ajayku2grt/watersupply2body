import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { saveWaterIntakeEntry } from '../services/StorageService';
import { cancelNotification } from '../services/NotificationService';

interface WaterIntakeFormProps {
  timestamp?: number;
  notificationId?: string;
  onSubmit?: () => void;
}

const WaterIntakeForm: React.FC<WaterIntakeFormProps> = ({
  timestamp = Date.now(),
  notificationId,
  onSubmit,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async () => {
    try {
      // Validate input
      const waterAmount = parseInt(amount, 10);
      if (isNaN(waterAmount) || waterAmount <= 0) {
        setErrorMessage('Please enter a valid amount of water in ml');
        setSnackbarVisible(true);
        return;
      }

      // Save the water intake entry
      await saveWaterIntakeEntry({
        timestamp,
        amount: waterAmount,
        note: note.trim() || undefined,
      });

      // If this form was opened from a notification, cancel it
      if (notificationId) {
        await cancelNotification(notificationId);
      }

      // Reset form
      setAmount('');
      setNote('');
      
      // Show success message
      setErrorMessage('Water intake saved successfully!');
      setSnackbarVisible(true);
      
      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error submitting water intake:', error);
      setErrorMessage('Failed to save water intake. Please try again.');
      setSnackbarVisible(true);
    }
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers
    if (/^\d*$/.test(text)) {
      setAmount(text);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Log Your Water Intake</Text>
        
        <TextInput
          label="Amount (ml)"
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          placeholder="e.g. 250"
        />
        
        <TextInput
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          style={styles.input}
          mode="outlined"
          placeholder="e.g. After breakfast"
          multiline
        />
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
        >
          Save
        </Button>

        <View style={styles.presetContainer}>
          <Text style={styles.presetTitle}>Quick Add:</Text>
          <View style={styles.presetButtons}>
            {[100, 200, 250, 300, 500].map((presetAmount) => (
              <Button
                key={presetAmount}
                mode="outlined"
                onPress={() => setAmount(presetAmount.toString())}
                style={styles.presetButton}
              >
                {presetAmount}ml
              </Button>
            ))}
          </View>
        </View>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {errorMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
  presetContainer: {
    marginTop: 16,
  },
  presetTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    margin: 4,
    minWidth: 80,
  },
});

export default WaterIntakeForm; 