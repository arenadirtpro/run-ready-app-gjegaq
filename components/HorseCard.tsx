
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
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
    <View style={[commonStyles.card, styles.card]}>
      <View style={styles.header}>
        <Text style={styles.horseTitle}>Horse Details</Text>
        <TouchableOpacity onPress={onDeleteHorse} style={styles.deleteButton}>
          <IconSymbol
            ios_icon_name="xmark.circle.fill"
            android_material_icon_name="cancel"
            size={24}
            color={colors.accent}
          />
        </TouchableOpacity>
      </View>

      <Text style={commonStyles.label}>Horse Name</Text>
      <TextInput
        style={commonStyles.input}
        value={horse.name}
        onChangeText={handleNameChange}
        placeholder="Enter horse name"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={commonStyles.label}>Draw Number</Text>
      <TextInput
        style={commonStyles.input}
        value={horse.drawNumber}
        onChangeText={handleDrawNumberChange}
        keyboardType="numeric"
        placeholder="e.g., 5"
        placeholderTextColor={colors.textSecondary}
      />

      <View style={styles.runTimeContainer}>
        <Text style={styles.runTimeLabel}>Estimated Run Time:</Text>
        <Text style={styles.runTime}>{formatTime(horse.estimatedRunTime)}</Text>
      </View>

      <View style={styles.remindersSection}>
        <Text style={styles.remindersTitle}>Pre-Run Notifications</Text>
        
        {horse.reminders.length === 0 ? (
          <Text style={styles.noRemindersText}>No reminders yet. Add one below!</Text>
        ) : (
          <View style={styles.remindersList}>
            {horse.reminders.map((reminder) => (
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
            color="#FFFFFF"
          />
          <Text style={styles.addReminderText}>Add Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  horseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  deleteButton: {
    padding: 4,
  },
  runTimeContainer: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  runTimeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  runTime: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  remindersSection: {
    marginTop: 8,
  },
  remindersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  noRemindersText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 12,
  },
  remindersList: {
    marginBottom: 12,
  },
  addReminderButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addReminderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
