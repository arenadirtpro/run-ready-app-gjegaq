
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
    console.log('Time picker event:', event.type, 'Selected date:', selectedDate);
    
    // On Android, the picker closes automatically after selection or dismissal
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      
      // Only update if user selected a time (not cancelled)
      if (event.type === 'set' && selectedDate) {
        console.log('Setting new start time (Android):', selectedDate);
        onUpdateEventDetails({ ...eventDetails, startTime: selectedDate });
      } else {
        console.log('Time picker dismissed (Android)');
      }
    } else {
      // On iOS, we handle it differently
      if (event.type === 'set' && selectedDate) {
        console.log('Setting new start time (iOS):', selectedDate);
        onUpdateEventDetails({ ...eventDetails, startTime: selectedDate });
        setShowTimePicker(false);
      } else if (event.type === 'dismissed') {
        console.log('Time picker dismissed (iOS)');
        setShowTimePicker(false);
      }
    }
  };

  const handleHorsesPerHourChange = (text: string) => {
    console.log('Horses per hour changed:', text);
    onUpdateEventDetails({ ...eventDetails, horsesPerHour: text });
  };

  const formatTimeDisplay = (date: Date | null) => {
    if (!date) return 'Select Time';
    
    return date.toLocaleTimeString('en-US', {
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
        onPress={() => {
          console.log('Time button pressed, opening picker');
          setShowTimePicker(true);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.timeButtonText}>
          {formatTimeDisplay(eventDetails.startTime)}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
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
