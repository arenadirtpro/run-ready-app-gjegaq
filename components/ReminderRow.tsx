
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Reminder } from '@/types/horse';
import { formatTime, offsetOptions } from '@/utils/timeCalculations';
import { IconSymbol } from '@/components/IconSymbol';

interface ReminderRowProps {
  reminder: Reminder;
  onUpdateReminder: (reminder: Reminder) => void;
  onDeleteReminder: () => void;
}

export default function ReminderRow({ reminder, onUpdateReminder, onDeleteReminder }: ReminderRowProps) {
  const [showOffsetPicker, setShowOffsetPicker] = React.useState(false);

  const handleLabelChange = (text: string) => {
    onUpdateReminder({ ...reminder, label: text });
  };

  const handleOffsetSelect = (offsetMinutes: number) => {
    onUpdateReminder({ ...reminder, offsetMinutes });
    setShowOffsetPicker(false);
  };

  const selectedOffset = offsetOptions.find(opt => opt.value === reminder.offsetMinutes);

  return (
    <View style={styles.reminderRow}>
      <View style={styles.reminderContent}>
        <TextInput
          style={styles.labelInput}
          value={reminder.label}
          onChangeText={handleLabelChange}
          placeholder="e.g., Lasix, Warm-up"
          placeholderTextColor={colors.textSecondary}
        />
        
        <TouchableOpacity
          style={styles.offsetButton}
          onPress={() => setShowOffsetPicker(!showOffsetPicker)}
        >
          <Text style={styles.offsetButtonText}>
            {selectedOffset?.label || '1 hr'}
          </Text>
        </TouchableOpacity>

        <View style={styles.firesAtContainer}>
          <Text style={styles.firesAtLabel}>Fires At:</Text>
          <Text style={styles.firesAtTime}>{formatTime(reminder.firesAt)}</Text>
        </View>

        <TouchableOpacity onPress={onDeleteReminder} style={styles.deleteButton}>
          <IconSymbol
            ios_icon_name="trash.fill"
            android_material_icon_name="delete"
            size={20}
            color={colors.accent}
          />
        </TouchableOpacity>
      </View>

      {showOffsetPicker && (
        <View style={styles.offsetPicker}>
          {offsetOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.offsetOption}
              onPress={() => handleOffsetSelect(option.value)}
            >
              <Text style={styles.offsetOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  reminderRow: {
    marginBottom: 8,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelInput: {
    flex: 2,
    backgroundColor: colors.highlight,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: colors.text,
  },
  offsetButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  offsetButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  firesAtContainer: {
    flex: 1.5,
    alignItems: 'center',
  },
  firesAtLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  firesAtTime: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  offsetPicker: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 8,
    padding: 8,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  offsetOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
  },
  offsetOptionText: {
    fontSize: 14,
    color: colors.text,
  },
});
