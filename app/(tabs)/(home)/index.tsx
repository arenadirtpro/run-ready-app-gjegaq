
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform, Modal, TextInput, Switch } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { EventDetails, Horse, Reminder } from '@/types/horse';
import { SavedSchedule } from '@/types/savedSchedule';
import { calculateEstimatedRunTime, calculateFiresAtTime } from '@/utils/timeCalculations';
import { saveSchedule } from '@/utils/storage';
import { requestNotificationPermissions, scheduleNotificationsForSchedule } from '@/utils/notifications';
import EventDetailsCard from '@/components/EventDetailsCard';
import HorseCard from '@/components/HorseCard';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    startTime: null,
    horsesPerHour: '',
  });

  const [horses, setHorses] = useState<Horse[]>([]);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  // Load schedule if editing
  useEffect(() => {
    if (params.scheduleData) {
      try {
        const schedule: SavedSchedule = JSON.parse(params.scheduleData as string);
        setEventDetails(schedule.eventDetails);
        setHorses(schedule.horses);
        setScheduleName(schedule.name);
        setNotificationsEnabled(schedule.notificationsEnabled);
        setEditingScheduleId(schedule.id);
        console.log('Loaded schedule for editing:', schedule.id);
      } catch (error) {
        console.error('Error loading schedule:', error);
      }
    }
  }, [params.scheduleData]);

  // Recalculate run times when event details change
  useEffect(() => {
    console.log('Event details changed:', {
      startTime: eventDetails.startTime,
      horsesPerHour: eventDetails.horsesPerHour,
    });

    if (eventDetails.startTime && eventDetails.horsesPerHour) {
      const horsesPerHour = parseFloat(eventDetails.horsesPerHour);
      console.log('Parsed horses per hour:', horsesPerHour);
      
      if (horsesPerHour > 0) {
        const updatedHorses = horses.map(horse => {
          const drawNumber = parseInt(horse.drawNumber);
          console.log(`Processing horse ${horse.name}, draw number: ${drawNumber}`);
          
          if (drawNumber > 0) {
            const estimatedRunTime = calculateEstimatedRunTime(
              eventDetails.startTime,
              horsesPerHour,
              drawNumber
            );
            console.log(`Calculated run time for ${horse.name}:`, estimatedRunTime);
            
            // Update reminder fire times
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
    
    console.log('Updating horse:', {
      name: updatedHorse.name,
      drawNumber,
      horsesPerHour,
      startTime: eventDetails.startTime,
    });
    
    if (eventDetails.startTime && horsesPerHour > 0 && drawNumber > 0) {
      const estimatedRunTime = calculateEstimatedRunTime(
        eventDetails.startTime,
        horsesPerHour,
        drawNumber
      );
      
      console.log('Calculated estimated run time:', estimatedRunTime);
      
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

  const handleSaveSchedule = () => {
    // Validate that we have at least event details
    if (!eventDetails.startTime || !eventDetails.horsesPerHour) {
      Alert.alert(
        'Missing Information',
        'Please enter event start time and horses per hour before saving.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Show save modal
    setSaveModalVisible(true);
  };

  const handleConfirmSave = async () => {
    if (!scheduleName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this schedule.', [{ text: 'OK' }]);
      return;
    }

    try {
      const schedule: SavedSchedule = {
        id: editingScheduleId || Date.now().toString(),
        name: scheduleName.trim(),
        eventDetails,
        horses,
        notificationsEnabled,
        createdAt: editingScheduleId ? new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveSchedule(schedule);

      // Request notification permissions and schedule notifications if enabled
      if (notificationsEnabled) {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          await scheduleNotificationsForSchedule(schedule);
          Alert.alert(
            'Schedule Saved',
            `Your schedule "${scheduleName}" has been saved with notifications enabled!`,
            [
              {
                text: 'OK',
                onPress: () => {
                  setSaveModalVisible(false);
                  setScheduleName('');
                  setEditingScheduleId(null);
                },
              },
            ]
          );
        } else {
          Alert.alert(
            'Schedule Saved',
            `Your schedule "${scheduleName}" has been saved, but notification permissions were not granted.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  setSaveModalVisible(false);
                  setScheduleName('');
                  setEditingScheduleId(null);
                },
              },
            ]
          );
        }
      } else {
        Alert.alert(
          'Schedule Saved',
          `Your schedule "${scheduleName}" has been saved successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setSaveModalVisible(false);
                setScheduleName('');
                setEditingScheduleId(null);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Failed to save schedule. Please try again.', [{ text: 'OK' }]);
    }
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
          <Text style={styles.appSubtitle}>Precise Run Time Estimates</Text>
        </View>

        <EventDetailsCard
          eventDetails={eventDetails}
          onUpdateEventDetails={setEventDetails}
        />

        {horses.map((horse) => (
          <HorseCard
            key={horse.id}
            horse={horse}
            onUpdateHorse={handleUpdateHorse}
            onDeleteHorse={() => handleDeleteHorse(horse.id)}
          />
        ))}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[buttonStyles.secondaryButton, styles.actionButton]}
            onPress={handleAddHorse}
          >
            <Text style={buttonStyles.buttonText}>+ Add Another Horse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.primaryButton, styles.actionButton]}
            onPress={handleSaveSchedule}
          >
            <Text style={buttonStyles.buttonText}>
              {editingScheduleId ? 'Update Schedule' : 'Save Schedule'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Extra padding for floating tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Save Schedule Modal */}
      <Modal
        visible={saveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingScheduleId ? 'Update Schedule' : 'Save Schedule'}
            </Text>

            <Text style={styles.modalLabel}>Schedule Name</Text>
            <TextInput
              style={styles.modalInput}
              value={scheduleName}
              onChangeText={setScheduleName}
              placeholder="e.g., Saturday Barrel Race"
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.notificationToggle}>
              <View style={styles.notificationToggleText}>
                <Text style={styles.modalLabel}>Enable Notifications</Text>
                <Text style={styles.modalSubtext}>
                  Receive alerts for pre-run activities
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[buttonStyles.secondaryButton, styles.modalButton]}
                onPress={() => {
                  setSaveModalVisible(false);
                  setScheduleName('');
                }}
              >
                <Text style={buttonStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.primaryButton, styles.modalButton]}
                onPress={handleConfirmSave}
              >
                <Text style={buttonStyles.buttonText}>
                  {editingScheduleId ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  actionsContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  actionButton: {
    width: '100%',
  },
  bottomPadding: {
    height: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  notificationToggleText: {
    flex: 1,
    marginRight: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
