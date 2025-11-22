
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
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
    <View style={styles.reminderContainer}>
      <View style={styles.reminderRow}>
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
          <IconSymbol
            ios_icon_name="chevron.down"
            android_material_icon_name="expand_more"
            size={16}
            color={colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onDeleteReminder} style={styles.deleteButton}>
          <IconSymbol
            ios_icon_name="trash.fill"
            android_material_icon_name="delete"
            size={20}
            color={colors.danger}
          />
        </TouchableOpacity>
      </View>

      {reminder.firesAt && (
        <View style={styles.firesAtContainer}>
          <IconSymbol
            ios_icon_name="alarm.fill"
            android_material_icon_name="alarm"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={styles.firesAtText}>
            Alert at {formatTime(reminder.firesAt)}
          </Text>
        </View>
      )}

      {showOffsetPicker && (
        <View style={styles.offsetPicker}>
          {offsetOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.offsetOption,
                option.value === reminder.offsetMinutes && styles.offsetOptionSelected,
              ]}
              onPress={() => handleOffsetSelect(option.value)}
            >
              <Text style={[
                styles.offsetOptionText,
                option.value === reminder.offsetMinutes && styles.offsetOptionTextSelected,
              ]}>
                {option.label}
              </Text>
              {option.value === reminder.offsetMinutes && (
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={20}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  reminderContainer: {
    marginBottom: spacing.md,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  labelInput: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  offsetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  offsetButtonText: {
    ...typography.captionMedium,
    color: colors.primary,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  firesAtContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingLeft: spacing.md,
  },
  firesAtText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  offsetPicker: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    padding: spacing.xs,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  offsetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  offsetOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  offsetOptionText: {
    ...typography.body,
    color: colors.text,
  },
  offsetOptionTextSelected: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
});
