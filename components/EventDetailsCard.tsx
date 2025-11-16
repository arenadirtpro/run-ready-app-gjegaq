
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
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      onUpdateEventDetails({ ...eventDetails, startTime: selectedDate });
    }
  };

  const handleHorsesPerHourChange = (text: string) => {
    onUpdateEventDetails({ ...eventDetails, horsesPerHour: text });
  };

  return (
    <View style={[commonStyles.card, styles.card]}>
      <Text style={commonStyles.title}>Event Details</Text>
      
      <Text style={commonStyles.label}>Event Start Time</Text>
      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setShowTimePicker(true)}
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
