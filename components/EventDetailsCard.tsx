
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, commonStyles } from '@/styles/commonStyles';
import { EventDetails } from '@/types/horse';

interface EventDetailsCardProps {
  eventDetails: EventDetails;
  onUpdateEventDetails: (details: EventDetails) => void;
}

export default function EventDetailsCard({ eventDetails, onUpdateEventDetails }: EventDetailsCardProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date>(new Date());

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    console.log('Time picker event:', event.type, 'Selected date:', selectedDate);
    
    if (Platform.OS === 'android') {
      // On Android, the picker closes automatically after selection or dismissal
      setShowTimePicker(false);
      
      // Only update if user selected a time (not cancelled)
      if (event.type === 'set' && selectedDate) {
        console.log('Setting new start time (Android):', selectedDate);
        onUpdateEventDetails({ ...eventDetails, startTime: selectedDate });
      } else {
        console.log('Time picker dismissed (Android)');
      }
    } else {
      // On iOS, just update the temporary time
      if (selectedDate) {
        console.log('Updating temp time (iOS):', selectedDate);
        setTempTime(selectedDate);
      }
    }
  };

  const handleConfirmTime = () => {
    console.log('Confirming time selection:', tempTime);
    onUpdateEventDetails({ ...eventDetails, startTime: tempTime });
    setShowTimePicker(false);
  };

  const handleCancelTime = () => {
    console.log('Cancelling time selection');
    setShowTimePicker(false);
  };

  const handleOpenPicker = () => {
    console.log('Opening time picker');
    // Set temp time to current start time or now
    setTempTime(eventDetails.startTime || new Date());
    setShowTimePicker(true);
  };

  const handleHorsesPerHourChange = (text: string) => {
    console.log('Horses per hour changed:', text);
    onUpdateEventDetails({ ...eventDetails, horsesPerHour: text });
  };

  const formatTimeDisplay = (date: Date | null) => {
    if (!date) return 'Select Time';
    
    // Ensure date is a Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date:', date);
      return 'Select Time';
    }
    
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={[commonStyles.card, styles.card]}>
      <Text style={commonStyles.title}>Event Details</Text>
      
      <Text style={commonStyles.label}>Event Start Time</Text>
      <TouchableOpacity
        style={styles.timeButton}
        onPress={handleOpenPicker}
        activeOpacity={0.7}
      >
        <Text style={styles.timeButtonText}>
          {formatTimeDisplay(eventDetails.startTime)}
        </Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancelTime}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancelTime} style={styles.modalButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Time</Text>
                <TouchableOpacity onPress={handleConfirmTime} style={styles.modalButton}>
                  <Text style={styles.confirmButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                testID="dateTimePicker"
                value={tempTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleTimeChange}
                textColor={colors.text}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showTimePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={eventDetails.startTime || new Date()}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleTimeChange}
          />
        )
      )}

      <Text style={commonStyles.label}>Horses Per Hour</Text>
      <TextInput
        style={commonStyles.input}
        value={eventDetails.horsesPerHour}
        onChangeText={handleHorsesPerHourChange}
        keyboardType="numeric"
        placeholder="e.g., 12"
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
  },
  timeButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  timeButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  modalButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelButtonText: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
  },
});
