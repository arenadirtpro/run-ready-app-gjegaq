
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { EventDetails } from '@/types/horse';
import { IconSymbol } from '@/components/IconSymbol';

interface EventDetailsCardProps {
  eventDetails: EventDetails;
  onUpdateEventDetails: (details: EventDetails) => void;
}

export default function EventDetailsCard({ eventDetails, onUpdateEventDetails }: EventDetailsCardProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date>(new Date());

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      
      if (event.type === 'set' && selectedDate) {
        onUpdateEventDetails({ ...eventDetails, startTime: selectedDate });
      }
    } else {
      if (selectedDate) {
        setTempTime(selectedDate);
      }
    }
  };

  const handleConfirmTime = () => {
    onUpdateEventDetails({ ...eventDetails, startTime: tempTime });
    setShowTimePicker(false);
  };

  const handleCancelTime = () => {
    setShowTimePicker(false);
  };

  const handleOpenPicker = () => {
    setTempTime(eventDetails.startTime || new Date());
    setShowTimePicker(true);
  };

  const handleHorsesPerHourChange = (text: string) => {
    onUpdateEventDetails({ ...eventDetails, horsesPerHour: text });
  };

  const formatTimeDisplay = (date: Date | null) => {
    if (!date) return 'Select Time';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Select Time';
    }
    
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Event Start Time</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={handleOpenPicker}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="clock.fill"
            android_material_icon_name="schedule"
            size={20}
            color={eventDetails.startTime ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.timeButtonText, !eventDetails.startTime && styles.placeholderText]}>
            {formatTimeDisplay(eventDetails.startTime)}
          </Text>
        </TouchableOpacity>
      </View>

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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Horses Per Hour</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={eventDetails.horsesPerHour}
            onChangeText={handleHorsesPerHourChange}
            keyboardType="numeric"
            placeholder="e.g., 12"
            placeholderTextColor={colors.textSecondary}
          />
          <View style={styles.inputIcon}>
            <IconSymbol
              ios_icon_name="figure.equestrian.sports"
              android_material_icon_name="pets"
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  timeButtonText: {
    ...typography.body,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    paddingRight: 48,
    fontSize: 16,
    color: colors.text,
  },
  inputIcon: {
    position: 'absolute',
    right: spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text,
  },
  modalButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  confirmButtonText: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
});
