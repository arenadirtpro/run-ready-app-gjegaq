
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform, TextInput, Switch, Animated } from 'react-native';
import { colors, commonStyles, buttonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { EventDetails, Horse } from '@/types/horse';
import { SavedSchedule } from '@/types/savedSchedule';
import { calculateEstimatedRunTime, calculateFiresAtTime } from '@/utils/timeCalculations';
import { saveSchedule } from '@/utils/storage';
import { requestNotificationPermissions, scheduleNotificationsForSchedule } from '@/utils/notifications';
import EventDetailsCard from '@/components/EventDetailsCard';
import HorseCard from '@/components/HorseCard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/IconSymbol';

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    startTime: null,
    horsesPerHour: '',
  });

  const [horses, setHorses] = useState<Horse[]>([]);
  const [scheduleName, setScheduleName] = useState('');
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [originalCreatedAt, setOriginalCreatedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSection, setShowSaveSection] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (params.scheduleData) {
      try {
        const schedule: SavedSchedule = JSON.parse(params.scheduleData as string);
        
        const parsedEventDetails: EventDetails = {
          ...schedule.eventDetails,
          startTime: schedule.eventDetails.startTime ? new Date(schedule.eventDetails.startTime) : null,
        };
        
        const parsedHorses: Horse[] = schedule.horses.map(horse => ({
          ...horse,
          estimatedRunTime: horse.estimatedRunTime ? new Date(horse.estimatedRunTime) : null,
          reminders: horse.reminders.map(reminder => ({
            ...reminder,
            firesAt: reminder.firesAt ? new Date(reminder.firesAt) : null,
          })),
        }));
        
        setEventDetails(parsedEventDetails);
        setHorses(parsedHorses);
        setScheduleName(schedule.name);
        setEventDate(new Date(schedule.eventDate));
        setNotificationsEnabled(schedule.notificationsEnabled);
        setEditingScheduleId(schedule.id);
        setOriginalCreatedAt(schedule.createdAt);
        setShowSaveSection(true);
        console.log('Loaded schedule for editing:', schedule.id);
      } catch (error) {
        console.error('Error loading schedule:', error);
        Alert.alert('Error', 'Failed to load schedule for editing.');
      }
    }
  }, [params.scheduleData]);

  useEffect(() => {
    if (eventDetails.startTime && eventDetails.horsesPerHour) {
      const horsesPerHour = parseFloat(eventDetails.horsesPerHour);
      
      if (horsesPerHour > 0) {
        const updatedHorses = horses.map(horse => {
          const drawNumber = parseInt(horse.drawNumber);
          
          if (drawNumber > 0) {
            const estimatedRunTime = calculateEstimatedRunTime(
              eventDetails.startTime,
              horsesPerHour,
              drawNumber
            );
            
            const updatedReminders = horse.reminders.map(reminder => ({
              ...reminder,
              firesAt: calculateFiresAtTime(estimatedRunTime, reminder.offsetMinutes),
            }));

            return {
              ...horse,
              estimatedRunTime,
              reminders: updatedReminders,
            };
          }
          return horse;
        });
        setHorses(updatedHorses);
      }
    }
  }, [eventDetails.startTime, eventDetails.horsesPerHour]);

  useEffect(() => {
    if (showSaveSection) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [showSaveSection]);

  const handleAddHorse = () => {
    const newHorse: Horse = {
      id: Date.now().toString(),
      name: '',
      drawNumber: '',
      estimatedRunTime: null,
      reminders: [],
    };
    setHorses([...horses, newHorse]);
  };

  const handleUpdateHorse = (updatedHorse: Horse) => {
    const horsesPerHour = parseFloat(eventDetails.horsesPerHour);
    const drawNumber = parseInt(updatedHorse.drawNumber);
    
    if (eventDetails.startTime && horsesPerHour > 0 && drawNumber > 0) {
      const estimatedRunTime = calculateEstimatedRunTime(
        eventDetails.startTime,
        horsesPerHour,
        drawNumber
      );
      
      const updatedReminders = updatedHorse.reminders.map(reminder => ({
        ...reminder,
        firesAt: calculateFiresAtTime(estimatedRunTime, reminder.offsetMinutes),
      }));

      updatedHorse = {
        ...updatedHorse,
        estimatedRunTime,
        reminders: updatedReminders,
      };
    }

    setHorses(horses.map(h => (h.id === updatedHorse.id ? updatedHorse : h)));
  };

  const handleDeleteHorse = (horseId: string) => {
    setHorses(horses.filter(h => h.id !== horseId));
  };

  const handlePrepareToSave = () => {
    if (!eventDetails.startTime || !eventDetails.horsesPerHour) {
      Alert.alert(
        'Missing Information',
        'Please enter event start time and horses per hour before saving.',
        [{ text: 'OK' }]
      );
      return;
    }

    setShowSaveSection(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const handleSaveSchedule = async () => {
    if (!scheduleName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this schedule.', [{ text: 'OK' }]);
      return;
    }

    setIsSaving(true);

    try {
      const now = new Date().toISOString();
      const schedule: SavedSchedule = {
        id: editingScheduleId || Date.now().toString(),
        name: scheduleName.trim(),
        eventDate: eventDate.toISOString(),
        eventDetails,
        horses,
        notificationsEnabled,
        createdAt: originalCreatedAt || now,
        updatedAt: now,
      };

      await saveSchedule(schedule);

      if (notificationsEnabled) {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          await scheduleNotificationsForSchedule(schedule);
        }
      }

      Alert.alert(
        '✓ Saved',
        `Your schedule "${scheduleName}" has been saved successfully!`,
        [
          {
            text: 'View Saved Events',
            onPress: () => router.push('/profile'),
          },
          {
            text: 'Create Another',
            onPress: () => {
              setEventDetails({ startTime: null, horsesPerHour: '' });
              setHorses([]);
              setScheduleName('');
              setEventDate(new Date());
              setNotificationsEnabled(true);
              setEditingScheduleId(null);
              setOriginalCreatedAt(null);
              setShowSaveSection(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Failed to save schedule. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.appTitle}>RunReady</Text>
          <Text style={styles.appSubtitle}>Precise run time estimates for your horses</Text>
        </View>

        <EventDetailsCard
          eventDetails={eventDetails}
          onUpdateEventDetails={setEventDetails}
        />

        {horses.map((horse, index) => (
          <HorseCard
            key={horse.id}
            horse={horse}
            onUpdateHorse={handleUpdateHorse}
            onDeleteHorse={() => handleDeleteHorse(horse.id)}
          />
        ))}

        <TouchableOpacity
          style={styles.addHorseButton}
          onPress={handleAddHorse}
        >
          <IconSymbol
            ios_icon_name="plus.circle.fill"
            android_material_icon_name="add_circle"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.addHorseText}>Add Horse</Text>
        </TouchableOpacity>

        {!showSaveSection && (
          <TouchableOpacity
            style={[buttonStyles.primaryButton, styles.continueButton]}
            onPress={handlePrepareToSave}
          >
            <Text style={buttonStyles.buttonText}>
              {editingScheduleId ? 'Continue to Update' : 'Continue to Save'}
            </Text>
          </TouchableOpacity>
        )}

        {showSaveSection && (
          <Animated.View style={[styles.saveSection, { opacity: fadeAnim }]}>
            <View style={styles.saveSectionHeader}>
              <Text style={styles.saveSectionTitle}>Schedule Details</Text>
              <TouchableOpacity
                onPress={() => setShowSaveSection(false)}
                style={styles.collapseSaveButton}
              >
                <IconSymbol
                  ios_icon_name="chevron.up"
                  android_material_icon_name="expand_less"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Schedule Name</Text>
              <TextInput
                style={styles.input}
                value={scheduleName}
                onChangeText={setScheduleName}
                placeholder="e.g., Saturday Barrel Race"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="event"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.dateButtonText}>{formatDateDisplay(eventDate)}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={eventDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.notificationToggle}>
              <View style={styles.notificationToggleLeft}>
                <IconSymbol
                  ios_icon_name="bell.badge.fill"
                  android_material_icon_name="notifications_active"
                  size={24}
                  color={notificationsEnabled ? colors.primary : colors.textSecondary}
                />
                <View style={styles.notificationToggleText}>
                  <Text style={styles.notificationToggleTitle}>Notifications</Text>
                  <Text style={styles.notificationToggleSubtitle}>
                    Get alerts for pre-run activities
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={notificationsEnabled ? colors.primary : colors.backgroundSecondary}
              />
            </View>

            <TouchableOpacity
              style={[buttonStyles.primaryButton, styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSaveSchedule}
              disabled={isSaving}
            >
              <Text style={buttonStyles.buttonText}>
                {isSaving ? 'Saving...' : editingScheduleId ? 'Update Schedule' : 'Save Schedule'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? 48 : spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  appTitle: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  appSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  addHorseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addHorseText: {
    ...typography.bodySemibold,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  continueButton: {
    marginTop: spacing.md,
  },
  saveSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.lg,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  saveSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  saveSectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  collapseSaveButton: {
    padding: spacing.xs,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  dateButtonText: {
    ...typography.body,
    color: colors.text,
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  notificationToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  notificationToggleText: {
    flex: 1,
  },
  notificationToggleTitle: {
    ...typography.bodySemibold,
    color: colors.text,
    marginBottom: 2,
  },
  notificationToggleSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  bottomPadding: {
    height: 120,
  },
});
