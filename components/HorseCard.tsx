
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { Horse, Reminder } from '@/types/horse';
import { formatTime, calculateFiresAtTime } from '@/utils/timeCalculations';
import ReminderRow from './ReminderRow';
import { IconSymbol } from '@/components/IconSymbol';

interface HorseCardProps {
  horse: Horse;
  onUpdateHorse: (horse: Horse) => void;
  onDeleteHorse: () => void;
}

export default function HorseCard({ horse, onUpdateHorse, onDeleteHorse }: HorseCardProps) {
  const handleNameChange = (text: string) => {
    onUpdateHorse({ ...horse, name: text });
  };

  const handleDrawNumberChange = (text: string) => {
    onUpdateHorse({ ...horse, drawNumber: text });
  };

  const handleAddReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      label: '',
      offsetMinutes: 60,
      firesAt: calculateFiresAtTime(horse.estimatedRunTime, 60),
    };
    onUpdateHorse({ ...horse, reminders: [...horse.reminders, newReminder] });
  };

  const handleUpdateReminder = (updatedReminder: Reminder) => {
    const updatedReminders = horse.reminders.map(r =>
      r.id === updatedReminder.id
        ? { ...updatedReminder, firesAt: calculateFiresAtTime(horse.estimatedRunTime, updatedReminder.offsetMinutes) }
        : r
    );
    onUpdateHorse({ ...horse, reminders: updatedReminders });
  };

  const handleDeleteReminder = (reminderId: string) => {
    const updatedReminders = horse.reminders.filter(r => r.id !== reminderId);
    onUpdateHorse({ ...horse, reminders: updatedReminders });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol
            ios_icon_name="figure.equestrian.sports"
            android_material_icon_name="pets"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.horseTitle}>Horse Details</Text>
        </View>
        <TouchableOpacity onPress={onDeleteHorse} style={styles.deleteButton}>
          <IconSymbol
            ios_icon_name="xmark.circle.fill"
            android_material_icon_name="cancel"
            size={28}
            color={colors.danger}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Horse Name</Text>
        <TextInput
          style={styles.input}
          value={horse.name}
          onChangeText={handleNameChange}
          placeholder="Enter horse name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Draw Number</Text>
        <TextInput
          style={styles.input}
          value={horse.drawNumber}
          onChangeText={handleDrawNumberChange}
          keyboardType="numeric"
          placeholder="e.g., 5"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {horse.estimatedRunTime && (
        <View style={styles.runTimeContainer}>
          <View style={styles.runTimeHeader}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="schedule"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.runTimeLabel}>Estimated Run Time</Text>
          </View>
          <Text style={styles.runTime}>{formatTime(horse.estimatedRunTime)}</Text>
        </View>
      )}

      <View style={styles.remindersSection}>
        <View style={styles.remindersSectionHeader}>
          <IconSymbol
            ios_icon_name="bell.badge.fill"
            android_material_icon_name="notifications_active"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={styles.remindersTitle}>Pre-Run Notifications</Text>
        </View>
        
        {horse.reminders.length === 0 ? (
          <View style={styles.noRemindersContainer}>
            <Text style={styles.noRemindersText}>No reminders yet</Text>
          </View>
        ) : (
          <View style={styles.remindersList}>
            {horse.reminders.map((reminder, index) => (
              <ReminderRow
                key={reminder.id}
                reminder={reminder}
                onUpdateReminder={handleUpdateReminder}
                onDeleteReminder={() => handleDeleteReminder(reminder.id)}
              />
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addReminderButton} onPress={handleAddReminder}>
          <IconSymbol
            ios_icon_name="plus.circle.fill"
            android_material_icon_name="add_circle"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.addReminderText}>Add Reminder</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  horseTitle: {
    ...typography.h3,
    color: colors.text,
  },
  deleteButton: {
    padding: spacing.xs,
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
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.text,
  },
  runTimeContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  runTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  runTimeLabel: {
    ...typography.captionMedium,
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  runTime: {
    ...typography.h2,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  remindersSection: {
    marginTop: spacing.md,
  },
  remindersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  remindersTitle: {
    ...typography.h4,
    color: colors.text,
  },
  noRemindersContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  noRemindersText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  remindersList: {
    marginBottom: spacing.md,
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addReminderText: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
});
