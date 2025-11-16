
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, commonStyles } from '@/styles/commonStyles';
import { EventDetails } from '@/types/horse';

interface EventDetailsCardProps {
  eventDetails: EventDetails;
  onUpdateEventDetails: (details: EventDetails) => void;
}

export default function EventDetailsCard({ eventDetails, onUpdateEventDetails }: EventDetailsCardProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    console.log('Time picker event:', event.type, selectedDate);
    
    // On Android, hide picker after selection or dismissal
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    // Only update if user selected a date (not cancelled)
    if (event.type === 'set' && selectedDate) {
      console.log('Setting new start time:', selectedDate);
      onUpdateEventDetails({ ...eventDetails, startTime: selectedDate });
      
      // On iOS, hide picker after selection
      if (Platform.OS === 'ios') {
        setShowTimePicker(false);
      }
    } else if (event.type === 'dismissed') {
      console.log('Time picker dismissed');
      // Just close the picker, don't update the time
      setShowTimePicker(false);
    }
  };

  const handleHorsesPerHourChange = (text: string) => {
    console.log('Horses per hour changed:', text);
    onUpdateEventDetails({ ...eventDetails, horsesPerHour: text });
  };

  return (
    <View style={[commonStyles.card, styles.card]}>
      <Text style={commonStyles.title}>Event Details</Text>
      
      <Text style={commonStyles.label}>Event Start Time</Text>
      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => {
          console.log('Opening time picker');
          setShowTimePicker(true);
        }}
      >
        <Text style={styles.timeButtonText}>
          {eventDetails.startTime
            ? eventDetails.startTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
            : 'Select Time'}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={eventDetails.startTime || new Date()}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
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
});
